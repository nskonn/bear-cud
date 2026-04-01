import prisma from '../../prisma/client';
import { RoleType } from '@prisma/client';

type TelegramPayload = {
  telegramId?: string | null;
  telegramFirstName?: string | null;
  telegramLastName?: string | null;
  telegramUsername?: string | null;
};

type UserPayload = TelegramPayload & {
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

  async findByTelegramId(telegramId: string) {
    return prisma.user.findUnique({
      where: { telegramId },
    });
  }

  async createUser(data: UserPayload & { name: string }) {
    return prisma.user.create({
      data: {
        name: data.name,
        role: data.role ?? RoleType.worker,
        position: data.position ?? null,
        telegramId: data.telegramId ?? null,
        telegramFirstName: data.telegramFirstName ?? null,
        telegramLastName: data.telegramLastName ?? null,
        telegramUsername: data.telegramUsername ?? null,
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

  async attachTelegramData(id: string, data: TelegramPayload) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export const userService = new UserService();
