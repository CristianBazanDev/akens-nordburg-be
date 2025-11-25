import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../services/prisma';
import Messages from '../constants/messages';
import logger from '../services/logger';

const NotificationController = {
  getNotifications: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const { read, limit = 50 } = req.query;

      const where: any = { userId };
      if (read !== undefined) {
        where.read = read === 'true';
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: parseInt(limit as string),
      });

      res.json(notifications);
    } catch (error) {
      logger.error('Error in getNotifications', { error });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  markAsRead: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const notificationId = parseInt(id);

      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification || notification.userId !== userId) {
        res.status(404).json({ error: 'Notificación no encontrada' });
        return;
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      res.json(updated);
    } catch (error) {
      logger.error('Error in markAsRead', { error, notificationId: req.params.id });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  markAllAsRead: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
        },
      });

      res.json({ message: 'Todas las notificaciones han sido marcadas como leídas' });
    } catch (error) {
      logger.error('Error in markAllAsRead', { error });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  getUnreadCount: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const count = await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });

      res.json({ count });
    } catch (error) {
      logger.error('Error in getUnreadCount', { error });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },
};

export default NotificationController;

