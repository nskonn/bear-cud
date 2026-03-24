import prisma from '../../prisma/client';
import {adminLogin, adminPassword} from "../../../config/config";

export class RoleService {
  async getAllRoles() {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
    return roles.map((r) => r.name);
  }

  async createRole(name: string) {
    const role = await prisma.role.create({
      data: { name },
    });
    return role.name;
  }

  async updateRole(oldName: string, newName: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Update the role itself
      await tx.role.update({
        where: { name: oldName },
        data: { name: newName },
      });

      // 2. Update all users with this role
      await tx.user.updateMany({
        where: { role: oldName },
        data: { role: newName },
      });

      // 3. Update all catalog items with this role
      await tx.catalogItem.updateMany({
        where: { role: oldName },
        data: { role: newName },
      });

      return newName;
    });
  }

  async seedDefaultRoles() {
    try {
      // 1. Определяем список необходимых ролей
      // Добавляем 'admin' в общий список, чтобы роль существовала в базе
      const defaultRoles = ['Швея', 'Закройщик', 'Упаковщик', 'admin'];

      for (const name of defaultRoles) {
        await prisma.role.upsert({
          where: { name: name }, // Ищем по уникальному имени [cite: 1]
          update: {},           // Если найдено — ничего не меняем
          create: { name: name }, // Если не найдено — создаем [cite: 1]
        });
      }

      // 2. Создаем или обновляем администратора

      await prisma.user.upsert({
        where: { login: adminLogin }, // Проверка по уникальному полю login
        update: {}, // Если админ уже есть, не перезаписываем его (чтобы не сбросить измененный пароль)
        create: {
          name: 'Администратор',
          login: adminLogin,
          password: adminPassword,
          role: 'admin',
          isBlocked: false,
          hourlyRate: 0
        },
      });

      console.log('✅ Роли и администратор успешно проверены/созданы');
    } catch (error) {
      console.error('❌ Ошибка при сидинге базы данных:', error);
    }
  }
}

export const roleService = new RoleService();
