import { locationConfig } from '@/constants/permission';
import { UserPermission } from '@/types/auth';

export function checkUserPermissions(path: string, userPermissions: UserPermission[]): boolean {
  const permission = userPermissions || [];
  const config = locationConfig[path];

  if (config?.permissionRequired) {
    const expectedPermissions = config.permissionArray || [];
    if (expectedPermissions.length === 0) {
      return false;
    }

    return hasAnyPermission(permission, expectedPermissions);
  }
  return true;
}

export function hasAnyPermission(
  userPermissions: UserPermission[] | undefined,
  requiredPermissions: string[] | undefined
): boolean {
  const permission = userPermissions || [];
  if (!requiredPermissions || requiredPermissions.length === 0) return false;

  for (const expectedPermission of requiredPermissions) {
    if (permission.includes(expectedPermission)) return true;
  }
  return false;
}
