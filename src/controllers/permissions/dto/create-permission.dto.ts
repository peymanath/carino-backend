import { IsNotEmpty, IsString, MaxLength, IsNumber } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  key: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
