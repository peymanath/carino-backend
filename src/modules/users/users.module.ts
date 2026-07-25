import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PermissionsService } from '../permissions/permissions.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService,PermissionsService],
  exports: [UsersService],
})
export class UsersModule {}
