import RouteRolePage from '@/components/pages/route-role-page';
import { requirePermission } from '@/lib/requirePermission';

export default async function Page() {
  await requirePermission('role_route_mapping_post');

  return <RouteRolePage />;
}
