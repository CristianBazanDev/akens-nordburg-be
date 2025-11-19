import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../services/prisma';
import { getFileUrl, deleteFile } from '../middleware/upload';
import path from 'path';
import Messages from '../constants/messages';
import logger from '../services/logger';

const UploadController = {
  uploadProfilePicture: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const authenticatedUserId = req.user?.userId;

      if (authenticatedUserId !== userId) {
        logger.warn(`Unauthorized profile picture upload attempt`, { authenticatedUserId, userId });
        res.status(403).json({ error: Messages.GENERAL.FORBIDDEN });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No se proporcionó ningún archivo' });
        return;
      }

      // Obtener usuario actual para eliminar foto anterior si existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        // Eliminar archivo subido si el usuario no existe
        deleteFile(req.file.path);
        res.status(404).json({ error: Messages.USER.NOT_FOUND });
        return;
      }

      // Eliminar foto anterior si existe
      if (user.profilePicture) {
        const oldFileName = user.profilePicture.split('/').pop();
        if (oldFileName) {
          const oldFilePath = path.join(process.cwd(), 'uploads', 'profile-pictures', oldFileName);
          deleteFile(oldFilePath);
        }
      }

      // Guardar nueva URL de foto de perfil
      const fileUrl = getFileUrl(req.file.filename, 'profile');
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: fileUrl },
        include: {
          rol: true,
        },
      });

      logger.info(`Profile picture uploaded for user: ${userId}`, { userId, fileName: req.file.filename });
      res.json({
        profilePicture: updatedUser.profilePicture,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.rol.description,
          profilePicture: updatedUser.profilePicture,
        },
      });
    } catch (error) {
      const userId = parseInt(req.params.id);
      logger.error('Error in uploadProfilePicture', { error, userId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  uploadCV: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const talentId = parseInt(req.params.id);
      const userId = req.user?.userId;

      if (userId !== talentId) {
        logger.warn(`Unauthorized CV upload attempt`, { userId, talentId });
        res.status(403).json({ error: Messages.GENERAL.FORBIDDEN });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No se proporcionó ningún archivo' });
        return;
      }

      // Verificar que el usuario es un talento
      const user = await prisma.user.findUnique({
        where: { id: talentId },
        include: { rol: true },
      });

      if (!user) {
        deleteFile(req.file.path);
        res.status(404).json({ error: Messages.USER.NOT_FOUND });
        return;
      }

      if (user.rol.description !== 'talent') {
        deleteFile(req.file.path);
        res.status(403).json({ error: 'Solo los talentos pueden subir CVs' });
        return;
      }

      // Obtener última versión del CV
      const latestCV = await prisma.talentCV.findFirst({
        where: { talentId },
        orderBy: {
          version: 'desc',
        },
      });

      const newVersion = latestCV ? latestCV.version + 1 : 1;
      const fileUrl = getFileUrl(req.file.filename, 'cv');

      // Crear nuevo registro de CV
      const cv = await prisma.talentCV.create({
        data: {
          talentId,
          fileUrl,
          fileName: req.file.originalname,
          version: newVersion,
        },
      });

      // Actualizar el CV actual del usuario
      await prisma.user.update({
        where: { id: talentId },
        data: { currentCVId: cv.id },
      });

      logger.info(`CV uploaded for talent: ${talentId}`, {
        cvId: cv.id,
        fileName: cv.fileName,
        version: cv.version,
      });

      res.status(201).json(cv);
    } catch (error) {
      const talentId = parseInt(req.params.id);
      logger.error('Error in uploadCV', { error, talentId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },
};

export default UploadController;

