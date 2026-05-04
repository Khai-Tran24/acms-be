import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enum/role.enum';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: { roles?: Role[] };
    }>();
    const userRoles = request.user?.roles ?? [];

    if (!userRoles) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này',
      );
    }
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
