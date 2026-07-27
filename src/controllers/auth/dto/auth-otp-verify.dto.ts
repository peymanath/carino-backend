import { ISessionToken } from '../../../types';
import { User, UserProfile } from '@prisma/client';
import { IsNotEmpty, IsString, Matches, IsInt } from 'class-validator';

export class OTPVerifyDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?:\+98|0098|98|0)?9(0[1-5]|1[0-9]|2[0-2]|3[0-9]|9[0-9])\d{7}$/, {
    message: 'شماره موبایل معتبر نیست. فقط اپراتورهای ایرانسل، همراه اول، رایتل و شاتل پشتیبانی می‌شوند.',
  })
  mobile: string;

  @IsNotEmpty()
  @IsInt()
  code: number;
}

export class OTPVerificationResultDto {

  isNewUser!: boolean;
  token!: ISessionToken;
  profile:
    | (Pick<UserProfile, 'firstName' | 'lastName' | 'email' | 'birthDate'> &
        Pick<User, 'isActive' | 'mobile' | 'isMobileVerified'> & {
          avatarUrl: string | null;
        })
    | null;
  permissions: string[];
}
