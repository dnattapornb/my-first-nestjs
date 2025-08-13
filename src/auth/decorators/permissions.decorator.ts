import { SetMetadata } from '@nestjs/common';
import { PermissionAction } from '@prisma/client';

export type RequiredPermission = [PermissionAction, string];

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);