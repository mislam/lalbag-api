import { errorHandler, notFoundHandler } from "@/handlers/error"
import { registerRoutes } from "@/routes"
import { Hono } from "hono"

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Error handlers
app.onError(errorHandler)
app.notFound(notFoundHandler)

registerRoutes(app)

export default app
