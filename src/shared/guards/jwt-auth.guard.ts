import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { DECORATOR_PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { MESSAGES } from '../errors';

type PermissionShape = string | { key: string };

type JwtUser = {
  id?: string | number;
  permissions?: PermissionShape[];
};

type RequestWithUser = {
  user?: JwtUser;
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ok = Boolean(await super.canActivate(context));

    if (!ok) return false;

    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const user = req.user;

    if (!user?.id) {
      throw new UnauthorizedException(MESSAGES.USER_INVALID);
    }

    this.enforcePermissions(context);

    return true;
  }

  handleRequest<TUser = JwtUser>(err: unknown, user: TUser | undefined, info?: unknown, ...args: unknown[]): TUser {
    void args;

    if (err instanceof Error) {
      throw err;
    }

    if (!user) {
      const reason = this.infoToFa(info);

      throw new UnauthorizedException(reason ?? MESSAGES.AUTH_UNAUTHORIZED);
    }

    return user;
  }

  private enforcePermissions(context: ExecutionContext): void {
    const required = this.reflector.getAllAndOverride<string[]>(DECORATOR_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!required || required.length === 0) {
      return;
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const user = req.user;

    if (!user) {
      throw new UnauthorizedException(MESSAGES.USER_UNAUTHORIZED);
    }

    const userPerms = Array.isArray(user.permissions) ? user.permissions.map(permission => (typeof permission === 'string' ? permission : permission.key)) : [];

    const missing = required.filter(permission => !userPerms.includes(permission));

    if (missing.length > 0) {
      throw new ForbiddenException(MESSAGES.USER_PERMISSION_DENIED);
    }
  }

  private infoToFa(info: unknown): string {
    const toText = (value: unknown): string => {
      if (!value) {
        return '';
      }

      if (typeof value === 'string') {
        return value;
      }

      if (value instanceof Error) {
        return `${value.name}: ${value.message}`;
      }

      if (Array.isArray(value)) {
        return value.map(toText).join(' | ');
      }

      if (typeof value === 'object') {
        const object = value as Record<string, unknown>;

        return [object.message, object.name, object.code, object.error, object.reason].filter((item): item is string => typeof item === 'string').join(' ');
      }

      return typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
    };

    const text = toText(info);

    if (!text) {
      return MESSAGES.AUTH_UNAUTHORIZED;
    }

    const s = text.toLowerCase();

    if (s.includes('no auth token') || s.includes('no authorization token') || s.includes('missing auth') || s.includes('credentials required') || s.includes('jwt must be provided') || s.includes('token must be provided') || s.includes('no bearer') || s.includes('bearer token not found')) {
      return MESSAGES.AUTH_TOKEN_NOT_FOUND;
    }

    if (s.includes('jwt expired') || s.includes('tokenexpirederror')) {
      return MESSAGES.AUTH_TOKEN_EXPIRED;
    }

    if (s.includes('not before') || s.includes('notbeforeerror') || s.includes('nbf')) {
      return MESSAGES.AUTH_TOKEN_NOT_ACTIVE;
    }

    if (s.includes('invalid signature') || s.includes('signature verification failed')) {
      return MESSAGES.AUTH_TOKEN_SIGNATURE_INVALID;
    }

    if (s.includes('jwt malformed') || s.includes('malformed') || s.includes('bad jwt')) {
      return MESSAGES.AUTH_TOKEN_STRUCTURE_INVALID;
    }

    if (s.includes('jwt signature is required')) {
      return MESSAGES.AUTH_TOKEN_SIGNATURE_REQUIRED;
    }

    if (s.includes('invalid token') || s.includes('invalid jwt')) {
      return MESSAGES.AUTH_TOKEN_INVALID;
    }

    if (s.includes('unexpected jwt alg') || s.includes('unsupported algorithm')) {
      return MESSAGES.AUTH_TOKEN_ALGORITHM_UNSUPPORTED;
    }

    if (s.includes('kid') && (s.includes('missing') || s.includes('invalid') || s.includes('not found'))) {
      return MESSAGES.AUTH_TOKEN_KID_INVALID;
    }

    if (s.includes('invalid issuer') || s.includes('jwt issuer invalid') || s.includes('issuer')) {
      return MESSAGES.AUTH_TOKEN_ISSUER_INVALID;
    }

    if (s.includes('invalid audience') || s.includes('audience')) {
      return MESSAGES.AUTH_TOKEN_AUDIENCE_INVALID;
    }

    if (s.includes('subject must be a string') || s.includes('invalid subject') || s.includes('subject')) {
      return MESSAGES.AUTH_TOKEN_SUBJECT_INVALID;
    }

    if (s.includes('unauthorized') || s.includes('forbidden')) {
      return MESSAGES.AUTH_UNAUTHORIZED;
    }

    return MESSAGES.AUTH_TOKEN_VALIDATION_FAILED;
  }
}
