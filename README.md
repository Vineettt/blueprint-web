# Blueprint Web

A Next.js 16 dashboard frontend with RBAC/PBAC-style auth patterns, built with shadcn/ui components. The **backend API lives on a separate host**; configure its base URL in environment variables (for example `NEXT_PUBLIC_API_URL`) so the app only talks to HTTP(S) endpoints.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the state management design, auth flow, permission system, and file conventions.

## Tech Stack

- **Framework**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Lucide icons
- **State**: Zustand (stores-first — all shared state in `src/stores/`)
- **Authentication**: JWT + HTTP-only refresh cookie
- **Tables**: TanStack React Table
- **Forms**: React Hook Form

## Project Structure

```
src/
├── app/           # Next.js App Router pages
│   ├── auth/      # Login page
│   ├── dashboard/ # Main dashboard
│   ├── mapping/   # Role/Route/RouteRole mapping
│   └── account/   # Users and user-role management
├── components/
│   ├── auth/      # Login form
│   ├── dialogs/   # CRUD dialogs per entity
│   ├── data-table/# Reusable paginated table
│   └── ui/        # shadcn/ui primitives
├── constants/
│   ├── permission.ts  # Route permission config (locationConfig)
│   ├── route.ts       # API endpoint enum + HTTP method enum
│   └── storage.ts     # localStorage key constants
├── contexts/
│   └── AuthProtectionContext.tsx  # Route guard
├── hooks/         # UI-local hooks only (dialog, table, mutation, mobile)
├── stores/        # Zustand global stores (auth, maintenance, roles, routes, mappings)
├── types/         # Shared TypeScript types
└── utils/         # Pure utility functions (api, storage, permissions, errors)
```

## Features

- JWT authentication with HTTP-only refresh cookie
- Token refresh on page reload (expired token → auto-refresh → sidebar renders)
- Role-based access control (RBAC) + Permission-based access control (PBAC)
- Dynamic sidebar with permission-filtered navigation
- Paginated data tables with search and role filtering
- Form dialogs for CRUD operations with warning/confirm flows
- Dark/light theme support

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Copy the environment file and set your API URL:

```bash
cp .env.example .env
# Set NEXT_PUBLIC_API_URL=http://your-api-host:port
```

Then run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm start` - Production server
- `pnpm lint` - ESLint check
- `pnpm format` / `pnpm format:check` - Prettier
- `pnpm test` / `pnpm test:run` / `pnpm test:coverage` - Vitest (watch / single run / coverage)
- `pnpm test:e2e` - Playwright end-to-end tests
- `pnpm docker:build` / `pnpm docker:up` - Container build and compose

## Quality Gates

- **Husky:** on `git commit`, runs TypeScript check, ESLint, Prettier, `next build`, then `vitest run`
- **CI:** GitHub Actions runs lint, TypeScript, Vitest with coverage, and production build on pushes/PRs to `main`

## Adding a New Protected Route

1. Add the page under `src/app/your-route/page.tsx`
2. Add an entry to `locationConfig` in `src/constants/permission.ts`:
   ```ts
   '/your-route': {
     permissionRequired: true,
     permissionArray: ['your_permission_key'],
   }
   ```
3. Add the route to `src/config/sidebar.json` with matching `permissionRequired` and `permissionArray`
