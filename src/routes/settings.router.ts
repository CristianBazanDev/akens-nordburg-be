import { Router } from 'express';
import SettingsController from '../controllers/settings.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/indicators', authMiddleware, SettingsController.getIndicatorSettings);
router.post('/indicators', authMiddleware, SettingsController.saveIndicatorSettings);

router.get('/tenant', authMiddleware, SettingsController.getTenantConfig);
router.get('/tenants', authMiddleware, SettingsController.getAllTenants);
router.post('/tenants', authMiddleware, SettingsController.createTenant);
router.put('/tenant/:tenant', authMiddleware, SettingsController.updateTenantConfig);

export default router;







