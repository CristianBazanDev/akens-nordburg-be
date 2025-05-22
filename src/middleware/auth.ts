import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Messages from '../constants/messages';
import dotenv from 'dotenv';

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
    res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
    return;
  }

  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    console.log('no hay token');
    res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Error verificando token:', error);
    res.status(401).json({ error: Messages.GENERAL.UNAUTHORIZED });
    return;
  }
};
