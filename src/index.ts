import { registerRoutes } from "@/routes"
import { Hono } from "hono"

const app = new Hono<{ Bindings: CloudflareBindings }>()

registerRoutes(app)

export default app
