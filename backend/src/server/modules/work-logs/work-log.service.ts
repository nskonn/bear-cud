import prisma from '../../prisma/client';

export class WorkLogService {
  async getAllLogs() {
    return prisma.workLog.findMany({
      include: {
        items: true,
        expenses: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async createLog(data: {
    userId: string;
    date: string;
    totalEarned: number;
    items: { itemId: string; name: string; qty: number; standardHours: number; total: number }[];
    expenses?: { name: string; amount: number }[];
  }) {
    // Используем транзакцию для сохранения лога и его элементов
    return prisma.$transaction(async (tx) => {
      const log = await tx.workLog.create({
        data: {
          userId: data.userId,
          date: new Date(data.date),
          totalEarned: data.totalEarned,
        },
      });

      if (data.items && data.items.length > 0) {
        await Promise.all(
          data.items.map((item) =>
            tx.workLogItem.create({
              data: {
                workLogId: log.id,
                itemId: item.itemId,
                name: item.name,
                qty: item.qty,
                standardHours: item.standardHours,
                total: item.total,
              },
            })
          )
        );
      }

      if (data.expenses && data.expenses.length > 0) {
        await Promise.all(
          data.expenses.map((expense) =>
            tx.workLogExpense.create({
              data: {
                workLogId: log.id,
                name: expense.name,
                amount: expense.amount,
              },
            })
          )
        );
      }

      return tx.workLog.findUnique({
        where: { id: log.id },
        include: { items: true, expenses: true },
      });
    });
  }

  async updateLog(
    id: string,
    data: {
      date: string;
      totalEarned: number;
      items: { itemId: string; name: string; qty: number; standardHours: number; total: number }[];
      expenses?: { name: string; amount: number }[];
    }
  ) {
    return prisma.$transaction(async (tx) => {
      // Обновляем сам лог
      await tx.workLog.update({
        where: { id },
        data: {
          date: new Date(data.date),
          totalEarned: data.totalEarned,
        },
      });

      // Удаляем старые элементы и расходы
      await tx.workLogItem.deleteMany({
        where: { workLogId: id },
      });
      await tx.workLogExpense.deleteMany({
        where: { workLogId: id },
      });

      // Создаем новые элементы
      if (data.items && data.items.length > 0) {
        await Promise.all(
          data.items.map((item) =>
            tx.workLogItem.create({
              data: {
                workLogId: id,
                itemId: item.itemId,
                name: item.name,
                qty: item.qty,
                standardHours: item.standardHours,
                total: item.total,
              },
            })
          )
        );
      }

      // Создаем новые расходы
      if (data.expenses && data.expenses.length > 0) {
        await Promise.all(
          data.expenses.map((expense) =>
            tx.workLogExpense.create({
              data: {
                workLogId: id,
                name: expense.name,
                amount: expense.amount,
              },
            })
          )
        );
      }

      return tx.workLog.findUnique({
        where: { id },
        include: { items: true, expenses: true },
      });
    });
  }
}

export const workLogService = new WorkLogService();
