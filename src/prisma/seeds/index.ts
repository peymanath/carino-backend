import { PrismaClient } from '@prisma/client';
import { PERMISSION_CATEGORIES } from '../../shared/permissions/permission-categories';

const prisma = new PrismaClient();

async function main() {
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
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });