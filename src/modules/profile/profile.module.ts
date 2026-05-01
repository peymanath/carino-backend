import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { StorageModule } from '../storage/storage.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [StorageModule, SessionModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
