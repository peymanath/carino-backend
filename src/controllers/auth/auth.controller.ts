import { AuthService } from './auth.service';
import { OTPAuthDto as OtpAuthDto, OtpDataDto } from './dto/auth-otp.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OTPVerifyDto, OTPVerificationResultDto } from './dto/auth-otp-verify.dto';
import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { StandardResponseDto } from '../../shared/dto';
import { AuthCompleteProfileDto, AuthCompleteProfileResultDto } from './dto/auth-complete-profile.dto';
import { HasAuthentication } from '../../shared/decorators/auth-swagger.decorator';


@ApiTags("Site Authentication")
@Controller('authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async authOtp(@Body() dto: OtpAuthDto): Promise<StandardResponseDto<unknown>> {
    return this.authService.handleOTPRequest(dto.mobile);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async authOtpVerify(@Body() dto: OTPVerifyDto): Promise<StandardResponseDto<OTPVerificationResultDto>> {
    return this.authService.verifyOtp(dto.mobile, dto.code);
  }

  @Post('complete-profile')
  @HasAuthentication()
  @HttpCode(HttpStatus.CREATED)
  async authCompleteProfile(@Req() req: Request, @Body() dto: AuthCompleteProfileDto): Promise<StandardResponseDto<AuthCompleteProfileResultDto>> {
    return this.authService.completeProfile(req.user.id, dto);
  }
}
