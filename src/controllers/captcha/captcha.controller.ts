import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import { CaptchaService } from "./captcha.service";
import { ReGenerateCaptchaDto, VerifyCaptchaDto } from "./dto/get-captcha.dto";

@Controller("captcha")
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}
  @Get()
  async generateCaptcha() {
    return this.captchaService.generateCaptcha();
  }
  @Post()
  async verifyCaptcha(@Body() dto: VerifyCaptchaDto) {
    return this.captchaService.verifyCaptcha(dto);
  }
  @Put()
  async regenerateCaptcha(@Body() dto: ReGenerateCaptchaDto) {
    return this.captchaService.regenerateCaptcha(dto);
  }
}
