import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../shared/dto/PaginationQuery.dto';
import { EnumPlaceLocationType } from '../../../shared/enums/EnumPlaceLocationType';

export class QueryPlaceDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cityId?: number;

  @IsOptional()
  @IsInt()
  type?: EnumPlaceLocationType;
}
