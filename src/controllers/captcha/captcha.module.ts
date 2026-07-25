import { Module } from "@nestjs/common";
import { CaptchaService } from "./captcha.service";
import { CaptchaController } from "./captcha.controller";
import { RedisService } from "../../modules/cache/redis.service";

@Module({
  providers: [CaptchaService, RedisService],
  controllers: [CaptchaController]
})
export class CaptchaModule {}
