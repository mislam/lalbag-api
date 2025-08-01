import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".dev.vars", quiet: true })

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL environment variable is not set!")
}

const DATABASE_URL = process.env.DATABASE_URL

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: DATABASE_URL,
	},
	strict: true,
})
