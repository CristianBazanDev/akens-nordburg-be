import { Router } from 'express';
import SettingsController from '../controllers/settings.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/indicators', authMiddleware, SettingsController.getIndicatorSettings);
router.post('/indicators', authMiddleware, SettingsController.saveIndicatorSettings);

export default router;


