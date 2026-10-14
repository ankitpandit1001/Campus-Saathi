import prisma from '../utils/prisma.js';

export async function createNotification({
  userId,
  title,
  message,
  link = null,
  type = 'INFO',
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        link,
        type,
      },
    });
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
    return null;
  }
}
