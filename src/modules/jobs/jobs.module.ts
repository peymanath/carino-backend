import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { RedisService } from '../cache/redis.service';
import { ApiCallerBomberJob } from './jobs.processor';
// import { ApiCallerBomberService } from './definitions/api-caller-bomber/api-caller-bomber.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [RedisService],
      useFactory: () => {
        const host = process.env.REDIS_HOST || '127.0.0.1';
        const port = +(process.env.REDIS_PORT || 6379);
        const username = process.env.REDIS_USERNAME || undefined;
        const password = process.env.REDIS_PASSWORD || undefined;

        return {
          connection: {
            host,
            port,
            username,
            password,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'jobs',
    }),
  ],
  providers: [
    JobsService,
    ApiCallerBomberJob,
    // ApiCallerBomberService
  ],
  exports: [JobsService],
})
export class JobsModule {}
