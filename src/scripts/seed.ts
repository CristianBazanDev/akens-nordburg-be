import dotenv from 'dotenv';
import { initializeRoles } from './initialize/roles';
import { initializeTestUsers } from './initialize/user';
import { initializeTestData } from './initialize/testData';
import { prisma } from '../services/prisma';
import logger from '../services/logger';

dotenv.config();

async function seed() {
  try {
    logger.info('Iniciando seed completo de datos de prueba...');
    
    logger.info('Inicializando roles...');
    await initializeRoles();
    
    logger.info('Inicializando usuarios...');
    await initializeTestUsers();
    
    logger.info('Inicializando datos de prueba...');
    await initializeTestData();
    
    logger.info('✅ Seed completado exitosamente');
  } catch (error) {
    logger.error('Error en seed', { error });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

