// Centralized logging utility with environment-based output
export const logger = {
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[v0] ${message}`, data || "")
    }
  },

  error: (message: string, error?: Error | unknown) => {
    console.error(`[v0] ERROR: ${message}`, error)
    // In production, send to Sentry or similar service
    if (process.env.NODE_ENV === "production") {
      // sentryClient.captureException(error);
    }
  },

  warn: (message: string, data?: unknown) => {
    console.warn(`[v0] WARNING: ${message}`, data || "")
  },

  info: (message: string, data?: unknown) => {
    console.info(`[v0] INFO: ${message}`, data || "")
  },
}

export default logger
