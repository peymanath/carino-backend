import { Module } from '@nestjs/common';
import { UserLocationController } from './user-location.controller';
import { LocationModule } from '../../modules/location/location.module';

@Module({
  imports: [LocationModule],
  controllers: [UserLocationController],
})
export class UserLocationModule {}
