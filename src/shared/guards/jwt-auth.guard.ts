import { ExecutionContext, ForbiddenException, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { DECORATOR_PERMISSIONS_KEY } from '../decorators/permissions.decorator'; // adjust import path if needed
import { SessionService } from '@/modules/session/session.service';

type PermissionShape = string | { key: string };

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionService: SessionService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ok = (await super.canActivate(context)) as boolean;

    if (!ok) return false;

    const req = context.switchToHttp().getRequest();

    const sessionId = req.headers['session'] as string | undefined;
    if (!sessionId) {
      throw new UnauthorizedException('SessionId ارسال نشده است.');
    }

    const user = req.user;
    if (!user?.id) {
      throw new UnauthorizedException('کاربر معتبر نیست.');
    }

    const hasSession = await this.sessionService.findUserSessionBySessionId(user.id, sessionId);

    if (!hasSession) {
      throw new UnauthorizedException('سشن معتبر نیست یا منقضی شده است.');
    }

    req.session = hasSession;

    // At this point, req.user should already be set by JwtStrategy.validate
    this.enforcePermissions(context);
    return true;
  }

  handleRequest(err: unknown, user: any, info?: unknown) {
    if (err) throw err;
    if (!user) {
      const reason = this.infoToFa(info);
      throw new UnauthorizedException(reason ?? 'دسترسی غیرمجاز. لطفاً دوباره وارد شوید.');
    }

    return user;
  }

  private enforcePermissions(context: ExecutionContext): void {
    const required = this.reflector.getAllAndOverride<string[]>(DECORATOR_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // No permission requirement → JWT is enough
    if (!required || required.length === 0) return;

    const req = context.switchToHttp().getRequest<{ user?: any }>();
    const user = req.user;

    if (!user) {
      // Should not happen: Passport should have set user already
      throw new UnauthorizedException('دسترسی غیرمجاز. لطفاً دوباره وارد شوید.');
    }

    // Support both formats: ['PERM'] or [{ key: 'PERM' }]
    const userPerms: string[] = Array.isArray(user.permissions) ? (user.permissions as PermissionShape[]).map(p => (typeof p === 'string' ? p : p?.key)).filter((v): v is string => !!v) : [];

    const missing = required.filter(r => !userPerms.includes(r));
    if (missing.length > 0) {
      throw new ForbiddenException('شما دسترسی لازم برای انجام این عملیات را ندارید.');
    }
  }

  private infoToFa(info: unknown): string {
    // Normalize to a searchable lowercase text
    const toText = (i: unknown): string => {
      if (!i) return '';
      if (typeof i === 'string') return i;
      if (i instanceof Error) return `${i.name || 'Error'}: ${i.message || ''}`;
      if (Array.isArray(i)) return i.map(toText).join(' | ');
      if (typeof i === 'object') {
        const anyi = i as any;
        return [anyi.message, anyi.name, anyi.code, anyi.error, anyi.reason].filter(Boolean).join(' ');
      }
      return String(i);
    };

    const text = toText(info);
    if (!text) return 'دسترسی غیرمجاز. لطفاً دوباره وارد شوید.';
    const s = text.toLowerCase();

    // Missing token / not provided
    if (s.includes('no auth token') || s.includes('no authorization token') || s.includes('missing auth') || s.includes('credentials required') || s.includes('jwt must be provided') || s.includes('token must be provided') || s.includes('no bearer') || s.includes('bearer token not found')) {
      return 'توکن احراز هویت یافت نشد.';
    }

    // Expired / Not before
    if (s.includes('jwt expired') || s.includes('tokenexpirederror')) {
      return 'توکن منقضی شده است.';
    }
    if (s.includes('not before') || s.includes('notbeforeerror') || s.includes('nbf')) {
      return 'توکن هنوز قابل استفاده نیست.';
    }

    // Signature / format
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

    // Algorithm / header issues
    if (s.includes('unexpected jwt alg') || s.includes('unsupported algorithm')) {
      return 'الگوریتم امضای توکن پشتیبانی نمی‌شود.';
    }
    if (s.includes('kid') && (s.includes('missing') || s.includes('invalid') || s.includes('not found'))) {
      return 'کلید امضا (kid) معتبر/یافت نشد.';
    }

    // Claims mismatches
    if (s.includes('invalid issuer') || s.includes('jwt issuer invalid') || s.includes('issuer')) {
      return 'مقدار issuer توکن معتبر نیست.';
    }
    if (s.includes('invalid audience') || s.includes('audience')) {
      return 'مقدار audience توکن معتبر نیست.';
    }
    if (s.includes('subject must be a string') || s.includes('invalid subject') || s.includes('subject')) {
      return 'مقدار subject توکن معتبر نیست.';
    }

    // Generic unauthorized
    if (s.includes('unauthorized') || s.includes('forbidden')) {
      return 'دسترسی غیرمجاز. لطفاً دوباره وارد شوید.';
    }

    // Fallback
    return 'اعتبارسنجی توکن ناموفق بود.';
  }
}
