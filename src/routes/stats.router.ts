import { Router } from 'express';
import StatsController from '../controllers/stats.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/admin', authMiddleware, StatsController.getAdminStats);
router.get('/recruiter', authMiddleware, StatsController.getRecruiterStats);
router.get('/client', authMiddleware, StatsController.getClientStats);

router.post('/goals/monthly', authMiddleware, StatsController.upsertMonthlyGoal);
router.post('/goals/annual', authMiddleware, StatsController.upsertAnnualGoal);

export default router;

