// Utility function to get current UTC time
export const now = (): Date => {
	return new Date()
}

export const minutesAgo = (minutes: number): Date => {
	return new Date(Date.now() - minutes * 60 * 1000)
}

export const minutesFromNow = (minutes: number): Date => {
	return new Date(Date.now() + minutes * 60 * 1000)
}

export const hoursAgo = (hours: number): Date => {
	return new Date(Date.now() - hours * 60 * 60 * 1000)
}

export const hoursFromNow = (hours: number): Date => {
	return new Date(Date.now() + hours * 60 * 60 * 1000)
}

export const daysAgo = (days: number): Date => {
	return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

export const daysFromNow = (days: number): Date => {
	return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}
