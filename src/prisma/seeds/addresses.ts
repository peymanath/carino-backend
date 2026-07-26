import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

export const seedLocations = async (
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) => {
  let country = await prisma.country.findFirst({
    where: {
      name: 'ایران',
    },
  });

  if (!country) {
    country = await prisma.country.create({
      data: {
        name: 'ایران',
      },
    });
  }


  let province = await prisma.province.findFirst({
    where: {
      name: 'تهران',
      countryId: country.id,
    },
  });

  if (!province) {
    province = await prisma.province.create({
      data: {
        name: 'تهران',
        countryId: country.id,
      },
    });
  }


  const city = await prisma.city.findFirst({
    where: {
      name: 'تهران',
      provinceId: province.id,
    },
  });

  if (!city) {
     await prisma.city.create({
      data: {
        name: 'تهران',
        provinceId: province.id,
      },
    });
  }
};