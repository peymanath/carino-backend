import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { DECORATOR_PERMISSIONS_KEY } from '../decorators/permissions.decorator';

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
      throw new UnauthorizedException('کاربر معتبر نیست.');
    }

    this.enforcePermissions(context);

    return true;
  }

  handleRequest<TUser = JwtUser>(
    err: unknown,
    user: TUser | undefined,
    info?: unknown,
    ...args: unknown[]
  ): TUser {
    void args;

    if (err instanceof Error) {
      throw err;
    }

    if (!user) {
      const reason = this.infoToFa(info);

      throw new UnauthorizedException(reason ?? 'دسترسی غیرمجاز. لطفاً دوباره وارد شوید.');
    }

    return user;
  }

  private enforcePermissions(context: ExecutionContext): void {
    const required = this.reflector.getAllAndOverride<string[]>(DECORATOR_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return;
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('دسترسی غیرمجاز. لطفاً دوباره وارد شوید.');
    }

    const userPerms = Array.isArray(user.permissions)
      ? user.permissions.map((permission) =>
          typeof permission === 'string' ? permission : permission.key
        )
      : [];

    const missing = required.filter((permission) => !userPerms.includes(permission));

    if (missing.length > 0) {
      throw new ForbiddenException('شما دسترسی لازم برای انجام این عملیات را ندارید.');
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

        return [
          object.message,
          object.name,
          object.code,
          object.error,
          object.reason,
        ]
          .filter((item): item is string => typeof item === 'string')
          .join(' ');
      }

      return typeof value === 'number' || typeof value === 'boolean'
        ? String(value)
        : '';
    };

    const text = toText(info);

    if (!text) {
      return 'دسترسی غیرمجاز. لطفاً دوباره وارد شوید.';
    }

    const s = text.toLowerCase();

    if (s.includes('no auth token') || s.includes('no authorization token') || s.includes('missing auth') || s.includes('credentials required') || s.includes('jwt must be provided') || s.includes('token must be provided') || s.includes('no bearer') || s.includes('bearer token not found')) {
      return 'توکن احراز هویت یافت نشد.';
    }

    if (s.includes('jwt expired') || s.includes('tokenexpirederror')) {
      return 'توکن منقضی شده است.';
    }

    if (s.includes('not before') || s.includes('notbeforeerror') || s.includes('nbf')) {
      return 'توکن هنوز قابل استفاده نیست.';
    }

    if (s.includes('invalid signature') || s.includes('signature verification failed')) {
      return 'امضای توکن نامعتبر است.';
    }

    if (s.includes('jwt malformed') || s.includes('malformed') || s.includes('bad jwt')) {
      return 'ساختار توکن معتبر نیست.';
    }

    if (s.includes('jwt signature is required')) {
      return 'امضای توکن الزامی است.';
    }

    if (s.includes('invalid token') || s.includes('invalid jwt')) {
      return 'توکن نامعتبر است.';
    }

    if (s.includes('unexpected jwt alg') || s.includes('unsupported algorithm')) {
      return 'الگوریتم امضای توکن پشتیبانی نمی‌شود.';
    }

    if (s.includes('kid') && (s.includes('missing') || s.includes('invalid') || s.includes('not found'))) {
      return 'کلید امضا (kid) معتبر/یافت نشد.';
    }

    if (s.includes('invalid issuer') || s.includes('jwt issuer invalid') || s.includes('issuer')) {
      return 'مقدار issuer توکن معتبر نیست.';
    }

    if (s.includes('invalid audience') || s.includes('audience')) {
      return 'مقدار audience توکن معتبر نیست.';
    }

    if (s.includes('subject must be a string') || s.includes('invalid subject') || s.includes('subject')) {
      return 'مقدار subject توکن معتبر نیست.';
    }

    if (s.includes('unauthorized') || s.includes('forbidden')) {
      return 'دسترسی غیرمجاز. لطفاً دوباره وارد شوید.';
    }

    return 'اعتبارسنجی توکن ناموفق بود.';
  }
}