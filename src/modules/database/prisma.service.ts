import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { softDeleteExtension } from './extensions/soft-delete-extension';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
    return this.$extends(softDeleteExtension) as PrismaService;
  }
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (error) {
      console.error('❌ Prisma connection failed:', error);
    }
  }
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
