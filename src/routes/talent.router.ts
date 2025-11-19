import { Router } from 'express';
import TalentController from '../controllers/talent.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/:id/profile', authMiddleware, TalentController.getProfile);
router.put('/:id/profile', authMiddleware, TalentController.upsertProfile);

router.get('/:id/cvs', authMiddleware, TalentController.getCVs);
router.post('/:id/cvs', authMiddleware, TalentController.uploadCV);
router.delete('/:id/cvs/:cvId', authMiddleware, TalentController.deleteCV);

export default router;

