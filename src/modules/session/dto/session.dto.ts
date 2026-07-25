import { ApiProperty } from '@nestjs/swagger';
import { EnumBrowserEngine, EnumBrowserName, EnumDeviceType, EnumOSName } from '../../../types';

export class SessionDto {
  @ApiProperty({ example: '6e6c6b49-143e-4b0c-9ef1-bc3b7c90bb8f' })
  id: string;

  @ApiProperty({ enum: EnumBrowserEngine, example: EnumBrowserEngine.BLINK })
  browserEngine: EnumBrowserEngine;

  @ApiProperty({ enum: EnumBrowserName, example: EnumBrowserName.CHROME })
  browserName: EnumBrowserName;

  @ApiProperty({ example: 117 })
  browserMajor?: number;

  @ApiProperty({ enum: EnumDeviceType, example: EnumDeviceType.DESKTOP })
  deviceType: EnumDeviceType;

  @ApiProperty({ enum: EnumOSName, example: EnumOSName.WINDOWS })
  osName: EnumOSName;

  @ApiProperty({ example: '10.0' })
  osVersion?: string;

  @ApiProperty({ example: '192.168.1.10' })
  ip?: string;

  @ApiProperty({ example: true })
  current?: boolean;

  @ApiProperty({ example: '2025-12-12T12:12:12' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-12T12:12:12' })
  updatedAt: Date | null;
}
