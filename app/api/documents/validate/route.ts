import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  validateRUT,
  validateDateFormat,
  getDaysUntilExpiry,
  validateLicenseClass,
  validateRUTMatch,
  calculateComplianceScore,
} from '@/lib/validations'
import { generateDocumentStatusChangeAlert } from '@/lib/document-alerts-generator'
import { logAuditEvent } from '@/lib/audit-logging-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documents, action, documentId, isApproved, rejectionReason } = body

    // Action: validate data format
    if (action === 'validate-data') {
      if (!documents || !Array.isArray(documents)) {
        return NextResponse.json(
          { error: 'Invalid documents array' },
          { status: 400 }
        )
      }

      const validationResults = documents.map((doc) => {
        const validations: Record<string, any> = {
          documentId: doc.id,
          documentType: doc.documentType,
          validations: {} as Record<string, boolean>,
          warnings: [] as string[],
          complianceScore: 0,
        }

        const data = doc.extractedData || {}

        // RUT Validation
        if (data.rut) {
          const isValidRUT = validateRUT(data.rut)
          validations.validations.validRUT = isValidRUT
          if (!isValidRUT) {
            validations.warnings.push('RUT invalido o formato incorrecto')
          }
        }

        // Date Validations
        if (data.fecha_vencimiento || data.fecha_emision) {
          const expiryField = data.fecha_vencimiento || data.fecha_emision
          const { valid: isValidDate } = validateDateFormat(expiryField)
          validations.validations.validDate = isValidDate

          if (isValidDate) {
            const { daysRemaining, status } = getDaysUntilExpiry(expiryField)
            validations.daysRemaining = daysRemaining
            validations.expiryStatus = status

            if (status === 'expired') {
              validations.warnings.push(`Documento vencido hace ${Math.abs(daysRemaining)} dias`)
            } else if (status === 'expiring') {
              validations.warnings.push(`Documento vence en ${daysRemaining} dias`)
            }
          }
        }

        // License Class Validation
        if (data.clase_licencia) {
          const isValidClass = validateLicenseClass(data.clase_licencia)
          validations.validations.validLicenseClass = isValidClass
          if (!isValidClass) {
            validations.warnings.push('Clase de licencia invalida')
          }
        }

        // Calculate Compliance Score
        validations.complianceScore = calculateComplianceScore(validations.validations)

        return validations
      })

      return NextResponse.json({
        success: true,
        results: validationResults,
        summary: {
          total: documents.length,
          fullCompliance: validationResults.filter((r) => r.complianceScore === 100).length,
          partial: validationResults.filter((r) => r.complianceScore > 0 && r.complianceScore < 100).length,
          failed: validationResults.filter((r) => r.complianceScore === 0).length,
        },
      })
    }

    // Action: approve/reject document with alerts
    if (action === 'approve' || action === 'reject') {
      const supabase = await createClient()

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'manager', 'supervisor'].includes(profile.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (!documentId) {
        return NextResponse.json(
          { error: 'Missing documentId' },
          { status: 400 }
        )
      }

      // Get document details
      const { data: document, error: docError } = await supabase
        .from('uploaded_documents')
        .select(`
          *,
          document_types(name),
          profiles:uploaded_by(first_name, company_name)
        `)
        .eq('id', documentId)
        .single()

      if (docError || !document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        )
      }

      // Update validation status
      const { error: updateError } = await supabase
        .from('uploaded_documents')
        .update({
          validation_status: action === 'approve' ? 'approved' : 'rejected',
          validation_notes: rejectionReason || null,
          validated_at: new Date().toISOString(),
          validated_by: user.id,
        })
        .eq('id', documentId)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update document' },
          { status: 500 }
        )
      }

      // Log audit event
      try {
        await logAuditEvent(
          user.id,
          action === 'approve' ? 'DOCUMENT_APPROVED' : 'DOCUMENT_REJECTED',
          'uploaded_documents',
          documentId,
          {
            previous_status: document.validation_status,
            new_status: action === 'approve' ? 'approved' : 'rejected',
            rejection_reason: rejectionReason || null,
            validated_by_user_id: user.id,
          },
          request.headers.get('x-forwarded-for') || undefined,
          request.headers.get('user-agent') || undefined
        )
        console.log('[v0] Audit event logged for document:', documentId)
      } catch (auditError) {
        console.error('[v0] Audit logging error (non-fatal):', auditError)
        // Don't fail the operation if audit logging fails
      }
      const uploaderType = document.conductor_id ? 'conductor' : 'client'
      const uploaderId = document.conductor_id || document.client_id
      const uploaderName = Array.isArray(document.profiles)
        ? document.profiles[0]?.first_name || document.profiles[0]?.company_name || 'Usuario'
        : document.profiles?.first_name || document.profiles?.company_name || 'Usuario'

      // Get conductor info for alerts
      const { data: conductorData } = await supabase
        .from('conductores')
        .select('nombres, apellido_paterno, apellido_materno')
        .eq('id', document.conductor_id)
        .single()

      const conductorName = conductorData 
        ? [conductorData.nombres, conductorData.apellido_paterno, conductorData.apellido_materno]
            .filter(Boolean)
            .join(' ')
            .trim()
        : uploaderName

      // Generate new-style status change alert with priorities
      await generateDocumentStatusChangeAlert(
        documentId,
        document.document_types?.name || 'Documento',
        conductorName,
        document.conductor_id || '',
        action === 'approve' ? 'approved' : 'rejected',
        rejectionReason || undefined
      )

      // Create notification for admin/manager who validated
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: `Documento ${action === 'approve' ? 'Aprobado' : 'Rechazado'}`,
          message: `${uploaderName}'s ${document.document_types?.name || 'documento'} ha sido ${action === 'approve' ? 'aprobado' : 'rechazado'}.`,
          type: 'info',
          read: false,
          created_at: new Date().toISOString(),
        })

      return NextResponse.json({
        success: true,
        message: `Document ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        documentId,
        status: action === 'approve' ? 'approved' : 'rejected',
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('[v0] Validation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

