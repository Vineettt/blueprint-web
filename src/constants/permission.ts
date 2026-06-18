interface LocationPermission {
  permissionRequired: boolean;
  permissionArray?: string[];
}

export const locationConfig: Record<string, LocationPermission> = {
  '/': {
    permissionRequired: false,
  },
  '/misc/permission-denied': {
    permissionRequired: false,
  },
  '/dashboard': {
    permissionRequired: false,
  },
  '/users': {
    permissionRequired: true,
    permissionArray: ['users_post'],
  },
  '/account/users': {
    permissionRequired: true,
    permissionArray: ['users_post'],
  },
  '/account/user-role': {
    permissionRequired: true,
    permissionArray: ['user_role_mapping_post'],
  },
  '/mapping/role': {
    permissionRequired: true,
    permissionArray: ['role_post'],
  },
  '/mapping/route': {
    permissionRequired: true,
    permissionArray: ['route_post'],
  },
  '/mapping/route-role': {
    permissionRequired: true,
    permissionArray: ['role_route_mapping_post'],
  },
};

export const publicPaths = ['/auth/login', '/auth/register', '/', '/misc/permission-denied'];
