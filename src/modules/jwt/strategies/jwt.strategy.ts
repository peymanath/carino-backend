import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';
import type { JwtStandardClaims } from '../../../shared/interfaces/jwt-standard-claims.interface';
import { fromB64 } from '../../../shared/utils';
import { UserWithPermissions } from '../../../shared/interfaces/user-with-permisstions.interface';
import { ConfigService } from '@nestjs/config';
import { MESSAGES } from '../../../shared/errors';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
    const pubB64 = config.get<string>('env.JWT_PUBLIC_B64') ?? config.get<string>('JWT_PUBLIC_B64');

    const publicKey = fromB64(pubB64);

    if (!publicKey || !publicKey.includes('BEGIN PUBLIC KEY')) {
      // Fail fast: باعث همون خطای «requires a secret or key» نشه
      throw new Error('JWT_PUBLIC_B64 is missing or invalid (cannot decode PEM).');
    }

    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    };

    super(opts);
  }
  public async validate(payload: JwtStandardClaims): Promise<UserWithPermissions | null> {
    const rawSub = payload?.sub;
    const userId = typeof rawSub === 'number' ? rawSub : typeof rawSub === 'string' && rawSub.trim() !== '' ? Number.parseInt(rawSub, 10) : NaN;

    if (!Number.isFinite(userId)) {
      throw new UnauthorizedException(MESSAGES.AUTH_TOKEN_INVALID);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { permissions: { select: { key: true } } },
    });

    if (!user) {
      throw new UnauthorizedException(MESSAGES.AUTH_USER_NOT_FOUND);
    }

    if (user.isDeleted) {
      throw new ForbiddenException(MESSAGES.AUTH_USER_BLOCKED);
    }

    if (!user.isActive) {
      throw new ForbiddenException(MESSAGES.AUTH_USER_INACTIVE);
    }

    return user;
  }
}
