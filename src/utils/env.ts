import { type Context } from "hono"

// Central helper to get typed bindings without sprinkling generics everywhere
export const getEnv = (c: Context): CloudflareBindings => c.env as unknown as CloudflareBindings

// Convenient helper for environment check
export const isDev = (c: Context): boolean => getEnv(c).ENV === "development"
