import prisma from '../utils/prisma.js';
import { logAuditEvent } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Platform Operational Metrics (Super Admin)
 */
export async function getPlatformMetrics(req, res, next) {
  try {
    const [
      totalInstitutions,
      pendingInstitutions,
      activeInstitutions,
      suspendedInstitutions,
      totalComplaints,
      resolvedComplaints,
      inProgressComplaints,
      totalUsers,
    ] = await Promise.all([
      prisma.institution.count(),
      prisma.institution.count({ where: { status: 'PENDING' } }),
      prisma.institution.count({ where: { status: 'ACTIVE' } }),
      prisma.institution.count({ where: { status: 'SUSPENDED' } }),
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }),
      prisma.complaint.count({ where: { status: { in: ['IN_PROGRESS', 'UNDER_REVIEW'] } } }),
      prisma.user.count(),
    ]);

    const recentInstitutions = await prisma.institution.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        code: true,
        type: true,
        city: true,
        state: true,
        status: true,
        contactEmail: true,
        createdAt: true,
        _count: {
          select: {
            memberships: true,
            complaints: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalInstitutions,
          pendingInstitutions,
          activeInstitutions,
          suspendedInstitutions,
          totalComplaints,
          resolvedComplaints,
          inProgressComplaints,
          totalUsers,
        },
        recentInstitutions,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List Institutions for Platform Governance (Super Admin)
 */
export async function listAllInstitutions(req, res, next) {
  try {
    const { status, type, search, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (type && type !== 'ALL') {
      where.type = type.toUpperCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { code: { contains: q } },
        { contactEmail: { contains: q } },
        { city: { contains: q } },
        { state: { contains: q } },
      ];
    }

    const [total, institutions] = await Promise.all([
      prisma.institution.count({ where }),
      prisma.institution.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              memberships: true,
              complaints: true,
              departments: true,
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        institutions,
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

/**
 * Manage Institution Status (Super Admin: Approve, Reject, Suspend, Reactivate)
 */
export async function updateInstitutionStatus(req, res, next) {
  try {
    const { institutionId } = req.params;
    const { status, rejectionReason } = req.body;

    const validStatuses = ['ACTIVE', 'SUSPENDED', 'REJECTED', 'PENDING'];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const normalizedStatus = status.toUpperCase();

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        memberships: {
          where: { role: 'ADMIN' },
          select: { userId: true },
        },
      },
    });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found.',
      });
    }

    // Update in transaction: if approving, also activate pending admin memberships
    const updated = await prisma.$transaction(async (tx) => {
      const inst = await tx.institution.update({
        where: { id: institution.id },
        data: {
          status: normalizedStatus,
          rejectionReason: rejectionReason || null,
        },
      });

      if (normalizedStatus === 'ACTIVE') {
        // Activate any pending admin memberships
        await tx.membership.updateMany({
          where: {
            institutionId: inst.id,
            role: 'ADMIN',
            status: 'PENDING',
          },
          data: { status: 'ACTIVE' },
        });
      }

      return inst;
    });

    // Notify institution admin users
    for (const admin of institution.memberships) {
      await createNotification({
        userId: admin.userId,
        institutionId: institution.id,
        title: `Institution ${normalizedStatus === 'ACTIVE' ? 'Approved & Activated' : `Status: ${normalizedStatus}`}`,
        message:
          normalizedStatus === 'ACTIVE'
            ? `Your institution registration for ${institution.name} has been approved by the Platform Super Admin.`
            : `Your institution status is now ${normalizedStatus}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
        link: '/admin/dashboard',
        type: 'INFO',
      });
    }

    await logAuditEvent({
      institutionId: institution.id,
      userId: req.user.id,
      action: 'PLATFORM_INSTITUTION_STATUS_CHANGED',
      entityType: 'Institution',
      entityId: institution.id,
      details: `Super Admin changed institution status from ${institution.status} to ${normalizedStatus}`,
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Institution status updated to ${normalizedStatus}.`,
      data: { institution: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Platform Audit Logs (Super Admin)
 */
export async function getPlatformAuditLogs(req, res, next) {
  try {
    const { action, entityType, page = 1, limit = 25 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (action && action !== 'ALL') where.action = action;
    if (entityType && entityType !== 'ALL') where.entityType = entityType;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          institution: {
            select: { id: true, name: true, code: true },
          },
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
