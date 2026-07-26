export enum EnumRedisKey {
  OTP = 'otp:{1}',
  OTP_TIMESTAMP = 'otp_timestamp:{1}',
  CAPTCHA = 'captcha_id:{1}',
  CRAWLER_HISTORY = 'CRAWLER_HISTORY-network:{1}',
  STORAGE_BUCKET_EXIST = 'storage:bucket:exists:{1}',
  PASSKEY_REGISTER = 'passkey_register:{1}',
  PASSKEY_LOGIN = 'passkey_login:{1}',
  USER_LOCATION = 'user_location:{1}',
}
