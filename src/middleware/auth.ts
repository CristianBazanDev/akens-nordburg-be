import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Messages from '../constants/messages';
import dotenv from 'dotenv';
import logger from '../services/logger';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    logger.warn('Authentication attempt without token', { path: req.path, method: req.method });
    res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
    return;
  }

  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    logger.warn('Authentication attempt with empty token', { path: req.path, method: req.method });
    res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    logger.debug('Token verified successfully', { userId: (decoded as any).userId, path: req.path });
    next();
  } catch (error) {
    logger.warn('Token verification failed', { error, path: req.path, method: req.method });
    res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
    return;
  }
};
