import { EnumLocationSource } from '../enum/location.enums';

export class LocationContextResultDto {
  latitude: number;
  longitude: number;
}
export class GetLocationResultDto extends LocationContextResultDto {
  source: EnumLocationSource;
}

export class GetLocationFromAddressResultDto extends GetLocationResultDto {
  addressId: number;
}
export class GetUserLocationResultDto extends GetLocationResultDto {
  addressId?: number;
}
