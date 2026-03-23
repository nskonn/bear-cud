import { Request, Response } from 'express';
import { userService } from './user.service';

export class UserController {
  async getAll(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, role, login, password, isBlocked, hourlyRate } = req.body;
      if (!name || !role) {
        return res.status(400).json({ error: 'Name and role are required' });
      }
      const user = await userService.createUser({ name, role, login, password, isBlocked, hourlyRate });
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, role, login, password, isBlocked, hourlyRate } = req.body;
      const user = await userService.updateUser(id, { name, role, login, password, isBlocked, hourlyRate });
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const userController = new UserController();
