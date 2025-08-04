// User context types
export interface UserContext {
	id: string
}

// Extend Hono's Context type to include user-specific context variables
// This makes c.get("user") return proper types with full type safety
// Note: validated is handled by Handler<T> generic in validator.ts
declare module "hono" {
	interface ContextVariableMap {
		user: UserContext
	}
}
