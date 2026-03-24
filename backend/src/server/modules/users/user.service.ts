import prisma from '../../prisma/client';

export class UserService {
  async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createUser(data: { name: string; role: string; login?: string | null; password?: string | null; isBlocked?: boolean; hourlyRate?: number | null }) {
    return prisma.user.create({
      data,
    });
  }

  async updateUser(id: string, data: { name?: string; role?: string; login?: string | null; password?: string | null; isBlocked?: boolean; hourlyRate?: number | null }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const userService = new UserService();
