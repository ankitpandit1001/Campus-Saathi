import prisma from '../utils/prisma.js';
import { verifyToken } from '../utils/jwt.js';

export async function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2. Check Authorization header as fallback
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
        message: 'User account not found.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
    }

    // Determine current role context:
    // 1. If Super Admin -> 'SUPER_ADMIN'
    // 2. If caller passed 'x-institution-id', match that membership's role
    // 3. Otherwise first active membership role, default 'STUDENT'
    const requestedInstitutionId = req.headers['x-institution-id'] || req.params.institutionId;
    let activeMembership = null;

    if (requestedInstitutionId) {
      activeMembership = user.memberships.find(
        (m) => m.institutionId === requestedInstitutionId || m.institution?.slug === requestedInstitutionId
      );
    }
    if (!activeMembership && user.memberships.length > 0) {
      activeMembership = user.memberships[0];
    }

    user.role = user.isSuperAdmin ? 'SUPER_ADMIN' : activeMembership ? activeMembership.role : 'STUDENT';
    user.activeInstitutionId = activeMembership ? activeMembership.institutionId : null;

    req.user = user;
    req.activeMembership = activeMembership;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
}
