# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev           # Next.js dev server (port 3000)
npm run electron:dev  # Launch Electron (requires dev server already running)
npm run build         # Production build (auto-runs prisma:generate)
npm run lint          # ESLint
npm run test          # Run src/lib/ai-system.test.ts via tsx (no framework)
npm run db:seed       # Seed dev.db
npm run db:reset      # Drop + re-seed (destructive)
npm run db:repair     # Repair schema drift
npm run dist:win      # Build Windows NSIS installer
npm run dist:mac      # Build macOS DMG
```

`DATABASE_URL` env var sets the dev DB path (default: `file:./dev.db`). In packaged Electron, `DATABASE_FILE` is set automatically to `userData/inventory.db`.

## Architecture

**Stack**: Next.js 16 + React 19 + Prisma 7 (libsql adapter) + SQLite + Tailwind CSS 4 + shadcn/ui (Base UI) + Electron 43.

**Electron integration**: In dev, Electron (`electron/main.mjs`) connects to the running Next.js dev server. In production, it spawns the Next.js standalone server from `resources/`, then loads `http://127.0.0.1:3000/inventory`. DB initialization happens in `electron/main.mjs` before the server starts.

**Database layer** (`src/lib/db.ts`): Prisma singleton using `@prisma/adapter-libsql`. Resolves DB from `DATABASE_FILE` (Electron) → `DATABASE_URL` (dev) → `file:./dev.db`. Never use `new PrismaClient()` directly — always import `prisma` from `@/lib/db`.

**Prisma**: Version 7 uses the `prisma-client` generator (not `prisma-client-js`). Generated client lives in `src/generated/prisma/` — never edit those files. Run `npm run prisma:generate` after schema changes. Single model: `AISystem`. Array-typed fields (e.g. `countriesUsed`, `outputTypes`) are stored as JSON strings in SQLite.

**Data flow**: Server Actions in `src/app/inventory/actions.ts` → `parseAISystemMutationInput` in `src/lib/ai-system-write.ts` → Prisma. All form validation uses the shared `aiSystemSchema` in `src/lib/schema.ts` (Zod 4).

**Wizard**: 7-step form (`src/components/wizard/step{1-7}-*.tsx`) driven by `wizard-shell.tsx` using react-hook-form. Steps map to schema sections (Basic Info → Use Case → Technical → Data & People → Build/Vendor → Risk Flags → Review). `step7-review.tsx` is read-only summary before submit.

**Completeness score**: Computed in `src/lib/completeness.ts` from `REQUIRED_FIELDS` (defined in `src/lib/schema.ts`). Stored as `completenessScore` integer on the model.

**Routes**:
- `/inventory` — list view with `InventoryTable` (TanStack Table)
- `/inventory/new` — wizard (create)
- `/inventory/[id]` — read-only detail
- `/inventory/[id]/edit` — edit form (same schema as wizard)

**UI components**: `src/components/ui/` are shadcn/ui primitives (Base UI-backed). Don't replace them with raw HTML. `src/lib/options.ts` holds all enum constants shared between schema and UI.

## Tooling notes

When the `headroom` MCP server is available, route large tool outputs (big file reads, large grep/search results, long logs) through `headroom_compress` before reasoning over them, rather than leaving it unused. Retrieve originals via `headroom_retrieve` with the returned hash if full detail is needed later.
