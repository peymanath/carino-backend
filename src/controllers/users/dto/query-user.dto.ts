import { PaginationQueryDto } from '../../../shared/dto/PaginationQuery.dto';
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsMobilePhone, IsOptional, IsString } from "class-validator";

export class QueryUserDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsMobilePhone("fa-IR")
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMobileVerified?: boolean;
}
