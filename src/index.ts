import { errorHandler, notFoundHandler } from "@/middlewares/error"
import { Hono } from "hono"

import * as health from "@/handlers/health"
import * as users from "@/handlers/users"
import * as auth from "@/modules/auth"

const app = new Hono()

// Error handlers
app.onError(errorHandler)
app.notFound(notFoundHandler)

// Register routes
health.registerRoutes(app)
auth.registerRoutes(app)
users.registerRoutes(app)

export default app
