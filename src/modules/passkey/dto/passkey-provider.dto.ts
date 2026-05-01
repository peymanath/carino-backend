import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePasskeyProviderDto {
  @ApiProperty({ example: 'ea9b8d66-4d01-1d21-3ce7-b6b327f62fde' })
  @IsString()
  @IsNotEmpty()
  aaguid: string;

  @ApiProperty({ example: 'Google Password Manager' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  providerType?: number;
}

export class UpdatePasskeyProviderDto {
  @ApiPropertyOptional({ example: 'ea9b8d66-4d01-1d21-3ce7-b6b327f62fde' })
  @IsString()
  @IsOptional()
  aaguid?: string;

  @ApiPropertyOptional({ example: 'Google Password Manager' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  providerType?: number;
}

export class PasskeyProviderResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  aaguid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  providerType: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
