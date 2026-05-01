import { StandardResponseDto } from '@/shared/dto';
import { ISessionToken } from '@/types';
import { ApiProperty } from '@nestjs/swagger';
import { User, UserProfile, Media } from '@prisma/client';
import { IsNotEmpty, IsString, Matches, IsInt } from 'class-validator';

export class OTPVerifyDto {
  @ApiProperty({
    description: 'Iranian mobile phone number for OTP verification.',
    example: '09218856192',
  })
  @IsNotEmpty({ message: 'شماره موبایل الزامی است.' })
  @IsString({ message: 'شماره موبایل باید به صورت رشته وارد شود.' })
  @Matches(/^(?:\+98|0098|98|0)?9(0[1-5]|1[0-9]|2[0-2]|3[0-9]|9[0-9])\d{7}$/, {
    message: 'شماره موبایل معتبر نیست. فقط اپراتورهای ایرانسل، همراه اول، رایتل و شاتل پشتیبانی می‌شوند.',
  })
  mobile: string;

  @ApiProperty({
    description: 'One-time password code entered by the user for verification.',
    example: 1234,
  })
  @IsNotEmpty({ message: 'کد OTP الزامی است.' })
  @IsInt({ message: 'کد OTP باید عدد باشد.' })
  code: number;
}

export class OTPVerificationResultDto {
  @ApiProperty({
    description: 'Indicates whether the user is new and needs to complete their profile.',
    example: true,
  })
  isNewUser!: boolean;

  @ApiProperty({
    description: 'Indicates if the user has reached the maximum number of devices.',
    example: false,
  })
  isFullLogin!: boolean;

  @ApiProperty({
    description: 'Access and refresh tokens along with expiration time.',
    example: {
      accessToken: 'access-token-here',
      refreshToken: 'refresh-token-here',
      sessionId: 'refresh-token-here',
      exp: 1637105062000,
    },
  })
  token!: ISessionToken;

  @ApiProperty({
    description: 'User profile data.',
  })
  profile:
    | (Pick<UserProfile, 'firstName' | 'lastName' | 'email' | 'birthDate'> &
        Pick<User, 'isActive' | 'mobile' | 'isMobileVerified'> & {
          avatarUrl: string | null;
        })
    | null;

  @ApiProperty({
    description: 'Permissions data.',
  })
  permissions: string[];
}
