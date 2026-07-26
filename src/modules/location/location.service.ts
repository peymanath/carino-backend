import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MESSAGES } from '../../shared/errors';
import { PrismaService } from '../database/prisma.service';
import { GetLocationFromAddressResultDto, GetUserLocationResultDto, LocationContextResultDto } from './dto/location.dto';
import { EnumLocationSource } from './enum/location.enums';
import { RedisService } from '../cache/redis.service';
import { EnumRedisDatabase } from '../../shared/enums/EnumRedisDatabase';
import { EnumRedisKey } from '../../shared/enums/EnumRedisKey';
import { buildRedisKey } from '../../shared/utils';

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  //#region validateLocation
  validateLocation(latitude: number, longitude: number) {
    if (latitude === null || latitude === undefined) {
      throw new BadRequestException({
        detail: MESSAGES.LOCATION_REQUIRED_LATITUDE,
        error: 'InvalidLatitude',
      });
    }

    if (longitude === null || longitude === undefined) {
      throw new BadRequestException({
        detail: MESSAGES.LOCATION_REQUIRED_LONGITUDE,
        error: 'InvalidLongitude',
      });
    }

    if (!Number.isFinite(latitude)) {
      throw new BadRequestException({
        detail: MESSAGES.LOCATION_INVALID_LATITUDE,
        error: 'InvalidLatitude',
      });
    }

    if (!Number.isFinite(longitude)) {
      throw new BadRequestException({
        detail: MESSAGES.LOCATION_INVALID_LONGITUDE,
        error: 'InvalidLongitude',
      });
    }

    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException({
        detail: MESSAGES.LOCATION_LATITUDE_OUT_OF_RANGE,
        error: 'InvalidLatitudeRange',
      });
    }

    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException({
        detail: MESSAGES.LOCATION_LONGITUDE_OUT_OF_RANGE,
        error: 'InvalidLongitudeRange',
      });
    }

    if (latitude === 0 && longitude === 0) {
      throw new BadRequestException({
        detail: MESSAGES.LOCATION_INVALID_COORDINATES,
        error: 'InvalidCoordinates',
      });
    }

    const normalizedLatitude = Number(latitude.toFixed(7));
    const normalizedLongitude = Number(longitude.toFixed(7));
    const latitudeDecimalLength = normalizedLatitude.toString().split('.')[1]?.length ?? 0;
    const longitudeDecimalLength = normalizedLongitude.toString().split('.')[1]?.length ?? 0;

    if (latitudeDecimalLength > 7) {
      throw new BadRequestException({
        detail: MESSAGES.LOCATION_INVALID_LATITUDE_PRECISION,
        error: 'InvalidLatitudePrecision',
      });
    }

    if (longitudeDecimalLength > 7) {
      throw new BadRequestException({
        detail: MESSAGES.LOCATION_INVALID_LONGITUDE_PRECISION,
        error: 'InvalidLongitudePrecision',
      });
    }

    return {
      latitude: normalizedLatitude,
      longitude: normalizedLongitude,
    };
  }
  //#endregion

  //#region Get User Location
  async getUserLocation(userId: number): Promise<GetUserLocationResultDto> {
    if (!userId) {
      throw new BadRequestException({
        detail: MESSAGES.USER_REQUIRED_ID,
        error: 'InvalidUserId',
      });
    }

    this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.LOCATION);

    const locationKey = buildRedisKey(EnumRedisKey.USER_LOCATION, [userId]);

    const storedLocation = await this.redis.get(locationKey);

    if (storedLocation) {
      let parsedLocation: LocationContextResultDto;
      try {
        parsedLocation = JSON.parse(storedLocation) as LocationContextResultDto;
      } catch {
        throw new BadRequestException({
          detail: MESSAGES.LOCATION_INVALID_COORDINATES,
          error: 'InvalidStoredLocation',
        });
      }

      const validatedLocation = this.validateLocation(Number(parsedLocation.latitude), Number(parsedLocation.longitude));

      return {
        latitude: validatedLocation.latitude,
        longitude: validatedLocation.longitude,
        source: EnumLocationSource.Temporary,
      };
    }

    return this.getLocationFromAddress(userId);
  }
  //#endregion

  //#region Set User Location
  async setUserLocation(userId: number, latitude: number, longitude: number): Promise<GetUserLocationResultDto> {
    if (!userId) {
      throw new BadRequestException({
        detail: MESSAGES.USER_REQUIRED_ID,
        error: 'InvalidUserId',
      });
    }

    const validatedUserId = await this.getUser(userId);

    const validatedLocation = this.validateLocation(Number(latitude), Number(longitude));

    this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.LOCATION);

    const key = buildRedisKey(EnumRedisKey.USER_LOCATION, [validatedUserId]);

    const locationData: LocationContextResultDto = {
      latitude: validatedLocation.latitude,
      longitude: validatedLocation.longitude,
    };

    await this.redis.set(key, JSON.stringify(locationData));

    return {
      latitude: validatedLocation.latitude,
      longitude: validatedLocation.longitude,
      source: EnumLocationSource.Temporary,
    };
  }
  //#endregion

  //#region Clear User Location
  async clearUserLocation(userId: number): Promise<boolean> {
    if (!userId) {
      throw new BadRequestException({
        detail: MESSAGES.USER_REQUIRED_ID,
        error: 'InvalidUserId',
      });
    }

    const validatedUserId = await this.getUser(userId);

    this.redis.switchDatabaseIfNeeded(EnumRedisDatabase._TEMP_DATA_CACHE);

    const key = buildRedisKey(EnumRedisKey.USER_LOCATION, [validatedUserId]);

    await this.redis.delete(key);

    return true;
  }
  //#endregion

  //#region Get Location From Address
  async getLocationFromAddress(userId: number): Promise<GetLocationFromAddressResultDto> {
    if (!userId) {
      throw new BadRequestException({
        detail: MESSAGES.USER_REQUIRED_ID,
        error: 'InvalidUserId',
      });
    }

    const validatedUserId = await this.getUser(userId);

    const address = await this.prisma.address.findFirst({
      where: {
        userId: validatedUserId,
        isDefault: true,
        user: {
          isDeleted: false,
        },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
      },
    });

    if (!address) {
      throw new NotFoundException({
        detail: MESSAGES.LOCATION_DEFAULT_ADDRESS_NOT_FOUND,
        error: 'DefaultAddressNotFound',
      });
    }

    if (address.latitude === null || address.longitude === null) {
      throw new BadRequestException({
        detail: MESSAGES.LOCATION_ADDRESS_COORDINATES_REQUIRED,
        error: 'AddressLocationMissing',
      });
    }

    const latitude = Number(address.latitude);
    const longitude = Number(address.longitude);
    const validatedLocation = this.validateLocation(latitude, longitude);

    return {
      addressId: address.id,
      latitude: validatedLocation.latitude,
      longitude: validatedLocation.longitude,
      source: EnumLocationSource.DefaultAddress,
    };
  }
  //#endregion

  //#region Get User
  private async getUser(userId: number): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException({ detail: MESSAGES.fmtNamed('USER_ID_NOT_FOUND', { userId }) });
    }
    return user.id;
  }
  //#endregion
}
