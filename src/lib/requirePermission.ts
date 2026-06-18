import { getSession } from './session';
import { redirect } from 'next/navigation';

export async function requirePermission(permission: string) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  if (!session.permissions?.includes(permission)) {
    redirect('/misc/permission-denied');
  }

  return session;
}
