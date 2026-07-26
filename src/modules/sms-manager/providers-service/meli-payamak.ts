import { Injectable } from '@nestjs/common';
import { registerEnv } from '../../../config/env.config';
import { ProviderService, EnumProviderServiceStatus, ProviderServicePattern, MergeTupleToObject } from '../types/sms-services.types';

interface MeliPayamakResponse {
  status?: string;
  code?: string | number;
  recId?: string | number;
  [key: string]: unknown;
}

function isMeliPayamakResponse(value: unknown): value is MeliPayamakResponse {
  return typeof value === 'object' && value !== null;
}

@Injectable()
export class ProviderServiceMeliPayamak implements ProviderService {
  async sendSms(mobile: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${registerEnv.MELI_PAYAMAK_CONSOLE_API_URL}/send/simple/${registerEnv.MELI_PAYAMAK_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': registerEnv.MELI_PAYAMAK_CONSOLE_API_URL,
        },
        body: JSON.stringify({
          from: registerEnv.MELI_PAYAMAK_NUMBER_FROM,
          to: mobile,
          text: message,
        }),
      });

      const rawData: unknown = await response.json();
      const data = isMeliPayamakResponse(rawData) ? rawData : {};

      if (data.status === 'ارسال موفق بود') {
        return true;
      }

      console.error('Failed to send SMS:', data);
      return false;
    } catch (error: unknown) {
      console.error('Error sending SMS via MeliPayamak:', error);
      return false;
    }
  }

  checkStatus(messageId: string): Promise<EnumProviderServiceStatus> {
    void messageId;

    return Promise.resolve(EnumProviderServiceStatus.UNKNOWN);
  }

  async sendSmsWithPattern<TParams extends Array<object>>(mobile: string, patternId: number | string, parameters: TParams): Promise<ProviderServicePattern<TParams>> {
    try {
      const res = await fetch(registerEnv.MELI_PAYAMAK_CONSOLE_API_URL + '/send/otp/' + registerEnv.MELI_PAYAMAK_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: mobile,
        }),
      });

      const rawData: unknown = await res.json();
      const data = isMeliPayamakResponse(rawData) ? rawData : {};

      const mergedData = Object.assign({}, ...parameters) as MergeTupleToObject<TParams>;

      if (data.status === 'ارسال موفق بود') {
        return {
          status: true,
          data: {
            ...mergedData,
            otp: data.code,
          },
          messageId: data.recId ? String(data.recId) : undefined,
          provider: registerEnv.SMS_PROVIDER,
        };
      }

      return {
        status: false,
        data: mergedData,
        messageId: undefined,
        errors: data,
        provider: registerEnv.SMS_PROVIDER,
      };
    } catch (error: unknown) {
      const mergedData = Object.assign({}, ...parameters) as MergeTupleToObject<TParams>;

      return {
        status: false,
        data: mergedData,
        messageId: undefined,
        errors: error,
        provider: registerEnv.SMS_PROVIDER,
      };
    }
  }
}
