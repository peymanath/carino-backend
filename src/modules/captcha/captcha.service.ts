import { StandardResponseDto } from "@/shared/dto";
import { Injectable } from "@nestjs/common";
import { GenerateCaptchaDto, ReGenerateCaptchaDto, VerifyCaptchaDto } from "./dto/get-captcha.dto";
import * as svgCaptcha from "svg-captcha";
import { optimize, Output } from "svgo";
import { randomUUID } from "crypto";
import { RedisService } from "../cache/redis.service";
import { EnumRedisDatabase } from "@/shared/enums/EnumRedisDatabase";
import { buildRedisKey } from "@/shared/utils";
import { EnumRedisKey } from "@/shared/enums/EnumRedisKey";

@Injectable()
export class CaptchaService {
  private readonly expTime = 15 * 60;
  constructor(private readonly redis: RedisService) {}

  async generateCaptcha(): Promise<StandardResponseDto<GenerateCaptchaDto>> {
    const cap = this.captchaGenerator();
    const minSvg = this.minifySvg(cap.data).replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
    const dataUri = "data:image/svg+xml;utf8," + encodeURIComponent(minSvg);
    const id = randomUUID();

    /**
     * Save to Redis
     */
    await this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.CAPTCHA);
    await this.redis.set(buildRedisKey(EnumRedisKey.CAPTCHA, [id]), cap.text, this.expTime);

    /**
     * Return Data
     */
    return new StandardResponseDto({
      data: {
        captcha: dataUri,
        id: id,
        time: this.expTime
      }
    });
  }
  async verifyCaptcha(dto: VerifyCaptchaDto): Promise<StandardResponseDto<boolean>> {
    /**
     * Get Data in Redis
     */
    await this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.CAPTCHA);
    const verifyCode = await this.redis.get(buildRedisKey(EnumRedisKey.CAPTCHA, [dto.id]));

    // Check Data
    if (!!verifyCode && dto.verify === verifyCode) {
      await this.redis.delete(buildRedisKey(EnumRedisKey.CAPTCHA, [dto.id]));
      return new StandardResponseDto({
        data: true
      });
    }

    return new StandardResponseDto({
      data: false
    });
  }
  async regenerateCaptcha(dto: ReGenerateCaptchaDto): Promise<StandardResponseDto<GenerateCaptchaDto>> {
    const cap = this.captchaGenerator();
    const minSvg = this.minifySvg(cap.data).replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
    const dataUri = "data:image/svg+xml;utf8," + encodeURIComponent(minSvg);
    const id = dto.id;

    /**
     * Save to Redis
     */
    await this.redis.switchDatabaseIfNeeded(EnumRedisDatabase.CAPTCHA);
    await this.redis.set(buildRedisKey(EnumRedisKey.CAPTCHA, [id]), cap.text, this.expTime);
    return new StandardResponseDto({
      data: {
        captcha: dataUri,
        id: id,
        time: this.expTime
      }
    });
  }

  // ==============================================
  private captchaGenerator() {
    return svgCaptcha.create({
      noise: 2,
      size: 6,
      color: true
    });
  }

  private minifySvg(rawSvg: string): string {
    const result: Output = optimize(rawSvg, {
      multipass: true,
      plugins: [
        "removeDoctype",
        "removeXMLProcInst",
        "removeComments",
        "removeMetadata",
        "removeTitle",
        "removeDesc",
        "removeUselessDefs",
        "removeEditorsNSData",
        "cleanupAttrs",
        "minifyStyles",
        "convertStyleToAttrs",
        "removeUnknownsAndDefaults",
        "removeNonInheritableGroupAttrs",
        "removeUselessStrokeAndFill",
        "collapseGroups",
        "convertShapeToPath",
        "convertPathData",
        "convertTransform",
        "removeDimensions"
      ]
    });

    return typeof result === "string" ? result : result.data;
  }
}
