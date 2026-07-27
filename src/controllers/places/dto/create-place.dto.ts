import { IsInt, IsOptional, IsString, IsNumber, IsEmail } from 'class-validator';

export class CreatePlaceDto {
  @IsInt()
  cityId: number;

  @IsInt()
  type: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
