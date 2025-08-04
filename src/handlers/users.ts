import { getDb } from "@/adapters/database"
import { users } from "@/db/schema"
import { getUserIdFromTokenOrSession } from "@/modules/auth/utils"
import { res } from "@/utils/response"
import { Handler, validate } from "@/utils/validator"
import { eq } from "drizzle-orm"
import { type Hono } from "hono"
import { z } from "zod"

const createProfileSchema = z.object({
	name: z.string().min(1, "Name is required"),
	gender: z.enum(["male", "female"], "Gender must be male or female"),
	birthYear: z.number().int().min(1900).max(new Date().getFullYear(), "Invalid birth year"),
	email: z.email("Invalid email address").optional(),
	refreshToken: z.string().length(24, "Invalid refresh token").optional(),
})

const createProfile: Handler<typeof createProfileSchema> = async (c) => {
	const { name, gender, birthYear, email, refreshToken } = c.get("validated")
	const db = getDb(c)

	const userId = await getUserIdFromTokenOrSession(c, refreshToken)

	if (!userId) {
		return res.unauthorized(c, "Authentication required")
	}

	const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1)
	if (existing.length > 0) {
		return res.conflict(c, "Profile already exists")
	}

	const [profile] = await db
		.insert(users)
		.values({ id: userId, name, gender, birthYear, email })
		.returning()

	return res.created(c, profile, "Profile created")
}

export const registerRoutes = (app: Hono) => {
	app.post("/users", validate(createProfileSchema), createProfile)
}
