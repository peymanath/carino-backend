import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsMobilePhone, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Gender } from '../../../types';

export class CreateUserProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'number' })
  @IsOptional()
  @IsNumber()
  gender: Gender;

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  birthDate: Date;
}

export class UpdateUserProfileDto extends CreateUserProfileDto {}

export class CreateUserDto extends CreateUserProfileDto {
  @ApiProperty({ example: '09120000000' })
  @IsString()
  @IsMobilePhone('fa-IR', {}, { message: 'mobile must be a valid Iranian phone number' })
  mobile!: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
