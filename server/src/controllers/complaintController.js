import prisma from '../utils/prisma.js';
import { generateComplaintNumber } from '../utils/complaintId.js';
import { logAuditEvent } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export async function createComplaint(req, res, next) {
  try {
    const { title, description, categoryId, location, roomNumber, priority, departmentId } = req.body;
    const institutionId = req.institution.id;

    // 1. Verify category belongs to this institution
    const category = await prisma.complaintCategory.findFirst({
      where: {
        id: categoryId,
        institutionId,
        isActive: true,
      },
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Selected category does not exist in this institution or is inactive.',
      });
    }

    // 2. Generate institution-scoped complaint number
    const complaintNumber = await generateComplaintNumber(institutionId, req.institution.code);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // 3. Create complaint within a transaction
    const newComplaint = await prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.create({
        data: {
          complaintNumber,
          institutionId,
          title,
          description,
          categoryId: category.id,
          departmentId: departmentId || null,
          location,
          roomNumber: roomNumber || null,
          priority: priority || 'MEDIUM',
          status: 'SUBMITTED',
          studentId: req.user.id,
          imageUrl,
        },
        include: {
          category: true,
          department: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          institutionId,
          oldStatus: 'NONE',
          newStatus: 'SUBMITTED',
          changedById: req.user.id,
          notes: 'Complaint submitted by student',
        },
      });

      return complaint;
    });

    await logAuditEvent({
      institutionId,
      userId: req.user.id,
      action: 'COMPLAINT_CREATED',
      entityType: 'Complaint',
      entityId: newComplaint.id,
      details: `Complaint ${newComplaint.complaintNumber} lodged in ${req.institution.name}: ${newComplaint.title}`,
      req,
    });

    // Notify institution admins
    const admins = await prisma.membership.findMany({
      where: {
        institutionId,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      select: { userId: true },
    });

    for (const a of admins) {
      await createNotification({
        userId: a.userId,
        institutionId,
        title: 'New Campus Complaint',
        message: `${newComplaint.complaintNumber} (${newComplaint.priority}): ${newComplaint.title}`,
        link: `/admin/complaints`,
        type: 'STATUS_CHANGE',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: { complaint: newComplaint },
    });
  } catch (error) {
    next(error);
  }
}

export async function getComplaints(req, res, next) {
  try {
    const institutionId = req.institution.id;
    const { status, categoryId, priority, search, page = 1, limit = 20, assignedToMe } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      institutionId,
    };

    // If caller is student in this institution, strictly restrict to their own complaints
    if (req.tenantRole === 'STUDENT') {
      where.studentId = req.user.id;
    } else if (req.tenantRole === 'STAFF') {
      if (assignedToMe === 'true') {
        where.assignedStaffId = req.user.id;
      }
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { complaintNumber: { contains: q } },
        { title: { contains: q } },
        { description: { contains: q } },
        { location: { contains: q } },
      ];
    }

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { id: true, name: true, slaHours: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          student: {
            select: { id: true, name: true, email: true },
          },
          assignedStaff: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        complaints,
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

export async function getComplaintById(req, res, next) {
  try {
    const { id } = req.params;
    const institutionId = req.institution.id;

    // Strict tenant check: complaint MUST belong to active institution
    const complaint = await prisma.complaint.findFirst({
      where: {
        id,
        institutionId,
      },
      include: {
        category: true,
        department: true,
        student: {
          select: { id: true, name: true, email: true, phone: true },
        },
        assignedStaff: {
          select: { id: true, name: true, email: true, phone: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            changedBy: {
              select: { id: true, name: true },
            },
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found in this institution.',
      });
    }

    // If caller is student, verify they own this complaint
    if (req.tenantRole === 'STUDENT' && complaint.studentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own complaints.',
      });
    }

    // Filter out internal comments for students
    if (req.tenantRole === 'STUDENT') {
      complaint.comments = complaint.comments.filter((c) => !c.isInternal);
    }

    return res.status(200).json({
      success: true,
      data: { complaint },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateComplaintStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes, resolutionSummary, rejectionReason } = req.body;
    const institutionId = req.institution.id;

    const complaint = await prisma.complaint.findFirst({
      where: { id, institutionId },
      include: { student: true, assignedStaff: true },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found in this institution.',
      });
    }

    // Staff can only update complaints assigned to them
    if (req.tenantRole === 'STAFF' && complaint.assignedStaffId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not assigned to this complaint.',
      });
    }

    const currentStatus = complaint.status;
    const newStatus = status.toUpperCase();

    // Allowed transition map
    const allowedTransitions = {
      SUBMITTED: ['UNDER_REVIEW', 'IN_PROGRESS', 'REJECTED'],
      UNDER_REVIEW: ['ASSIGNED', 'IN_PROGRESS', 'REJECTED'],
      ASSIGNED: ['IN_PROGRESS', 'ON_HOLD', 'RESOLVED'],
      IN_PROGRESS: ['ON_HOLD', 'RESOLVED'],
      ON_HOLD: ['IN_PROGRESS'],
      RESOLVED: ['CLOSED', 'REOPENED'],
      REOPENED: ['IN_PROGRESS', 'UNDER_REVIEW'],
      REJECTED: [],
      CLOSED: ['REOPENED'],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${newStatus}.`,
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const isResolved = newStatus === 'RESOLVED';
      const isClosed = newStatus === 'CLOSED';

      const updatePayload = {
        status: newStatus,
        ...(isResolved && {
          resolvedAt: new Date(),
          resolutionSummary: resolutionSummary || notes || null,
        }),
        ...(isClosed && {
          closedAt: new Date(),
        }),
        ...(newStatus === 'REJECTED' && {
          rejectionReason: rejectionReason || notes || null,
        }),
      };

      const resComplaint = await tx.complaint.update({
        where: { id: complaint.id },
        data: updatePayload,
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          institutionId,
          oldStatus: currentStatus,
          newStatus,
          changedById: req.user.id,
          notes: notes || `Status updated to ${newStatus}`,
        },
      });

      return resComplaint;
    });

    // Notify the student
    await createNotification({
      userId: complaint.studentId,
      institutionId,
      title: `Complaint Status Updated: ${newStatus}`,
      message: `Your complaint ${complaint.complaintNumber} is now ${newStatus}. ${notes ? `Note: ${notes}` : ''}`,
      link: `/complaints/${complaint.id}`,
      type: 'STATUS_CHANGE',
    });

    await logAuditEvent({
      institutionId,
      userId: req.user.id,
      action: 'STATUS_UPDATED',
      entityType: 'Complaint',
      entityId: complaint.id,
      details: `${complaint.complaintNumber} updated from ${currentStatus} to ${newStatus}`,
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Status updated to ${newStatus}.`,
      data: { complaint: updated },
    });
  } catch (error) {
    next(error);
  }
}

export async function addComment(req, res, next) {
  try {
    const { id } = req.params;
    const { content, isInternal = false } = req.body;
    const institutionId = req.institution.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.',
      });
    }

    const complaint = await prisma.complaint.findFirst({
      where: { id, institutionId },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found in this institution.',
      });
    }

    // Students cannot comment on complaints that aren't theirs, and cannot post internal comments
    const isStudent = req.tenantRole === 'STUDENT';
    if (isStudent && complaint.studentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only comment on your own complaints.',
      });
    }

    const comment = await prisma.complaintComment.create({
      data: {
        complaintId: complaint.id,
        institutionId,
        userId: req.user.id,
        content: content.trim(),
        isInternal: isStudent ? false : Boolean(isInternal),
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    // Notify other party
    if (isStudent && complaint.assignedStaffId) {
      await createNotification({
        userId: complaint.assignedStaffId,
        institutionId,
        title: 'New Student Comment',
        message: `Student commented on ${complaint.complaintNumber}: "${content.substring(0, 60)}..."`,
        link: `/staff/complaints/${complaint.id}`,
        type: 'COMMENT',
      });
    } else if (!isStudent && !isInternal) {
      await createNotification({
        userId: complaint.studentId,
        institutionId,
        title: 'New Staff Update',
        message: `Staff replied on your complaint ${complaint.complaintNumber}: "${content.substring(0, 60)}..."`,
        link: `/complaints/${complaint.id}`,
        type: 'COMMENT',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
}

export async function reopenComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const { reopenReason } = req.body;
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

    if (req.tenantRole === 'STUDENT' && complaint.studentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only reopen your own complaints.',
      });
    }

    if (complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'Only resolved or closed complaints can be reopened.',
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const resComplaint = await tx.complaint.update({
        where: { id: complaint.id },
        data: {
          status: 'REOPENED',
          reopenReason: reopenReason || 'Issue reoccurred after initial resolution.',
          resolvedAt: null,
          closedAt: null,
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          institutionId,
          oldStatus: complaint.status,
          newStatus: 'REOPENED',
          changedById: req.user.id,
          notes: reopenReason || 'Complaint reopened by student.',
        },
      });

      return resComplaint;
    });

    await logAuditEvent({
      institutionId,
      userId: req.user.id,
      action: 'COMPLAINT_REOPENED',
      entityType: 'Complaint',
      entityId: complaint.id,
      details: `${complaint.complaintNumber} reopened with reason: ${reopenReason}`,
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint reopened successfully.',
      data: { complaint: updated },
    });
  } catch (error) {
    next(error);
  }
}

export async function getComplaintHistory(req, res, next) {
  try {
    const { id } = req.params;
    const institutionId = req.institution.id;

    const history = await prisma.complaintStatusHistory.findMany({
      where: {
        complaintId: id,
        institutionId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        changedBy: { select: { id: true, name: true } },
      },
    });

    return res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
}

