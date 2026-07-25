import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../cache/redis.service';
import { User, UserProfile } from '@prisma/client';
import { EnumRedisDatabase } from '../../shared/enums/EnumRedisDatabase';
import { buildRedisKey } from '../../shared/utils';
import { EnumRedisKey } from '../../shared/enums/EnumRedisKey';
import { OTPVerificationResultDto } from './dto/auth-otp-verify.dto';
import { JwtTokenService } from '../jwt/jwt-token.servise';
import { StandardResponseDto } from '../../shared/dto';
import { JwtStandardClaims } from '../../shared/interfaces/jwt-standard-claims.interface';
import { MESSAGES } from '../../shared/errors';
import { registerEnv } from '../../config/env.config';
import { AuthCompleteProfileDto, AuthCompleteProfileResultDto } from './dto/auth-complete-profile.dto';
import { Gender, ISessionToken } from '../../types';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class AuthService {
  private static readonly OTP_TTL_SECONDS = 120;
  private static readonly OTP_TTL_MS = AuthService.OTP_TTL_SECONDS * 1000;
  private static readonly EXPIRE_TIME_TOKEN = 2 * 60 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtTokenService,
    private readonly permissionsService: PermissionsService
  ) {}

  async handleOTPRequest(mobile: string): Promise<StandardResponseDto<unknown>> {
    this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.OTP_CACHE);

    const timestampKey = buildRedisKey(EnumRedisKey.OTP_TIMESTAMP, [mobile]);
    const existingOtpTimestamp = await this.redis.get(timestampKey);

    if (existingOtpTimestamp) {
      const timeLeftMs = this.getRemainingMs(+existingOtpTimestamp, AuthService.OTP_TTL_MS);
      if (timeLeftMs > 0) {
        const waitMsg = this.formatRemaining(timeLeftMs);
        throw new BadRequestException({
          detail: MESSAGES.fmtNamed('AUTH_SEND_OTP_WAITING', { waitMsg }),
          error: 'OTPRequestTooSoon',
        });
      }
    }

    let otpCode = this.generateOtp();

    // Send SMS
    // const smsStatus = await this.sms.sendSmsWithPattern<[{ otp: string }]>(mobile, "359595", [{ otp: otpCode.toString() }]);
    // otpCode = +smsStatus.data.otp;

    if (otpCode) {
      const otpKey = buildRedisKey(EnumRedisKey.OTP, [mobile]);
      await this.redis.set(otpKey, String(otpCode), AuthService.OTP_TTL_SECONDS);
      await this.redis.set(timestampKey, String(Date.now()), AuthService.OTP_TTL_SECONDS);

      return new StandardResponseDto({ message: MESSAGES.fmtNamed('AUTH_SUCCESS_SEND_OTP', { mobile }), data: { otpCode } });
    } else {
      throw new BadRequestException({
        detail: MESSAGES.SMS_MANAGER,
      });
    }
  }

  async verifyOtp(mobile: string, otp: number): Promise<StandardResponseDto<OTPVerificationResultDto>> {
    this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.OTP_CACHE);

    const otpKey = buildRedisKey(EnumRedisKey.OTP, [mobile]);
    const storedOtp = await this.redis.get(otpKey);

    if (!storedOtp) {
      throw new BadRequestException({ detail: MESSAGES.AUTH_OTP_CODE_INVALIDATE, error: 'InvalidOTP', statusCode: 445 });
    }

    if (otp.toString() !== storedOtp && registerEnv.IS_DEVELOPMENT && otp.toString() !== '1234') {
      throw new BadRequestException({ detail: MESSAGES.AUTH_RECIVED_OTP_WRONG, error: 'InvalidOTP' });
    }

    const existingUser = await this.validateUser(mobile);
    return existingUser ? this.loginUser(existingUser) : this.registerUser(mobile);
  }

  async completeProfile(userId: number, dto: AuthCompleteProfileDto): Promise<StandardResponseDto<AuthCompleteProfileResultDto>> {
    const fixDate: AuthCompleteProfileDto = { ...dto, birthDate: new Date(dto.birthDate) };
    try {
      const updateUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          profile: fixDate
            ? {
                upsert: {
                  create: { ...fixDate },
                  update: { ...fixDate },
                },
              }
            : undefined,
        },
        include: { profile: true },
      });

      return new StandardResponseDto({
        message: MESSAGES.fmtNamed('AUTH_COMPLETE_PROFILE', {}),
        data: {
          firstName: updateUser.profile?.firstName as string,
          lastName: updateUser.profile?.lastName as string,
          email: updateUser.profile?.email as string,
          gender: updateUser.profile?.gender as Gender,
          birthDate: updateUser.profile?.birthDate ?? null,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('User not found');
      throw e;
    }
  }

  private async issueTokens(user: User): Promise<ISessionToken> {
    const payload: JwtStandardClaims = { sub: user.id };
    const accessToken = this.jwt.encode<typeof payload>(payload, AuthService.EXPIRE_TIME_TOKEN);
    const refreshToken = this.jwt.encode<typeof payload>(payload, AuthService.EXPIRE_TIME_TOKEN);

    return { accessToken, refreshToken, exp: Date.now() + AuthService.EXPIRE_TIME_TOKEN };
  }

  private async loadProfile(userId: number) {
    return this.prisma.userProfile.findUnique({
      where: { userId },
      include: { media: { select: { url: true } } },
    });
  }

  private async validateUserById(userId: number) {
    return this.prisma.userProfile.findUnique({
      where: { userId },
      include: { media: { select: { url: true } } },
    });
  }

  private async loadPermissions(userId: number) {
    return this.permissionsService.getForPermissionWithUserId(userId);
  }

  private async finishAuth(user: User, isNewUser: boolean, message: string): Promise<StandardResponseDto<OTPVerificationResultDto>> {
    /**
     * Get User Profile and Token and Permissions
     */
    const [tokens, profile, permissions] = await Promise.all([this.issueTokens(user), this.loadProfile(user.id), this.loadPermissions(user.id)]);

    /**
     * Clean Redis
     */
    this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.OTP_CACHE);
    const timestampKey = buildRedisKey(EnumRedisKey.OTP_TIMESTAMP, [user.mobile]);
    const otpKey = buildRedisKey(EnumRedisKey.OTP, [user.mobile]);
    await Promise.all([this.redis.delete(otpKey), this.redis.delete(timestampKey)]);

    return new StandardResponseDto({
      message,
      data: {
        isNewUser,
        profile: profile
          ? {
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              mobile: user.mobile,
              birthDate: profile.birthDate,
              gender: profile.gender,
              avatarUrl: profile.media?.url ?? null,
              isActive: user.isActive,
              isMobileVerified: user.isMobileVerified,
            }
          : null,
        token: tokens,
        permissions: permissions?.data?.permissions ?? [],
      },
    });
  }

  private async loginUser(user: User & { profile: UserProfile | null }): Promise<StandardResponseDto<OTPVerificationResultDto>> {
    const isNewUser = !this.isProfileComplete(user.profile);
    return this.finishAuth(user, isNewUser, MESSAGES.AUTH_LOGIN_SUCCESS);
  }

  public async publicLoginUser(user: User & { profile: UserProfile | null }): Promise<StandardResponseDto<OTPVerificationResultDto>> {
    return this.loginUser(user);
  }

  private async registerUser(mobile: string): Promise<StandardResponseDto<OTPVerificationResultDto>> {
    const newUser = await this.prisma.user.create({
      data: { mobile, isMobileVerified: true, isActive: true },
    });

    await this.prisma.userProfile.upsert({
      where: { userId: newUser.id },
      create: { userId: newUser.id },
      update: {},
    });

    // تخصیص پرمیشن های پیش فرض
    this.permissionsService.assignDefaultPermissions(newUser.id);

    return this.finishAuth(newUser, true, MESSAGES.AUTH_REGISTER_SUCCESS);
  }

  async validateUser(mobile: string): Promise<(User & { profile: UserProfile | null }) | null> {
    return this.prisma.user.findUnique({
      where: { mobile_isDeleted: { mobile, isDeleted: false } },
      include: {
        profile: true,
      },
    });
  }

  private isProfileComplete(profile: UserProfile | null): boolean {
    if (!profile) return false;
    return Boolean(profile.firstName?.trim() && profile.lastName?.trim() && profile.email?.trim() && profile.gender !== null && profile.gender !== undefined && profile.birthDate);
  }

  private getRemainingMs(startedAtMs: number, windowMs: number): number {
    const elapsed = Date.now() - startedAtMs;
    return Math.max(0, windowMs - elapsed);
  }

  private formatRemaining(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min > 0 && sec > 0) return MESSAGES.fmtNamed('AUTH_TIMER_SEC_MIN', { sec, min });
    if (min > 0) return MESSAGES.fmtNamed('AUTH_TIMER_MIN', { min });
    return MESSAGES.fmtNamed('AUTH_TIMER_SEC', { sec });
  }

  private generateOtp(): number {
    const length = +registerEnv.AUTH_OTP_NUM;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1));
  }
}
