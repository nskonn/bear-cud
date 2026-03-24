import prisma from '../../prisma/client';

export class PayoutService {
  async getAllPayouts() {
    return prisma.payout.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async createPayout(data: { userId: string; date: string; amount: number }) {
    return prisma.payout.create({
      data: {
        userId: data.userId,
        date: new Date(data.date),
        amount: data.amount,
      },
    });
  }
}

export const payoutService = new PayoutService();
