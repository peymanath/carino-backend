import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RedisModule } from './modules/cache/redis.module';
import { PrismaModule } from './modules/database/prisma.module';
import { SmsManagerModule } from './modules/sms-manager/sms-manager.module';
import { SessionModule } from './modules/session/session.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { envConfig, redisConfig } from './config/env.config';
import { StorageModule } from './modules/storage/storage.module';
import { ProfileModule } from './modules/profile/profile.module';
// import { BomberModule } from './modules/bomber/bomber.module';
// import { CaptchaModule } from './modules/captcha/captcha.module';
// import { CrawlModule } from './modules/crawl/crawl.module';
// import { BruteForceTestModule } from './modules/brute-force-test/brute-force-test.module';
import { PasskeyModule } from './modules/passkey/passkey.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig, redisConfig],
    }),
    PrismaModule,
    RedisModule,
    // SmsManagerModule,
    AuthModule,
    SessionModule,
    UsersModule,
    ProfileModule,
    PermissionsModule,
    // StorageModule,
    // PasskeyModule,
    // BomberModule,
    // CaptchaModule,
    // CrawlModule,
    // BruteForceTestModule,
  ],
})
export class AppModule {}
