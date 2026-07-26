import { BadRequestException, Body, Controller, Delete, Post, Req } from '@nestjs/common';

import { LocationService } from '../../modules/location/location.service';
import { SetUserLocationDto } from './dto/set-user-location.dto';
import { MESSAGES } from '../../shared/errors';

@Controller('user/location')
export class UserLocationController {
  constructor(private readonly locationService: LocationService) {}

  //#region Set User Location
  @Post()
  async setUserLocation(@Req() req: Request, @Body() dto: SetUserLocationDto) {
    const userId = req.user.id;

    if (!dto.addressId && (dto.latitude === undefined || dto.longitude === undefined)) {
      throw new BadRequestException({
        detail: MESSAGES.LOCATION_REQUIRED_LOCATION_SOURCE,
        error: 'LocationSourceRequired',
      });
    }

    if (dto.addressId) {
      return this.locationService.getLocationFromAddress(userId);
    }

    return this.locationService.setUserLocation(userId, dto.latitude!, dto.longitude!);
  }
  //#endregion

  //#region Clear User Location
  @Delete()
  async clearUserLocation(@Req() req: Request) {
    return this.locationService.clearUserLocation(req.user.id);
  }
  //#endregion
}
