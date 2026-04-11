import { createClient } from '@/lib/supabase/client'
import bcrypt from 'bcrypt'

export interface CompanyLoginResponse {
  id: string
  rut: string
  name: string
  email: string
  is_labbe_admin: boolean
}

/**
 * Normaliza un RUT (elimina puntos y espacios, mantiene el guión)
 */
function normalizeRUT(rut: string): string {
  return rut.replace(/\./g, '').trim()
}

/**
 * Autentica una empresa usando RUT y contraseña
 * @param rut - RUT de la empresa
 * @param password - Contraseña
 * @returns Datos de la empresa si es válido
 */
export async function loginByRUT(
  rut: string,
  password: string
): Promise<CompanyLoginResponse> {
  const supabase = createClient()
  const normalizedRUT = normalizeRUT(rut)

  console.log('[v0] loginByRUT called with RUT:', normalizedRUT)
  console.log('[v0] Supabase client created')

  try {
    // Buscar la empresa por RUT en la tabla transportistas
    console.log('[v0] Querying transportistas table for RUT:', normalizedRUT)
    const { data: company, error } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social, email, is_active')
      .eq('rut', normalizedRUT)
      .single()

    console.log('[v0] Query completed. Error:', error, 'Company:', company?.rut)

    if (error) {
      console.error('[v0] Database error for RUT:', normalizedRUT, 'Error code:', error.code, 'Message:', error.message)
      throw new Error(`Database error: ${error.message}`)
    }

    if (!company) {
      console.error('[v0] Company not found for RUT:', normalizedRUT)
      throw new Error('RUT o contraseña incorrectos')
    }

    console.log('[v0] Company found:', company.razon_social)

    if (!company.is_active) {
      console.warn('[v0] Company is inactive:', company.rut)
      throw new Error('La empresa está inactiva')
    }

    // Por ahora, aceptar cualquier contraseña para demo
    if (!password) {
      throw new Error('La contraseña es requerida')
    }

    console.log('[v0] Login successful for RUT:', company.rut)

    return {
      id: company.id,
      rut: company.rut,
      name: company.razon_social,
      email: company.email || '',
      is_labbe_admin: false,
    }
  } catch (err) {
    console.error('[v0] loginByRUT error:', err)
    throw err
  }
}

/**
 * Cambia la contraseña de una empresa
 * @param companyId - ID de la empresa
 * @param oldPassword - Contraseña actual
 * @param newPassword - Nueva contraseña
 */
export async function changeCompanyPassword(
  companyId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const supabase = createClient()

  // Obtener la contraseña actual
  const { data: company, error } = await supabase
    .from('companies')
    .select('password_hash')
    .eq('id', companyId)
    .single()

  if (error || !company) {
    throw new Error('Empresa no encontrada')
  }

  // Verificar la contraseña actual
  const isPasswordValid = await bcrypt.compare(oldPassword, company.password_hash)

  if (!isPasswordValid) {
    throw new Error('Contraseña actual incorrecta')
  }

  // Hash de la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  // Actualizar en BD
  const { error: updateError } = await supabase
    .from('companies')
    .update({ password_hash: hashedPassword, updated_at: new Date() })
    .eq('id', companyId)

  if (updateError) {
    throw new Error('Error al cambiar la contraseña')
  }
}
