import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthenticatorTransportFuture, PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PasskeyRegistrationOptionsResponseDto implements PublicKeyCredentialCreationOptionsJSON {
  @ApiProperty({ example: 'f32a89...' })
  challenge: string;

  @ApiProperty({
    example: { name: 'Carino', id: 'localhost' },
  })
  rp: PublicKeyCredentialCreationOptionsJSON['rp'];

  @ApiProperty({
    example: {
      id: 'dXNlcl8xMjM',
      name: 'user@example.com',
      displayName: 'User Display Name',
    },
  })
  user: PublicKeyCredentialCreationOptionsJSON['user'];

  @ApiProperty({
    example: [{ type: 'public-key', alg: -7 }],
  })
  pubKeyCredParams: PublicKeyCredentialCreationOptionsJSON['pubKeyCredParams'];

  @ApiPropertyOptional({ example: 60000 })
  timeout?: number;

  @ApiPropertyOptional({ example: 'none' })
  attestation?: PublicKeyCredentialCreationOptionsJSON['attestation'];

  @ApiPropertyOptional({
    example: [
      {
        id: 'AbCdEf...',
        type: 'public-key',
      },
    ],
  })
  excludeCredentials?: PublicKeyCredentialCreationOptionsJSON['excludeCredentials'];

  @ApiPropertyOptional()
  authenticatorSelection?: PublicKeyCredentialCreationOptionsJSON['authenticatorSelection'];

  @ApiPropertyOptional()
  extensions?: PublicKeyCredentialCreationOptionsJSON['extensions'];
}

export class AuthenticatorAttestationResponseDto {
  @ApiProperty({ example: 'eyJ0eXBlIjoi...' })
  @IsString()
  @IsNotEmpty()
  clientDataJSON: string;

  @ApiProperty({ example: 'o2NmbXRoZ...' })
  @IsString()
  @IsNotEmpty()
  attestationObject: string;

  @ApiProperty({ example: ['internal'], required: false })
  @IsOptional()
  transports?: string[];
}

export class PasskeyRegisterVerifyDto {
  @ApiProperty({ example: 'AbCdEf...' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'AbCdEf...' })
  @IsString()
  @IsNotEmpty()
  rawId: string;

  @ApiProperty({ example: 'public-key' })
  @IsString()
  @IsNotEmpty()
  type: 'public-key';

  @ApiProperty({ example: ['internal'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  transports: AuthenticatorTransportFuture[];

  @ApiProperty({ type: AuthenticatorAttestationResponseDto })
  @ValidateNested()
  @Type(() => AuthenticatorAttestationResponseDto)
  response: AuthenticatorAttestationResponseDto;

  @ApiProperty({ required: false })
  @IsOptional()
  authenticatorAttachment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  clientExtensionResults?: Record<string, any>;
}
