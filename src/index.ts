import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import UserRouter from './routes/user.router';
import AuthRouter from './routes/auth.router';
import RolRouter from './routes/rol.router';
import PositionRouter from './routes/position.router';
import ProcessRouter from './routes/process.router';
import TalentRouter from './routes/talent.router';
import StatsRouter from './routes/stats.router';
import SettingsRouter from './routes/settings.router';
import UploadRouter from './routes/upload.router';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import { prisma } from './services/prisma';
import { initializeRoles } from './scripts/initialize/roles';
import { initializeTestUsers } from './scripts/initialize/user';
import { initializeTestData } from './scripts/initialize/testData';
import { initializeIndicators } from './scripts/initialize/indicators';
import logger from './services/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
console.log(PORT)

app.use(express.json());

app.use(
  cors({
    origin: process.env.FE_URL,
    credentials: true,
  })
);

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', AuthRouter);
app.use('/api/user', UserRouter);
app.use('/api/roles', RolRouter);
app.use('/api/positions', PositionRouter);
app.use('/api/processes', ProcessRouter);
app.use('/api/talents', TalentRouter);
app.use('/api/stats', StatsRouter);
app.use('/api/settings', SettingsRouter);
app.use('/api', UploadRouter);

async function main() {
  try {
    const config = await prisma.config.findFirst()

    if (!config?.firstInitialize) {
      logger.info("Primera inicialización de la base de datos")

      await initializeRoles()

      await initializeTestUsers()

      await initializeTestData()

      await initializeIndicators()

      if (config) {
        await prisma.config.update({
          where: {id: config.id}, 
          data: {firstInitialize: true},
        })

        logger.info("Inicialización completa")
      } else {
        await prisma.config.create({ data: { firstInitialize: true, clientVerbose: '' } });
        logger.info("Config creado e inicialización completa")
      }
      
    } else {
      logger.info("La base de datos ya fue inicializada, saltando procesos.")
      // Inicializar indicadores si no existen para el año actual
      await initializeIndicators()
    }

    app.listen(PORT, () => {
      logger.info(`Server ON http://localhost:${PORT}`);
    });

  } catch (err) { 
    logger.error(`Error al inicializar la app: ${err}`)
    process.exit(1)
  }
}


main()