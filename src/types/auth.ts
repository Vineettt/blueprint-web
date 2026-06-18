export type UserPermission = string;

export interface User {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  roles?: string[];
  permissions?: UserPermission[];
}
