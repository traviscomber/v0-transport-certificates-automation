import type { VerificationResult } from './types'

const EXPECTED_HUMAN_CHALLENGES = new Set([
  'SII_RECAPTCHA_REQUIRED',
  'SII_RECAPTCHA_INVALID',
])

export function isVerificationSuccess(status: VerificationResult['status']) {
  return status === 'success' || status === 'warning' || status === 'not_found'
}

export function isVerificationProviderFailure(
  result: Pick<VerificationResult, 'status' | 'errorCode'>,
) {
  if (result.status === 'failed') return true
  if (result.status !== 'blocked') return false
  return !result.errorCode || !EXPECTED_HUMAN_CHALLENGES.has(result.errorCode)
}
