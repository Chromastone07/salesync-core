# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a mobile app (Expo/React Native) and a shared API server.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Dukaan - Digital Register (`artifacts/dukaan`)
A mobile-first Digital Register for small Indian shopkeepers.

**Features:**
- Multilingual onboarding (English, Hindi, Marathi)
- Business type selection (Kirana, Dairy, Hardware, Flour Mill, Stationery, Other)
- Suggested inventory quick-start based on business type
- Sales recording with flexible schema (products + services)
- Inventory management (add/edit/delete items with local language labels)
- Sales history grouped by date
- Guest mode — all data stored locally via AsyncStorage
- Settings (language change, shop name, business type display)

**Key Design Decisions:**
- Flexible sale schema supports both products (inventory deduction) and services (no stock)
- `is_service` flag toggles stock logic per sale line item
- All data persists via `@react-native-async-storage/async-storage`
- No backend required for V1 — fully offline-first

**Context Providers:**
- `AppContext` — language, businessType, shopName, onboardingComplete
- `StoreContext` — inventoryItems (CRUD), sales (CRUD)

**Screens:**
- `/onboarding/language` — Language selection gateway
- `/onboarding/business` — Business type picker
- `/onboarding/quickstart` — Suggested items with price input
- `/(tabs)/index` — Dashboard (today's revenue, recent sales)
- `/(tabs)/sale` — New sale screen (item grid + cart)
- `/(tabs)/inventory` — Manage items (add/edit/delete with local language support)
- `/(tabs)/history` — Date-grouped sales history
- `/(tabs)/settings` — Language, shop name, business type, reset

### API Server (`artifacts/api-server`)
Shared Express backend (not used by Dukaan V1 — Dukaan is frontend-only).

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
