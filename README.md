# Lalbag API

Modern TypeScript-first marketplace API built with Hono v4.8.10 for Cloudflare Workers. Targets ~10ms cold starts with scalable, low-maintenance architecture serving Expo (React Native) and SvelteKit frontends.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono v4.8.10 (fast, lightweight)
- **Database**: Neon Postgres with Drizzle ORM v0.44.4
- **Authentication**: SMS OTP with dual strategy (JWT/Session)
- **Validation**: Zod schemas with type-safe request handling

## Quick Start

```bash
# Setup
cp .dev.vars.example .dev.vars    # Copy environment variables
pnpm gen:jwt-secret              # Generate JWT secret

# Development
pnpm dev:up                      # Start local services + dev server
pnpm dev                         # Dev server only
pnpm dev:down                    # Stop local services

# Database
pnpm db:push                     # Push schema changes
pnpm db:admin                    # Open Drizzle Studio

# Code
pnpm format                      # Format code
pnpm check                       # Type check
pnpm deploy                      # Deploy to Workers
```

## Project Structure

```
src/
├── index.ts               # Application entry point
├── handlers/              # Business logic and route handlers
│   └── health.ts          # Health check with DB connectivity
├── middlewares/           # Request/response middleware
│   └── error.ts           # Error handling middleware
├── modules/               # Feature modules
│   └── auth/              # Authentication module
│       ├── index.ts       # Module exports
│       ├── handlers.ts    # Auth route handlers
│       ├── middleware.ts  # Auth middleware
│       ├── types.ts       # Auth-specific types
│       └── utils.ts       # Auth utilities
├── utils/                 # Shared utilities
│   ├── date.ts            # Date/time utilities
│   ├── response.ts        # JSON response helpers (res.*)
│   └── validator.ts       # Request validation with Zod
├── adapters/              # External services
│   ├── database.ts        # Neon database adapter
│   └── sms.ts             # SMS service adapter
└── db/                    # Database schema
    └── schema.ts          # Drizzle schema (auth, users, tokens, OTPs)
```

## Core Patterns

- **Response Format**: JSON-centric responses

  ```typescript
  // Success
  { ok: true, data, message?, meta? }
  // Error
  { ok: false, error, code?, details? }
  ```

- **Request Validation**: Zod schemas with type-safe handlers

  ```typescript
  app.post("/users", validate(userSchema), createUser)
  ```

- **Authentication**: Dual strategy
  - Mobile: JWT (30m) + Refresh Token (30d)
  - Web: Session Cookie (30d, HttpOnly, SameSite=Strict; Secure in production)

## API & Security Docs

- See Architecture Guide (`docs/architecture.md`) for the full API reference, authentication lifecycle, token/session behavior, database model, and security design.

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-64-character-secret-key
SMS_API_KEY=your-sms-api-key

# Optional (local development only; omit in deployment)
ENV=development
```

> **Note**: `ENV` is for local development only (controls cookie flags, Neon proxy, etc.). If unset, the app behaves as production. Do not set `ENV` for Cloudflare deployment unless you explicitly need non-production behavior.

## Documentation

- Architecture Guide: [docs/architecture.md](docs/architecture.md)
- SMS Provider: [docs/sms.md](docs/sms.md)
