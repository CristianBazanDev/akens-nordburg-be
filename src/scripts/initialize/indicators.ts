import { prisma } from '../../services/prisma';
import logger from '../../services/logger';

const INDICATOR_DEFINITIONS = [
  {
    type: 'processes',
    name: 'Procesos',
    description: 'Número total de procesos de reclutamiento',
    enabled: true,
    monthlyTarget: 50,
    annualTarget: 600,
    unit: 'procesos',
  },
  {
    type: 'hires',
    name: 'Contrataciones',
    description: 'Número total de contrataciones exitosas',
    enabled: true,
    monthlyTarget: 10,
    annualTarget: 120,
    unit: 'contrataciones',
  },
  {
    type: 'averageTimeToHire',
    name: 'Tiempo Promedio de Contratación',
    description: 'Tiempo promedio desde la apertura del proceso hasta la contratación',
    enabled: false,
    monthlyTarget: 30,
    annualTarget: null,
    unit: 'días',
  },
  {
    type: 'conversionRate',
    name: 'Tasa de Conversión',
    description: 'Porcentaje de procesos que resultan en contrataciones',
    enabled: false,
    monthlyTarget: 20,
    annualTarget: null,
    unit: '%',
  },
  {
    type: 'candidatePipeline',
    name: 'Pipeline de Candidatos',
    description: 'Número de candidatos activos en el pipeline',
    enabled: false,
    monthlyTarget: null,
    annualTarget: 200,
    unit: 'candidatos',
  },
  {
    type: 'recruiterEfficiency',
    name: 'Eficiencia del Reclutador',
    description: 'Promedio de procesos cerrados por reclutador',
    enabled: false,
    monthlyTarget: null,
    annualTarget: 15,
    unit: 'procesos',
  },
  {
    type: 'timeToFill',
    name: 'Tiempo de Llenado',
    description: 'Tiempo promedio para llenar una posición',
    enabled: false,
    monthlyTarget: null,
    annualTarget: 45,
    unit: 'días',
  },
  {
    type: 'offerAcceptanceRate',
    name: 'Tasa de Aceptación de Ofertas',
    description: 'Porcentaje de ofertas que son aceptadas por los candidatos',
    enabled: false,
    monthlyTarget: null,
    annualTarget: 85,
    unit: '%',
  },
];

export const initializeIndicators = async () => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Verificar si ya existe una configuración para el año actual
    const existingSetting = await prisma.indicatorSetting.findFirst({
      where: {
        year: currentYear,
        month: null,
      },
    });

    if (existingSetting) {
      logger.info(`Indicator settings already exist for year ${currentYear}`);
      return;
    }

    // Crear la configuración para el año actual
    const setting = await prisma.indicatorSetting.create({
      data: {
        year: currentYear,
        month: null,
      },
    });

    // Crear los indicadores por defecto
    const indicatorData = INDICATOR_DEFINITIONS.map((ind) => ({
      indicatorSettingId: setting.id,
      type: ind.type,
      name: ind.name,
      description: ind.description,
      enabled: ind.enabled,
      monthlyTarget: ind.monthlyTarget,
      annualTarget: ind.annualTarget,
      unit: ind.unit,
    }));

    await prisma.indicatorConfig.createMany({
      data: indicatorData,
    });

    logger.info(`Indicator settings initialized for year ${currentYear}`, {
      settingId: setting.id,
      indicatorsCount: INDICATOR_DEFINITIONS.length,
    });
    console.log(`Configuraciones de indicadores inicializadas para el año ${currentYear}`);
  } catch (error) {
    logger.error('Error initializing indicators', { error });
    throw error;
  }
};





