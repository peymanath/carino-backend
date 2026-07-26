import { PickType } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CaptchaDto {
  @IsString()
  id: string;

  @IsString()
  captcha: string;
}
export class GenerateCaptchaDto extends CaptchaDto {}
export class VerifyCaptchaDto extends PickType(CaptchaDto, ["id"]) {
  @IsString()
  verify: string;
}
export class ReGenerateCaptchaDto extends PickType(CaptchaDto, ["id"]) {}
