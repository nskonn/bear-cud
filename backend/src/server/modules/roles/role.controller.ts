import { Request, Response } from 'express';
import { roleService } from './role.service';

export class RoleController {
  async getAll(req: Request, res: Response) {
    try {
      const roles = await roleService.getAllRoles();
      res.json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const role = await roleService.createRole(name);
      res.status(201).json(role);
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { oldName, newName } = req.body;
      if (!oldName || !newName) {
        return res.status(400).json({ error: 'oldName and newName are required' });
      }
      const role = await roleService.updateRole(oldName, newName);
      res.json(role);
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const roleController = new RoleController();
