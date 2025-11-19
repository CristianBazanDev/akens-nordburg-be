import { Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { IProcessCreate, IProcessUpdate, IProcessCandidateCreate, IProcessCandidateUpdate } from '../types/process';
import { AuthRequest } from '../middleware/auth';
import Messages from '../constants/messages';
import logger from '../services/logger';

const ProcessController = {
  getProcesses: async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId, recruiterId, status, positionId, talentId } = req.query;

      const where: any = {};
      if (clientId) where.clientId = parseInt(clientId as string);
      if (recruiterId) where.recruiterId = parseInt(recruiterId as string);
      if (status) where.status = status;
      if (positionId) where.positionId = parseInt(positionId as string);
      
      if (talentId) {
        const talentProcessIds = await prisma.processCandidate.findMany({
          where: { talentId: parseInt(talentId as string) },
          select: { processId: true },
        });
        where.id = { in: talentProcessIds.map(p => p.processId) };
      }

      const processes = await prisma.process.findMany({
        where,
        include: {
          position: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          recruiter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          stages: {
            orderBy: {
              order: 'asc',
            },
            include: {
              candidates: {
                include: {
                  talent: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      logger.info(`Processes retrieved: ${processes.length}`, { filters: req.query });
      res.json(processes);
    } catch (error) {
      logger.error('Error in getProcesses', { error, query: req.query });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  getProcessById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const process = await prisma.process.findUnique({
        where: { id },
        include: {
          position: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          recruiter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          stages: {
            orderBy: {
              order: 'asc',
            },
            include: {
              candidates: {
                include: {
                  talent: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          candidates: {
            include: {
              talent: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              stage: true,
            },
          },
        },
      });

      if (!process) {
        logger.warn(`Process not found: ${id}`);
        res.status(404).json({ error: Messages.PROCESS.NOT_FOUND });
        return;
      }

      logger.info(`Process retrieved: ${id}`);
      res.json(process);
    } catch (error) {
      const processId = parseInt(req.params.id);
      logger.error('Error in getProcessById', { error, processId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  createProcess: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data: IProcessCreate = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      if (!data.recruiterId) {
        data.recruiterId = userId;
      }

      const process = await prisma.process.create({
        data: {
          title: data.title,
          description: data.description,
          status: data.status || 'open',
          positionId: data.positionId,
          recruiterId: data.recruiterId,
          clientId: data.clientId,
          stages: {
            create: data.stages?.map((stage) => ({
              name: stage.name,
              order: stage.order,
            })) || [],
          },
        },
        include: {
          position: true,
          recruiter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          stages: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      logger.info(`Process created: ${process.id}`, { processId: process.id, recruiterId: process.recruiterId, positionId: process.positionId, stagesCount: process.stages.length });
      res.status(201).json(process);
    } catch (error) {
      const userId = req.user?.userId;
      logger.error('Error in createProcess', { error, userId, data: req.body });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  updateProcess: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const data: Partial<IProcessUpdate> = req.body;

      const existingProcess = await prisma.process.findUnique({
        where: { id },
      });

      if (!existingProcess) {
        logger.warn(`Process not found for update: ${id}`);
        res.status(404).json({ error: Messages.PROCESS.NOT_FOUND });
        return;
      }

      const process = await prisma.process.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.status && { status: data.status }),
          ...(data.positionId && { positionId: data.positionId }),
          ...(data.recruiterId && { recruiterId: data.recruiterId }),
          ...(data.clientId && { clientId: data.clientId }),
        },
        include: {
          position: true,
          recruiter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          stages: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      logger.info(`Process updated: ${id}`, { processId: id, updates: Object.keys(data) });
      res.json(process);
    } catch (error) {
      const processId = parseInt(req.params.id);
      logger.error('Error in updateProcess', { error, processId, data: req.body });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  deleteProcess: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const process = await prisma.process.findUnique({
        where: { id },
      });

      if (!process) {
        logger.warn(`Process not found for deletion: ${id}`);
        res.status(404).json({ error: Messages.PROCESS.NOT_FOUND });
        return;
      }

      await prisma.process.delete({
        where: { id },
      });

      logger.info(`Process deleted: ${id}`, { processId: id });
      res.json({ message: Messages.PROCESS.DELETED });
    } catch (error) {
      const processId = parseInt(req.params.id);
      logger.error('Error in deleteProcess', { error, processId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  addStage: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const processId = parseInt(req.params.id);
      const { name, order } = req.body;

      const process = await prisma.process.findUnique({
        where: { id: processId },
      });

      if (!process) {
        logger.warn(`Process not found for adding stage: ${processId}`);
        res.status(404).json({ error: Messages.PROCESS.NOT_FOUND });
        return;
      }

      const stage = await prisma.processStage.create({
        data: {
          name,
          order,
          processId,
        },
      });

      logger.info(`Stage added to process: ${processId}`, { stageId: stage.id, stageName: name, order });
      res.status(201).json(stage);
    } catch (error) {
      const processId = parseInt(req.params.id);
      const { name, order } = req.body;
      logger.error('Error in addStage', { error, processId, name, order });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  addCandidate: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const processId = parseInt(req.params.id);
      const data: IProcessCandidateCreate = req.body;

      const process = await prisma.process.findUnique({
        where: { id: processId },
      });

      if (!process) {
        logger.warn(`Process not found for adding candidate: ${processId}`);
        res.status(404).json({ error: Messages.PROCESS.NOT_FOUND });
        return;
      }

      const stage = await prisma.processStage.findFirst({
        where: {
          id: data.stageId,
          processId: processId,
        },
      });

      if (!stage) {
        logger.warn(`Stage not found in process: ${processId}`, { stageId: data.stageId });
        res.status(404).json({ error: 'Stage not found in this process' });
        return;
      }

      const candidate = await prisma.processCandidate.create({
        data: {
          processId,
          talentId: data.talentId,
          stageId: data.stageId,
          status: data.status || 'pending',
          notes: data.notes,
        },
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          stage: true,
        },
      });

      logger.info(`Candidate added to process: ${processId}`, { candidateId: candidate.id, talentId: candidate.talentId, stageId: candidate.stageId });
      res.status(201).json(candidate);
    } catch (error) {
      const processId = parseInt(req.params.id);
      logger.error('Error in addCandidate', { error, processId, data: req.body });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  updateCandidate: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      const data: Partial<IProcessCandidateUpdate> = req.body;

      const candidate = await prisma.processCandidate.findUnique({
        where: { id: candidateId },
      });

      if (!candidate) {
        logger.warn(`Candidate not found: ${candidateId}`);
        res.status(404).json({ error: 'Candidate not found' });
        return;
      }

      const updatedCandidate = await prisma.processCandidate.update({
        where: { id: candidateId },
        data: {
          ...(data.stageId && { stageId: data.stageId }),
          ...(data.status && { status: data.status }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          stage: true,
        },
      });

      logger.info(`Candidate updated: ${candidateId}`, { candidateId, updates: Object.keys(data) });
      res.json(updatedCandidate);
    } catch (error) {
      const candidateId = parseInt(req.params.candidateId);
      logger.error('Error in updateCandidate', { error, candidateId, data: req.body });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  removeCandidate: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const candidateId = parseInt(req.params.candidateId);

      const candidate = await prisma.processCandidate.findUnique({
        where: { id: candidateId },
      });

      if (!candidate) {
        logger.warn(`Candidate not found for removal: ${candidateId}`);
        res.status(404).json({ error: 'Candidate not found' });
        return;
      }

      await prisma.processCandidate.delete({
        where: { id: candidateId },
      });

      logger.info(`Candidate removed from process: ${candidate.processId}`, { candidateId, processId: candidate.processId });
      res.json({ message: Messages.PROCESS.CANDIDATE_REMOVED });
    } catch (error) {
      const candidateId = parseInt(req.params.candidateId);
      logger.error('Error in removeCandidate', { error, candidateId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },
};

export default ProcessController;

