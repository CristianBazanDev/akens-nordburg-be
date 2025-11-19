import { Response } from 'express';
import { prisma } from '../services/prisma';
import { AuthRequest } from '../middleware/auth';
import Messages from '../constants/messages';
import logger from '../services/logger';

const INDICATOR_DEFINITIONS: Record<string, { name: string; description: string; unit: string }> = {
  processes: {
    name: 'Procesos',
    description: 'Número total de procesos de reclutamiento',
    unit: 'procesos',
  },
  hires: {
    name: 'Contrataciones',
    description: 'Número total de contrataciones exitosas',
    unit: 'contrataciones',
  },
  averageTimeToHire: {
    name: 'Tiempo Promedio de Contratación',
    description: 'Tiempo promedio desde la apertura del proceso hasta la contratación',
    unit: 'días',
  },
  conversionRate: {
    name: 'Tasa de Conversión',
    description: 'Porcentaje de procesos que resultan en contrataciones',
    unit: '%',
  },
  candidatePipeline: {
    name: 'Pipeline de Candidatos',
    description: 'Número de candidatos activos en el pipeline',
    unit: 'candidatos',
  },
  recruiterEfficiency: {
    name: 'Eficiencia del Reclutador',
    description: 'Promedio de procesos cerrados por reclutador',
    unit: 'procesos',
  },
  timeToFill: {
    name: 'Tiempo de Llenado',
    description: 'Tiempo promedio para llenar una posición',
    unit: 'días',
  },
  offerAcceptanceRate: {
    name: 'Tasa de Aceptación de Ofertas',
    description: 'Porcentaje de ofertas que son aceptadas por los candidatos',
    unit: '%',
  },
};

const SettingsController = {
  getIndicatorSettings: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      // Verificar que el usuario sea admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { rol: true },
      });

      if (!user || user.rol.description !== 'admin') {
        logger.warn(`Non-admin user attempted to access settings: ${userId}`);
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const currentYear = new Date().getFullYear();
      let settings = await prisma.indicatorSetting.findFirst({
        where: {
          year: currentYear,
          month: null,
        },
        include: {
          indicators: {
            orderBy: {
              type: 'asc',
            },
          },
        },
      });

      // Si no existe, crear con valores por defecto
      if (!settings) {
        settings = await createDefaultSettings(currentYear);
      }

      if (!settings) {
        res.status(500).json({ error: 'Failed to create default settings' });
        return;
      }

      logger.info(`Indicator settings retrieved for year ${currentYear}`, { userId, settingsId: settings.id });
      res.json(settings);
    } catch (error) {
      logger.error('Error in getIndicatorSettings', { error, userId: req.user?.userId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  saveIndicatorSettings: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      // Verificar que el usuario sea admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { rol: true },
      });

      if (!user || user.rol.description !== 'admin') {
        logger.warn(`Non-admin user attempted to save settings: ${userId}`);
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const { year, indicators } = req.body;

      if (!year || !indicators || !Array.isArray(indicators)) {
        res.status(400).json({ error: 'Invalid request body. Year and indicators array are required.' });
        return;
      }

      // Validar año
      if (year < 2000 || year > 2100) {
        res.status(400).json({ error: 'Invalid year. Must be between 2000 and 2100.' });
        return;
      }

      // Buscar o crear el setting
      let setting = await prisma.indicatorSetting.findFirst({
        where: {
          year,
          month: null,
        },
      });

      if (!setting) {
        setting = await prisma.indicatorSetting.create({
          data: {
            year,
            month: null,
          },
        });
      }

      // Eliminar indicadores existentes y crear nuevos
      await prisma.indicatorConfig.deleteMany({
        where: {
          indicatorSettingId: setting.id,
        },
      });

      // Crear los nuevos indicadores
      const indicatorData = indicators.map((ind: any) => {
        const definition = INDICATOR_DEFINITIONS[ind.type] || {
          name: ind.name || ind.type,
          description: ind.description || '',
          unit: ind.unit || '',
        };

        return {
          indicatorSettingId: setting.id,
          type: ind.type,
          name: definition.name,
          description: ind.description || definition.description,
          enabled: ind.enabled !== undefined ? ind.enabled : false,
          monthlyTarget: ind.monthlyTarget !== undefined && ind.monthlyTarget !== null ? ind.monthlyTarget : null,
          annualTarget: ind.annualTarget !== undefined && ind.annualTarget !== null ? ind.annualTarget : null,
          unit: ind.unit || definition.unit,
        };
      });

      await prisma.indicatorConfig.createMany({
        data: indicatorData,
      });

      // Recargar con relaciones
      const updatedSetting = await prisma.indicatorSetting.findUnique({
        where: { id: setting.id },
        include: {
          indicators: {
            orderBy: {
              type: 'asc',
            },
          },
        },
      });

      logger.info(`Indicator settings saved for year ${year}`, { userId, settingsId: setting.id, indicatorsCount: indicators.length });
      res.json(updatedSetting);
    } catch (error) {
      logger.error('Error in saveIndicatorSettings', { error, userId: req.user?.userId, body: req.body });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },
};

async function createDefaultSettings(year: number) {
  const setting = await prisma.indicatorSetting.create({
    data: {
      year,
      month: null,
    },
  });

  const defaultIndicators = Object.keys(INDICATOR_DEFINITIONS).map((type) => {
    const definition = INDICATOR_DEFINITIONS[type];
    return {
      indicatorSettingId: setting.id,
      type,
      name: definition.name,
      description: definition.description,
      enabled: type === 'processes' || type === 'hires', // Solo procesos y contrataciones habilitados por defecto
      monthlyTarget: type === 'processes' ? 50 : type === 'hires' ? 10 : null,
      annualTarget: type === 'processes' ? 600 : type === 'hires' ? 120 : null,
      unit: definition.unit,
    };
  });

  await prisma.indicatorConfig.createMany({
    data: defaultIndicators,
  });

  const result = await prisma.indicatorSetting.findUnique({
    where: { id: setting.id },
    include: {
      indicators: {
        orderBy: {
          type: 'asc',
        },
      },
    },
  });

  if (!result) {
    throw new Error('Failed to retrieve created indicator setting');
  }

  return result;
}

export default SettingsController;

