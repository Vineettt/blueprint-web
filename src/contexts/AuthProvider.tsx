'use client';

import { createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { checkUserPermissions } from '@/utils/permissionUtils';
import { GlobalLoading } from '@/components/ui/global-loading';

interface AuthContextType {
  canAccessPath: (path: string) => boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { permissions, logout: storeLogout, authStatus } = useAuthStore();

  const canAccessPath = (path: string): boolean => {
    return checkUserPermissions(path, permissions ?? []);
  };

  const logout = async () => {
    await storeLogout();
    router.replace('/auth/login');
  };

  if (authStatus === 'initializing') {
    return <GlobalLoading message="Loading..." />;
  }

  if (authStatus === 'loggingOut') {
    return <GlobalLoading message="logging out..." />;
  }

  return (
    <AuthContext.Provider
      value={{
        canAccessPath,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthProtection() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthProtection must be used within AuthProvider');
  }

  return context;
}
