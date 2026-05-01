import { registerAs } from '@nestjs/config';
export const registerEnv = {
  REDIS_HOST: process.env.REDIS_HOST || '',
  REDIS_PORT: process.env.REDIS_PORT || '',
  REDIS_USERNAME: process.env.REDIS_USERNAME || '',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_PRIVATE_B64: process.env.JWT_PRIVATE_B64 || '',
  JWT_PUBLIC_B64: process.env.JWT_PUBLIC_B64 || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || 0,
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'MELI',
  MELI_PAYAMAK_API_KEY: process.env.MELI_PAYAMAK_API_KEY || '',
  MELI_PAYAMAK_API_URL: process.env.MELI_PAYAMAK_API_URL || '',
  MELI_PAYAMAK_CONSOLE_API_URL: process.env.MELI_PAYAMAK_CONSOLE_API_URL || '',
  MELI_PAYAMAK_NUMBER_FROM: process.env.MELI_PAYAMAK_NUMBER_FROM || '',
  AUTH_OTP_NUM: process.env.AUTH_OTP_NUM || 4,
  IS_DEVELOPMENT: (process.env.NODE_ENV || 'development') === 'development',
  ENABLE_LOGGER: (process.env.ENABLE_LOGGER || 'false') === 'true',
  PASSKEY_ORIGIN: process.env.PASSKEY_ORIGIN,
  RP_ID: process.env.RP_ID,
} as const;

export const envConfig = registerAs('env', () => ({
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_PRIVATE_B64: process.env.JWT_PRIVATE_B64 || '',
  JWT_PUBLIC_B64: process.env.JWT_PUBLIC_B64 || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || 0,
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'MELI',
  MELI_PAYAMAK_API_KEY: process.env.MELI_PAYAMAK_API_KEY || '',
  MELI_PAYAMAK_API_URL: process.env.MELI_PAYAMAK_API_URL || '',
  MELI_PAYAMAK_CONSOLE_API_URL: process.env.MELI_PAYAMAK_CONSOLE_API_URL || '',
  MELI_PAYAMAK_NUMBER_FROM: process.env.MELI_PAYAMAK_NUMBER_FROM || '',
  AUTH_OTP_NUM: process.env.AUTH_OTP_NUM || 4,
}));
export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || '',
  port: parseInt(process.env.REDIS_PORT as string, 10),
  username: process.env.REDIS_USERNAME || '',
  password: process.env.REDIS_PASSWORD || '',
}));
export const storageConfig = registerAs('s3', () => ({
  endpoint: process.env.STORAGE_ENDPOINT ?? '',
  port: Number(process.env.STORAGE_PORT),
  accessKey: process.env.STORAGE_ACCESS_KEY ?? '',
  secretKey: process.env.STORAGE_SECRET_KEY ?? '',
  useSSL: process.env.STORAGE_USE_SSL === 'true',
}));
