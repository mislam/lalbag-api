# Lalbag API

A Hono-based API running on Cloudflare Workers with PostgreSQL database support via Neon serverless driver.

## Features

- **Hono Framework**: Fast, lightweight web framework for Cloudflare Workers
- **Database**: PostgreSQL with Drizzle ORM
- **Local Development**: Docker Compose setup with PostgreSQL and MinIO
- **Neon Proxy**: Enables Neon serverless driver for local development
- **Object Storage**: MinIO for local file storage development

## Prerequisites

- Node.js 18+
- pnpm
- Docker and Docker Compose
- Cloudflare account with Workers enabled

## Environment Setup

1. Copy the environment variables:

   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. For local development with Neon proxy, add this to your `/etc/hosts` file:
   ```
   127.0.0.1 db.localtest.me
   ```

## Development

Start local services and development server:

```bash
pnpm dev:up # starts docker containers and dev server
# or
pnpm dev    # starts dev server only
```

Stop local services:

```bash
pnpm dev:down
```

Push schema changes to database:

```bash
pnpm db:push
```

Open Drizzle Studio (database admin UI):

```bash
pnpm db:admin
```

Generate Cloudflare Worker types:

```bash
pnpm cf-typegen
```

Format code:

```bash
pnpm format
```

## Deployment

Deploy to Cloudflare Workers:

```bash
pnpm deploy
```

## API Endpoints

- `GET /health` - Health check endpoint

## Services (Local Development)

- **API**: http://localhost:8787
- **PostgreSQL**: localhost:5432
- **MinIO Console**: http://localhost:9001
- **MinIO API**: http://localhost:9000

## Development Patterns

### Response Utilities

Use the `res.*` namespace for consistent API responses:

```typescript
import { res } from "@/utils/response"

// Success responses
return res.ok(c, { user: data })
return res.created(c, { id: 123 }, "User created")
return res.noContent(c)

// Error responses
return res.badRequest(c, "Invalid input", { field: "email" })
return res.unauthorized(c)
return res.notFound(c, "User not found")
return res.internalError(c)

// Paginated responses
return res.paginated(c, users, { page: 1, limit: 10, total: 100, totalPages: 10 })
```

### Import Aliases

Use `@/*` aliases for clean, maintainable imports:

```typescript
// ✅ Use aliases
import { res } from "@/utils/response"
import { UserHandler } from "@/handlers/user"

// ❌ Avoid relative paths
import { res } from "../utils/response"
```

## Project Structure

```
src/
├── index.ts         # Main application entry point
├── routes.ts        # Route registration and organization
├── handlers/        # Route handlers and business logic
│   └── health.ts    # Health check handler
├── adapters/        # External service adapters
├── db/              # Database schema and utilities
└── utils/           # Shared utilities
    └── response.ts  # Type-safe response helpers (res.*)
```

### Key Files

- **`src/utils/response.ts`**: Unified response utilities with 12 methods covering all HTTP patterns
- **`tsconfig.json`**: Path aliases configuration (`@/*` → `src/*`)
- **`src/routes.ts`**: Centralized route registration system
