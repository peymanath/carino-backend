import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DECORATOR_PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserWithPermissions } from '../interfaces/user-with-permisstions.interface';

type RequestWithUser = {
  user?: UserWithPermissions;
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(DECORATOR_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    const userPermissions = user.permissions.map(permission => permission.key);

    const hasAllPermissions = requiredPermissions.every(permission => userPermissions.includes(permission));

    if (!hasAllPermissions) {
      throw new ForbiddenException('You do not have the required permissions');
    }

    return true;
  }
}
