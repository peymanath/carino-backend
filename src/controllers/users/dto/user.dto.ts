import { PartialType } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsMobilePhone, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Gender } from '../../../types';

export class CreateUserProfileDto {

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  gender: Gender;

  @IsOptional()
  @IsDateString()
  birthDate: Date;
}

export class UpdateUserProfileDto extends CreateUserProfileDto {}

export class CreateUserDto extends CreateUserProfileDto {
  @IsString()
  @IsMobilePhone('fa-IR', {}, { message: 'mobile must be a valid Iranian phone number' })
  mobile!: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
