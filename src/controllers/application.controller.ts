import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../services/prisma';
import Messages from '../constants/messages';
import logger from '../services/logger';
import { createNotification } from '../services/notifications';

const ApplicationController = {
  // Aplicar a una posición (talent)
  applyToPosition: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const talentId = req.user?.userId;
      const { positionId } = req.params;
      const { coverLetter } = req.body;

      if (!talentId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const positionIdNum = parseInt(positionId);

      // Verificar que la posición existe y está publicada
      const position = await prisma.position.findUnique({
        where: { id: positionIdNum },
        include: { client: true },
      });

      if (!position) {
        res.status(404).json({ error: 'Posición no encontrada' });
        return;
      }

      if (position.status !== 'published') {
        res.status(400).json({ error: 'Esta posición no está disponible para aplicar' });
        return;
      }

      // Verificar que no haya aplicado antes
      const existingApplication = await prisma.application.findUnique({
        where: {
          positionId_talentId: {
            positionId: positionIdNum,
            talentId,
          },
        },
      });

      if (existingApplication) {
        res.status(409).json({ error: 'Ya has aplicado a esta posición' });
        return;
      }

      // Crear la aplicación
      const application = await prisma.application.create({
        data: {
          positionId: positionIdNum,
          talentId,
          coverLetter: coverLetter || null,
          status: 'pending',
        },
        include: {
          position: {
            include: {
              client: true,
            },
          },
          talent: {
            include: {
              rol: true,
            },
          },
        },
      });

      // Crear notificación para el cliente (dueño de la posición)
      await createNotification({
        userId: position.clientId,
        type: 'application_received',
        title: 'Nueva aplicación recibida',
        message: `${application.talent.name} ha aplicado a la posición "${position.title}"`,
        relatedId: application.id,
        relatedType: 'application',
      });

      // Crear notificación para el talento
      await createNotification({
        userId: talentId,
        type: 'application_submitted',
        title: 'Aplicación enviada',
        message: `Has aplicado exitosamente a la posición "${position.title}"`,
        relatedId: application.id,
        relatedType: 'application',
      });

      logger.info(`Application created: ${application.id}`, {
        applicationId: application.id,
        positionId: positionIdNum,
        talentId,
      });

      res.status(201).json({
        id: application.id,
        positionId: application.positionId,
        talentId: application.talentId,
        status: application.status,
        coverLetter: application.coverLetter,
        createdAt: application.createdAt,
        position: {
          id: application.position.id,
          title: application.position.title,
        },
      });
    } catch (error) {
      logger.error('Error in applyToPosition', { error, positionId: req.params.positionId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  // Obtener aplicaciones de un talento
  getTalentApplications: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const talentId = req.user?.userId;

      if (!talentId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const applications = await prisma.application.findMany({
        where: { talentId },
        include: {
          position: {
            include: {
              client: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(applications.map((app: any) => ({
        id: app.id,
        positionId: app.positionId,
        status: app.status,
        coverLetter: app.coverLetter,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        position: {
          id: app.position.id,
          title: app.position.title,
          description: app.position.description,
          location: app.position.location,
          status: app.position.status,
          client: {
            id: app.position.client.id,
            name: app.position.client.name,
          },
        },
      })));
    } catch (error) {
      logger.error('Error in getTalentApplications', { error });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  // Obtener aplicaciones de una posición (para recruiter/client)
  getPositionApplications: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { positionId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const positionIdNum = parseInt(positionId);

      // Verificar que el usuario tiene acceso a esta posición
      const position = await prisma.position.findUnique({
        where: { id: positionIdNum },
      });

      if (!position) {
        res.status(404).json({ error: 'Posición no encontrada' });
        return;
      }

      // Solo el cliente dueño de la posición o un recruiter puede ver las aplicaciones
      // TODO: Agregar verificación de rol recruiter si es necesario

      const applications = await prisma.application.findMany({
        where: { positionId: positionIdNum },
        include: {
          talent: {
            include: {
              rol: true,
              talentProfile: true,
              currentCV: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(applications.map((app: any) => ({
        id: app.id,
        talentId: app.talentId,
        status: app.status,
        coverLetter: app.coverLetter,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        talent: {
          id: app.talent.id,
          name: app.talent.name,
          email: app.talent.email,
          profilePicture: app.talent.profilePicture,
          talentProfile: app.talent.talentProfile,
          currentCV: app.talent.currentCV,
        },
      })));
    } catch (error) {
      logger.error('Error in getPositionApplications', { error, positionId: req.params.positionId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  // Iniciar proceso desde una aplicación (recruiter)
  startProcessFromApplication: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { applicationId } = req.params;
      const recruiterId = req.user?.userId;

      if (!recruiterId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const applicationIdNum = parseInt(applicationId);

      // Obtener la aplicación
      const application = await prisma.application.findUnique({
        where: { id: applicationIdNum },
        include: {
          position: {
            include: {
              client: true,
            },
          },
          talent: true,
        },
      });

      if (!application) {
        res.status(404).json({ error: 'Aplicación no encontrada' });
        return;
      }

      // Verificar que no exista ya un proceso para esta posición y talento
      const existingProcess = await prisma.process.findFirst({
        where: {
          positionId: application.positionId,
          candidates: {
            some: {
              talentId: application.talentId,
            },
          },
        },
      });

      if (existingProcess) {
        res.status(409).json({ error: 'Ya existe un proceso para este candidato en esta posición' });
        return;
      }

      // Crear el proceso
      const process = await prisma.process.create({
        data: {
          title: `Proceso: ${application.position.title} - ${application.talent.name}`,
          description: `Proceso iniciado desde aplicación`,
          positionId: application.positionId,
          recruiterId,
          clientId: application.position.clientId,
          status: 'open',
        },
      });

      // Crear etapa inicial
      const initialStage = await prisma.processStage.create({
        data: {
          name: 'Inicial',
          order: 1,
          processId: process.id,
        },
      });

      // Agregar el candidato al proceso
      await prisma.processCandidate.create({
        data: {
          processId: process.id,
          talentId: application.talentId,
          stageId: initialStage.id,
          status: 'pending',
        },
      });

      // Actualizar el estado de la aplicación
      await prisma.application.update({
        where: { id: applicationIdNum },
        data: { status: 'accepted' },
      });

      // Crear notificación para el talento
      await createNotification({
        userId: application.talentId,
        type: 'process_started',
        title: 'Proceso iniciado',
        message: `Se ha iniciado un proceso de reclutamiento para la posición "${application.position.title}"`,
        relatedId: process.id,
        relatedType: 'process',
      });

      logger.info(`Process started from application: ${applicationIdNum}`, {
        processId: process.id,
        applicationId: applicationIdNum,
        recruiterId,
      });

      res.status(201).json({
        id: process.id,
        title: process.title,
        status: process.status,
        positionId: process.positionId,
        recruiterId: process.recruiterId,
        clientId: process.clientId,
        createdAt: process.createdAt,
      });
    } catch (error) {
      logger.error('Error in startProcessFromApplication', { error, applicationId: req.params.applicationId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },
};

export default ApplicationController;

