import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './controllers/auth/auth.module';
import { UsersModule } from './controllers/users/users.module';
import { RedisModule } from './modules/cache/redis.module';
import { PrismaModule } from './modules/database/prisma.module';
import { PermissionsModule } from './controllers/permissions/permissions.module';
import { envConfig, redisConfig } from './config/env.config';
import { ProfileModule } from './controllers/profile/profile.module';
import { AddressModule } from './controllers/address/address.module';
import { DdlModule } from './controllers/ddl/ddl.module';
import { UserLocationModule } from './controllers/user-location/user-location.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig, redisConfig],
    }),
    PrismaModule,
    RedisModule,

    AuthModule,
    ProfileModule,
    UsersModule,
    PermissionsModule,
    AddressModule,
    DdlModule,
    UserLocationModule
    // SmsManagerModule,
    // StorageModule,
    // PasskeyModule,
    // CaptchaModule,
  ],
})
export class AppModule {}
