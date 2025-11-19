import { prisma } from '../services/prisma';
import logger from '../services/logger';

/**
 * Script para migrar datos existentes y establecer currentCVId
 * para usuarios que ya tienen CVs subidos
 */
async function migrateCurrentCV() {
  try {
    logger.info('Iniciando migración de currentCVId...');

    // Obtener todos los usuarios que tienen CVs pero no tienen currentCVId establecido
    const usersWithCVs = await prisma.user.findMany({
      where: {
        currentCVId: null,
        talentCVs: {
          some: {},
        },
      },
      include: {
        talentCVs: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
      },
    });

    logger.info(`Encontrados ${usersWithCVs.length} usuarios con CVs sin currentCVId`);

    let updated = 0;

    for (const user of usersWithCVs) {
      if (user.talentCVs.length > 0) {
        // Obtener el CV más reciente
        const latestCV = user.talentCVs[0];

        // Actualizar el usuario con el currentCVId
        await prisma.user.update({
          where: { id: user.id },
          data: { currentCVId: latestCV.id },
        });

        updated++;
        logger.info(`Usuario ${user.id} actualizado con currentCVId: ${latestCV.id}`);
      }
    }

    logger.info(`Migración completada. ${updated} usuarios actualizados.`);
  } catch (error) {
    logger.error('Error en migración de currentCVId', { error });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateCurrentCV()
    .then(() => {
      logger.info('Migración finalizada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Error fatal en migración', { error });
      process.exit(1);
    });
}

export default migrateCurrentCV;

