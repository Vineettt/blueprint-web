# Architecture

## State Management

All shared/global state lives in **Zustand stores** under `src/stores/`. React hooks under `src/hooks/` are reserved for **UI-local, component-scoped state** only.

### Stores

| Store                      | File                              | Purpose                              |
| -------------------------- | --------------------------------- | ------------------------------------ |
| `useAuthStore`             | `stores/authStore.ts`             | JWT auth, user data, token lifecycle |
| `useMaintenanceStore`      | `stores/maintenanceStore.ts`      | Server health / maintenance mode     |
| `useRoutesStore`           | `stores/routesStore.ts`           | Role-scoped API route list           |
| `useRolesStore`            | `stores/rolesStore.ts`            | Role list (via `createEntityStore`)  |
| `useRoleRouteMappingStore` | `stores/roleRouteMappingStore.ts` | Role-route mapping mutations         |
| `createEntityStore<T>`     | `stores/entityStore.ts`           | Generic CRUD store factory           |

### Hooks (UI-local only)

| Hook                     | Purpose                                                 |
| ------------------------ | ------------------------------------------------------- |
| `useDataTable`           | Pagination + fetch state for a single table instance    |
| `useDialog`              | Open/close + selected item for a single dialog          |
| `useMutation`            | Per-call loading/error state for a single mutation      |
| `useMutationWithConfirm` | Mutation with toast-based warning/confirm flow          |
| `usePermission`          | Selector: reads `authStore.user.permissions` for a path |
| `useIsMobile`            | Responsive breakpoint detection                         |

---

## Auth Flow

```
App mount
  └─ AppProviders.useEffect
       └─ authStore.initializeAuth()
            ├─ loadToken() — reads localStorage → sets store.token
            ├─ apiFetch(Endpoint.USER) — fetches fresh user + permissions
            │    ├─ success → storeUserData(user) — writes user/permissions to store + localStorage
            │    └─ failure → fallback to localStorage data or clearAuthState()
            └─ loading: false
                 └─ ConditionalSidebarWrapper re-renders
                      └─ isAuthenticated === true && !publicPaths → sidebar shown
```

### Token Refresh

Token refresh is handled automatically by `apiFetch` in `apiUtils.ts`:

1. Before each API call, `getValidToken()` checks if the current token is valid
2. If token is expired or missing, it calls `authStore.refreshAccessToken()`
3. `refreshAccessToken()` uses the HTTP-only refresh cookie to get a new JWT
4. On success: new token stored in localStorage + Zustand state
5. On failure: returns null, causing the API call to fail with 401

The `initializeAuth` method does NOT attempt token refresh on page load - it directly tries to fetch user data with the existing token.

---

## Permission System

Permissions are stored as a flat string array on the user object (e.g. `['users_post', 'role_post']`).

Route-level access is configured in `src/constants/permission.ts` via `locationConfig`. Every app route must have an entry — routes without an entry default to **open access**.

```
locationConfig[path].permissionRequired === true
  → hasAnyPermission(user.permissions, permissionArray) must return true
```

**Note:** The `AuthProtectionContext` does NOT currently enforce permission-based route access. It only checks authentication status and public path access. Permission checking utilities (`checkUserPermissions`, `hasAnyPermission`) are available but not used for route protection.

Sidebar items use the `hasAnyPermission` check via `app-sidebar.tsx` — items the user lacks permission for are hidden entirely.

---

## Storage

All localStorage access goes through `src/utils/storageUtils.ts`. Keys are defined in `src/constants/storage.ts`.

```ts
STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  PERMISSIONS: 'permissions',
  ROUTES: 'routes',
};
```

**Do not** call `localStorage` directly in stores or components. Use `getStorageItem` / `setStorageItem` / `removeStorageItem` from `storageUtils`.

---

## API Layer

All HTTP calls go through `apiFetch` in `src/utils/apiUtils.ts`. It:

- Reads the current token from `authStore`
- Attempts token refresh if the token is expired before the call
- Normalizes errors into `ApiError` instances
- Handles 401 responses by logging out and redirecting

For mutations, `executeApiMutation` in `src/utils/mutationUtils.ts` is a thin wrapper that serializes the body. Use `useMutation` or `useMutationWithConfirm` hooks in components.

---

## File Conventions

```
src/
├── app/           # Next.js App Router pages (route segments)
├── components/    # React components
│   ├── dialogs/   # CRUD dialogs per entity
│   ├── data-table/# Reusable paginated table
│   └── ui/        # shadcn/ui primitives
├── constants/     # Enums and config (permission, route, storage)
├── contexts/      # React contexts (AuthProtectionContext only)
├── hooks/         # UI-local hooks only
├── stores/        # Zustand global stores
├── types/         # Shared TypeScript types
└── utils/         # Pure utility functions (no React)
```
