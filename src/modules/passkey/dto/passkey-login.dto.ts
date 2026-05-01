import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PublicKeyCredentialRequestOptionsJSON, AuthenticationResponseJSON, AuthenticatorTransportFuture } from '@simplewebauthn/server';

export class PasskeyLoginOptionsDto implements PublicKeyCredentialRequestOptionsJSON {
  @ApiProperty({
    example: 'Y2hhbGxlbmdlLXZhbHVl',
  })
  @IsString()
  challenge: string;

  @ApiProperty({
    example: 'localhost',
  })
  @IsString()
  rpId: string;

  @ApiProperty({
    example: 60000,
    required: false,
  })
  @IsOptional()
  timeout?: number;

  @ApiProperty({
    description: 'User verification requirement',
    example: 'required',
  })
  @IsIn(['required', 'preferred', 'discouraged'])
  userVerification: 'required' | 'preferred' | 'discouraged';

  @ApiProperty({
    description: 'Optional list of allowed credentials (empty when using discoverable credentials)',
    required: false,
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowedCredentialDto)
  allowCredentials: AllowedCredentialDto[];
}

export class AllowedCredentialDto {
  @ApiProperty({ example: 'credential-id-base64url' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'public-key' })
  @IsIn(['public-key'])
  type: 'public-key';

  @ApiProperty({
    description: 'Transports supported by this credential',
    required: false,
    example: ['usb', 'ble', 'nfc', 'internal'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: false })
  transports?: AuthenticatorTransportFuture[];
}

export class PasskeyLoginVerifyDto implements AuthenticationResponseJSON {
  @ApiProperty({
    description: 'Credential ID',
    example: 'credential-id-base64url',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Raw credential ID',
    example: 'credential-id-base64url',
  })
  @IsString()
  rawId: string;

  @ApiProperty({
    description: 'Credential type',
    example: 'public-key',
  })
  @IsIn(['public-key'])
  type: 'public-key';

  @ApiProperty({
    description: 'Authenticator response object',
  })
  @IsOptional()
  response: AuthenticationResponseJSON['response'];

  @ApiProperty({
    description: 'Client extension results',
    required: false,
  })
  @IsOptional()
  clientExtensionResults: AuthenticationResponseJSON['clientExtensionResults'];

  @ApiProperty({
    description: 'Authenticator attachment (if available)',
    required: false,
  })
  @IsOptional()
  authenticatorAttachment?: AuthenticationResponseJSON['authenticatorAttachment'];
}
