/**
 * Validation schemas for API requests
 */

export type ValidationError = {
  field: string
  message: string
}

export function validateChangeStatusRequest(body: any): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  if (!body.status) {
    errors.push({ field: 'status', message: 'Status is required' })
  } else if (!['approved', 'rejected', 'pending'].includes(body.status)) {
    errors.push({ field: 'status', message: 'Invalid status value' })
  }

  if (body.reason && typeof body.reason !== 'string') {
    errors.push({ field: 'reason', message: 'Reason must be a string' })
  }

  if (body.reason && body.reason.length > 500) {
    errors.push({ field: 'reason', message: 'Reason must be less than 500 characters' })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateAnomalyActionRequest(body: any): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  if (!body.anomaly_id) {
    errors.push({ field: 'anomaly_id', message: 'Anomaly ID is required' })
  }

  if (!body.action) {
    errors.push({ field: 'action', message: 'Action is required' })
  } else if (!['investigate', 'resolve', 'dismiss', 'escalate'].includes(body.action)) {
    errors.push({ field: 'action', message: 'Invalid action value' })
  }

  if (body.notes && typeof body.notes !== 'string') {
    errors.push({ field: 'notes', message: 'Notes must be a string' })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateEmailAlertRequest(body: any): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  if (!body.anomaly_id) {
    errors.push({ field: 'anomaly_id', message: 'Anomaly ID is required' })
  }

  if (!body.recipient_email) {
    errors.push({ field: 'recipient_email', message: 'Recipient email is required' })
  } else if (!isValidEmail(body.recipient_email)) {
    errors.push({ field: 'recipient_email', message: 'Invalid email format' })
  }

  if (!body.recipient_name || typeof body.recipient_name !== 'string') {
    errors.push({ field: 'recipient_name', message: 'Recipient name is required' })
  }

  if (body.severity && !['baja', 'media', 'alta', 'crítica'].includes(body.severity)) {
    errors.push({ field: 'severity', message: 'Invalid severity' })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
