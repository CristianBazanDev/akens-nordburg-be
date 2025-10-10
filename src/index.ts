import express from 'express';
import dotenv from 'dotenv';
import UserRouter from './routes/user.router';
import AuthRouter from './routes/auth.router';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import { prisma } from './services/prisma';
import { initializeRoles } from './scripts/initialize/roles';
import { initializeAdminUser } from './scripts/initialize/user';

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



// Routes
app.use('/api/auth', AuthRouter);
app.use('/api/user', UserRouter);

// Funcion de inicializacion 

async function main() {
  try {
    const config = await prisma.config.findFirst()

    if (!config?.firstInitialize) {
      console.log("Primera inicialización de la base de datos")

      await initializeRoles()
      await initializeAdminUser()

      if (config) {
        await prisma.config.update({
          where: {id: config.id}, 
          data: {firstInitialize: true},
        })

        console.log("Inicialización completa")
      } else {
        console.log("La base de datos ya fue inicializada, saltando procesos.")
      }
      
    }

    app.listen(PORT, () => {
      console.log(`Server ON http://localhost:${PORT}`);
    });

  } catch (err) { 
    console.error(`Error al inicializar la app: ${err}`)
    process.exit(1)
  }
}


main()
// Middlewares

