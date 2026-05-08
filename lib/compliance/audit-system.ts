import { createClient } from '@supabase/supabase-js'

/**
 * Compliance Audit System
 * Daily automatic compliance checking and alert generation
 */
export class ComplianceAuditSystem {
  private supabase

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Run complete audit for all conductors
   */
  async auditAllConductors() {
    console.log('[v0] Starting conductor compliance audit...')

    // Get all conductors
    const { data: conductors, error: conductorsError } = await this.supabase.from('conductores').select('id')

    if (conductorsError) throw conductorsError

    const results = []
    for (const conductor of conductors || []) {
      try {
        const result = await this.auditConductor(conductor.id)
        results.push(result)
      } catch (error) {
        console.error(`[v0] Error auditing conductor ${conductor.id}:`, error)
      }
    }

    console.log(`[v0] Conductor audit complete. Processed ${results.length} conductors`)
    return results
  }

  /**
   * Run complete audit for all companies
   */
  async auditAllCompanies() {
    console.log('[v0] Starting company compliance audit...')

    // Get all companies
    const { data: companies, error: companiesError } = await this.supabase.from('transportistas').select('id')

    if (companiesError) throw companiesError

    const results = []
    for (const company of companies || []) {
      try {
        const result = await this.auditCompany(company.id)
        results.push(result)
      } catch (error) {
        console.error(`[v0] Error auditing company ${company.id}:`, error)
      }
    }

    console.log(`[v0] Company audit complete. Processed ${results.length} companies`)
    return results
  }

  /**
   * Audit specific conductor compliance
   */
  async auditConductor(conductorId: string) {
    const alerts: any[] = []

    // Get all compliance records for conductor
    const { data: compliance } = await this.supabase
      .from('conductor_document_compliance')
      .select('*, document_requirement:document_requirements(*)')
      .eq('conductor_id', conductorId)

    const now = new Date()
    let completed = 0
    let expired = 0
    let expiringSoon = 0

    for (const record of compliance || []) {
      if (record.status === 'approved') {
        completed++

        // Check for expired documents
        if (record.expiry_date) {
          const expiryDate = new Date(record.expiry_date)
          const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

          if (daysUntilExpiry < 0) {
            // Document has expired
            expired++

            // Create alert if not already created
            if (!record.expiry_alert_sent) {
              alerts.push({
                entity_type: 'conductor',
                entity_id: conductorId,
                alert_type: 'document_expired',
                severity: 'high',
                title: `Documento Vencido: ${record.document_requirement.name}`,
                message: `El documento "${record.document_requirement.name}" venció el ${record.expiry_date}. Por favor sube la documentación actualizada.`,
                document_requirement_id: record.document_requirement_id,
                days_until_action: 0,
              })

              // Mark alert as sent
              await this.supabase
                .from('conductor_document_compliance')
                .update({ expiry_alert_sent: true, expiry_alert_sent_at: now.toISOString() })
                .eq('id', record.id)
            }
          } else if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            // Document expiring soon
            expiringSoon++

            // Create alert if not already created
            if (!record.expiry_alert_sent) {
              const threshold = record.document_requirement.expiration_warning_days || 30

              if (daysUntilExpiry <= threshold) {
                alerts.push({
                  entity_type: 'conductor',
                  entity_id: conductorId,
                  alert_type: 'document_expiring_soon',
                  severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
                  title: `Documento Próximo a Vencer: ${record.document_requirement.name}`,
                  message: `El documento "${record.document_requirement.name}" vencerá en ${daysUntilExpiry} días (${record.expiry_date}). Por favor renuévalo próximamente.`,
                  document_requirement_id: record.document_requirement_id,
                  days_until_action: daysUntilExpiry,
                })

                // Mark alert as sent
                await this.supabase
                  .from('conductor_document_compliance')
                  .update({ expiry_alert_sent: true, expiry_alert_sent_at: now.toISOString() })
                  .eq('id', record.id)
              }
            }
          }
        }
      } else if (record.status === 'pending') {
        // Document still pending
        alerts.push({
          entity_type: 'conductor',
          entity_id: conductorId,
          alert_type: 'document_pending',
          severity: 'medium',
          title: `Documento Pendiente: ${record.document_requirement.name}`,
          message: `Aún no has subido el documento "${record.document_requirement.name}". Por favor completa tu perfil.`,
          document_requirement_id: record.document_requirement_id,
          days_until_action: null,
        })
      }
    }

    // Insert all alerts
    if (alerts.length > 0) {
      const { error: alertError } = await this.supabase.from('compliance_alerts').insert(alerts)
      if (alertError) console.error('[v0] Error inserting alerts:', alertError)
    }

    // Calculate and update compliance score
    const total = compliance?.length || 0
    const score = total > 0 ? (completed / total) * 100 : 0
    const riskLevel = score >= 90 ? 'low' : score >= 70 ? 'medium' : 'high'

    const { error: scoreError } = await this.supabase.from('compliance_scores').upsert({
      entity_type: 'conductor',
      entity_id: conductorId,
      total_required_documents: total,
      completed_documents: completed,
      pending_documents: total - completed,
      expired_documents: expired,
      missing_documents: total - completed,
      compliance_score: score,
      risk_level: riskLevel,
      calculated_at: now.toISOString(),
    })

    if (scoreError) console.error('[v0] Error updating score:', scoreError)

    return {
      conductorId,
      totalDocuments: total,
      completed,
      expired,
      expiringSoon,
      alertsCreated: alerts.length,
      complianceScore: Math.round(score),
      riskLevel,
    }
  }

  /**
   * Audit specific company compliance
   */
  async auditCompany(transportistaId: string) {
    const alerts: any[] = []

    // Get all compliance records for company
    const { data: compliance } = await this.supabase
      .from('company_document_compliance')
      .select('*, document_requirement:document_requirements(*)')
      .eq('transportista_id', transportistaId)

    const now = new Date()
    let completed = 0
    let expired = 0
    let expiringSoon = 0

    for (const record of compliance || []) {
      if (record.status === 'approved') {
        completed++

        // Check for expired documents
        if (record.expiry_date) {
          const expiryDate = new Date(record.expiry_date)
          const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

          if (daysUntilExpiry < 0) {
            // Document has expired
            expired++

            if (!record.expiry_alert_sent) {
              alerts.push({
                entity_type: 'company',
                entity_id: transportistaId,
                alert_type: 'document_expired',
                severity: 'high',
                title: `Documento Vencido: ${record.document_requirement.name}`,
                message: `El documento "${record.document_requirement.name}" venció el ${record.expiry_date}. Por favor sube la documentación actualizada.`,
                document_requirement_id: record.document_requirement_id,
                days_until_action: 0,
              })

              await this.supabase
                .from('company_document_compliance')
                .update({ expiry_alert_sent: true, expiry_alert_sent_at: now.toISOString() })
                .eq('id', record.id)
            }
          } else if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            // Document expiring soon
            expiringSoon++

            if (!record.expiry_alert_sent) {
              const threshold = record.document_requirement.expiration_warning_days || 30

              if (daysUntilExpiry <= threshold) {
                alerts.push({
                  entity_type: 'company',
                  entity_id: transportistaId,
                  alert_type: 'document_expiring_soon',
                  severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
                  title: `Documento Próximo a Vencer: ${record.document_requirement.name}`,
                  message: `El documento "${record.document_requirement.name}" vencerá en ${daysUntilExpiry} días (${record.expiry_date}). Por favor renuévalo próximamente.`,
                  document_requirement_id: record.document_requirement_id,
                  days_until_action: daysUntilExpiry,
                })

                await this.supabase
                  .from('company_document_compliance')
                  .update({ expiry_alert_sent: true, expiry_alert_sent_at: now.toISOString() })
                  .eq('id', record.id)
              }
            }
          }
        }
      } else if (record.status === 'pending') {
        // Document still pending
        alerts.push({
          entity_type: 'company',
          entity_id: transportistaId,
          alert_type: 'document_pending',
          severity: 'medium',
          title: `Documento Pendiente: ${record.document_requirement.name}`,
          message: `Aún no has subido el documento "${record.document_requirement.name}". Por favor completa tu perfil.`,
          document_requirement_id: record.document_requirement_id,
          days_until_action: null,
        })
      }
    }

    // Insert all alerts
    if (alerts.length > 0) {
      const { error: alertError } = await this.supabase.from('compliance_alerts').insert(alerts)
      if (alertError) console.error('[v0] Error inserting alerts:', alertError)
    }

    // Calculate and update compliance score
    const total = compliance?.length || 0
    const score = total > 0 ? (completed / total) * 100 : 0
    const riskLevel = score >= 90 ? 'low' : score >= 70 ? 'medium' : 'high'

    const { error: scoreError } = await this.supabase.from('compliance_scores').upsert({
      entity_type: 'company',
      entity_id: transportistaId,
      total_required_documents: total,
      completed_documents: completed,
      pending_documents: total - completed,
      expired_documents: expired,
      missing_documents: total - completed,
      compliance_score: score,
      risk_level: riskLevel,
      calculated_at: now.toISOString(),
    })

    if (scoreError) console.error('[v0] Error updating score:', scoreError)

    return {
      transportistaId,
      totalDocuments: total,
      completed,
      expired,
      expiringSoon,
      alertsCreated: alerts.length,
      complianceScore: Math.round(score),
      riskLevel,
    }
  }

  /**
   * Get all active alerts for an entity
   */
  async getActiveAlerts(entityType: 'conductor' | 'company', entityId: string) {
    const { data, error } = await this.supabase
      .from('compliance_alerts')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('status', 'active')
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string) {
    const { error } = await this.supabase
      .from('compliance_alerts')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('id', alertId)

    if (error) throw error
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string) {
    const { error } = await this.supabase
      .from('compliance_alerts')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', alertId)

    if (error) throw error
  }
}

export const complianceAuditSystem = new ComplianceAuditSystem()
