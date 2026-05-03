/**
 * Notification utilities for conductors
 * Handles email and WhatsApp notifications
 */

export interface NotificationPayload {
  conductor_id: string
  conductor_name: string
  conductor_phone?: string
  notification_type: 'document_approved' | 'document_rejected' | 'expiration_warning' | 'onboarding_welcome'
  document_type?: string
  rejection_reason?: string
  days_until_expiry?: number
  channel: 'email' | 'whatsapp' | 'both'
}

/**
 * Generate email template for document validation
 */
export function generateEmailTemplate(
  notificationType: string,
  conductorName: string,
  data: Record<string, any>
): { subject: string; body: string } {
  switch (notificationType) {
    case 'document_approved':
      return {
        subject: `Documento Aprobado - ${data.documentType || 'Documento'} ✓`,
        body: `
Hola ${conductorName},

¡Excelente noticia! Tu documento ha sido validado correctamente.

Documento: ${data.documentType || 'Documento'}
Estado: Aprobado
Fecha: ${new Date().toLocaleDateString('es-CL')}

Puedes continuar con tu solicitud. Si tienes preguntas, contacta a soporte@labbe.cl

Saludos,
Equipo Labbe
        `
      }
    
    case 'document_rejected':
      return {
        subject: `Documento Requiere Correcciones - ${data.documentType || 'Documento'}`,
        body: `
Hola ${conductorName},

Tu documento requiere algunas correcciones. Por favor, sube una nueva versión.

Documento: ${data.documentType || 'Documento'}
Razón del rechazo: ${data.rejectionReason || 'Formato no válido o información incompleta'}

Sube una nueva versión en: https://labbe.cl/conductor/documentos

Saludos,
Equipo Labbe
        `
      }
    
    case 'expiration_warning':
      return {
        subject: `Alerta: Tu ${data.documentType || 'documento'} vence en ${data.daysUntilExpiry} días`,
        body: `
Hola ${conductorName},

Tu ${data.documentType || 'documento'} vence en ${data.daysUntilExpiry} días.

Para evitar problemas, por favor renueva tu documento lo antes posible.

Sube una nueva versión en: https://labbe.cl/conductor/documentos

Saludos,
Equipo Labbe
        `
      }
    
    case 'onboarding_welcome':
      return {
        subject: 'Bienvenido a Labbe - Comienza tu Onboarding',
        body: `
Hola ${conductorName},

¡Bienvenido a Labbe! 

Estamos listos para ayudarte a subir tus documentos y comenzar a trabajar con nosotros.

Pasos para completar tu onboarding:
1. Revisa los documentos requeridos
2. Sube tus documentos
3. Espera la validación (24-48 horas)
4. ¡Comienza a trabajar!

Ingresa aquí: https://labbe.cl/conductor/onboarding

Saludos,
Equipo Labbe
        `
      }
    
    default:
      return {
        subject: 'Notificación de Labbe',
        body: 'Contacta con soporte@labbe.cl'
      }
  }
}

/**
 * Generate WhatsApp message for conductor
 */
export function generateWhatsAppMessage(
  notificationType: string,
  conductorName: string,
  data: Record<string, any>
): string {
  switch (notificationType) {
    case 'document_approved':
      return `¡Hola ${conductorName}! 🎉\n\nTu documento *${data.documentType || 'Documento'}* ha sido *aprobado* ✓\n\nPuedes continuar con tu solicitud.\n\nEquipo Labbe 📱`
    
    case 'document_rejected':
      return `Hola ${conductorName},\n\nTu documento *${data.documentType || 'Documento'}* requiere correcciones:\n\n_${data.rejectionReason || 'Información incompleta'}_\n\nSube una nueva versión aquí: https://labbe.cl/conductor/documentos\n\nEquipo Labbe`
    
    case 'expiration_warning':
      return `⚠️ *Alerta:* Tu *${data.documentType || 'documento'}* vence en *${data.daysUntilExpiry} días*\n\nRenueva tu documento lo antes posible:\nhttps://labbe.cl/conductor/documentos\n\nEquipo Labbe`
    
    case 'onboarding_welcome':
      return `¡Hola ${conductorName}! 👋\n\n*Bienvenido a Labbe*\n\nSigue estos pasos para completar tu onboarding:\n1️⃣ Sube tus documentos\n2️⃣ Espera la validación (24-48 hrs)\n3️⃣ ¡Comienza a trabajar!\n\nhttps://labbe.cl/conductor/onboarding\n\nEquipo Labbe`
    
    default:
      return `Hola ${conductorName}, contacta con soporte@labbe.cl`
  }
}

/**
 * Calculate days until expiration
 */
export function getDaysUntilExpiry(expirationDate: string | Date): number {
  const expDate = new Date(expirationDate)
  const today = new Date()
  const timeDiff = expDate.getTime() - today.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

/**
 * Check if document is expiring soon (7 days)
 */
export function isExpiringsoon(expirationDate: string | Date): boolean {
  const daysUntilExpiry = getDaysUntilExpiry(expirationDate)
  return daysUntilExpiry > 0 && daysUntilExpiry <= 7
}

/**
 * Check if document is expired
 */
export function isExpired(expirationDate: string | Date): boolean {
  return getDaysUntilExpiry(expirationDate) < 0
}
