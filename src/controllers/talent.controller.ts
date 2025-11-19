import { Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { ITalentProfileCreate, ITalentProfileUpdate, ITalentCVCreate } from '../types/talent';
import { AuthRequest } from '../middleware/auth';
import Messages from '../constants/messages';
import logger from '../services/logger';

const TalentController = {
  getProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      const talentId = parseInt(req.params.id);

      const profile = await prisma.talentProfile.findUnique({
        where: { talentId },
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!profile) {
        logger.warn(`Profile not found for talent: ${talentId}`);
        res.status(404).json({ error: Messages.TALENT.PROFILE_NOT_FOUND });
        return;
      }

      const latestCV = await prisma.talentCV.findFirst({
        where: { talentId },
        orderBy: {
          uploadedAt: 'desc',
        },
      });

      res.json({
        ...profile,
        cv: latestCV || null,
      });
      logger.info(`Profile retrieved for talent: ${talentId}`, { talentId, hasCV: !!latestCV });
    } catch (error) {
      const talentId = parseInt(req.params.id);
      logger.error('Error in getProfile', { error, talentId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  upsertProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const talentId = parseInt(req.params.id);
      const userId = req.user?.userId;

      if (userId !== talentId) {
        logger.warn(`Unauthorized profile update attempt`, { userId, talentId });
        res.status(403).json({ error: Messages.GENERAL.FORBIDDEN });
        return;
      }

      const data: ITalentProfileCreate = req.body;

      const profile = await prisma.talentProfile.upsert({
        where: { talentId },
        update: {
          keywords: data.keywords || [],
          skills: data.skills || [],
          experience: data.experience,
          education: data.education,
        },
        create: {
          talentId,
          keywords: data.keywords || [],
          skills: data.skills || [],
          experience: data.experience,
          education: data.education,
        },
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logger.info(`Profile updated for talent: ${talentId}`, { talentId, keywordsCount: profile.keywords.length, skillsCount: profile.skills.length });
      res.json(profile);
    } catch (error) {
      const talentId = parseInt(req.params.id);
      logger.error('Error in upsertProfile', { error, talentId, data: req.body });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  getCVs: async (req: Request, res: Response): Promise<void> => {
    try {
      const talentId = parseInt(req.params.id);

      const cvs = await prisma.talentCV.findMany({
        where: { talentId },
        orderBy: {
          uploadedAt: 'desc',
        },
      });

      logger.info(`CVs retrieved for talent: ${talentId}`, { talentId, cvCount: cvs.length });
      res.json(cvs);
    } catch (error) {
      const talentId = parseInt(req.params.id);
      logger.error('Error in getCVs', { error, talentId });
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

      const data: ITalentCVCreate = req.body;

      const latestCV = await prisma.talentCV.findFirst({
        where: { talentId },
        orderBy: {
          version: 'desc',
        },
      });

      const newVersion = latestCV ? latestCV.version + 1 : 1;

      const cv = await prisma.talentCV.create({
        data: {
          talentId,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          version: newVersion,
        },
      });

      logger.info(`CV uploaded for talent: ${talentId}`, { cvId: cv.id, fileName: cv.fileName, version: cv.version });
      res.status(201).json(cv);
    } catch (error) {
      const talentId = parseInt(req.params.id);
      const data: ITalentCVCreate = req.body;
      logger.error('Error in uploadCV', { error, talentId, fileName: data.fileName });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  deleteCV: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const cvId = parseInt(req.params.cvId);
      const userId = req.user?.userId;

      const cv = await prisma.talentCV.findUnique({
        where: { id: cvId },
      });

      if (!cv) {
        logger.warn(`CV not found: ${cvId}`);
        res.status(404).json({ error: Messages.GENERAL.NOT_FOUND });
        return;
      }

      if (userId !== cv.talentId) {
        logger.warn(`Unauthorized CV deletion attempt`, { userId, cvTalentId: cv.talentId });
        res.status(403).json({ error: Messages.GENERAL.FORBIDDEN });
        return;
      }

      await prisma.talentCV.delete({
        where: { id: cvId },
      });

      logger.info(`CV deleted: ${cvId}`, { cvId, talentId: cv.talentId, fileName: cv.fileName });
      res.json({ message: Messages.TALENT.CV_DELETED });
    } catch (error) {
      const cvId = parseInt(req.params.cvId);
      logger.error('Error in deleteCV', { error, cvId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },
};

export default TalentController;

