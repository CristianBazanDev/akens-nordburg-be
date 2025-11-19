import { Router } from 'express';
import ProcessController from '../controllers/process.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, ProcessController.getProcesses);
router.get('/:id', authMiddleware, ProcessController.getProcessById);
router.post('/', authMiddleware, ProcessController.createProcess);
router.put('/:id', authMiddleware, ProcessController.updateProcess);
router.delete('/:id', authMiddleware, ProcessController.deleteProcess);

router.post('/:id/stages', authMiddleware, ProcessController.addStage);

router.post('/:id/candidates', authMiddleware, ProcessController.addCandidate);
router.put('/:id/candidates/:candidateId', authMiddleware, ProcessController.updateCandidate);
router.delete('/:id/candidates/:candidateId', authMiddleware, ProcessController.removeCandidate);

export default router;

