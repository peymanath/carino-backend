import { Prisma, PrismaClient } from '@prisma/client';
import { PERMISSION_CATEGORIES } from '../shared/permissions/permission-categories';
import { DefaultArgs } from '@prisma/client/runtime/library';

export const seedPermissions = async (prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) => {
  for (const category of PERMISSION_CATEGORIES) {
    let permissionCategory = await prisma.permissionCategory.findFirst({
      where: {
        name: category.name,
      },
    });

    if (!permissionCategory) {
      permissionCategory = await prisma.permissionCategory.create({
        data: {
          name: category.name,
        },
      });
    }

    for (const permission of category.permissions) {
      await prisma.permission.upsert({
        where: {
          key: permission.key,
        },
        update: {
          name: permission.name,
          categoryId: permissionCategory.id,
        },
        create: {
          key: permission.key,
          name: permission.name,
          categoryId: permissionCategory.id,
        },
      });
    }
  }
};
