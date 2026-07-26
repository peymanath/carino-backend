import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class OTPAuthDto {
  @IsNotEmpty({ message: 'شماره موبایل الزامی است.' })
  @IsString({ message: 'شماره موبایل باید به صورت رشته وارد شود.' })
  @Matches(/^(?:\+98|0098|98|0)?9(0[1-5]|1[0-9]|2[0-2]|3[0-9]|9[0-9])\d{7}$/, {
    message: 'شماره موبایل معتبر نیست. فقط اپراتورهای ایرانسل، همراه اول، رایتل و شاتل پشتیبانی می‌شوند.',
  })
  mobile!: string;
}

export class OtpDataDto {
  code!: number;
}
