import { PaginationQueryDto } from '../../../shared/dto/PaginationQuery.dto';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class QueryAddressDto extends PaginationQueryDto {
  @IsOptional()
  @IsInt()
  cityId?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
