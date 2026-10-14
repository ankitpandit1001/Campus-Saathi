import prisma from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken, getCookieOptions } from '../utils/jwt.js';
import { logAuditEvent } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export async function register(req, res, next) {
  try {
    const { email, password, name, phone, studentId, department, institutionId } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await hashPassword(password);

    // If an institutionId was selected, verify institution exists and is active
    let targetInstitution = null;
    if (institutionId) {
      targetInstitution = await prisma.institution.findUnique({
        where: { id: institutionId },
        include: { settings: true },
      });

      if (!targetInstitution || targetInstitution.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Selected institution is not accepting registrations.',
        });
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone: phone || null,
        isActive: true,
      },
    });

    // Create initial membership if institution provided
    let createdMembership = null;
    if (targetInstitution) {
      // Find or create default department if string provided
      let deptId = null;
      if (department) {
        const foundDept = await prisma.department.findFirst({
          where: { institutionId: targetInstitution.id, name: department },
        });
        if (foundDept) {
          deptId = foundDept.id;
        } else {
          const newDept = await prisma.department.create({
            data: {
              institutionId: targetInstitution.id,
              name: department,
              code: department.substring(0, 4).toUpperCase(),
            },
          });
          deptId = newDept.id;
        }
      }

      createdMembership = await prisma.membership.create({
        data: {
          userId: user.id,
          institutionId: targetInstitution.id,
          role: 'STUDENT',
          status: 'ACTIVE',
          departmentId: deptId,
          studentId: studentId || null,
        },
        include: {
          institution: true,
          department: true,
        },
      });
    }

    const token = signToken({ userId: user.id, isSuperAdmin: user.isSuperAdmin });
    res.cookie('token', token, getCookieOptions());

    await logAuditEvent({
      institutionId: targetInstitution?.id,
      userId: user.id,
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: user.id,
      details: `Student registered: ${user.name} (${user.email}) in institution: ${targetInstitution?.name || 'Global'}`,
      req,
    });

    await createNotification({
      userId: user.id,
      institutionId: targetInstitution?.id,
      title: 'Welcome to CampusSaathi!',
      message: 'Your account is active. Explore your campus maintenance dashboard.',
      link: '/dashboard',
      type: 'INFO',
    });

    const memberships = createdMembership ? [createdMembership] : [];

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          isSuperAdmin: user.isSuperAdmin,
          role: createdMembership ? createdMembership.role : 'STUDENT',
          activeInstitution: targetInstitution || null,
          memberships,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, institutionId } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: {
            institution: {
              select: {
                id: true,
                name: true,
                slug: true,
                code: true,
                type: true,
                city: true,
                state: true,
                status: true,
                isDemo: true,
                logoUrl: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact campus administration.',
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const token = signToken({ userId: user.id, isSuperAdmin: user.isSuperAdmin });
    res.cookie('token', token, getCookieOptions());

    // Determine active institution context
    let activeMembership = null;
    if (institutionId) {
      activeMembership = user.memberships.find(
        (m) => m.institutionId === institutionId || m.institution?.slug === institutionId
      );
    }
    if (!activeMembership && user.memberships.length > 0) {
      activeMembership = user.memberships[0];
    }

    const effectiveRole = user.isSuperAdmin
      ? 'SUPER_ADMIN'
      : activeMembership
      ? activeMembership.role
      : 'STUDENT';

    await logAuditEvent({
      institutionId: activeMembership?.institutionId || null,
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      details: `User logged in: ${user.email} as ${effectiveRole}`,
      req,
    });

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      isSuperAdmin: user.isSuperAdmin,
      role: effectiveRole,
      department: activeMembership?.department?.name || null,
      studentId: activeMembership?.studentId || null,
      activeInstitution: activeMembership ? activeMembership.institution : null,
      memberships: user.memberships,
    };

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: sanitizedUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function switchInstitution(req, res, next) {
  try {
    const { institutionId } = req.body;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Target institutionId is required.',
      });
    }

    // Super Admin can switch to any institution
    if (req.user.isSuperAdmin) {
      const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
      });

      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Target institution not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: `Switched context to ${institution.name} (Super Admin view).`,
        data: {
          activeInstitution: institution,
          role: 'SUPER_ADMIN',
        },
      });
    }

    // Verify user has active membership in target institution
    const membership = await prisma.membership.findUnique({
      where: {
        userId_institutionId: {
          userId: req.user.id,
          institutionId,
        },
      },
      include: {
        institution: true,
        department: true,
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'You do not have active membership in this institution.',
      });
    }

    if (membership.institution.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Institution is currently ${membership.institution.status}. Operations restricted.`,
      });
    }

    await logAuditEvent({
      institutionId: membership.institutionId,
      userId: req.user.id,
      action: 'SWITCH_INSTITUTION',
      entityType: 'Institution',
      entityId: membership.institutionId,
      details: `Switched active institution to ${membership.institution.name} as ${membership.role}`,
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Active institution switched to ${membership.institution.name}.`,
      data: {
        activeInstitution: membership.institution,
        activeMembership: membership,
        role: membership.role,
        department: membership.department?.name || null,
        studentId: membership.studentId || null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.user) {
      await logAuditEvent({
        userId: req.user.id,
        action: 'USER_LOGOUT',
        entityType: 'User',
        entityId: req.user.id,
        details: `User logged out: ${req.user.email}`,
        req,
      });
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res) {
  const activeMembership = req.activeMembership || (req.user.memberships && req.user.memberships[0]);

  const sanitizedUser = {
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    phone: req.user.phone,
    avatarUrl: req.user.avatarUrl,
    isSuperAdmin: req.user.isSuperAdmin,
    role: req.user.role,
    department: activeMembership?.department?.name || null,
    studentId: activeMembership?.studentId || null,
    activeInstitution: activeMembership ? activeMembership.institution : null,
    memberships: req.user.memberships || [],
  };

  return res.status(200).json({
    success: true,
    data: {
      user: sanitizedUser,
    },
  });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        isSuperAdmin: true,
        isActive: true,
      },
    });

    await logAuditEvent({
      userId: req.user.id,
      action: 'PROFILE_UPDATED',
      entityType: 'User',
      entityId: req.user.id,
      details: 'User updated personal profile',
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash },
    });

    await logAuditEvent({
      userId: req.user.id,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: req.user.id,
      details: 'User changed account password',
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
}
