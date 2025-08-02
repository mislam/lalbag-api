import * as health from "@/handlers/health"
import { Hono } from "hono"

// Single Hono instance for all routes
const api = new Hono<{ Bindings: CloudflareBindings }>()

// Health check route
api.get("/health", health.check)

// Register routes
export const registerRoutes = (app: Hono<{ Bindings: CloudflareBindings }>) => {
	app.route("/", api)
}
