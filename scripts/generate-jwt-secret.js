#!/usr/bin/env node

import crypto from "crypto"
import fs from "fs"
import path from "path"

// ANSI escape codes for text color
const red = "\x1b[31m"
const green = "\x1b[32m"
const yellow = "\x1b[33m"
const reset = "\x1b[0m"

function generateBase62Secret(length = 64) {
	const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	let secret = ""
	const bytes = crypto.randomBytes(length)
	for (let i = 0; i < length; i++) {
		secret += chars[bytes[i] % 62]
	}
	return secret
}

function updateJWTSecret() {
	const envFile = path.join(process.cwd(), ".dev.vars")

	// Check if .dev.vars exists
	if (!fs.existsSync(envFile)) {
		throw new Error(".dev.vars file not found")
	}

	// Read current content
	let content = fs.readFileSync(envFile, "utf8")

	// Generate new JWT secret
	const newSecret = generateBase62Secret(64)

	// Replace JWT_SECRET line (handles various formats)
	const jwtSecretRegex = /^JWT_SECRET=.*$/m

	if (jwtSecretRegex.test(content)) {
		// Replace existing JWT_SECRET
		content = content.replace(jwtSecretRegex, `JWT_SECRET=${newSecret}`)
	} else {
		throw new Error("JWT_SECRET not found in .dev.vars")
	}

	// Write back to file
	fs.writeFileSync(envFile, content)

	console.log(
		`${green}✓${reset} Generated new JWT secret ${green}${newSecret.substring(0, 20)}...${reset}`,
	)
	console.log(`  Length: 64 characters (~380 bits entropy)`)
	console.log(`  ${yellow}Updated .dev.vars with the new secret${reset}`)
}

try {
	updateJWTSecret()
} catch (error) {
	console.error(`${red}${error.message}${reset}`)
}
