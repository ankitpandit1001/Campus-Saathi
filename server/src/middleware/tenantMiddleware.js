import prisma from '../utils/prisma.js';

/**
 * Tenant Isolation Middleware
 * Resolves the institution context for the request and strictly validates
 * that the user has an active membership in the target institution.
 */
export async function resolveTenant(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before tenant resolution.',
      });
    }

    // 1. Resolve institutionId from params, headers, query, or body
    let institutionId =
      req.params.institutionId ||
      req.headers['x-institution-id'] ||
      req.query.institutionId ||
      (req.body && req.body.institutionId);

    // If not explicitly provided, fallback to user's first active membership
    if (!institutionId) {
      const defaultMembership = await prisma.membership.findFirst({
        where: {
          userId: req.user.id,
          status: 'ACTIVE',
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: { institution: true },
      });

      if (defaultMembership && defaultMembership.institution) {
        institutionId = defaultMembership.institution.id;
      }
    }

    if (!institutionId) {
      // If user is Platform Super Admin, they may operate across institutions
      if (req.user.isSuperAdmin) {
        req.isSuperAdmin = true;
        return next();
      }

      return res.status(400).json({
        success: false,
        message: 'Institution context is required. Please specify an active institution.',
      });
    }

    // 2. Fetch institution record
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Target institution was not found.',
      });
    }

    // 3. Platform Super Admin can inspect any institution
    if (req.user.isSuperAdmin) {
      req.institution = institution;
      req.institutionId = institution.id;
      req.tenantRole = 'SUPER_ADMIN';
      req.isSuperAdmin = true;
      return next();
    }

    // 4. Verify institution status
    if (institution.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Institution operations are disabled. Current status: ${institution.status}. Reason: ${institution.rejectionReason || 'Under administrative review.'}`,
      });
    }

    // 5. Verify user's active membership in target institution
    const membership = await prisma.membership.findUnique({
      where: {
        userId_institutionId: {
          userId: req.user.id,
          institutionId: institution.id,
        },
      },
      include: {
        department: true,
      },
    });

    if (!membership || membership.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have an active membership in this institution.',
      });
    }

    // 6. Attach verified tenant context to request
    req.institution = institution;
    req.institutionId = institution.id;
    req.membership = membership;
    req.tenantRole = membership.role; // ADMIN, STAFF, STUDENT

    next();
  } catch (error) {
    console.error('[Tenant Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify tenant isolation context.',
    });
  }
}

/**
 * Tenant Role Guard
 * Enforces that the caller possesses one of the allowed roles within the active institution.
 */
export function requireTenantRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Platform Super Admin bypasses tenant role restrictions
    if (req.user.isSuperAdmin) {
      return next();
    }

    const currentRole = req.tenantRole || req.membership?.role;

    if (!currentRole || !allowedRoles.includes(currentRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Permitted institution roles: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
}

/**
 * Super Admin Guard
 * Restricts access to platform-level governance and institution management.
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (!req.user.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Platform Super Admin privileges required.',
    });
  }

  next();
}
