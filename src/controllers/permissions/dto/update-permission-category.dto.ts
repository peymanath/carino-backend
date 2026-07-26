import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class UpdatePermissionCategoryDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;
}
