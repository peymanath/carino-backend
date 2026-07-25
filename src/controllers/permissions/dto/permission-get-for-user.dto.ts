import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt, IsString, Min } from 'class-validator';

export class PermissionGetForUserDto {
  @ApiProperty({ type: [String], example: ['create', 'read', 'update', 'delete'] })
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissions: string[];
}
