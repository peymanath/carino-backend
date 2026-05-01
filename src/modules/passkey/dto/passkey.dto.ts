import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PasskeyProviderDTO {
  @ApiProperty({ example: 'Yubico', description: 'نام provider' })
  name: string;

  @ApiProperty({ example: 'ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4', description: 'AAGUID منحصر به فرد provider' })
  aaguid: string;

  @ApiProperty({ example: 0, description: 'نوع provider' })
  providerType: number;
}

export class PasskeyListItemDTO {
  @ApiProperty({ example: 1, description: 'شناسه passkey' })
  id: string;

  @ApiPropertyOptional({ example: 'کلید لپ‌تاپ', description: 'نام انتخابی passkey' })
  name?: string;

  @ApiProperty({ example: new Date(), description: 'زمان ایجاد passkey' })
  createdAt: Date;

  @ApiProperty({ example: new Date(), description: 'آخرین بروزرسانی' })
  updatedAt: Date;

  @ApiProperty({ example: 0 })
  deviceType: number;

  @ApiProperty({ example: 0 })
  backedUp: number;

  @ApiProperty({ example: ['ble'] })
  transports: string[];

  @ApiProperty({ type: PasskeyProviderDTO, description: 'اطلاعات provider' })
  provider: PasskeyProviderDTO;
}

export type PasskeyListDTO = PasskeyListItemDTO[];
