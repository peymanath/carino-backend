import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@/modules/jwt/strategies/jwt.strategy';
import { JwtTokenService } from './jwt-token.servise';
import { fromB64 } from '@/shared/utils';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const privB64 = config.get<string>('env.JWT_PRIVATE_B64') ?? config.get<string>('JWT_PRIVATE_B64');
        const pubB64 = config.get<string>('env.JWT_PUBLIC_B64') ?? config.get<string>('JWT_PUBLIC_B64');
        const exp = config.get<string>('env.JWT_EXPIRES_IN') ?? config.get<string>('JWT_EXPIRES_IN') ?? 2 * 60 * 60 * 1000;

        const privateKey = fromB64(privB64);
        const publicKey = fromB64(pubB64);

        if (!privateKey || !publicKey) {
          throw new Error('JWT_PRIVATE_B64 / JWT_PUBLIC_B64 are missing or empty.');
        }

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: 'RS256',
            expiresIn: Number(exp),
          },
          verifyOptions: {
            algorithms: ['RS256'],
          },
        };
      },
    }),
  ],
  providers: [JwtTokenService, JwtStrategy],
  exports: [JwtTokenService],
})
export class JwtTokenModule {}
