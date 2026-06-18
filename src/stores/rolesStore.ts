import { createEntityStore } from './entityStore';

export interface Role {
  id: string;
  name: string;
}

export const useRolesStore = createEntityStore<Role>('roles');
