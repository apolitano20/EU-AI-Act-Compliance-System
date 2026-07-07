# EU AI Act Compliance Inventory

This project is a Next.js 16 and Electron app for capturing an internal inventory of AI systems before running deeper EU AI Act assessments.

## Requirements

- Node.js 20+
- npm

## Setup

Install dependencies and generate the Prisma client:

```bash
npm install
```

The generated Prisma client stays out of version control, so `postinstall` and `prebuild` regenerate it automatically. You can also run the step manually:

```bash
npm run prisma:generate
```

## Database

The local development database lives at `./dev.db`.

Seed it with sample inventory data:

```bash
npm run db:seed
```

Repair legacy or malformed inventory records in place:

```bash
npm run db:repair
```

Reset and reseed the local database:

```bash
npm run db:reset
```

## Development

Start the Next.js app:

```bash
npm run dev
```

The app redirects to `/inventory`.

## Electron

Start the Electron shell in development:

```bash
npm run electron:dev
```

In packaged builds, Electron creates and uses a per-user SQLite database in the app data directory as `inventory.db`.

## Verification

Run the main checks:

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run build
```

## Packaging

Build desktop packages:

```bash
npm run dist:win
npm run dist:mac
```
