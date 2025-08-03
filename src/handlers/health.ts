import { checkDbHealth } from "@/adapters/database"
import { res } from "@/utils/response"
import { Context } from "hono"

export const check = async (c: Context) => {
	const dbHealth = await checkDbHealth(c)

	if (!dbHealth.healthy) {
		console.error(dbHealth.error)
		return res.serviceUnavailable(c, "Database connection failed")
	}

	return res.ok(c, { status: "healthy" })
}
