import { PaginationQueryDto } from '../../../shared/dto/PaginationQuery.dto';
import { IsBoolean, IsMobilePhone, IsOptional, IsString } from 'class-validator';

export class QueryUserDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @IsMobilePhone('fa-IR')
  mobile?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isMobileVerified?: boolean;
}
