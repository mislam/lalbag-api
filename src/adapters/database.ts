import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { Context } from "hono"

// Cache database clients for performance
const dbCache = new Map<string, ReturnType<typeof drizzle>>()

// Utility function to get database client from context
export const getDb = (c: Context<{ Bindings: CloudflareBindings }>): ReturnType<typeof drizzle> => {
	const connectionString = c.env.DATABASE_URL
	if (!connectionString) {
		throw new Error("DATABASE_URL is not set in the environment variables")
	}

	// Check cache for existing database instance
	let db = dbCache.get(connectionString)
	if (db) return db

	try {
		// Configure Neon for local development
		if ("development" === c.env.ENV) {
			neonConfig.fetchEndpoint = (host) => {
				const [protocol, port] = host === "db.localtest.me" ? ["http", 4444] : ["https", 443]
				return `${protocol}://${host}:${port}/sql`
			}
		}
		// Initialize database client
		const sql = neon(connectionString)
		db = drizzle({ client: sql })
		dbCache.set(connectionString, db)
		return db
	} catch (error) {
		throw new Error(`Failed to initialize database connection: ${(error as Error).message}`)
	}
}

// Check database health
export const checkDbHealth = async (c: Context): Promise<{ healthy: boolean; error?: string }> => {
	try {
		const db = getDb(c)
		await db.execute("SELECT 1")
		return { healthy: true }
	} catch (error) {
		return {
			healthy: false,
			error: error instanceof Error ? error.message : "Unknown database error",
		}
	}
}
