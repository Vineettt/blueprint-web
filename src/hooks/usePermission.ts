import { useAuthStore } from '@/stores/authStore';
import { checkUserPermissions } from '@/utils/permissionUtils';

export const usePermission = (path: string) => {
  const user = useAuthStore((state) => state.user);
  return checkUserPermissions(path, user?.permissions || []);
};
