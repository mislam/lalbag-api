import { getDb } from "@/adapters/database"
import { sendOTP } from "@/adapters/sms"
import { auth, otps, tokens } from "@/db/schema"
import { daysFromNow, minutesAgo, minutesFromNow, now } from "@/utils/date"
import { isDev } from "@/utils/env"
import { res } from "@/utils/response"
import { Handler, validate } from "@/utils/validator"
import { eq } from "drizzle-orm"
import { type Context, type Hono } from "hono"
import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import { z } from "zod"
import { AUTH_CONFIG, generateJWT, generateOTP, generateToken } from "./utils"

// OTP Request Validation Schema
const otpRequestSchema = z.object({
	phone: z.string().regex(/^01[1-9]\d{8}$/, "Invalid Bangladesh phone number format"),
})

// Request OTP with rate limiting
const requestOTP: Handler<typeof otpRequestSchema> = async (c) => {
	const { phone } = c.get("validated") // Retrieve validated data from context

	const db = getDb(c)
	const [recentOTP] = await db.select().from(otps).where(eq(otps.phone, phone)).limit(1)

	// Check if an OTP was requested recently (within cooldown period)
	if (
		recentOTP &&
		recentOTP.createdAt &&
		recentOTP.createdAt > minutesAgo(AUTH_CONFIG.OTP_COOLDOWN_MINUTES)
	) {
		return res.tooManyRequests(c, "Too many requests, try again later")
	}

	const otpCode = generateOTP()
	const expiresAt = minutesFromNow(AUTH_CONFIG.OTP_EXPIRY_MINUTES)

	await db
		.insert(otps)
		.values({ phone, code: otpCode, expiresAt, attempts: 0, createdAt: now() })
		.onConflictDoUpdate({
			target: otps.phone,
			set: { code: otpCode, expiresAt, attempts: 0, createdAt: now() },
		})

	// Defer SMS sending so the response is fast; logs/HTTP happen in background
	c.executionCtx.waitUntil(sendOTP(c, phone, otpCode))

	return res.ok(c, { message: "OTP sent" })
}

// OTP Verify Validation Schema
const otpVerifySchema = z.object({
	phone: z.string().regex(/^01[1-9]\d{8}$/, "Invalid Bangladesh phone number format"),
	code: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
	deviceInfo: z.string().optional(),
	platform: z.enum(["mobile", "web"], "Platform must be 'mobile' or 'web'"),
})

// Verify OTP and issue tokens
const verifyOTP: Handler<typeof otpVerifySchema> = async (c) => {
	const { phone, code, deviceInfo, platform } = c.get("validated")

	const db = getDb(c)
	const [otp] = await db.select().from(otps).where(eq(otps.phone, phone)).limit(1)

	// Check if OTP exists and hasn't exceeded max attempts
	if (!otp) {
		return res.unauthorized(c, "No OTP found for this phone number")
	}

	if (otp.expiresAt < now()) {
		// Clean up expired OTP
		await db.delete(otps).where(eq(otps.phone, phone))
		return res.unauthorized(c, "OTP has expired")
	}

	if ((otp.attempts ?? 0) >= AUTH_CONFIG.OTP_MAX_ATTEMPTS) {
		// Clean up OTP that has exceeded max attempts
		await db.delete(otps).where(eq(otps.phone, phone))
		return res.unauthorized(c, "Too many failed attempts. Please request a new OTP.")
	}

	// Check if OTP code matches
	if (otp.code !== code) {
		// Increment attempts and check if we've exceeded the limit
		const newAttempts = (otp.attempts ?? 0) + 1
		await db.update(otps).set({ attempts: newAttempts }).where(eq(otps.phone, phone))

		if (newAttempts >= AUTH_CONFIG.OTP_MAX_ATTEMPTS) {
			// Clean up OTP that has now exceeded max attempts
			await db.delete(otps).where(eq(otps.phone, phone))
			return res.unauthorized(c, "Too many failed attempts. Please request a new OTP.")
		}

		return res.unauthorized(c, "Invalid OTP code")
	}

	// OTP is valid - clean it up
	await db.delete(otps).where(eq(otps.phone, phone))

	// Find or create auth record
	let [authRecord] = await db.select().from(auth).where(eq(auth.phone, phone)).limit(1)

	// If auth record doesn't exist, create one
	if (!authRecord) {
		;[authRecord] = await db.insert(auth).values({ phone }).returning()
	}

	if (platform === "mobile") {
		// Mobile: Issue JWT + Refresh Token
		const jwt = await generateJWT(c, authRecord.id)
		const refreshToken = generateToken()
		const expiresAt = daysFromNow(AUTH_CONFIG.REFRESH_TOKEN_EXPIRY_DAYS)

		await db.insert(tokens).values({
			authId: authRecord.id,
			token: refreshToken,
			type: "refresh_token",
			expiresAt,
			deviceInfo,
		})

		return res.ok(c, { jwt, refreshToken })
	} else {
		// Web: Issue Session Cookie
		const sessionToken = generateToken()
		const expiresAt = daysFromNow(AUTH_CONFIG.SESSION_EXPIRY_DAYS)

		await db.insert(tokens).values({
			authId: authRecord.id,
			token: sessionToken,
			type: "session",
			expiresAt,
			deviceInfo,
		})

		// Use secure cookies in production; allow non-secure in local dev for DX
		const secureCookie = !isDev(c)
		setCookie(c, "session", sessionToken, {
			httpOnly: true,
			secure: secureCookie,
			sameSite: "Strict",
			path: "/",
			maxAge: AUTH_CONFIG.SESSION_EXPIRY_DAYS * 24 * 60 * 60,
		})

		return res.ok(c, { message: "Logged in" })
	}
}

// Refresh Token Validation Schema
const refreshTokenSchema = z.object({
	refreshToken: z.string().length(24, "Invalid refresh token"),
})

// Rotate Token (Mobile Only) - Uses refresh token for authentication
const rotateToken: Handler<typeof refreshTokenSchema> = async (c) => {
	const { refreshToken } = c.get("validated")

	const db = getDb(c)
	const [token] = await db.select().from(tokens).where(eq(tokens.token, refreshToken)).limit(1)

	// Verify refresh token is valid and not expired
	if (!token || token.type !== "refresh_token" || token.revokedAt || token.expiresAt < now()) {
		return res.unauthorized(c, "Invalid or expired refresh token")
	}

	// Get the auth record from the refresh token
	const [authRecord] = await db.select().from(auth).where(eq(auth.id, token.authId)).limit(1)
	if (!authRecord) {
		return res.unauthorized(c, "User not found")
	}

	// Rotate refresh token (update existing token)
	const newRefreshToken = generateToken()
	const expiresAt = daysFromNow(AUTH_CONFIG.REFRESH_TOKEN_EXPIRY_DAYS)

	await db
		.update(tokens)
		.set({
			token: newRefreshToken,
			expiresAt,
			lastUsedAt: now(),
		})
		.where(eq(tokens.token, refreshToken))

	const jwt = await generateJWT(c, token.authId)
	return res.ok(c, { jwt, refreshToken: newRefreshToken })
}

// Logout Validation Schema (mobile uses refreshToken; web uses session cookie)
const logoutSchema = z.object({
	refreshToken: z.string().length(24, "Invalid refresh token").optional(),
})

// Logout - Auth via token possession (refresh token for mobile, session cookie for web)
const logout = async (c: Context) => {
	const db = getDb(c)
	const { refreshToken } = c.get("validated")

	// Mobile logout via refresh token
	if (refreshToken) {
		const [token] = await db.select().from(tokens).where(eq(tokens.token, refreshToken)).limit(1)
		if (token && token.type === "refresh_token" && !token.revokedAt) {
			await db.update(tokens).set({ revokedAt: now() }).where(eq(tokens.token, refreshToken))
		}
		return res.ok(c, { message: "Logged out" })
	}

	// Web logout via session cookie
	const sessionToken = getCookie(c, "session")
	if (sessionToken) {
		const [token] = await db.select().from(tokens).where(eq(tokens.token, sessionToken)).limit(1)
		if (token && token.type === "session" && !token.revokedAt) {
			await db.update(tokens).set({ revokedAt: now() }).where(eq(tokens.token, sessionToken))
		}
		deleteCookie(c, "session", {
			httpOnly: true,
			secure: true,
			sameSite: "Strict",
			path: "/",
		})
	}
	return res.ok(c, { message: "Logged out" })
}

export const registerRoutes = (app: Hono) => {
	app.post("/auth/otp/request", validate(otpRequestSchema), requestOTP)
	app.post("/auth/otp/verify", validate(otpVerifySchema), verifyOTP)
	app.post("/auth/token/rotate", validate(refreshTokenSchema), rotateToken)
	app.post("/auth/logout", validate(logoutSchema), logout)
}
