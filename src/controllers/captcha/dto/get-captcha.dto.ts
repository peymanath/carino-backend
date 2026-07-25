import { ApiPropertyOptional, PickType } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CaptchaDto {
  @ApiPropertyOptional()
  @IsString()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  captcha: string;
}
export class GenerateCaptchaDto extends CaptchaDto {}
export class VerifyCaptchaDto extends PickType(CaptchaDto, ["id"]) {
  @ApiPropertyOptional()
  @IsString()
  verify: string;
}
export class ReGenerateCaptchaDto extends PickType(CaptchaDto, ["id"]) {}
