import { Request, Response } from 'express';
import Messages from '../constants/messages';
import { IUser } from '../types/user';
import logger from '../services/logger';

const UserController = {
  createUser: async (
    req: Request<{}, {}, IUser>,
    res: Response
  ): Promise<void> => {
    try {
      console.log('Create user');

      res.json('Creating user');
    } catch (error) {
      console.error('Error in getUser:', error);
      res.status(500).json({ message: Messages.USER.LOGGIN_ERROR });
    }
  },
  updateUser: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Updating user');

      res.json('Updating user');
    } catch (error) {
      console.error('Error in getUser:', error);
      res.status(500).json({ message: Messages.USER.LOGGIN_ERROR });
    }
  },
  getUsers: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Get all users');

      res.json('Get all users');
      logger.info('Usuarios encontrados con exito');
    } catch (error) {
      console.error('Error in getUser:', error);
      res.status(500).json({ message: Messages.USER.LOGGIN_ERROR });
    }
  },
  getUserById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      console.log('Getting user by id');

      res.json(`Getting user by id ${id}`);
    } catch (error) {
      console.error('Error in getUser:', error);
      res.status(500).json({ message: Messages.USER.LOGGIN_ERROR });
    }
  },
  getUsersByRol: async (req: Request, res: Response): Promise<void> => {
    try {
      const { rol } = req.body;

      console.log('Getting by rol');

      res.json(`Getting users by rol ${rol}`);
    } catch (error) {
      console.error('Error in getUser:', error);
      res.status(500).json({ message: Messages.USER.LOGGIN_ERROR });
    }
  },
  deleteUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      console.log('Deleting user by id');

      res.json(`Getting users by rol ${id}`);
    } catch (error) {
      console.error('Error in getUser:', error);
      res.status(500).json({ message: Messages.USER.LOGGIN_ERROR });
    }
  },
};

export default UserController;
