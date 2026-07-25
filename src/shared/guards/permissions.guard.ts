import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DECORATOR_PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { UserWithPermissions } from '../interfaces/user-with-permisstions.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // متادیتا رو از متد یا کنترلر می‌خونیم
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      DECORATOR_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // اگر هیچ پرمیشنی نیاز نبود → اجازه بده
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // گرفتن یوزر از req که AuthGuard("jwt") گذاشته
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserWithPermissions;

    if (!user) {
      throw new ForbiddenException("User not found in request");
    }

    // لیست پرمیشن‌های یوزر رو استخراج می‌کنیم
    const userPermissions = user.permissions.map(p => p.key);

    // بررسی اینکه آیا تمام پرمیشن‌های لازم رو داره یا نه
    const hasAllPermissions = requiredPermissions.every(p => userPermissions.includes(p));

    if (!hasAllPermissions) {
      throw new ForbiddenException("You do not have the required permissions");
    }

    return true;
  }
}
