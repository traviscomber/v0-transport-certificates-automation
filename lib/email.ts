import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface EmailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
}

/**
 * Sends email via Supabase Email API or logs to database
 * For MVP, this creates a notification in the database
 * Future: integrate with SendGrid, Resend, or AWS SES
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // For now, we log emails to a database table for review
    // In production, integrate with actual email service
    
    console.log('[v0] Email would be sent to:', options.to)
    console.log('[v0] Subject:', options.subject)
    
    // Insert into email_queue table for async processing
    await supabase.from('email_queue').insert({
      recipient: options.to,
      subject: options.subject,
      html_body: options.html,
      reply_to: options.replyTo || 'noreply@transporteslabe.cl',
      status: 'pending',
      created_at: new Date().toISOString(),
    })

    console.log('[v0] Email queued successfully for:', options.to)
  } catch (error) {
    console.error('[v0] Error sending email:', error)
    // Don't throw - allow the app to continue even if email fails
  }
}

export async function getEmailQueue() {
  return supabase.from('email_queue').select('*').eq('status', 'pending')
}

export async function markEmailAsSent(emailId: string) {
  return supabase
    .from('email_queue')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', emailId)
}
