export enum EnumProviderServiceStatus {
  SENDED = "SENDED",
  FAILED = "FAILED",
  QUEUED = "QUEUED",
  UNKNOWN = "UNKNOWN"
}

export interface ProviderServicePattern<TParams extends Array<object>> {
  status: boolean;
  data: MergeTupleToObject<TParams>; // خروجی، آبجکت مرج‌شده
  errors?: any;
  messageId?: string;
  provider?: string;
}

// Converts tuple of objects to a single merged object
export type MergeTupleToObject<T extends Array<object>, R = {}> =
  T extends [infer First, ...infer Rest]
    ? MergeTupleToObject<Rest extends Array<object> ? Rest : [], R & First>
    : R;

export interface ProviderService {
  sendSms(mobile: string, message: string): Promise<boolean>;

  sendSmsWithPattern<TParams extends Array<object>>(mobile: string, patternId: number | string, parameters: TParams): Promise<ProviderServicePattern<TParams>>;

  checkStatus(messageId: string): Promise<EnumProviderServiceStatus>;
}

/**
 * Providers
 */
export type MeliPayamakPatternParams = readonly (string | number)[];
