import { Router } from 'express';
import ApplicationController from '../controllers/application.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Aplicar a una posición (talent)
router.post('/positions/:positionId/apply', authMiddleware, ApplicationController.applyToPosition);

// Obtener aplicaciones de un talento
router.get('/talent/applications', authMiddleware, ApplicationController.getTalentApplications);

// Obtener aplicaciones de una posición (recruiter/client)
router.get('/positions/:positionId/applications', authMiddleware, ApplicationController.getPositionApplications);

// Iniciar proceso desde una aplicación (recruiter)
router.post('/applications/:applicationId/start-process', authMiddleware, ApplicationController.startProcessFromApplication);

export default router;

