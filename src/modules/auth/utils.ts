import { getDb } from "@/adapters/database"
import { tokens } from "@/db/schema"
import { now } from "@/utils/date"
import { getEnv } from "@/utils/env"
import { createId } from "@paralleldrive/cuid2"
import { eq } from "drizzle-orm"
import { type Context } from "hono"
import { getCookie } from "hono/cookie"
import { sign, verify } from "hono/jwt"

// Authentication configuration constants
export const AUTH_CONFIG = {
	JWT_EXPIRY_MINUTES: 30,
	REFRESH_TOKEN_EXPIRY_DAYS: 30,
	SESSION_EXPIRY_DAYS: 30,
	OTP_EXPIRY_MINUTES: 5,
	OTP_COOLDOWN_MINUTES: 1,
	OTP_MAX_ATTEMPTS: 3,
} as const

// Generate a 6-digit OTP using Web Crypto (Workers-native)
export const generateOTP = (): string => {
	const buffer = new Uint32Array(1)
	crypto.getRandomValues(buffer)
	const value = (buffer[0] % 900_000) + 100_000
	return value.toString()
}

// Generate a JWT with configurable expiry
export const generateJWT = async (c: Context, userId: string): Promise<string> => {
	const expirySeconds = Math.floor(Date.now() / 1000) + AUTH_CONFIG.JWT_EXPIRY_MINUTES * 60
	return sign({ sub: userId, exp: expirySeconds }, getEnv(c).JWT_SECRET)
}

// Verify a JWT
export const verifyJWT = async (c: Context, token: string): Promise<any> => {
	return verify(token, getEnv(c).JWT_SECRET)
}

// Generate a secure random token for refresh tokens or sessions
export const generateToken = (): string => {
	return createId()
}

/**
 * Resolve authenticated user id by token possession:
 * - Mobile: via refresh token (body)
 * - Web: via session cookie
 * Returns user id or null when not authenticated/invalid.
 */
export const getUserIdFromTokenOrSession = async (
	c: Context,
	refreshToken?: string,
): Promise<string | null> => {
	const db = getDb(c)

	if (refreshToken) {
		// Mobile: refresh token possession
		const [token] = await db.select().from(tokens).where(eq(tokens.token, refreshToken)).limit(1)
		if (token && token.type === "refresh_token" && !token.revokedAt && token.expiresAt > now()) {
			return token.authId
		}
	} else {
		// Web: session cookie possession
		const sessionToken = getCookie(c, "session")
		if (sessionToken) {
			const [token] = await db.select().from(tokens).where(eq(tokens.token, sessionToken)).limit(1)
			if (token && token.type === "session" && !token.revokedAt && token.expiresAt > now()) {
				return token.authId
			}
		}
	}

	return null
}
