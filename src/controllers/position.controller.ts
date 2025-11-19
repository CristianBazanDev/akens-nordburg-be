import { Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { IPositionCreate, IPositionUpdate } from '../types/position';
import { AuthRequest } from '../middleware/auth';
import Messages from '../constants/messages';
import logger from '../services/logger';

const PositionController = {
  getPositions: async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId, status } = req.query;

      const where: any = {};
      if (clientId) where.clientId = parseInt(clientId as string);
      if (status) where.status = status;

      const positions = await prisma.position.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      logger.info(`Positions retrieved: ${positions.length}`, { filters: req.query });
      res.json(positions);
    } catch (error) {
      logger.error('Error in getPositions', { error, query: req.query });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  getPositionById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const position = await prisma.position.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          processes: {
            include: {
              recruiter: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!position) {
        logger.warn(`Position not found: ${id}`);
        res.status(404).json({ error: Messages.POSITION.NOT_FOUND });
        return;
      }

      logger.info(`Position retrieved: ${id}`);
      res.json(position);
    } catch (error) {
      const positionId = parseInt(req.params.id);
      logger.error('Error in getPositionById', { error, positionId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  createPosition: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data: IPositionCreate = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      if (!data.clientId) {
        data.clientId = userId;
      }

      const position = await prisma.position.create({
        data: {
          title: data.title,
          description: data.description,
          requirements: data.requirements,
          location: data.location,
          salaryMin: data.salaryMin,
          salaryMax: data.salaryMax,
          currency: data.currency || 'USD',
          clientId: data.clientId,
          status: data.status || 'draft',
          keywords: data.keywords || [],
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logger.info(`Position created: ${position.id}`, { positionId: position.id, clientId: position.clientId, title: position.title });
      res.status(201).json(position);
    } catch (error) {
      const userId = req.user?.userId;
      logger.error('Error in createPosition', { error, userId, data: req.body });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  updatePosition: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const data: Partial<IPositionUpdate> = req.body;

      const existingPosition = await prisma.position.findUnique({
        where: { id },
      });

      if (!existingPosition) {
        logger.warn(`Position not found for update: ${id}`);
        res.status(404).json({ error: Messages.POSITION.NOT_FOUND });
        return;
      }

      const position = await prisma.position.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.requirements && { requirements: data.requirements }),
          ...(data.location !== undefined && { location: data.location }),
          ...(data.salaryMin !== undefined && { salaryMin: data.salaryMin }),
          ...(data.salaryMax !== undefined && { salaryMax: data.salaryMax }),
          ...(data.currency && { currency: data.currency }),
          ...(data.status && { status: data.status }),
          ...(data.keywords && { keywords: data.keywords }),
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logger.info(`Position updated: ${id}`, { positionId: id, updates: Object.keys(data) });
      res.json(position);
    } catch (error) {
      const positionId = parseInt(req.params.id);
      logger.error('Error in updatePosition', { error, positionId, data: req.body });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  deletePosition: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const position = await prisma.position.findUnique({
        where: { id },
      });

      if (!position) {
        logger.warn(`Position not found for deletion: ${id}`);
        res.status(404).json({ error: Messages.POSITION.NOT_FOUND });
        return;
      }

      await prisma.position.delete({
        where: { id },
      });

      logger.info(`Position deleted: ${id}`, { positionId: id });
      res.json({ message: Messages.POSITION.DELETED });
    } catch (error) {
      const positionId = parseInt(req.params.id);
      logger.error('Error in deletePosition', { error, positionId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },
};

export default PositionController;

