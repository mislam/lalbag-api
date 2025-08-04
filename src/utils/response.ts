import { type Context } from "hono"
import { StatusCode, type ContentfulStatusCode } from "hono/utils/http-status"

// Response interfaces
interface SuccessResponse<T = unknown> {
	ok: true
	data: T
	message?: string
	meta?: Record<string, unknown>
}

interface ErrorResponse {
	ok: false
	error: string
	code?: string
	details?: unknown
}

interface PaginationMeta {
	page: number
	limit: number
	total: number
	totalPages: number
}

interface ResponseOptions {
	status?: ContentfulStatusCode
	message?: string
	meta?: Record<string, unknown>
}

// Response utilities for consistent API responses.
export const res = {
	ok: <T>(c: Context, data: T, options: ResponseOptions = {}) => {
		const response: SuccessResponse<T> = {
			ok: true,
			data,
		}
		if (options.message) response.message = options.message
		if (options.meta) response.meta = options.meta

		return c.json(response, options.status ?? 200)
	},

	created: <T>(c: Context, data: T, message = "Resource created") =>
		res.ok(c, data, { status: 201, message }),

	noContent: (c: Context) => c.body(null, 204 as StatusCode),

	paginated: <T>(
		c: Context,
		data: T[],
		pagination: PaginationMeta,
		options: ResponseOptions = {},
	) => {
		const reservedKeys = new Set(["pagination", "page", "limit", "total", "totalPages"])
		if (options.meta && Object.keys(options.meta).some((key) => reservedKeys.has(key))) {
			return res.err(c, "Pagination meta keys are reserved", {
				status: 500,
				code: "INTERNAL_ERROR",
			})
		}
		return res.ok(c, data, { ...options, meta: { pagination, ...options.meta } })
	},

	err: (
		c: Context,
		error: string,
		options: ResponseOptions & { code?: string; details?: unknown } = {},
	) => {
		const response: ErrorResponse = {
			ok: false,
			error,
		}
		if (options.code) response.code = options.code
		if (options.details !== undefined) response.details = options.details

		return c.json(response, options.status ?? 400)
	},

	badRequest: (c: Context, error: string, details?: unknown) =>
		res.err(c, error, { status: 400, code: "BAD_REQUEST", details }),

	unauthorized: (c: Context, error = "Unauthorized") =>
		res.err(c, error, { status: 401, code: "UNAUTHORIZED" }),

	forbidden: (c: Context, error = "Forbidden") =>
		res.err(c, error, { status: 403, code: "FORBIDDEN" }),

	notFound: (c: Context, error = "Not found") =>
		res.err(c, error, { status: 404, code: "NOT_FOUND" }),

	conflict: (c: Context, error: string, details?: unknown) =>
		res.err(c, error, { status: 409, code: "CONFLICT", details }),

	validationError: (c: Context, details: unknown) =>
		res.err(c, "Validation failed", { status: 422, code: "VALIDATION_ERROR", details }),

	tooManyRequests: (c: Context, error = "Too many requests") =>
		res.err(c, error, { status: 429, code: "TOO_MANY_REQUESTS" }),

	internalError: (c: Context, error = "Internal server error") =>
		res.err(c, error, { status: 500, code: "INTERNAL_ERROR" }),

	serviceUnavailable: (c: Context, error = "Service unavailable") =>
		res.err(c, error, { status: 503, code: "SERVICE_UNAVAILABLE" }),
}

// Export types
export type { ErrorResponse, PaginationMeta, ResponseOptions, SuccessResponse }
