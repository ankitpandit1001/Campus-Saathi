import prisma from '../utils/prisma.js';

export async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      data: { notification: updated },
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
}
