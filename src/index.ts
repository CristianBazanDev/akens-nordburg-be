import express, { Request, Response, NextFunction } from 'express';
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
import ApplicationRouter from './routes/application.router';
import NotificationRouter from './routes/notification.router';
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

// Configuración de CORS
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Permitir requests sin origin (como mobile apps o curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FE_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin) || !process.env.FE_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Middleware para manejar OPTIONS requests en /uploads (debe ir ANTES del static)
app.use('/uploads', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    const allowedOrigins = [
      process.env.FE_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ].filter(Boolean) as string[];
    
    if (origin && (allowedOrigins.includes(origin) || !process.env.FE_URL)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!process.env.FE_URL) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
    return;
  }
  next();
});

// Servir archivos estáticos desde la carpeta uploads
// IMPORTANTE: Esto debe ir ANTES de las rutas de API
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    // Headers CORS para archivos estáticos
    const origin = res.req.headers.origin;
    const allowedOrigins = [
      process.env.FE_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ].filter(Boolean) as string[];
    
    if (origin && (allowedOrigins.includes(origin) || !process.env.FE_URL)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!process.env.FE_URL) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Asegurar que las imágenes se sirvan con el tipo MIME correcto
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  },
}));

app.use('/api/auth', AuthRouter);
app.use('/api/user', UserRouter);
app.use('/api/roles', RolRouter);
app.use('/api/positions', PositionRouter);
app.use('/api/processes', ProcessRouter);
app.use('/api/talents', TalentRouter);
app.use('/api/stats', StatsRouter);
app.use('/api/settings', SettingsRouter);
app.use('/api', UploadRouter);
app.use('/api/applications', ApplicationRouter);
app.use('/api/notifications', NotificationRouter);

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