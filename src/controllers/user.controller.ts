import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../services/prisma';
import Messages from '../constants/messages';
import { IUser } from '../types/user';
import logger from '../services/logger';

const UserController = {
  createUser: async (
    req: Request<{}, {}, IUser & { password: string }>,
    res: Response
  ): Promise<void> => {
    try {
      const { email, password, name, rol } = req.body;

      if (!email || !password || !name || !rol) {
        res.status(400).json({ error: Messages.GENERAL.BAD_REQUEST });
        return;
      }

      const role = await prisma.rol.findUnique({
        where: { description: rol },
      });

      if (!role) {
        res.status(400).json({ error: 'Invalid role' });
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
          rolId: role.id,
        },
        include: {
          rol: true,
          currentCV: true,
        },
      });

      logger.info(`User created: ${user.email}`, { userId: user.id, role: user.rol.description });
      res.status(201).json({
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
      });
    } catch (error) {
      logger.error('Error in createUser', { error, email: req.body.email });
      res.status(500).json({ message: Messages.USER.LOGGIN_ERROR });
    }
  },
  updateUser: async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    try {
      const { name, email, rolId } = req.body;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        logger.warn(`User not found for update: ${id}`);
        res.status(404).json({ error: Messages.USER.NOT_FOUND });
        return;
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (rolId) updateData.rolId = parseInt(rolId);

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          rol: true,
          currentCV: true,
        },
      });

      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.rol.description,
        profilePicture: updatedUser.profilePicture,
        currentCV: updatedUser.currentCV ? {
          id: updatedUser.currentCV.id,
          fileUrl: updatedUser.currentCV.fileUrl,
          fileName: updatedUser.currentCV.fileName,
          version: updatedUser.currentCV.version,
          uploadedAt: updatedUser.currentCV.uploadedAt,
        } : null,
        createdAt: updatedUser.createdAt,
      });
      logger.info(`User updated: ${id}`, { userId: id, updates: Object.keys(updateData) });
    } catch (error) {
      logger.error('Error in updateUser', { error, userId: id, data: req.body });
      res.status(500).json({ message: Messages.USER.LOGGIN_ERROR });
    }
  },
  getUsers: async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await prisma.user.findMany({
        include: {
          rol: true,
          currentCV: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const formattedUsers = users.map((user) => ({
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
      }));

      logger.info(`Users retrieved: ${formattedUsers.length}`);
      res.json(formattedUsers);
    } catch (error) {
      logger.error('Error in getUsers', { error });
      res.status(500).json({ message: Messages.USER.LOGGIN_ERROR });
    }
  },
  getUserById: async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    try {

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          rol: true,
          currentCV: true,
        },
      });

      if (!user) {
        logger.warn(`User not found: ${id}`);
        res.status(404).json({ error: Messages.USER.NOT_FOUND });
        return;
      }

      logger.info(`User retrieved: ${id}`);
      res.json({
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
      });
    } catch (error) {
      logger.error('Error in getUserById', { error, userId: id });
      res.status(500).json({ message: Messages.USER.LOGGIN_ERROR });
    }
  },
  getUsersByRol: async (req: Request, res: Response): Promise<void> => {
    const { rol } = req.body;
    try {

      const role = await prisma.rol.findUnique({
        where: { description: rol },
      });

      if (!role) {
        logger.warn(`Role not found: ${rol}`);
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      const users = await prisma.user.findMany({
        where: {
          rolId: role.id,
        },
        include: {
          rol: true,
          currentCV: true,
        },
      });

      const formattedUsers = users.map((user) => ({
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
      }));

      logger.info(`Users retrieved by role: ${rol}`, { role: rol, count: formattedUsers.length });
      res.json(formattedUsers);
    } catch (error) {
      logger.error('Error in getUsersByRol', { error, role: rol });
      res.status(500).json({ message: Messages.USER.LOGGIN_ERROR });
    }
  },
  deleteUser: async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    try {

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        logger.warn(`User not found for deletion: ${id}`);
        res.status(404).json({ error: Messages.USER.NOT_FOUND });
        return;
      }

      await prisma.user.delete({
        where: { id },
      });

      logger.info(`User deleted: ${id}`, { userId: id, email: user.email });
      res.json({ message: Messages.USER.DELETED });
    } catch (error) {
      logger.error('Error in deleteUser', { error, userId: id });
      res.status(500).json({ message: Messages.USER.LOGGIN_ERROR });
    }
  },
};

export default UserController;
