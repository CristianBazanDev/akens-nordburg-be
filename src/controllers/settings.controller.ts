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

      if (year < 2000 || year > 2100) {
        res.status(400).json({ error: 'Invalid year. Must be between 2000 and 2100.' });
        return;
      }

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

      await prisma.indicatorConfig.deleteMany({
        where: {
          indicatorSettingId: setting.id,
        },
      });

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

  getTenantConfig: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const tenant = req.query.tenant as string || req.headers['x-tenant'] as string || process.env.DEFAULT_TENANT || 'default';

      const config = await prisma.config.findUnique({
        where: { tenant },
      });

      if (!config) {
        res.status(404).json({ error: 'Tenant configuration not found' });
        return;
      }

      if (!config.isActive) {
        res.status(403).json({ error: 'Tenant is not active' });
        return;
      }

      logger.info(`Tenant config retrieved`, { userId, tenant });
      res.json(config);
    } catch (error) {
      logger.error('Error in getTenantConfig', { error, userId: req.user?.userId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  updateTenantConfig: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { rol: true },
      });

      if (!user || user.rol.description !== 'admin') {
        logger.warn(`Non-admin user attempted to update tenant config: ${userId}`);
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const { tenant } = req.params;
      const {
        clientVerbose,
        logoUrl,
        isActive,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        textSecondaryColor,
        themeConfig,
        metadata,
      } = req.body;

      if (!tenant) {
        res.status(400).json({ error: 'Tenant is required' });
        return;
      }

      const existingConfig = await prisma.config.findUnique({
        where: { tenant },
      });

      if (!existingConfig) {
        res.status(404).json({ error: 'Tenant configuration not found' });
        return;
      }

      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      const colorsToValidate = { primaryColor, secondaryColor, accentColor, backgroundColor, textColor, textSecondaryColor };
      
      for (const [key, value] of Object.entries(colorsToValidate)) {
        if (value && typeof value === 'string' && !colorRegex.test(value)) {
          res.status(400).json({ error: `Invalid color format for ${key}. Must be a valid hex color (e.g., #FF0000 or #F00)` });
          return;
        }
      }

      const updatedConfig = await prisma.config.update({
        where: { tenant },
        data: {
          ...(clientVerbose !== undefined && { clientVerbose }),
          ...(logoUrl !== undefined && { logoUrl }),
          ...(isActive !== undefined && { isActive }),
          ...(primaryColor !== undefined && { primaryColor }),
          ...(secondaryColor !== undefined && { secondaryColor }),
          ...(accentColor !== undefined && { accentColor }),
          ...(backgroundColor !== undefined && { backgroundColor }),
          ...(textColor !== undefined && { textColor }),
          ...(textSecondaryColor !== undefined && { textSecondaryColor }),
          ...(themeConfig !== undefined && { themeConfig }),
          ...(metadata !== undefined && { metadata }),
        },
      });

      logger.info(`Tenant config updated`, { userId, tenant, configId: updatedConfig.id });
      res.json(updatedConfig);
    } catch (error) {
      logger.error('Error in updateTenantConfig', { error, userId: req.user?.userId, body: req.body });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  getAllTenants: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { rol: true },
      });

      if (!user || user.rol.description !== 'admin') {
        logger.warn(`Non-admin user attempted to list tenants: ${userId}`);
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const tenants = await prisma.config.findMany({
        orderBy: { createdAt: 'desc' },
      });

      logger.info(`All tenants retrieved`, { userId, count: tenants.length });
      res.json(tenants);
    } catch (error) {
      logger.error('Error in getAllTenants', { error, userId: req.user?.userId });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },

  createTenant: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { rol: true },
      });

      if (!user || user.rol.description !== 'admin') {
        logger.warn(`Non-admin user attempted to create tenant: ${userId}`);
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const {
        tenant,
        clientId,
        clientVerbose,
        logoUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        textSecondaryColor,
        themeConfig,
        metadata,
      } = req.body;

      if (!tenant || !clientId || !clientVerbose) {
        res.status(400).json({ error: 'Tenant, clientId, and clientVerbose are required' });
        return;
      }

      const existingTenant = await prisma.config.findUnique({
        where: { tenant },
      });

      if (existingTenant) {
        res.status(409).json({ error: 'Tenant already exists' });
        return;
      }

      const existingClientId = await prisma.config.findUnique({
        where: { clientId },
      });

      if (existingClientId) {
        res.status(409).json({ error: 'Client ID already exists' });
        return;
      }

      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      const colorsToValidate = { primaryColor, secondaryColor, accentColor, backgroundColor, textColor, textSecondaryColor };
      
      for (const [key, value] of Object.entries(colorsToValidate)) {
        if (value && typeof value === 'string' && !colorRegex.test(value)) {
          res.status(400).json({ error: `Invalid color format for ${key}. Must be a valid hex color (e.g., #FF0000 or #F00)` });
          return;
        }
      }

      const newTenant = await prisma.config.create({
        data: {
          tenant,
          clientId,
          clientVerbose,
          logoUrl,
          isActive: true,
          firstInitialize: false,
          primaryColor,
          secondaryColor,
          accentColor,
          backgroundColor,
          textColor,
          textSecondaryColor,
          themeConfig,
          metadata,
        },
      });

      logger.info(`New tenant created`, { userId, tenant, clientId, configId: newTenant.id });
      res.status(201).json(newTenant);
    } catch (error) {
      logger.error('Error in createTenant', { error, userId: req.user?.userId, body: req.body });
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
      enabled: type === 'processes' || type === 'hires',
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

