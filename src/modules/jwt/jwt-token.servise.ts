import { JwtStandardClaims } from '../../shared/interfaces/jwt-standard-claims.interface';
import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwt: JwtService) {}

  public encode<TPayload extends JwtStandardClaims = JwtStandardClaims>(payload: Readonly<TPayload>, expiresIn?: number, overrides?: Omit<JwtSignOptions, 'expiresIn'>): string {
    return this.jwt.sign(payload, {
      ...(expiresIn ? { expiresIn } : null),
      ...overrides,
    });
  }

  public verify<TPayload extends JwtStandardClaims = JwtStandardClaims>(token: string, options?: JwtVerifyOptions): TPayload {
    return this.jwt.verify<TPayload>(token, options);
  }

  public decode<TPayload extends JwtStandardClaims = JwtStandardClaims>(token: string): TPayload | null {
    const decoded: unknown = this.jwt.decode(token);
    if (!decoded || typeof decoded !== 'object') {
      return null;
    }
    return decoded as TPayload;
  }
}
