import 'server-only';
import { cookies } from 'next/headers';
import { UserPermission } from '@/types/auth';

export type Session = {
  permissions: UserPermission[];
};

export async function getSession(): Promise<Session | null> {
  const cookieHeader = (await cookies()).toString();

  if (!cookieHeader) return null;

  const res = await fetch(`${process.env.API_URL}/api/session`, {
    cache: 'no-store',
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!res.ok) return null;

  const response = await res.json();

  if (response.success) {
    return {
      permissions: response.data.permissions || [],
    };
  }

  return null;
}
