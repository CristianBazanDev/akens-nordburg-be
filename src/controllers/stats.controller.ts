import { Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { AuthRequest } from '../middleware/auth';
import Messages from '../constants/messages';
import logger from '../services/logger';

const StatsController = {
  getAdminStats: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const allProcesses = await prisma.process.findMany();
      const processStats = {
        total: allProcesses.length,
        open: allProcesses.filter((p) => p.status === 'open').length,
        inProgress: allProcesses.filter((p) => p.status === 'in_progress').length,
        closed: allProcesses.filter((p) => p.status === 'closed').length,
        cancelled: allProcesses.filter((p) => p.status === 'cancelled').length,
      };

      const recruiters = await prisma.user.findMany({
        where: {
          rol: {
            description: 'user',
          },
        },
        include: {
          processesAsRecruiter: true,
        },
      });

      const recruiterStats = recruiters.map((recruiter) => {
        const processes = recruiter.processesAsRecruiter;
        return {
          recruiterId: recruiter.id,
          recruiterName: recruiter.name,
          openProcesses: processes.filter((p) => p.status === 'open').length,
          closedProcesses: processes.filter((p) => p.status === 'closed').length,
          totalProcesses: processes.length,
        };
      });

      const topRecruiters = [...recruiterStats]
        .sort((a, b) => b.totalProcesses - a.totalProcesses)
        .slice(0, 5);

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // Obtener configuraciones de indicadores
      const indicatorSettings = await prisma.indicatorSetting.findFirst({
        where: {
          year: currentYear,
          month: null,
        },
        include: {
          indicators: true,
        },
      });

      // Obtener configuraciones de procesos y contrataciones
      const processesConfig = indicatorSettings?.indicators.find((ind) => ind.type === 'processes');
      const hiresConfig = indicatorSettings?.indicators.find((ind) => ind.type === 'hires');

      // Calcular procesos y contrataciones actuales
      const actualProcesses = allProcesses.length;
      const actualHires = allProcesses.filter((p) => p.status === 'closed').length;

      // Obtener o crear metas mensuales usando configuraciones
      let monthlyGoals = await prisma.monthlyGoal.findMany({
        where: {
          year: currentYear,
        },
        orderBy: {
          month: 'asc',
        },
      });

      // Si hay configuraciones y no existe meta para el mes actual, crearla o actualizarla
      if (processesConfig || hiresConfig) {
        const currentMonthGoal = monthlyGoals.find((g) => g.month === currentMonth);
        const targetProcesses = processesConfig?.monthlyTarget 
          ? Math.round(processesConfig.monthlyTarget) 
          : currentMonthGoal?.targetProcesses || 0;
        const targetHires = hiresConfig?.monthlyTarget 
          ? Math.round(hiresConfig.monthlyTarget) 
          : currentMonthGoal?.targetHires || 0;

        // Calcular procesos y contrataciones del mes actual
        const monthStart = new Date(currentYear, currentMonth - 1, 1);
        const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
        const monthProcesses = allProcesses.filter(
          (p) => new Date(p.createdAt) >= monthStart && new Date(p.createdAt) <= monthEnd
        );
        const monthHires = monthProcesses.filter((p) => p.status === 'closed').length;

        if (currentMonthGoal) {
          // Actualizar meta existente con valores de configuración si están disponibles
          await prisma.monthlyGoal.update({
            where: { id: currentMonthGoal.id },
            data: {
              targetProcesses: processesConfig?.monthlyTarget ? Math.round(processesConfig.monthlyTarget) : currentMonthGoal.targetProcesses,
              targetHires: hiresConfig?.monthlyTarget ? Math.round(hiresConfig.monthlyTarget) : currentMonthGoal.targetHires,
              actualProcesses: monthProcesses.length,
              actualHires: monthHires,
            },
          });
        } else {
          // Crear nueva meta para el mes actual
          await prisma.monthlyGoal.create({
            data: {
              month: currentMonth,
              year: currentYear,
              targetProcesses,
              targetHires,
              actualProcesses: monthProcesses.length,
              actualHires: monthHires,
            },
          });
        }

        // Recargar metas mensuales
        monthlyGoals = await prisma.monthlyGoal.findMany({
          where: {
            year: currentYear,
          },
          orderBy: {
            month: 'asc',
          },
        });
      }

      // Obtener o crear metas anuales usando configuraciones
      let annualGoals = await prisma.annualGoal.findMany({
        where: {
          year: currentYear,
        },
      });

      if (processesConfig || hiresConfig) {
        const currentAnnualGoal = annualGoals.find((g) => g.year === currentYear);
        const annualTargetProcesses = processesConfig?.annualTarget 
          ? Math.round(processesConfig.annualTarget) 
          : currentAnnualGoal?.targetProcesses || 0;
        const annualTargetHires = hiresConfig?.annualTarget 
          ? Math.round(hiresConfig.annualTarget) 
          : currentAnnualGoal?.targetHires || 0;

        // Calcular procesos y contrataciones del año actual
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
        const yearProcesses = allProcesses.filter(
          (p) => new Date(p.createdAt) >= yearStart && new Date(p.createdAt) <= yearEnd
        );
        const yearHires = yearProcesses.filter((p) => p.status === 'closed').length;

        if (currentAnnualGoal) {
          // Actualizar meta anual existente
          await prisma.annualGoal.update({
            where: { id: currentAnnualGoal.id },
            data: {
              targetProcesses: processesConfig?.annualTarget ? Math.round(processesConfig.annualTarget) : currentAnnualGoal.targetProcesses,
              targetHires: hiresConfig?.annualTarget ? Math.round(hiresConfig.annualTarget) : currentAnnualGoal.targetHires,
              actualProcesses: yearProcesses.length,
              actualHires: yearHires,
            },
          });
        } else {
          // Crear nueva meta anual
          await prisma.annualGoal.create({
            data: {
              year: currentYear,
              targetProcesses: annualTargetProcesses,
              targetHires: annualTargetHires,
              actualProcesses: yearProcesses.length,
              actualHires: yearHires,
            },
          });
        }

        // Recargar metas anuales
        annualGoals = await prisma.annualGoal.findMany({
          where: {
            year: currentYear,
          },
        });
      }

      const recentProcesses = await prisma.process.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
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
        },
      });

      logger.info('Admin stats retrieved', { processCount: processStats.total, recruiterCount: recruiterStats.length, recentProcessesCount: recentProcesses.length });
      res.json({
        processStats,
        recruiterStats,
        monthlyGoals,
        annualGoals,
        topRecruiters,
        recentProcesses,
      });
    } catch (error) {
      logger.error('Error in getAdminStats', { error });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  getRecruiterStats: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const processes = await prisma.process.findMany({
        where: {
          recruiterId: userId,
        },
      });

      const stats = {
        total: processes.length,
        open: processes.filter((p) => p.status === 'open').length,
        inProgress: processes.filter((p) => p.status === 'in_progress').length,
        closed: processes.filter((p) => p.status === 'closed').length,
        cancelled: processes.filter((p) => p.status === 'cancelled').length,
      };

      logger.info(`Recruiter stats retrieved: ${userId}`, { userId, totalProcesses: stats.total });
      res.json(stats);
    } catch (error) {
      const userId = req.user?.userId;
      logger.error('Error in getRecruiterStats', { error, userId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  getClientStats: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const positions = await prisma.position.findMany({
        where: {
          clientId: userId,
        },
      });

      const processes = await prisma.process.findMany({
        where: {
          clientId: userId,
        },
      });

      const stats = {
        positions: {
          total: positions.length,
          draft: positions.filter((p) => p.status === 'draft').length,
          published: positions.filter((p) => p.status === 'published').length,
          closed: positions.filter((p) => p.status === 'closed').length,
        },
        processes: {
          total: processes.length,
          open: processes.filter((p) => p.status === 'open').length,
          inProgress: processes.filter((p) => p.status === 'in_progress').length,
          closed: processes.filter((p) => p.status === 'closed').length,
          cancelled: processes.filter((p) => p.status === 'cancelled').length,
        },
      };

      logger.info(`Client stats retrieved: ${userId}`, { userId, positionsCount: stats.positions.total, processesCount: stats.processes.total });
      res.json(stats);
    } catch (error) {
      const userId = req.user?.userId;
      logger.error('Error in getClientStats', { error, userId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  upsertMonthlyGoal: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { month, year, targetProcesses, targetHires } = req.body;

      const goal = await prisma.monthlyGoal.upsert({
        where: {
          month_year: {
            month: month,
            year: year,
          },
        },
        update: {
          targetProcesses,
          targetHires,
        },
        create: {
          month,
          year,
          targetProcesses,
          targetHires,
        },
      });

      logger.info(`Monthly goal upserted`, { month, year, targetProcesses, targetHires, goalId: goal.id });
      res.json(goal);
    } catch (error) {
      const { month, year } = req.body;
      logger.error('Error in upsertMonthlyGoal', { error, month, year });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  upsertAnnualGoal: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { year, targetProcesses, targetHires } = req.body;

      const goal = await prisma.annualGoal.upsert({
        where: { year },
        update: {
          targetProcesses,
          targetHires,
        },
        create: {
          year,
          targetProcesses,
          targetHires,
        },
      });

      logger.info(`Annual goal upserted`, { year, targetProcesses, targetHires, goalId: goal.id });
      res.json(goal);
    } catch (error) {
      const { year } = req.body;
      logger.error('Error in upsertAnnualGoal', { error, year });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },
};

export default StatsController;

