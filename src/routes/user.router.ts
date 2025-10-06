import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, UserController.getUsers);
router.get('/:id', authMiddleware, UserController.getUserById);

router.post('/rol/', authMiddleware, UserController.getUsersByRol);

router.post('/', UserController.createUser);

router.put('/', authMiddleware, UserController.updateUser);

router.delete('/:id', authMiddleware, UserController.deleteUser);

export default router;
