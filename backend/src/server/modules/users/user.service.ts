import prisma from '../../prisma/client';
import { RoleType } from '@prisma/client';

type UserPayload = {
  name?: string;
  role?: RoleType;
  position?: string | null;
  login?: string | null;
  password?: string | null;
  isBlocked?: boolean;
  hourlyRate?: number | null;
};

export class UserService {
  async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createUser(data: UserPayload & { name: string }) {
    return prisma.user.create({
      data: {
        name: data.name,
        role: data.role ?? RoleType.worker,
        position: data.position ?? null,
        login: data.login ?? null,
        password: data.password ?? null,
        isBlocked: data.isBlocked,
        hourlyRate: data.hourlyRate ?? null,
      },
    });
  }

  async updateUser(id: string, data: UserPayload) {
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
