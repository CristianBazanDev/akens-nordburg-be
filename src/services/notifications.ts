import { prisma } from './prisma';
import logger from './logger';

interface CreateNotificationParams {
  userId: number;
  type: string;
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
}

export const createNotification = async (params: CreateNotificationParams): Promise<void> => {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedId: params.relatedId || null,
        relatedType: params.relatedType || null,
        read: false,
      },
    });
  } catch (error) {
    logger.error('Error creating notification', { error, params });
  }
};

