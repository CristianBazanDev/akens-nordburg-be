import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../services/prisma';
import Messages from '../constants/messages';
import logger from '../services/logger';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

const AuthController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ error: Messages.GENERAL.BAD_REQUEST });
        return;
      }

      // Por defecto, asignar rol de "talent" si no se proporciona
      const roleToAssign = role || 'talent';

      // Buscar el rol en la base de datos
      const roleRecord = await prisma.rol.findUnique({
        where: { description: roleToAssign },
      });

      if (!roleRecord) {
        logger.error(`Role not found: ${roleToAssign}`);
        res.status(400).json({ error: `Rol inválido: ${roleToAssign}` });
        return;
      }

      const hash = await bcrypt.hash(password, 12);

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({ message: Messages.USER.ALREADY_EXISTS });
        return;
      }

      const user = await prisma.user.create({
        data: {
          email,
          password: hash,
          name,
          rolId: roleRecord.id,
        },
        include: {
          rol: true,
        },
      });

      logger.info(`User registered: ${user.email}`, { userId: user.id, role: user.rol.description });
      res.status(201).json({
        message: Messages.AUTH.REGISTER_SUCCESS,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.rol.description,
        },
      });
    } catch (error) {
      logger.error('Error registering user', { error, email: req.body.email });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
        include: {
          rol: true,
          currentCV: true,
        },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        logger.warn(`Failed login attempt for email: ${email}`);
        res.status(401).json({ error: Messages.AUTH.LOGIN_ERROR });
        return;
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '1h',
      });

      logger.info(`User logged in: ${user.email}`, { userId: user.id, role: user.rol.description });
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.rol.description,
          profilePicture: user.profilePicture,
          currentCV: user.currentCV ? {
            id: user.currentCV.id,
            fileUrl: user.currentCV.fileUrl,
            fileName: user.currentCV.fileName,
            version: user.currentCV.version,
            uploadedAt: user.currentCV.uploadedAt,
          } : null,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      logger.error('Error in login', { error, email: req.body.email });
      res.status(500).json({ error: Messages.GENERAL.INTERNAL_ERROR });
    }
  },
};

export default AuthController;
