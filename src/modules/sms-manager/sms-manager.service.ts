import { Injectable } from "@nestjs/common";
import { EnumProviderServiceStatus, ProviderService, ProviderServicePattern } from "./types/sms-services.types";
import { registerEnv } from '../../config/env.config';
import { ProviderServiceMeliPayamak } from "./providers-service/meli-payamak";

@Injectable()
export class SmsManagerService implements ProviderService {
  constructor(private readonly meliPayamak: ProviderServiceMeliPayamak) {}

  public async sendSms(mobile: string, message: string): Promise<boolean> {
    if (registerEnv.SMS_PROVIDER === "MELI") {
      return await this.meliPayamak.sendSms(mobile, message);
    }
    throw new Error("No valid provider");
  }

  public async sendSmsWithPattern<TParams extends Array<{}>>(mobile: string, patternId: number | string, parameters: TParams): Promise<ProviderServicePattern<TParams>> {
    if (registerEnv.SMS_PROVIDER === "MELI") {
      return await this.meliPayamak.sendSmsWithPattern<TParams>(mobile, patternId, parameters);
    }
    throw new Error("No valid provider");
  }

  public async checkStatus(messageId: string): Promise<EnumProviderServiceStatus> {
    if (registerEnv.SMS_PROVIDER === "MELI") {
      return await this.meliPayamak.checkStatus(messageId);
    }
    throw new Error("No valid provider");
  }
}
