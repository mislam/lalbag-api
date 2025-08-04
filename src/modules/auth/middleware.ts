import { getDb } from "@/adapters/database"
import { tokens, users } from "@/db/schema"
import { now } from "@/utils/date"
import { res } from "@/utils/response"
import { eq } from "drizzle-orm"
import { type Context, type Next } from "hono"
import { getCookie } from "hono/cookie"
import { verifyJWT } from "./utils"

export const requireAuth = async (c: Context, next: Next) => {
	const db = getDb(c)
	const authHeader = c.req.header("Authorization")

	if (authHeader?.startsWith("Bearer ")) {
		// Mobile JWT authentication
		const token = authHeader.split(" ")[1]
		try {
			const decoded = await verifyJWT(c, token)
			// Enforce user existence
			const [user] = await db.select().from(users).where(eq(users.id, decoded.sub)).limit(1)
			if (!user) {
				return res.conflict(c, "Profile required")
			}
			c.set("user", { id: decoded.sub })
			await next()
		} catch (error) {
			return res.unauthorized(c, "Invalid or expired token")
		}
	} else {
		// Web session authentication
		const sessionToken = getCookie(c, "session")
		if (!sessionToken) {
			return res.unauthorized(c, "No session found")
		}

		try {
			const [token] = await db.select().from(tokens).where(eq(tokens.token, sessionToken)).limit(1)

			if (token && token.type === "session" && !token.revokedAt && token.expiresAt > now()) {
				// Update lastUsedAt using waitUntil to keep the response fast
				c.executionCtx.waitUntil(
					db.update(tokens).set({ lastUsedAt: now() }).where(eq(tokens.token, sessionToken)),
				)

				// Enforce user existence
				const [user] = await db.select().from(users).where(eq(users.id, token.authId)).limit(1)
				if (!user) {
					return res.conflict(c, "Profile required")
				}
				c.set("user", { id: token.authId })
				await next()
			} else {
				return res.unauthorized(c, "Invalid or expired session")
			}
		} catch (error) {
			return res.unauthorized(c, "Session validation failed")
		}
	}
}
