import { Request, Response } from 'express';
import { payoutService } from './payout.service';

export class PayoutController {
  async getAll(req: Request, res: Response) {
    try {
      const payouts = await payoutService.getAllPayouts();
      const formattedPayouts = payouts.map(p => ({
        ...p,
        date: p.date.toISOString(),
      }));
      res.json(formattedPayouts);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { userId, date, amount } = req.body;
      if (!userId || !date || typeof amount !== 'number') {
        return res.status(400).json({ error: 'Invalid data' });
      }
      const payout = await payoutService.createPayout({ userId, date, amount });
      res.status(201).json({ ...payout, date: payout.date.toISOString() });
    } catch (error) {
      console.error('Error creating payout:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const payoutController = new PayoutController();
