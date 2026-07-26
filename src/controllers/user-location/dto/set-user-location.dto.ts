import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class SetUserLocationDto {
  @IsOptional()
  @IsInt()
  addressId?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
