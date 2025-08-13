import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, PermissionAction } from '@prisma/client';
import {
  PERMISSIONS_KEY,
  RequiredPermission,
} from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userPermissions: Set<string> = new Set(user.permissions);

    // [TH] Rule 1: ถ้าเป็น MODERATOR, ไม่ต้องเช็ค permission
    // [EN] Rule 1: If the user is a MODERATOR, bypass permission checks.
    if (user.role === Role.MODERATOR) {
      return true;
    }

    // [TH] Rule 2: ถ้าเป็น ADMIN, เช็คเฉพาะ permission 'DELETE'
    // [EN] Rule 2: If the user is an ADMIN, only check for 'DELETE' permission.
    if (user.role === Role.ADMIN) {
      const requiresDelete = requiredPermissions.some(
        (p) => p[0] === PermissionAction.DELETE,
      );

      // สมมติว่า Admin มี 'DELETE:all'
      return requiresDelete ? userPermissions.has('DELETE:all') : true;
    }

    // [TH] Rule 3: ถ้าเป็น USER, ต้องมี permission ครบทุกอย่างที่กำหนด
    // [EN] Rule 3: If the user is a USER, they must have all required permissions.
    return requiredPermissions.every(([action, subject]) =>
      userPermissions.has(`${action}:${subject}`),
    );
  }
}
