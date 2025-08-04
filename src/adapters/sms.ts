import { isDev } from "@/utils/env"
import { type Context } from "hono"

export const sendOTP = async (c: Context, phone: string, otp: string) => {
	isDev(c) && console.log(`Your Lalbag OTP is ${otp}`)
	// TODO: Implement real HTTP call to provider and check response_code === 202
}
