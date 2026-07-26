import { PartialType } from '@nestjs/swagger';
import { Address } from '@prisma/client';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsInt()
  type: number;

  @IsInt()
  cityId: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  plaque?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {
  @IsInt()
  @IsNotEmpty()
  id: number;
}

export type AddressResultDto = Omit<Address, "userId">