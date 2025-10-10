import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../services/prisma';
import Messages from '../constants/messages';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

const AuthController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, rol } = req.body;

      const hash = await bcrypt.hash(password, 12);

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.json(201).json({ message: Messages.USER.ALREADY_EXISTS });
        return;
      }

      await prisma.user.create({
        data: {
          email,
          password: hash,
          rol,
        },
      });

      res.json({ message: 'User registered' });
    } catch (error) {
      console.error(error);
    }
  },
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: 'Error on user or password' });
        return;
      }

      const token = jwt.sign({ email: user.email }, JWT_SECRET, {
        expiresIn: '1h',
      });

      res.json(token);
    } catch (error) {
      console.error(error);
    }
  },
};

export default AuthController;
