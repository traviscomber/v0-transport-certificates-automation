import { isAuthorizedExpirationCronRequest } from '@/lib/expiration-cron-auth'

describe('expiration cron authorization', () => {
  it('accepts Vercel Cron user agent in production', () => {
    const headers = new Headers({ 'user-agent': 'vercel-cron/1.0' })
    expect(isAuthorizedExpirationCronRequest(headers, { nodeEnv: 'production' })).toBe(true)
  })

  it('accepts exact configured bearer token', () => {
    const headers = new Headers({ authorization: 'Bearer cron-secret' })
    expect(
      isAuthorizedExpirationCronRequest(headers, {
        nodeEnv: 'production',
        cronSecret: 'cron-secret',
      }),
    ).toBe(true)
  })

  it('rejects unauthenticated production requests', () => {
    expect(isAuthorizedExpirationCronRequest(new Headers(), { nodeEnv: 'production' })).toBe(false)
  })

  it('does not accept partial bearer token matches', () => {
    const headers = new Headers({ authorization: 'Bearer prefix-cron-secret-suffix' })
    expect(
      isAuthorizedExpirationCronRequest(headers, {
        nodeEnv: 'production',
        cronSecret: 'cron-secret',
      }),
    ).toBe(false)
  })
})
