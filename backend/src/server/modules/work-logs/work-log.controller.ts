import { Request, Response } from 'express';
import { workLogService } from './work-log.service';

export class WorkLogController {
  async getAll(req: Request, res: Response) {
    try {
      const logs = await workLogService.getAllLogs();
      // Преобразуем Date обратно в ISO string для фронтенда
      const formattedLogs = logs.map(log => ({
        ...log,
        date: log.date.toISOString(),
      }));
      res.json(formattedLogs);
    } catch (error) {
      console.error('Error fetching work logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { userId, date, totalEarned, items, expenses } = req.body;
      if (!userId || !date || typeof totalEarned !== 'number') {
        return res.status(400).json({ error: 'Invalid data' });
      }
      const log = await workLogService.createLog({ userId, date, totalEarned, items, expenses });
      res.status(201).json({ ...log, date: log?.date.toISOString() });
    } catch (error) {
      console.error('Error creating work log:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { date, totalEarned, items, expenses } = req.body;
      if (!date || typeof totalEarned !== 'number') {
        return res.status(400).json({ error: 'Invalid data' });
      }
      const log = await workLogService.updateLog(id, { date, totalEarned, items, expenses });
      res.json({ ...log, date: log?.date.toISOString() });
    } catch (error) {
      console.error('Error updating work log:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const workLogController = new WorkLogController();
