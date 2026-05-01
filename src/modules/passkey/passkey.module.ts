import { Module } from '@nestjs/common';
import { PasskeyService } from './passkey.service';
import { PasskeyController } from './passkey.controller';
import { SessionModule } from '../session/session.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SessionModule, AuthModule],
  controllers: [PasskeyController],
  providers: [PasskeyService],
  exports: [PasskeyService],
})
export class PasskeyModule {}
