import prisma from '../../prisma/client';

export class CatalogService {
  async getAllItems() {
    return prisma.catalogItem.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createItem(data: { name: string; role: string; standardHours: number }) {
    return prisma.catalogItem.create({
      data,
    });
  }

  async updateItem(id: string, data: { name?: string; role?: string; standardHours?: number }) {
    return prisma.catalogItem.update({
      where: { id },
      data,
    });
  }
}

export const catalogService = new CatalogService();
