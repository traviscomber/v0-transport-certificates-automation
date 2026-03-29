import { NextRequest, NextResponse } from 'next/server'
import {
  validateRUT,
  validateDateFormat,
  getDaysUntilExpiry,
  validateLicenseClass,
  validateRUTMatch,
  calculateComplianceScore,
} from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const { documents } = await request.json()

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
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
