import { Router } from 'express';
import NotificationController from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, NotificationController.getNotifications);
router.get('/unread-count', authMiddleware, NotificationController.getUnreadCount);
router.put('/:id/read', authMiddleware, NotificationController.markAsRead);
router.put('/read-all', authMiddleware, NotificationController.markAllAsRead);

export default router;

