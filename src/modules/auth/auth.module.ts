import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtTokenModule } from '../jwt/jwt-token.module';
import { SmsManagerModule } from '../sms-manager/sms-manager.module';
import { PermissionsService } from '../permissions/permissions.service';

@Module({
  imports: [JwtTokenModule, UsersModule, SmsManagerModule],
  controllers: [AuthController],
  providers: [AuthService, PermissionsService],
  exports: [AuthService],
})
export class AuthModule {}
