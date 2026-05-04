export interface EmailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
}

/**
 * Email utilities - Email sending is handled server-side via API routes
 * This file provides types and constants for client-side email features
 */

export function formatEmailSubject(type: string, severity: string): string {
  const typeLabel = {
    fraud: 'Fraude Detectado',
    alteration: 'Documento Alterado',
    expiration: 'Documento Vencido',
    invalid_format: 'Formato Inválido',
    missing_data: 'Datos Faltantes',
    document_damage: 'Documento Dañado',
  }[type] || type

  const severityLabel = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Crítica',
  }[severity] || severity

  return `[${severityLabel}] ${typeLabel} - Acción Requerida`
}
