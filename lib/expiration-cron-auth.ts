export type ExpirationCronAuthOptions = {
  nodeEnv?: string
  cronSecret?: string
  internalApiKey?: string
}

export function isAuthorizedExpirationCronRequest(
  headers: Headers,
  options: ExpirationCronAuthOptions = {},
): boolean {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV
  if (nodeEnv !== 'production') return true

  if (headers.get('user-agent') === 'vercel-cron/1.0') return true

  const authorization = headers.get('authorization')
  if (!authorization) return false

  const configuredSecrets = [
    options.cronSecret ?? process.env.CRON_SECRET,
    options.internalApiKey ?? process.env.INTERNAL_API_KEY,
  ].filter((value): value is string => Boolean(value))

  return configuredSecrets.some((secret) => authorization === `Bearer ${secret}`)
}
