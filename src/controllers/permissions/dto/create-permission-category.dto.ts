import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePermissionCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;
}
