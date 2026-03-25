import { Request, Response } from 'express';
import { catalogService } from './catalog.service';

export class CatalogController {
  async getAll(req: Request, res: Response) {
    try {
      const items = await catalogService.getAllItems();
      res.json(items);
    } catch (error) {
      console.error('Error fetching catalog:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, position, standardHours } = req.body;
      if (!name || !position || typeof standardHours !== 'number') {
        return res.status(400).json({ error: 'Invalid data' });
      }
      const item = await catalogService.createItem({ name, position, standardHours });
      res.status(201).json(item);
    } catch (error) {
      console.error('Error creating catalog item:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, position, standardHours } = req.body;
      const item = await catalogService.updateItem(id, { name, position, standardHours });
      res.json(item);
    } catch (error) {
      console.error('Error updating catalog item:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const catalogController = new CatalogController();
