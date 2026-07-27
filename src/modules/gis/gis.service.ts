import { BadRequestException, Injectable } from '@nestjs/common';
import type { ICoordinate, IDistanceResult } from './interfaces';
import { EnumDistanceUnit } from './enums/distance-unit.enum';
import { CalculateDistanceDto } from './dto';
import { MESSAGES } from '../../shared/errors';

@Injectable()
export class GisService {
  //#region validateLatitude
  validateLatitude(latitude: number): boolean {
    return latitude >= -90 && latitude <= 90;
  }
  //#endregion

  //#region validateLongitude
  validateLongitude(longitude: number): boolean {
    return longitude >= -180 && longitude <= 180;
  }
  //#endregion

  //#region validateCoordinate
  validateCoordinate(coordinate: ICoordinate): ICoordinate {
    const { latitude, longitude } = coordinate;

    if (latitude === null || latitude === undefined) {
      throw new BadRequestException({
        detail: MESSAGES.GIS_COORDINATE_REQUIRED_LATITUDE,
        error: 'InvalidLatitude',
      });
    }

    if (longitude === null || longitude === undefined) {
      throw new BadRequestException({
        detail: MESSAGES.GIS_COORDINATE_REQUIRED_LONGITUDE,
        error: 'InvalidLongitude',
      });
    }

    if (!Number.isFinite(latitude)) {
      throw new BadRequestException({
        detail: MESSAGES.GIS_COORDINATE_INVALID_LATITUDE,
        error: 'InvalidLatitude',
      });
    }

    if (!Number.isFinite(longitude)) {
      throw new BadRequestException({
        detail: MESSAGES.GIS_COORDINATE_INVALID_LONGITUDE,
        error: 'InvalidLongitude',
      });
    }

    if (!this.validateLatitude(latitude)) {
      throw new BadRequestException({
        detail: MESSAGES.GIS_COORDINATE_LATITUDE_OUT_OF_RANGE,
        error: 'InvalidLatitudeRange',
      });
    }

    if (!this.validateLongitude(longitude)) {
      throw new BadRequestException({
        detail: MESSAGES.GIS_COORDINATE_LONGITUDE_OUT_OF_RANGE,
        error: 'InvalidLongitudeRange',
      });
    }

    if (latitude === 0 && longitude === 0) {
      throw new BadRequestException({
        detail: MESSAGES.GIS_COORDINATE_INVALID,
        error: 'InvalidCoordinate',
      });
    }

    const normalizedLatitude = Number(latitude.toFixed(7));
    const normalizedLongitude = Number(longitude.toFixed(7));

    const latitudeDecimalLength = normalizedLatitude.toString().split('.')[1]?.length ?? 0;
    const longitudeDecimalLength = normalizedLongitude.toString().split('.')[1]?.length ?? 0;

    if (latitudeDecimalLength > 7) {
      throw new BadRequestException({
        detail: MESSAGES.GIS_COORDINATE_INVALID_LATITUDE_PRECISION,
        error: 'InvalidLatitudePrecision',
      });
    }

    if (longitudeDecimalLength > 7) {
      throw new BadRequestException({
        detail: MESSAGES.GIS_COORDINATE_INVALID_LONGITUDE_PRECISION,
        error: 'InvalidLongitudePrecision',
      });
    }

    return {
      latitude: normalizedLatitude,
      longitude: normalizedLongitude,
    };
  }
  //#endregion

  //#region calculateDistance
  calculateDistance(dto: CalculateDistanceDto): IDistanceResult {
    const earthRadius = this.calculateEarthRadius(dto.unit ?? EnumDistanceUnit.KILOMETER);

    const latitudeDifference = this.degreeToRadians(dto.to.latitude - dto.from.latitude);

    const longitudeDifference = this.degreeToRadians(dto.to.longitude - dto.from.longitude);

    const a = Math.sin(latitudeDifference / 2) ** 2 + Math.cos(this.degreeToRadians(dto.from.latitude)) * Math.cos(this.degreeToRadians(dto.to.latitude)) * Math.sin(longitudeDifference / 2) ** 2;

    const distance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * earthRadius;

    return {
      value: distance,
      unit: dto.unit ?? EnumDistanceUnit.KILOMETER,
    };
  }
  //#endregion

  //#region convertDistanceUnit
  convertDistanceUnit(value: number, from: EnumDistanceUnit, to: EnumDistanceUnit): number {
    if (from === to) {
      return value;
    }

    const kilometerValue = from === EnumDistanceUnit.METER ? value / 1000 : from === EnumDistanceUnit.MILE ? value * 1.609344 : value;

    return to === EnumDistanceUnit.METER ? kilometerValue * 1000 : to === EnumDistanceUnit.MILE ? kilometerValue / 1.609344 : kilometerValue;
  }
  //#endregion

  //#region isInsideRadius
  isInsideRadius(center: ICoordinate, target: ICoordinate, radius: number, unit: EnumDistanceUnit): boolean {
    const distance = this.calculateDistance({
      from: center,
      to: target,
      unit,
    });

    return distance.value <= radius;
  }
  //#endregion

  //#region degreeToRadians
  degreeToRadians(degree: number): number {
    return degree * (Math.PI / 180);
  }
  //#endregion

  //#region radiansToDegree
  radiansToDegree(radians: number): number {
    return radians * (180 / Math.PI);
  }
  //#endregion

  //#region calculateEarthRadius
  calculateEarthRadius(unit: EnumDistanceUnit): number {
    return unit === EnumDistanceUnit.METER ? 6371000 : unit === EnumDistanceUnit.MILE ? 3958.8 : 6371;
  }
  //#endregion

  //#region isSameCoordinate
  isSameCoordinate(first: ICoordinate, second: ICoordinate): boolean {
    return first.latitude === second.latitude && first.longitude === second.longitude;
  }
  //#endregion
}
