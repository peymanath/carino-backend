import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageClient } from './storage.client';
import { storageConfig } from '../../config/env.config';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [
    StorageService,
    {
      provide: StorageClient,
      useFactory: () => {
        const config = storageConfig();
        return new StorageClient({
          accessKey: config.accessKey,
          endPoint: config.endpoint,
          port: config.port,
          secretKey: config.secretKey,
          useSSL: config.useSSL,
        });
      },
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
