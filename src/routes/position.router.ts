import { Router } from 'express';
import PositionController from '../controllers/position.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, PositionController.getPositions);
router.get('/:id', authMiddleware, PositionController.getPositionById);
router.post('/', authMiddleware, PositionController.createPosition);
router.put('/:id', authMiddleware, PositionController.updatePosition);
router.delete('/:id', authMiddleware, PositionController.deletePosition);

export default router;

