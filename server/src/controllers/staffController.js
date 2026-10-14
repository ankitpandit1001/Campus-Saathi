import prisma from '../utils/prisma.js';
import { logAuditEvent } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export async function getAssignedComplaints(req, res, next) {
  try {
    const institutionId = req.institution.id;
    const { categoryId, status, priority, search, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      institutionId,
      assignments: {
        some: {
          staffId: req.user.id,
          isActive: true,
        },
      },
    };

    if (categoryId && categoryId !== 'ALL') where.categoryId = categoryId;
    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { complaintNumber: { contains: term } },
        { title: { contains: term } },
        { location: { contains: term } },
      ];
    }

    const [totalCount, complaints] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          department: true,
          student: {
            select: { id: true, name: true, email: true },
          },
          assignments: {
            where: { staffId: req.user.id, isActive: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        complaints,
        pagination: {
          currentPage: pageNum,
          pageSize: limitNum,
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStaffComplaintDetail(req, res, next) {
  try {
    const { id } = req.params;
    const institutionId = req.institution.id;

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
        assignments: {
          where: { isActive: true },
          include: {
            staff: { select: { id: true, name: true, email: true } },
            assignedBy: { select: { id: true, name: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            changedBy: { select: { id: true, name: true } },
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found in your assigned institution.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { complaint },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStaffStats(req, res, next) {
  try {
    const institutionId = req.institution.id;

    const staffAssignments = await prisma.complaintAssignment.findMany({
      where: {
        staffId: req.user.id,
        complaint: { institutionId },
      },
      include: {
        complaint: {
          select: {
            id: true,
            status: true,
            priority: true,
            createdAt: true,
            resolvedAt: true,
          },
        },
      },
    });

    const totalAssigned = staffAssignments.length;
    const inProgress = staffAssignments.filter((a) =>
      ['ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW'].includes(a.complaint.status)
    ).length;
    const resolved = staffAssignments.filter((a) =>
      ['RESOLVED', 'CLOSED'].includes(a.complaint.status)
    ).length;
    const onHold = staffAssignments.filter((a) => a.complaint.status === 'ON_HOLD').length;

    // Calculate Average Resolution Time
    const resolvedList = staffAssignments.filter((a) => a.complaint.resolvedAt);
    let avgResolutionHours = 0;
    if (resolvedList.length > 0) {
      const totalMs = resolvedList.reduce((acc, a) => {
        return (
          acc +
          (new Date(a.complaint.resolvedAt).getTime() - new Date(a.complaint.createdAt).getTime())
        );
      }, 0);
      avgResolutionHours = Number((totalMs / (resolvedList.length * 3600 * 1000)).toFixed(1));
    }

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalAssigned,
          inProgress,
          resolved,
          onHold,
          avgResolutionHours,
          completionRate:
            totalAssigned > 0 ? Number(((resolved / totalAssigned) * 100).toFixed(1)) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
