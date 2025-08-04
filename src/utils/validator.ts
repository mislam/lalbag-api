import { res } from "@/utils/response"
import { zValidator } from "@hono/zod-validator"
import { type Context } from "hono"
import { z } from "zod"

/**
 * Type for validated route handlers
 * @template T - Zod schema type
 */
export type Handler<T extends z.ZodSchema> = (
	c: Context<{ Variables: { validated: z.infer<T> } }>,
) => Response | Promise<Response>

/**
 * Creates a JSON validator middleware with consistent error handling
 * @param schema - Zod schema for validation
 * @returns Hono middleware for JSON validation
 */
export const validate = <T extends z.ZodSchema>(schema: T) =>
	zValidator("json", schema, (result, c: Context<{ Variables: { validated: z.infer<T> } }>) => {
		if (!result.success) {
			return res.validationError(c, result.error.issues)
		}
		c.set("validated", result.data)
	})
