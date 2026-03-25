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

      // 2. Обновляем должность у пользователей
      await tx.user.updateMany({
        where: { position: oldName },
        data: { position: newName },
      });

      // 3. Обновляем должность в справочнике
      await tx.catalogItem.updateMany({
        where: { position: oldName },
        data: { position: newName },
      });

      return newName;
    });
  }

  async seedDefaultRoles() {
    try {
      const defaultRoles = ['Упаковщик',];

      for (const name of defaultRoles) {
        await prisma.role.upsert({
          where: { name },
          update: {},
          create: { name },
        });
      }
console.log(adminLogin, 'adminLogin')
console.log(adminPassword, 'adminPassword')
      await prisma.user.upsert({
        where: { login: adminLogin },
        update: {},
        create: {
          name: 'Администратор',
          login: adminLogin,
          password: adminPassword,
          role: 'admin',
          position: null,
          isBlocked: false,
          hourlyRate: 0,
        },
      });

      console.log('✅ Роли/должности и администратор успешно проверены/созданы');
    } catch (error) {
      console.error('❌ Ошибка при сидинге базы данных:', error);
    }
  }
}

export const roleService = new RoleService();
