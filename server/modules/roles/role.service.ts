import prisma from '../../prisma/client';

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
    const count = await prisma.role.count();
    if (count === 0) {
      const defaultRoles = ['Швея', 'Закройщик', 'Упаковщик'];
      for (const name of defaultRoles) {
        await prisma.role.create({ data: { name } });
      }
    }
  }
}

export const roleService = new RoleService();
