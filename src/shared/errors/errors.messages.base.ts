export const MESSAGES_BASE = {
  // Auth
  AUTH_INVALID_MOBILE: 'شماره موبایل نامعتبر است.',
  AUTH_REQUIRED_MOBILE: 'شماره موبایل الزامی است.',
  AUTH_SUCCESS_SEND_OTP: `کد تائید به شماره «{mobile}» ارسال شد.`,
  AUTH_SEND_OTP_WAITING: `لطفاً «{waitMsg}» دیگر تلاش کنید.`,
  AUTH_RECIVED_OTP_WRONG: 'کد تایید اشتباه است.',
  AUTH_OTP_CODE_INVALIDATE: 'کد OTP منقضی شده است.',
  AUTH_LOGIN_SUCCESS: 'ورود با موفقیت انجام شد',
  AUTH_REGISTER_SUCCESS: 'ورود با موفقیت انجام شد',
  AUTH_TIMER_SEC_MIN: `{min} دقیقه {sec} ثانیه`,
  AUTH_TIMER_MIN: `{min} دقیقه`,
  AUTH_TIMER_SEC: `{sec} ثانیه`,
  AUTH_COMPLETE_PROFILE: `پروفایل شما با موفقیت ثبت شد.`,

  // Global
  RECEIVED_DATA: 'دیتا با موفقیت دریافت شد.',
  UPDATED_DATA: 'دیتا با موفقیت به‌روزرسانی شد.',

  // User
  USER_ID_NOT_FOUND: 'کاربر با شناسه «{userId}» پیدا نشد.',
  USER_REQUIRED_ID: 'شناسه کاربر الزامی است.',

  // Profile
  PROFILE_NOT_FOUND: 'پروفایل کاربر یافت نشد.',
  PROFILE_UPDATED: 'پروفایل با موفقیت به‌روزرسانی شد.',

  // Permission
  PERMISSION_KEY_EXISTS: 'کلید پرمیشن «{1}» از قبل وجود دارد.',
  PERMISSION_NOT_FOUND: 'پرمیشن با شناسه «{id}» پیدا نشد.',
  PERMISSION_CREATED_BY_NAME: 'پرمیشن «{name}» ایجاد شد',
  PERMISSION_IDS_NOT_FOUND: 'برخی شناسه‌های پرمیشن وجود ندارند: {ids}',

  //Permission Category
  PERMISSION_CATEGORY_NAME_EXISTS: 'نام دسته «{1}» از قبل وجود دارد.',
  PERMISSION_CATEGORY_NAME_CREATED: 'دسته‌بندی ایجاد شد',
  PERMISSION_CATEGORY_NOT_FOUND: 'دسته با شناسه «{1}» پیدا نشد.',
  PERMISSION_CATEGORY_HAS_PERMISSIONS: 'حذف ممکن نیست: دستهٔ «{name}» دارای {count} پرمیشنِ وابسته است.',
  PERMISSION_CATEGORY_ID_NOT_FOUND: 'شناسهٔ دسته «{1}» پیدا نشد.',

  // Media
  MEDIA_AVATAR_NOT_FOUND: 'آواتار انتخاب‌شده وجود ندارد.',

  // SMS
  SMS_MANAGER: 'خطایی در Sms Provider رخ داد.',

  // Prisma
  PRISMA_CODE_P2000: "طول داده واردشده برای ستون '{target}' بیش از حد مجاز است.",
  PRISMA_CODE_P2001: 'رکورد مورد نیاز برای رابطه یافت نشد.',
  PRISMA_CODE_P2002: "مقدار وارد شده در فیلد '{target}' تکراری است.",
  PRISMA_CODE_P2003: "کلید خارجی نامعتبر است. مقدار '{field_name}' در جداول دیگر تعریف نشده.",
  PRISMA_CODE_P2004: 'قید دیتابیس نقض شده است. لطفاً داده‌ها را بررسی کنید.',
  PRISMA_CODE_P2005: "مقدار '{field_name}' نامعتبر است.",
  PRISMA_CODE_P2006: "نوع داده برای فیلد '{field_name}' نادرست است.",
  PRISMA_CODE_P2007: 'خطای اعتبارسنجی از سمت دیتابیس.',
  PRISMA_CODE_P2008: 'در تجزیه‌ی کوئری خطایی رخ داد.',
  PRISMA_CODE_P2009: 'کوئری نامعتبر است یا با اسکیما سازگار نیست.',
  PRISMA_CODE_P2010: 'کوئری مستقیم به دلیل خطای نحوی یا منطقی شکست خورد.',
  PRISMA_CODE_P2011: "فیلد '{target}' نمی‌تواند مقدار null داشته باشد.",
  PRISMA_CODE_P2012: "مقدار لازم برای فیلد '{path}' وارد نشده است.",
  PRISMA_CODE_P2013: 'پارامتر الزامی در کوئری مشخص نشده است.',
  PRISMA_CODE_P2014: 'ساختار رابطه داده‌ای نادرست است.',
  PRISMA_CODE_P2015: 'رکورد مورد نظر در دیتابیس یافت نشد.',
  PRISMA_CODE_P2025: 'رکوردی یافت نشد که عملیات روی آن انجام شود.',
  PRISMA_CODE_P2022: 'مقدار وارد شده برای ستون {column} با محدودیت یکتایی تداخل دارد.',
  PRISMA_DEFAULT: 'خطای ناشناخته‌ای از Prisma دریافت شد.',

  // Location
  LOCATION_REQUIRED_LATITUDE: 'عرض جغرافیایی الزامی است.',
  LOCATION_REQUIRED_LONGITUDE: 'طول جغرافیایی الزامی است.',
  LOCATION_INVALID_LATITUDE: 'عرض جغرافیایی نامعتبر است.',
  LOCATION_INVALID_LONGITUDE: 'طول جغرافیایی نامعتبر است.',
  LOCATION_LATITUDE_OUT_OF_RANGE: 'عرض جغرافیایی باید بین ۹۰- تا ۹۰ باشد.',
  LOCATION_LONGITUDE_OUT_OF_RANGE: 'طول جغرافیایی باید بین ۱۸۰- تا ۱۸۰ باشد.',
  LOCATION_INVALID_COORDINATES: 'مختصات وارد شده معتبر نیست.',
  LOCATION_INVALID_LATITUDE_PRECISION: 'دقت عرض جغرافیایی بیش از حد مجاز است.',
  LOCATION_INVALID_LONGITUDE_PRECISION: 'دقت طول جغرافیایی بیش از حد مجاز است.',
  LOCATION_ADDRESS_COORDINATES_REQUIRED: 'برای آدرس پیش‌فرض مختصات جغرافیایی ثبت نشده است.',
  LOCATION_DEFAULT_ADDRESS_NOT_FOUND: 'آدرس پیش‌فرض کاربر ثبت نشده است.',
  LOCATION_REQUIRED_LOCATION_SOURCE: 'Address id یا مختصات موقعیت الزامی است',

  // GIS
  GIS_COORDINATE_REQUIRED_LATITUDE: 'عرض جغرافیایی الزامی است.',
  GIS_COORDINATE_REQUIRED_LONGITUDE: 'طول جغرافیایی الزامی است.',
  GIS_COORDINATE_INVALID_LATITUDE: 'عرض جغرافیایی معتبر نیست.',
  GIS_COORDINATE_INVALID_LONGITUDE: 'طول جغرافیایی معتبر نیست.',
  GIS_COORDINATE_LATITUDE_OUT_OF_RANGE: 'عرض جغرافیایی باید بین 90- و 90 باشد.',
  GIS_COORDINATE_LONGITUDE_OUT_OF_RANGE: 'طول جغرافیایی باید بین 180- و 180 باشد.',
  GIS_COORDINATE_INVALID: 'مختصات جغرافیایی معتبر نیست.',
  GIS_COORDINATE_INVALID_LATITUDE_PRECISION: 'دقت عرض جغرافیایی نمی‌تواند بیشتر از ۷ رقم اعشار باشد.',
  GIS_COORDINATE_INVALID_LONGITUDE_PRECISION: 'دقت طول جغرافیایی نمی‌تواند بیشتر از ۷ رقم اعشار باشد.',
} as const;
