import { checkDbHealth } from "@/adapters/database"
import { res } from "@/utils/response"
import { type Context, type Hono } from "hono"

const checkHealth = async (c: Context) => {
	const dbHealth = await checkDbHealth(c)

	if (!dbHealth.healthy) {
		console.error(dbHealth.error)
		return res.serviceUnavailable(c, "Database connection failed")
	}

	return res.ok(c, { status: "healthy" })
}

export const registerRoutes = (app: Hono) => {
	app.get("/health", checkHealth)
}
