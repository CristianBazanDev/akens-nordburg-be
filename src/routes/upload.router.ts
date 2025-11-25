import { Router } from 'express';
import UploadController from '../controllers/upload.controller';
import { authMiddleware } from '../middleware/auth';
import { uploadProfilePicture, uploadCV } from '../middleware/upload';

const router = Router();

router.put(
  '/users/:id/profile-picture',
  authMiddleware,
  uploadProfilePicture.single('profilePicture'),
  UploadController.uploadProfilePicture
);

router.post(
  '/talents/:id/cvs/upload',
  authMiddleware,
  uploadCV.single('cv'),
  UploadController.uploadCV
);

export default router;

