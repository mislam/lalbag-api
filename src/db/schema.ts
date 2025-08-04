import { createId } from "@paralleldrive/cuid2"
import { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

// Enums
export const genderEnum = pgEnum("gender", ["male", "female"])
export const tokenTypeEnum = pgEnum("token_type", ["refresh_token", "session"])

// Authentication Table (Core auth data)
export const auth = pgTable("auth", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	phone: text("phone").unique().notNull(),
	createdAt: timestamp("created_at").defaultNow(),
})

// Users Table (User identity and profile data)
// Shared primary key with AUTH: users.id === auth.id
export const users = pgTable("users", {
	id: text("id")
		.primaryKey()
		.references(() => auth.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	gender: genderEnum("gender").notNull(),
	birthYear: integer("birth_year").notNull(),
	email: text("email").unique(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
})

// OTPs Table
export const otps = pgTable("otps", {
	phone: text("phone").primaryKey(),
	code: text("code").notNull(),
	attempts: integer("attempts").default(0),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
})

// Tokens Table
export const tokens = pgTable(
	"tokens",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		authId: text("auth_id")
			.references(() => auth.id, { onDelete: "cascade" })
			.notNull(),
		token: text("token").unique().notNull(),
		type: tokenTypeEnum("type").notNull(), // 'refresh_token' or 'session'
		deviceInfo: text("device_info"), // e.g., "iPhone 15 Pro" or "Chrome/Windows"
		expiresAt: timestamp("expires_at").notNull(),
		revokedAt: timestamp("revoked_at"), // For security - mark tokens as revoked
		lastUsedAt: timestamp("last_used_at").defaultNow(), // Activity tracking
		createdAt: timestamp("created_at").defaultNow(),
	},
	(table) => [index("tokens_auth_type_idx").on(table.authId, table.type)],
)

// Type Inference
export type Auth = InferSelectModel<typeof auth>
export type NewAuth = InferInsertModel<typeof auth>

export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>

export type OTP = InferSelectModel<typeof otps>
export type NewOTP = InferInsertModel<typeof otps>

export type Token = InferSelectModel<typeof tokens>
export type NewToken = InferInsertModel<typeof tokens>
