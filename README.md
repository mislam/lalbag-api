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

## Services (Local Development)

- **API**: http://localhost:8787
- **PostgreSQL**: localhost:5432
- **MinIO Console**: http://localhost:9001
- **MinIO API**: http://localhost:9000

## Project Structure

```
src/
├── index.ts         # Main application entry point
├── handlers/        # Route handlers and business logic
├── adapters/        # External service adapters
├── db/              # Database schema and utilities
└── utils/           # Shared utilities
```
