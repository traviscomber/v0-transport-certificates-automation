import type { VerificationResult } from './types'

export function isVerificationSuccess(status: VerificationResult['status']) {
  return status === 'success' || status === 'warning' || status === 'not_found'
}

export function isVerificationProviderFailure(status: VerificationResult['status']) {
  return status === 'failed' || status === 'blocked'
}
