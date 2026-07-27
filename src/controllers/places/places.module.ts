import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { PermissionsService } from '../permissions/permissions.service';

@Module({
  controllers: [PlacesController],
  providers: [PlacesService, PermissionsService],
  exports: [PlacesService],
})
export class PlacesModule {}
