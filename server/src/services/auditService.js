import prisma from '../utils/prisma.js';

export async function logAuditEvent({
  userId = null,
  action,
  entityType,
  entityId = null,
  details = null,
  req = null,
}) {
  try {
    const ipAddress = req ? req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress : null;
    const detailString = typeof details === 'object' ? JSON.stringify(details) : details;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: detailString,
        ipAddress: ipAddress ? String(ipAddress) : null,
      },
    });
  } catch (error) {
    console.error('[AuditService] Failed to record audit log:', error.message);
  }
}
