import { res } from "@/utils/response"
import { Context } from "hono"

export async function check(c: Context) {
	return res.ok(c, { status: "healthy" })
}
