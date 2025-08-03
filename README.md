# Lalbag API

Modern TypeScript-first marketplace API built with Hono v4.8.10 for Cloudflare Workers. Targets ~10ms cold starts with scalable, low-maintenance architecture serving Expo (React Native) and SvelteKit frontends.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono v4.8.10 (fast, lightweight)
- **Database**: Neon Postgres with Drizzle ORM v0.44.4 + @neondatabase/serverless v1.0.1 _(planned)_
- **Authentication**: SMS OTP using [Bulk SMS BD](docs/sms-api.md) _(planned)_
- **Local Development**: Docker Compose (PostgreSQL + MinIO)

## Architecture Goals

- **Performance**: ~10ms cold starts on Cloudflare Workers
- **Scalability**: Marketplace features (users, products, orders)
- **Maintainability**: Concise, developer-friendly code for small teams
- **Type Safety**: TypeScript-first with minimal boilerplate
- **JSON-Centric**: Consistent response patterns

## Development

```bash
# Start local services + dev server
pnpm dev:up

# Dev server only
pnpm dev

# Stop services
pnpm dev:down

# Database operations
pnpm db:push     # Push schema changes
pnpm db:admin    # Open Drizzle Studio

# Code maintenance
pnpm format      # Format code
pnpm cf-typegen  # Generate Cloudflare types
pnpm deploy      # Deploy to Workers
```

## Environment Setup

1. Copy environment variables: `cp .dev.vars.example .dev.vars`
2. Add to `/etc/hosts` for Neon proxy: `127.0.0.1 db.localtest.me`

## Local Services

- **API**: http://localhost:8787
- **PostgreSQL**: localhost:5432
- **MinIO Console**: http://localhost:9001
- **MinIO API**: http://localhost:9000

## Core Patterns

- **Response Utilities**: JSON-centric `res.*` namespace with consistent structure
  - Success: `{ ok: true, data, message?, meta? }`
  - Error: `{ ok: false, error, code?, details? }`
- **Routing**: Centralized in `src/routes.ts` with handlers from `src/handlers`
- **Imports**: Use `@/*` aliases (e.g., `import { res } from "@/utils/response"`)

> See [Development Guide](docs/development.md) for detailed patterns and examples.

## Project Structure

```
src/
├── index.ts           # Application entry point
├── routes.ts          # Route registration
├── handlers/          # Business logic and route handlers
│   └── health.ts      # Health check handler
├── utils/             # Shared utilities
│   └── response.ts    # JSON response helpers (res.*)
├── adapters/          # External services (planned)
│   └── database.ts    # Placeholder for DB adapter
└── db/                # Database schema (planned)
    └── schema.ts      # Placeholder for schema
```

## API Context

This marketplace API will serve:

- **Frontend**: Expo (React Native) mobile app _(planned)_
- **Admin**: SvelteKit web dashboard _(planned)_
- **Authentication**: SMS OTP flow _(planned)_
- **Core Features**: Users, products, orders, marketplace functionality _(planned)_

**Currently implemented**: Health check endpoint at `/health`

## Implementation Status

✅ **Working**:

- Hono framework setup with Cloudflare Workers
- Response utilities (`res.*` namespace)
- Route registration system
- Health check endpoint (`/health`)
- Import aliases (`@/*`)

🚧 **Planned**:

- Database integration (Neon + Drizzle)
- SMS OTP authentication
- User management
- Marketplace features (products, orders)
- Frontend integration

## Documentation

- [SMS API Integration](docs/sms-api.md) - Bulk SMS BD provider details
- [Development Guide](docs/development.md) - Detailed patterns and examples
