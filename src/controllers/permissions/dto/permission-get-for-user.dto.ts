import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class PermissionGetForUserDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissions: string[];
}
