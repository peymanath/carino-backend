import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RedisModule } from './modules/cache/redis.module';
import { PrismaModule } from './modules/database/prisma.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { envConfig, redisConfig } from './config/env.config';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig, redisConfig],
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    ProfileModule,
    PermissionsModule,
    // SmsManagerModule,
    // StorageModule,
    // PasskeyModule,
    // CaptchaModule,
  ],
})
export class AppModule {}
