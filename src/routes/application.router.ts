import { Router } from 'express';
import ApplicationController from '../controllers/application.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/positions/:positionId/apply', authMiddleware, ApplicationController.applyToPosition);

router.get('/talent/applications', authMiddleware, ApplicationController.getTalentApplications);

router.get('/positions/:positionId/applications', authMiddleware, ApplicationController.getPositionApplications);

router.post('/applications/:applicationId/start-process', authMiddleware, ApplicationController.startProcessFromApplication);

export default router;

