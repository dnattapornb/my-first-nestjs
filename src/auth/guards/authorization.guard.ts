import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, PermissionAction } from '@prisma/client';
import { ROLES_KEY, Roles } from '../decorators/roles.decorator';
import {
  PERMISSIONS_KEY,
  RequiredPermission,
} from '../decorators/permissions.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // [TH] ดึงข้อมูล Role และ Permission ที่ต้องการจาก Decorators
    // [EN] Get the required roles and permissions from the decorators.
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions =
      this.reflector.getAllAndOverride<RequiredPermission[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    // [TH] ถ้าไม่มีการกำหนดสิทธิ์ใดๆ, ให้ผ่านได้เลย
    // [EN] If no permissions are required, allow access.
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // [TH] ตรวจสอบ Role ก่อนเป็นอันดับแรก
    // [EN] Check the role first.
    const hasRequiredRole = requiredRoles
      ? requiredRoles.some((role) => user.role === role)
      : true;

    if (!hasRequiredRole) {
      return false;
    }

    // --- [TH] Logic การตรวจสอบ Permission ตาม Role ---
    // --- [EN] Permission checking logic based on role ---

    // [TH] Rule 1: ถ้าเป็น MODERATOR, ไม่ต้องเช็ค permission
    // [EN] Rule 1: If the user is a MODERATOR, bypass permission checks.
    if (user.role === Role.MODERATOR) {
      return true;
    }

    // [TH] Rule 2: ถ้าเป็น ADMIN, เช็คเฉพาะ permission 'DELETE'
    // [EN] Rule 2: If the user is an ADMIN, only check for 'DELETE' permission.
    if (user.role === Role.ADMIN) {
      const requiresDelete = requiredPermissions?.some(
        (p) => p[0] === PermissionAction.DELETE,
      );
      return requiresDelete ? user.permissions.includes('DELETE:Product') : true;
    }

    // [TH] Rule 3: ถ้าเป็น USER, ต้องมี permission ครบทุกอย่างที่กำหนด
    // [EN] Rule 3: If the user is a USER, they must have all required permissions.
    const userPermissions: Set<string> = new Set(user.permissions);
    return requiredPermissions
      ? requiredPermissions.every(([action, subject]) =>
          userPermissions.has(`${action}:${subject}`),
        )
      : true;
  }
}