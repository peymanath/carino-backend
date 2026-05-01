import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // await essentials(prisma);
  // await profile();
  // await mocks();
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect().finally(() => process.exit(1));
  });
