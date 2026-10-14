import prisma from './prisma.js';

/**
 * Generates an institution-scoped, unique human-readable complaint number.
 * Example: CF-NSTAR-2026-0001 or CF-GREEN-2026-0002
 */
export async function generateComplaintNumber(institutionId, institutionCode = 'GEN') {
  const currentYear = new Date().getFullYear();
  const cleanCode = (institutionCode || 'GEN').trim().toUpperCase();
  const prefix = `CF-${cleanCode}-${currentYear}-`;

  const latestComplaint = await prisma.complaint.findFirst({
    where: {
      institutionId,
      complaintNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      complaintNumber: 'desc',
    },
    select: {
      complaintNumber: true,
    },
  });

  let nextSequence = 1;
  if (latestComplaint && latestComplaint.complaintNumber) {
    const parts = latestComplaint.complaintNumber.split('-');
    if (parts.length >= 4) {
      const parsedSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(parsedSeq)) {
        nextSequence = parsedSeq + 1;
      }
    }
  }

  const paddedSeq = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSeq}`;
}
