import { Injectable } from "@nestjs/common";
import fetch from "node-fetch";
import { registerEnv } from '../../../config/env.config';
import { ProviderService, EnumProviderServiceStatus, ProviderServicePattern, MergeTupleToObject } from "../types/sms-services.types";

@Injectable()
export class ProviderServiceMeliPayamak implements ProviderService {
  async sendSms(mobile: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${registerEnv.MELI_PAYAMAK_CONSOLE_API_URL}/send/simple/${registerEnv.MELI_PAYAMAK_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": registerEnv.MELI_PAYAMAK_CONSOLE_API_URL
        },
        body: JSON.stringify({
          from: registerEnv.MELI_PAYAMAK_NUMBER_FROM,
          to: mobile,
          text: message
        })
      });

      const data: any = await response.json();

      if (data?.status === "ارسال موفق بود") {
        return true;
      } else {
        console.error("Failed to send SMS:", data);
        return false;
      }
    } catch (error) {
      console.error("Error sending SMS via MeliPayamak:", error);
      return false;
    }
  }

  async checkStatus(messageId: string): Promise<EnumProviderServiceStatus> {
    throw new Error("No Implimentetion Mehod");
  }

  async sendSmsWithPattern<TParams extends Array<object>>(mobile: string, patternId: number | string, parameters: TParams): Promise<ProviderServicePattern<TParams>> {
    try {
      // const res = await fetch(registerEnv.MELI_PAYAMAK_CONSOLE_API_URL + "/send/shared/" + registerEnv.MELI_PAYAMAK_API_KEY, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     bodyId: patternId,
      //     to: mobile,
      //     args: parameters.flatMap((obj) => Object.values(obj))
      //   })
      // });
      const res = await fetch(registerEnv.MELI_PAYAMAK_CONSOLE_API_URL + "/send/otp/" + registerEnv.MELI_PAYAMAK_API_KEY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // bodyId: patternId,
          to: mobile
          // args: parameters.flatMap((obj) => Object.values(obj))
        })
      });

      const data: any = await res.json();

      const mergedData = Object.assign({}, ...parameters) as MergeTupleToObject<TParams>;

      if (data?.status === "ارسال موفق بود") {
        return {
          status: true,
          data: { ...mergedData, otp: data?.code },
          messageId: data.recId ? String(data.recId) : undefined,
          provider: registerEnv.SMS_PROVIDER
        };
      } else {
        return {
          status: false,
          data: mergedData,
          messageId: undefined,
          errors: data,
          provider: registerEnv.SMS_PROVIDER
        };
      }
    } catch (error: any) {
      const mergedData = Object.assign({}, ...parameters) as MergeTupleToObject<TParams>;
      return {
        status: false,
        data: mergedData,
        messageId: undefined,
        errors: error,
        provider: registerEnv.SMS_PROVIDER
      };
    }
  }
}
