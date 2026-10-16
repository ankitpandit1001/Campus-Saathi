import prisma from '../utils/prisma.js';
import { hashPassword } from '../utils/password.js';
import { logAuditEvent } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Public Institution Directory
 * Lists all verified, active institutions with search and filtering
 */
export async function listInstitutions(req, res, next) {
  try {
    const { search, type, state, city, page = 1, limit = 12 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      status: 'ACTIVE',
    };

    if (type && type !== 'ALL') {
      where.type = type.toUpperCase();
    }

    if (state && state !== 'ALL') {
      where.state = { contains: state };
    }

    if (city && city !== 'ALL') {
      where.city = { contains: city };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { code: { contains: q } },
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
        orderBy: { name: 'asc' },
        select: {
          id: true,
          slug: true,
          code: true,
          name: true,
          type: true,
          state: true,
          city: true,
          address: true,
          contactEmail: true,
          contactPhone: true,
          website: true,
          logoUrl: true,
          status: true,
          isDemo: true,
          createdAt: true,
          _count: {
            select: {
              departments: true,
              categories: true,
              memberships: true,
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
 * Public Institution Profile Details
 */
export async function getInstitutionById(req, res, next) {
  try {
    const { institutionId } = req.params;

    const institution = await prisma.institution.findFirst({
      where: {
        OR: [{ id: institutionId }, { slug: institutionId }],
      },
      include: {
        departments: {
          where: { isActive: true },
          select: { id: true, name: true, code: true },
        },
        categories: {
          where: { isActive: true },
          select: { id: true, name: true, description: true, slaHours: true },
        },
        settings: {
          select: {
            allowSelfRegistration: true,
            requireEmailDomain: true,
            defaultSlaHours: true,
          },
        },
        _count: {
          select: {
            complaints: true,
            memberships: true,
          },
        },
      },
    });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { institution },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public Institution Registration Flow
 * Creates an institution in 'PENDING' state and awaits Super Admin approval
 */
export async function registerInstitution(req, res, next) {
  try {
    const {
      name,
      code,
      type = 'COLLEGE',
      state,
      city,
      address,
      contactEmail,
      contactPhone,
      website,
      adminName,
      adminEmail,
      adminPassword,
      adminPhone,
    } = req.body;

    const normalizedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const normalizedCode = code ? code.trim().toUpperCase() : name.substring(0, 4).toUpperCase();

    // Check duplicate code or slug
    const existing = await prisma.institution.findFirst({
      where: {
        OR: [{ slug: normalizedSlug }, { code: normalizedCode }, { contactEmail }],
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An institution with this name, code, or official email has already been registered.',
      });
    }

    const passwordHash = await hashPassword(adminPassword);

    // Run creation inside database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or link Admin User
      let adminUser = await tx.user.findUnique({
        where: { email: adminEmail },
      });

      if (!adminUser) {
        adminUser = await tx.user.create({
          data: {
            email: adminEmail,
            passwordHash,
            name: adminName,
            phone: adminPhone || null,
            isActive: true,
          },
        });
      }

      // 2. Create Institution in PENDING state
      const institution = await tx.institution.create({
        data: {
          name,
          slug: normalizedSlug,
          code: normalizedCode,
          type: type.toUpperCase(),
          state,
          city,
          address: address || null,
          contactEmail,
          contactPhone: contactPhone || null,
          website: website || null,
          status: 'PENDING',
          isDemo: false,
        },
      });

      // 3. Create Settings & Service Level Policies
      await tx.institutionSettings.create({
        data: {
          institutionId: institution.id,
          allowSelfRegistration: true,
          defaultSlaHours: 48,
          slaEscalationEnabled: true,
        },
      });

      await tx.serviceLevelPolicy.createMany({
        data: [
          { institutionId: institution.id, priority: 'LOW', targetResponseHours: 48, targetResolutionHours: 120 },
          { institutionId: institution.id, priority: 'MEDIUM', targetResponseHours: 24, targetResolutionHours: 72 },
          { institutionId: institution.id, priority: 'HIGH', targetResponseHours: 8, targetResolutionHours: 36 },
          { institutionId: institution.id, priority: 'URGENT', targetResponseHours: 2, targetResolutionHours: 12 },
        ],
      });

      // 4. Create initial Admin Membership in PENDING status (activated upon institution approval)
      const membership = await tx.membership.create({
        data: {
          userId: adminUser.id,
          institutionId: institution.id,
          role: 'ADMIN',
          status: 'PENDING',
          staffTitle: 'Lead Administrator & Applicant',
        },
      });

      // 5. Default Starter Departments & Categories
      await tx.department.createMany({
        data: [
          { institutionId: institution.id, name: 'General Campus Infrastructure', code: 'GEN' },
          { institutionId: institution.id, name: 'Electrical & Power Systems', code: 'ELEC' },
          { institutionId: institution.id, name: 'IT & Digital Infrastructure', code: 'IT' },
        ],
      });

      await tx.complaintCategory.createMany({
        data: [
          {
            institutionId: institution.id,
            name: 'Electricity & Lighting',
            description: 'Classroom power, switchboards, wiring, hallway lighting',
            slaHours: 24,
          },
          {
            institutionId: institution.id,
            name: 'Internet & Network',
            description: 'Campus Wi-Fi connectivity, lab ethernet drops',
            slaHours: 24,
          },
          {
            institutionId: institution.id,
            name: 'Sanitation & Water',
            description: 'Restrooms, water dispensers, plumbing leaks',
            slaHours: 48,
          },
          {
            institutionId: institution.id,
            name: 'Furniture & Fixtures',
            description: 'Desks, chairs, whiteboards, door locks',
            slaHours: 72,
          },
        ],
      });

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          institutionId: institution.id,
          userId: adminUser.id,
          action: 'INSTITUTION_REGISTERED',
          entityType: 'Institution',
          entityId: institution.id,
          details: `Institution registration submitted by ${adminName} (${adminEmail}). Awaiting Super Admin review.`,
        },
      });

      return { institution, adminUser };
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    return res.status(201).json({
      success: true,
      message: 'Institution registration submitted successfully. It will be activated after Super Admin review.',
      data: {
        institution: result.institution,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Join Request: User submits request to join an active institution
 */
export async function submitJoinRequest(req, res, next) {
  try {
    const { institutionId } = req.params;
    const { requestedRole = 'STUDENT', departmentId, studentId, notes } = req.body;

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution || institution.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'This institution is not currently accepting join requests.',
      });
    }

    // Check existing membership
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_institutionId: {
          userId: req.user.id,
          institutionId: institution.id,
        },
      },
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: `You already have an existing membership (${existingMembership.status}) in this institution.`,
      });
    }

    // Check existing pending request
    const existingRequest = await prisma.institutionJoinRequest.findFirst({
      where: {
        userId: req.user.id,
        institutionId: institution.id,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending join request awaiting administrator review.',
      });
    }

    const joinRequest = await prisma.institutionJoinRequest.create({
      data: {
        institutionId: institution.id,
        userId: req.user.id,
        requestedRole: requestedRole.toUpperCase(),
        departmentId: departmentId || null,
        studentId: studentId || null,
        notes: notes || null,
        status: 'PENDING',
      },
    });

    // Notify Institution Admins
    const admins = await prisma.membership.findMany({
      where: {
        institutionId: institution.id,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      select: { userId: true },
    });

    for (const a of admins) {
      await createNotification({
        userId: a.userId,
        institutionId: institution.id,
        title: 'New Member Join Request',
        message: `${req.user.name} requested to join as ${requestedRole}. Review in Member Management.`,
        link: '/admin/members',
        type: 'INFO',
      });
    }

    await logAuditEvent({
      institutionId: institution.id,
      userId: req.user.id,
      action: 'JOIN_REQUEST_SUBMITTED',
      entityType: 'InstitutionJoinRequest',
      entityId: joinRequest.id,
      details: `${req.user.name} submitted join request for ${requestedRole}`,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Join request submitted successfully. The institution administrator will review your application.',
      data: { joinRequest },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List Join Requests (Institution Admin)
 */
export async function listJoinRequests(req, res, next) {
  try {
    const { status = 'PENDING' } = req.query;

    const joinRequests = await prisma.institutionJoinRequest.findMany({
      where: {
        institutionId: req.institution.id,
        ...(status !== 'ALL' && { status }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { joinRequests },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Review Join Request (Institution Admin: Approve or Reject)
 */
export async function reviewJoinRequest(req, res, next) {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return res.status(400).json({
        success: false,
        message: "Action must be either 'APPROVE' or 'REJECT'.",
      });
    }

    const joinRequest = await prisma.institutionJoinRequest.findFirst({
      where: {
        id: requestId,
        institutionId: req.institution.id,
      },
      include: { user: true },
    });

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found in your institution.',
      });
    }

    if (joinRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This join request has already been ${joinRequest.status.toLowerCase()}.`,
      });
    }

    if (action === 'APPROVE') {
      await prisma.$transaction([
        prisma.institutionJoinRequest.update({
          where: { id: joinRequest.id },
          data: {
            status: 'APPROVED',
            reviewedById: req.user.id,
            reviewedAt: new Date(),
          },
        }),
        prisma.membership.upsert({
          where: {
            userId_institutionId: {
              userId: joinRequest.userId,
              institutionId: req.institution.id,
            },
          },
          update: {
            role: joinRequest.requestedRole,
            status: 'ACTIVE',
            departmentId: joinRequest.departmentId,
            studentId: joinRequest.studentId,
          },
          create: {
            userId: joinRequest.userId,
            institutionId: req.institution.id,
            role: joinRequest.requestedRole,
            status: 'ACTIVE',
            departmentId: joinRequest.departmentId,
            studentId: joinRequest.studentId,
          },
        }),
      ]);

      await createNotification({
        userId: joinRequest.userId,
        institutionId: req.institution.id,
        title: 'Membership Approved!',
        message: `Your membership application to ${req.institution.name} as ${joinRequest.requestedRole} has been approved.`,
        link: '/dashboard',
        type: 'INFO',
      });
    } else {
      await prisma.institutionJoinRequest.update({
        where: { id: joinRequest.id },
        data: {
          status: 'REJECTED',
          reviewedById: req.user.id,
          reviewedAt: new Date(),
        },
      });

      await createNotification({
        userId: joinRequest.userId,
        institutionId: req.institution.id,
        title: 'Membership Application Update',
        message: `Your application to join ${req.institution.name} was not approved at this time.`,
        link: '/institutions',
        type: 'INFO',
      });
    }

    await logAuditEvent({
      institutionId: req.institution.id,
      userId: req.user.id,
      action: `JOIN_REQUEST_${action}`,
      entityType: 'InstitutionJoinRequest',
      entityId: joinRequest.id,
      details: `${req.user.name} reviewed join request from ${joinRequest.user.name} -> ${action}`,
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Join request has been ${action === 'APPROVE' ? 'approved' : 'rejected'}.`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List Institution Members (Institution Admin)
 */
export async function listMembers(req, res, next) {
  try {
    const { role, status, search } = req.query;

    const where = {
      institutionId: req.institution.id,
    };

    if (role && role !== 'ALL') {
      where.role = role.toUpperCase();
    }

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (search && search.trim()) {
      where.user = {
        OR: [
          { name: { contains: search.trim() } },
          { email: { contains: search.trim() } },
        ],
      };
    }

    const members = await prisma.membership.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
            createdAt: true,
          },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { members },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Membership Status (Institution Admin: Suspend, Revoke, Reactivate)
 */
export async function updateMembershipStatus(req, res, next) {
  try {
    const { membershipId } = req.params;
    const { status, role } = req.body;

    const membership = await prisma.membership.findFirst({
      where: {
        id: membershipId,
        institutionId: req.institution.id,
      },
      include: { user: true },
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found in your institution.',
      });
    }

    // Do not allow revoking oneself if last admin
    if (membership.userId === req.user.id && status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'You cannot revoke or suspend your own administrator membership.',
      });
    }

    const updated = await prisma.membership.update({
      where: { id: membership.id },
      data: {
        ...(status && { status: status.toUpperCase() }),
        ...(role && { role: role.toUpperCase() }),
      },
      include: { user: true },
    });

    await logAuditEvent({
      institutionId: req.institution.id,
      userId: req.user.id,
      action: 'MEMBERSHIP_STATUS_CHANGED',
      entityType: 'Membership',
      entityId: membership.id,
      details: `Changed ${membership.user.name}'s membership status to ${status || membership.status}`,
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Membership updated successfully.',
      data: { membership: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Institution Settings (Institution Admin)
 */
export async function getInstitutionSettings(req, res, next) {
  try {
    const [settings, policies, departments, categories] = await Promise.all([
      prisma.institutionSettings.findUnique({
        where: { institutionId: req.institution.id },
      }),
      prisma.serviceLevelPolicy.findMany({
        where: { institutionId: req.institution.id },
      }),
      prisma.department.findMany({
        where: { institutionId: req.institution.id },
      }),
      prisma.complaintCategory.findMany({
        where: { institutionId: req.institution.id },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        institution: req.institution,
        settings,
        policies,
        departments,
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Institution Settings (Institution Admin)
 */
export async function updateInstitutionSettings(req, res, next) {
  try {
    const { allowSelfRegistration, defaultSlaHours, slaEscalationEnabled } = req.body;

    const updated = await prisma.institutionSettings.upsert({
      where: { institutionId: req.institution.id },
      update: {
        ...(allowSelfRegistration !== undefined && { allowSelfRegistration }),
        ...(defaultSlaHours !== undefined && { defaultSlaHours: parseInt(defaultSlaHours, 10) }),
        ...(slaEscalationEnabled !== undefined && { slaEscalationEnabled }),
      },
      create: {
        institutionId: req.institution.id,
        allowSelfRegistration: allowSelfRegistration ?? true,
        defaultSlaHours: parseInt(defaultSlaHours, 10) || 48,
        slaEscalationEnabled: slaEscalationEnabled ?? true,
      },
    });

    await logAuditEvent({
      institutionId: req.institution.id,
      userId: req.user.id,
      action: 'SETTINGS_UPDATED',
      entityType: 'InstitutionSettings',
      entityId: updated.id,
      details: 'Institution settings and SLA policies updated',
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      data: { settings: updated },
    });
  } catch (error) {
    next(error);
  }
}
