import prisma from '../utils/prisma.js';
import { hashPassword } from '../utils/password.js';
import { formatComplaintsAsCsv } from '../utils/csv.js';
import { logAuditEvent } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export async function getDashboardMetrics(req, res, next) {
  try {
    const institutionId = req.institution.id;

    const [
      totalCount,
      submittedCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      allComplaints,
      recentComplaints,
      categories,
      staffMemberships,
    ] = await Promise.all([
      prisma.complaint.count({ where: { institutionId } }),
      prisma.complaint.count({ where: { institutionId, status: 'SUBMITTED' } }),
      prisma.complaint.count({ where: { institutionId, status: 'IN_PROGRESS' } }),
      prisma.complaint.count({ where: { institutionId, status: 'RESOLVED' } }),
      prisma.complaint.count({ where: { institutionId, status: 'CLOSED' } }),
      prisma.complaint.findMany({
        where: { institutionId },
        select: {
          id: true,
          status: true,
          priority: true,
          createdAt: true,
          resolvedAt: true,
          categoryId: true,
          category: { select: { name: true, slaHours: true } },
          assignedStaffId: true,
          assignedStaff: { select: { id: true, name: true } },
        },
      }),
      prisma.complaint.findMany({
        where: { institutionId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          department: true,
          student: { select: { id: true, name: true, email: true } },
          assignedStaff: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.complaintCategory.findMany({ where: { institutionId, isActive: true } }),
      prisma.membership.findMany({
        where: { institutionId, role: 'STAFF', status: 'ACTIVE' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          department: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Calculate Overdue complaints based on Category SLA
    const now = new Date();
    const overdueCount = allComplaints.filter((c) => {
      if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status)) return false;
      const slaHours = c.category ? c.category.slaHours : 48;
      const deadline = new Date(c.createdAt.getTime() + slaHours * 3600 * 1000);
      return now > deadline;
    }).length;

    // Calculate Average Resolution Time (in hours)
    const resolvedComplaints = allComplaints.filter((c) => c.resolvedAt);
    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalResolutionMs = resolvedComplaints.reduce((acc, c) => {
        return acc + (new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime());
      }, 0);
      avgResolutionHours = Number((totalResolutionMs / (resolvedComplaints.length * 3600 * 1000)).toFixed(1));
    }

    // Complaints by Category
    const categoryDistribution = categories.map((cat) => {
      const count = allComplaints.filter((c) => c.categoryId === cat.id).length;
      return {
        name: cat.name,
        count,
      };
    });

    // Complaints by Priority
    const priorityCounts = { Low: 0, Medium: 0, High: 0 };
    allComplaints.forEach((c) => {
      const p = (c.priority || 'MEDIUM').toUpperCase();
      if (p === 'LOW') priorityCounts.Low += 1;
      else if (p === 'HIGH' || p === 'URGENT') priorityCounts.High += 1;
      else priorityCounts.Medium += 1;
    });
    const complaintsByPriority = [
      { name: 'Low', count: priorityCounts.Low },
      { name: 'Medium', count: priorityCounts.Medium },
      { name: 'High', count: priorityCounts.High },
    ];

    // Complaints by Status
    const statusCounts = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      ON_HOLD: 0,
      RESOLVED: 0,
      CLOSED: 0,
      REJECTED: 0,
      REOPENED: 0,
    };
    allComplaints.forEach((c) => {
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status] += 1;
      }
    });

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    // 7-Day Velocity Trend
    const trendsOverTime = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = `${dayNames[d.getDay()]} ${d.getDate()}`;

      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const submitted = allComplaints.filter((c) => {
        const cDate = new Date(c.createdAt);
        return cDate >= startOfDay && cDate <= endOfDay;
      }).length;

      const resolved = allComplaints.filter((c) => {
        if (!c.resolvedAt) return false;
        const rDate = new Date(c.resolvedAt);
        return rDate >= startOfDay && rDate <= endOfDay;
      }).length;

      trendsOverTime.push({
        date: label,
        submitted,
        resolved,
      });
    }

    // Staff Workload
    const staffWorkload = staffMemberships.map((m) => {
      const activeTasks = allComplaints.filter(
        (c) => c.assignedStaffId === m.userId && ['ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW'].includes(c.status)
      ).length;
      const completedTasks = allComplaints.filter(
        (c) => c.assignedStaffId === m.userId && ['RESOLVED', 'CLOSED'].includes(c.status)
      ).length;
      const totalAssigned = allComplaints.filter((c) => c.assignedStaffId === m.userId).length;

      return {
        id: m.userId,
        name: m.user.name,
        department: m.department?.name || 'General Operations',
        activeTasks,
        completedTasks,
        assigned: totalAssigned || activeTasks + completedTasks,
        resolved: completedTasks,
      };
    });

    const formattedRecentComplaints = recentComplaints.map((c) => ({
      ...c,
      assignments: c.assignedStaff ? [{ staff: c.assignedStaff }] : [],
    }));

    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          total: totalCount,
          totalComplaints: totalCount,
          submitted: submittedCount,
          newlySubmitted: submittedCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
          closed: closedCount,
          overdue: overdueCount,
          avgResolutionHours,
          avgResolutionTimeHours: avgResolutionHours,
          resolutionRate: totalCount > 0 ? Number(((resolvedCount + closedCount) / totalCount * 100).toFixed(1)) : 0,
        },
        charts: {
          categoryDistribution,
          complaintsByCategory: categoryDistribution,
          complaintsByPriority,
          statusDistribution,
          trendsOverTime,
          staffWorkload,
        },
        recentComplaints: formattedRecentComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function assignComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const { staffId, notes, priority } = req.body;
    const institutionId = req.institution.id;

    const complaint = await prisma.complaint.findFirst({
      where: { id, institutionId },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found in this institution.',
      });
    }

    // Verify staff belongs to this institution with active STAFF membership
    const staffMembership = await prisma.membership.findFirst({
      where: {
        userId: staffId,
        institutionId,
        role: 'STAFF',
        status: 'ACTIVE',
      },
      include: { user: true },
    });

    if (!staffMembership) {
      return res.status(400).json({
        success: false,
        message: 'Selected staff member is not an active staff member in this institution.',
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Deactivate prior assignments
      await tx.complaintAssignment.updateMany({
        where: { complaintId: complaint.id, isActive: true },
        data: { isActive: false },
      });

      // Create new assignment
      await tx.complaintAssignment.create({
        data: {
          complaintId: complaint.id,
          staffId,
          assignedById: req.user.id,
          notes: notes || null,
          isActive: true,
        },
      });

      const resComplaint = await tx.complaint.update({
        where: { id: complaint.id },
        data: {
          assignedStaffId: staffId,
          ...(priority && { priority: priority.toUpperCase() }),
          status: complaint.status === 'SUBMITTED' ? 'ASSIGNED' : complaint.status,
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          institutionId,
          oldStatus: complaint.status,
          newStatus: resComplaint.status,
          changedById: req.user.id,
          notes: `Assigned to ${staffMembership.user.name}. ${notes || ''}`,
        },
      });

      return resComplaint;
    });

    // Notify staff
    await createNotification({
      userId: staffId,
      institutionId,
      title: 'New Complaint Assignment',
      message: `You were assigned complaint ${complaint.complaintNumber}: ${complaint.title}`,
      link: `/staff/complaints/${complaint.id}`,
      type: 'ASSIGNMENT',
    });

    // Notify student
    await createNotification({
      userId: complaint.studentId,
      institutionId,
      title: 'Technician Assigned',
      message: `Technician ${staffMembership.user.name} has been assigned to your complaint ${complaint.complaintNumber}.`,
      link: `/complaints/${complaint.id}`,
      type: 'STATUS_CHANGE',
    });

    await logAuditEvent({
      institutionId,
      userId: req.user.id,
      action: 'COMPLAINT_ASSIGNED',
      entityType: 'Complaint',
      entityId: complaint.id,
      details: `${complaint.complaintNumber} assigned to ${staffMembership.user.name}`,
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Complaint assigned to ${staffMembership.user.name}.`,
      data: { complaint: updated },
    });
  } catch (error) {
    next(error);
  }
}

export async function exportComplaintsCsv(req, res, next) {
  try {
    const institutionId = req.institution.id;
    const { status, categoryId, priority, startDate, endDate } = req.query;

    const where = { institutionId };

    if (status && status !== 'ALL') where.status = status;
    if (categoryId && categoryId !== 'ALL') where.categoryId = categoryId;
    if (priority && priority !== 'ALL') where.priority = priority;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        department: true,
        student: { select: { name: true, email: true } },
        assignedStaff: { select: { name: true, email: true } },
      },
    });

    const csvData = await formatComplaintsAsCsv(complaints);

    await logAuditEvent({
      institutionId,
      userId: req.user.id,
      action: 'DATA_EXPORTED',
      entityType: 'Complaint',
      details: `Exported ${complaints.length} complaint records to CSV`,
      req,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${req.institution.slug}-complaints-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');

    return res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
}

// Categories Management
export async function getCategories(req, res, next) {
  try {
    const categories = await prisma.complaintCategory.findMany({
      where: { institutionId: req.institution.id },
      include: {
        _count: { select: { complaints: true } },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, description, slaHours } = req.body;
    const institutionId = req.institution.id;

    const existing = await prisma.complaintCategory.findUnique({
      where: {
        institutionId_name: {
          institutionId,
          name: name.trim(),
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists in your institution.',
      });
    }

    const category = await prisma.complaintCategory.create({
      data: {
        institutionId,
        name: name.trim(),
        description: description?.trim() || '',
        slaHours: parseInt(slaHours, 10) || 48,
        isActive: true,
      },
    });

    await logAuditEvent({
      institutionId,
      userId: req.user.id,
      action: 'CATEGORY_CREATED',
      entityType: 'ComplaintCategory',
      entityId: category.id,
      details: `Category created: ${category.name}`,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, slaHours, isActive } = req.body;
    const institutionId = req.institution.id;

    const category = await prisma.complaintCategory.findFirst({
      where: { id, institutionId },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found in your institution.',
      });
    }

    const updated = await prisma.complaintCategory.update({
      where: { id: category.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(slaHours !== undefined && { slaHours: parseInt(slaHours, 10) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: { category: updated },
    });
  } catch (error) {
    next(error);
  }
}

// Departments Management
export async function getDepartments(req, res, next) {
  try {
    const departments = await prisma.department.findMany({
      where: { institutionId: req.institution.id },
      include: {
        _count: { select: { memberships: true, complaints: true } },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: { departments },
    });
  } catch (error) {
    next(error);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const { name, code } = req.body;
    const institutionId = req.institution.id;

    const existing = await prisma.department.findUnique({
      where: {
        institutionId_name: {
          institutionId,
          name: name.trim(),
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name already exists.',
      });
    }

    const department = await prisma.department.create({
      data: {
        institutionId,
        name: name.trim(),
        code: (code || name.substring(0, 4)).trim().toUpperCase(),
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: { department },
    });
  } catch (error) {
    next(error);
  }
}

// Users / Staff Management for institution
export async function listStaff(req, res, next) {
  try {
    const staffMemberships = await prisma.membership.findMany({
      where: {
        institutionId: req.institution.id,
        role: 'STAFF',
        status: 'ACTIVE',
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        staff: staffMemberships.map((m) => ({
          id: m.userId,
          membershipId: m.id,
          name: m.user.name,
          email: m.user.email,
          phone: m.user.phone,
          department: m.department?.name || 'General Operations',
          departmentId: m.departmentId,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const { page = 1, limit = 20, action } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = { institutionId: req.institution.id };
    if (action && action !== 'ALL') where.action = action;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
