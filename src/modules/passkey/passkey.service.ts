import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePasskeyProviderDto, UpdatePasskeyProviderDto } from './dto/passkey-provider.dto';
import { PasskeyRegistrationOptionsResponseDto, PasskeyRegisterVerifyDto } from './dto/passkey-register.dto';
import { AuthenticatorTransportFuture, generateAuthenticationOptions, generateRegistrationOptions, RegistrationResponseJSON, verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server';
import { RedisService } from '../cache/redis.service';
import { EnumRedisDatabase } from '@/shared/enums/EnumRedisDatabase';
import { buildRedisKey } from '@/shared/utils';
import { EnumRedisKey } from '@/shared/enums/EnumRedisKey';
import { registerEnv } from '@/config/env.config';
import { StandardResponseDto } from '@/shared/dto';
import { MESSAGES } from '@/shared/errors';
import { PasskeyListDTO, PasskeyListItemDTO } from './dto/passkey.dto';
import { SessionDto } from '../session/dto/session.dto';
import { CredentialBackupStatus, CredentialDeviceType, EnumBrowserName, EnumDeviceType, EnumOSName } from '@/types';
import { PasskeyLoginOptionsDto, PasskeyLoginVerifyDto } from './dto/passkey-login.dto';
import { OTPVerificationResultDto } from '../auth/dto/auth-otp-verify.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class PasskeyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly auth: AuthService
  ) {}

  // #region PasskeyProvider Admin CRUD
  async createProvider(data: CreatePasskeyProviderDto) {
    return this.prisma.passkeyProvider.create({
      data,
    });
  }

  async findAllProviders() {
    return this.prisma.passkeyProvider.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async findProviderById(id: number) {
    const provider = await this.prisma.passkeyProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
  }

  async updateProvider(id: number, data: UpdatePasskeyProviderDto) {
    await this.findProviderById(id);

    return this.prisma.passkeyProvider.update({
      where: { id },
      data,
    });
  }

  async deleteProvider(id: number) {
    await this.findProviderById(id);

    return this.prisma.passkeyProvider.delete({
      where: { id },
    });
  }
  // #endregion

  // #region Passkey Registration Flow
  private buildPasskeyName(session: SessionDto): string {
    const convertOsName: Record<EnumOSName, string> = {
      [EnumOSName.WINDOWS]: 'Windows',
      [EnumOSName.MACOS]: 'macOS',
      [EnumOSName.LINUX]: 'Linux',
      [EnumOSName.ANDROID]: 'Android',
      [EnumOSName.IOS]: 'iOS',
      [EnumOSName.OTHER]: 'Other',
    };

    const convertBrowserName: Record<EnumBrowserName, string> = {
      [EnumBrowserName.CHROME]: 'Chrome',
      [EnumBrowserName.FIREFOX]: 'Firefox',
      [EnumBrowserName.SAFARI]: 'Safari',
      [EnumBrowserName.EDGE]: 'Edge',
      [EnumBrowserName.OPERA]: 'Opera',
      [EnumBrowserName.OTHER]: 'Other',
    };

    const convertDeviceType: Record<EnumDeviceType, string> = {
      [EnumDeviceType.DESKTOP]: 'Desktop',
      [EnumDeviceType.MOBILE]: 'Mobile',
      [EnumDeviceType.TABLET]: 'Tablet',
      [EnumDeviceType.BOT]: 'Bot',
      [EnumDeviceType.OTHER]: 'Other',
    };

    return `${convertDeviceType[session.deviceType]} ${convertOsName[session.osName]} – ${convertBrowserName[session.browserName]}`;
  }

  passkeyToDbConverter = {
    deviceType: (type: string): number => (type === 'multiDevice' ? CredentialDeviceType.MULTI_DEVICE : CredentialDeviceType.SINGLE_DEVICE),
    backupStatus: (status: boolean): number => (status ? CredentialBackupStatus.BACKED_UP : CredentialBackupStatus.NOT_BACKED_UP),
  };

  async generateRegistrationOptions(userId: number): Promise<PasskeyRegistrationOptionsResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException({ detail: MESSAGES.fmtNamed('USER_ID_NOT_FOUND', { userId }) });
    }

    const userPasskeys = await this.prisma.passkey.findMany({
      where: { userId },
    });

    const options = await generateRegistrationOptions({
      rpName: 'Baarg-Better-Mood',
      rpID: registerEnv.RP_ID || 'localhost',
      userID: Buffer.from(user.id.toString()),
      userName: user.mobile,
      userDisplayName: `${user.profile?.firstName ?? ''} ${user.profile?.lastName ?? ''}`.trim(),
      attestationType: 'direct',
      excludeCredentials: userPasskeys.map(pk => ({
        id: pk.credentialId,
        type: 'public-key',
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
    });

    this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.PASSKEY);

    const challengeKey = buildRedisKey(EnumRedisKey.PASSKEY_REGISTER, [userId]);

    await this.redis.set(challengeKey, options.challenge, 120);

    return options;
  }

  async verifyRegistration(userId: number, session: SessionDto | null, body: PasskeyRegisterVerifyDto): Promise<StandardResponseDto<void>> {
    this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.PASSKEY);

    const challengeKey = buildRedisKey(EnumRedisKey.PASSKEY_REGISTER, [userId]);

    const savedChallenge = await this.redis.get(challengeKey);

    if (!savedChallenge) {
      throw new BadRequestException({ detail: MESSAGES.PASSKEY_REGISTRATION_SESSION_EXPIRED });
    }

    try {
      const verification = await verifyRegistrationResponse({
        response: body as RegistrationResponseJSON,
        expectedChallenge: savedChallenge,
        expectedOrigin: registerEnv.PASSKEY_ORIGIN || 'http://localhost:3000',
        expectedRPID: registerEnv.RP_ID || 'localhost',
      });

      if (!verification.verified || !verification.registrationInfo) {
        throw new BadRequestException({ detail: MESSAGES.PASSKEY_REGISTRATION_VERIFICATION_FAILED });
      }

      const { credential, aaguid } = verification.registrationInfo;

      const aaguidID = await this.prisma.passkeyProvider.findUnique({
        where: {
          aaguid,
        },
      });

      // if (!aaguidID) {
      //   throw new BadRequestException({ detail: MESSAGES.PASSKEY_REGISTRATION_AAGUID_NOTFOUND });
      // }

      const credentialId = credential.id;
      const publicKey = Buffer.from(credential.publicKey);
      const counter = BigInt(credential.counter);
      const transports = body.response.transports ?? [];

      await this.prisma.passkey.create({
        data: {
          userId,
          name: this.buildPasskeyName(session!),
          credentialId,
          publicKey,
          counter,
          transports,
          providerId: aaguidID?.id || 1,
          deviceType: this.passkeyToDbConverter.deviceType(verification.registrationInfo.credentialDeviceType),
          backedUp: this.passkeyToDbConverter.backupStatus(verification.registrationInfo.credentialBackedUp),
        },
        include: {
          provider: true,
        },
      });

      await this.redis.delete(challengeKey);
    } catch (error) {
      let userMessage: string = MESSAGES.PASSKEY_REGISTRATION_UNKNOWN_ERROR;

      if (error.response.detail) {
        userMessage = error.response.detail;
      } else if (error.message.includes('Unexpected registration response origin')) {
        userMessage = MESSAGES.PASSKEY_REGISTRATION_ORIGIN_MISMATCH;
      } else if (error.message.includes('Response has already been used')) {
        userMessage = MESSAGES.PASSKEY_REGISTRATION_RESPONSE_USED;
      } else if (error.message.includes('Challenge mismatch')) {
        userMessage = MESSAGES.PASSKEY_REGISTRATION_CHALLENGE_MISMATCH;
      } else if (error.message.includes('Invalid attestation format')) {
        userMessage = MESSAGES.PASSKEY_REGISTRATION_INVALID_ATTESTATION;
      }

      throw new BadRequestException(userMessage);
    }

    return new StandardResponseDto();
  }

  async revokeRegistrationPasskey(userId: number, passkeyId: string): Promise<StandardResponseDto<void>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException({ detail: MESSAGES.fmtNamed('USER_ID_NOT_FOUND', { userId }) });
    }

    const passkey = await this.prisma.passkey.findUnique({
      where: { id: passkeyId },
    });

    if (!passkey) {
      throw new BadRequestException(MESSAGES.PASSKEY_REGISTRATION_NOTFOUND);
    }

    if (passkey.userId !== userId) {
      throw new BadRequestException(MESSAGES.PASSKEY_REGISTRATION_FORBIDDEN);
    }

    console.log({ passkeyId });

    await this.prisma.passkey.delete({
      where: { id: passkeyId },
    });

    return new StandardResponseDto();
  }
  // #endregion

  // #region Passkey List
  async getList(userId: number): Promise<StandardResponseDto<PasskeyListDTO>> {
    const passkeys = await this.prisma.passkey.findMany({
      where: { userId },
      include: { provider: true },
      orderBy: { updatedAt: 'desc' },
    });

    const passkeyList: PasskeyListItemDTO[] = passkeys.map(pk => ({
      id: pk.id,
      name: pk.name ?? undefined,
      transports: pk.transports ?? [],
      deviceType: pk.deviceType,
      backedUp: pk.backedUp ?? [],
      createdAt: pk.createdAt,
      updatedAt: pk.updatedAt,
      provider: {
        name: pk.provider.name,
        aaguid: pk.provider.aaguid,
        providerType: pk.provider.providerType,
      },
    }));

    return new StandardResponseDto<PasskeyListDTO>(
      {
        data: passkeyList,
      },
      { skipTransform: true }
    );
  }
  // #endregion

  // #region Passkey Login Flow
  async generateAuthenticationOptions(): Promise<StandardResponseDto<PasskeyLoginOptionsDto>> {
    const options = await generateAuthenticationOptions({
      rpID: registerEnv.RP_ID || 'localhost',
      userVerification: 'required',
      timeout: 60000,
    });

    this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.PASSKEY);

    const challengeKey = buildRedisKey(EnumRedisKey.PASSKEY_LOGIN, [options.challenge]);

    await this.redis.set(challengeKey, options.challenge, 120);

    return new StandardResponseDto<PasskeyLoginOptionsDto>({
      data: {
        allowCredentials: options.allowCredentials ?? [],
        challenge: options.challenge,
        rpId: options.rpId ?? 'localhost',
        userVerification: options.userVerification ?? 'required',
        timeout: options.timeout,
      },
    });
  }
  async verifyAuthentication(body: PasskeyLoginVerifyDto): Promise<StandardResponseDto<OTPVerificationResultDto>> {
    const clientDataJSON = Buffer.from(body.response.clientDataJSON, 'base64');
    const clientData = JSON.parse(clientDataJSON.toString('utf8'));
    const challenge = clientData.challenge;

    if (!challenge) {
      throw new BadRequestException('Missing challenge in clientDataJSON');
    }

    this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.PASSKEY);
    const challengeKey = buildRedisKey(EnumRedisKey.PASSKEY_LOGIN, [challenge]);
    const savedChallenge = await this.redis.get(challengeKey);

    if (!savedChallenge) {
      throw new BadRequestException('Authentication session expired or invalid challenge');
    }

    const passkey = await this.prisma.passkey.findUnique({
      where: { credentialId: body.id },
    });

    if (!passkey) {
      throw new NotFoundException('Passkey not found');
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: savedChallenge,
      expectedOrigin: registerEnv.PASSKEY_ORIGIN || 'http://localhost:3000',
      expectedRPID: registerEnv.RP_ID || 'localhost',
      requireUserVerification: true,
      credential: {
        id: passkey.credentialId,
        publicKey: passkey.publicKey,
        counter: Number(passkey.counter),
        transports: (passkey.transports as AuthenticatorTransportFuture[]) ?? [],
      },
    });

    if (!verification.verified) {
      throw new BadRequestException('Passkey authentication verification failed');
    }

    await this.prisma.passkey.update({
      where: { id: passkey.id },
      data: { counter: BigInt(verification.authenticationInfo.newCounter) },
    });

    await this.redis.delete(challengeKey);

    const userId = passkey.userId;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException({ detail: MESSAGES.fmtNamed('USER_ID_NOT_FOUND', { userId }) });
    }

    return this.auth.publicLoginUser(user);
  }
  // #endregion
}
