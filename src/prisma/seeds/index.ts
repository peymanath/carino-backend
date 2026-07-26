import { PrismaClient } from '@prisma/client';
import { seedPermissions } from '../permissions';
import { seedLocations } from './addresses';

const prisma = new PrismaClient();

async function main() {
  await seedPermissions(prisma);
  await seedLocations(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
