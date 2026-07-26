import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ProvinceQueryDDLDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  countryId?: number;
}
export class CityQueryDDLDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  provinceId?: number;
}
