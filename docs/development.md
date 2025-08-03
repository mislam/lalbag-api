# Development Guide

## Response Utilities

The `res.*` namespace provides consistent JSON responses:

- **Success**: `{ ok: true, data, message?, meta? }`
- **Error**: `{ ok: false, error, code?, details? }`

### Available Methods

```typescript
import { res } from "@/utils/response"

// Success responses
return res.ok(c, { user: userData })
return res.created(c, { id: 123 }, "User created")
return res.noContent(c)

// Error responses
return res.badRequest(c, "Invalid input", { field: "email" })
return res.unauthorized(c)
return res.forbidden(c)
return res.notFound(c, "User not found")
return res.conflict(c, "Email already exists")
return res.validationError(c, { field: "email", message: "Invalid format" })
return res.internalError(c)
return res.serviceUnavailable(c)

// Paginated responses
return res.paginated(c, users, { page: 1, limit: 10, total: 100, totalPages: 10 })
```

## Routing

Routes are organized in `src/routes.ts`:

```typescript
import * as health from "@/handlers/health"
import { Hono } from "hono"

const api = new Hono<{ Bindings: CloudflareBindings }>()

api.get("/health", health.check)

export const registerRoutes = (app: Hono<{ Bindings: CloudflareBindings }>) => {
	app.route("/", api)
}
```

## Handler Pattern

Handlers are organized as modules with exported functions:

```typescript
// src/handlers/health.ts
import { res } from "@/utils/response"
import { Context } from "hono"

export const check = async (c: Context) => {
	return res.ok(c, { status: "healthy" })
}
```

## Import Aliases

Use `@/*` aliases for clean imports:

```typescript
// ✅ Use aliases
import { res } from "@/utils/response"
import * as health from "@/handlers/health"

// ❌ Avoid relative paths
import { res } from "../utils/response"
```
