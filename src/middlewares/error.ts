import { res } from "@/utils/response"
import { ErrorHandler, NotFoundHandler } from "hono"

export const errorHandler: ErrorHandler = (err, c) => {
	console.error(err)
	return res.internalError(c)
}

export const notFoundHandler: NotFoundHandler = (c) => {
	return res.notFound(c)
}
