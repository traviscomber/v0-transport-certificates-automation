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
 * Autentica un ejecutivo usando RUT y contraseña
 * @param rut - RUT del ejecutivo
 * @param password - Contraseña
 * @returns Datos del ejecutivo si es válido
 */
export async function loginByRUT(
  rut: string,
  password: string
): Promise<CompanyLoginResponse> {
  const supabase = createClient()
  const normalizedRUT = normalizeRUT(rut)

  console.log('[v0] loginByRUT called with RUT:', normalizedRUT)

  try {
    // Buscar el ejecutivo por RUT en la tabla executive_staff
    console.log('[v0] Querying executive_staff table for RUT:', normalizedRUT)
    const { data: executive, error } = await supabase
      .from('executive_staff')
      .select('id, rut, full_name, email, password_hash, is_active, transportista_id')
      .eq('rut', normalizedRUT)
      .single()

    if (error || !executive) {
      console.error('[v0] Executive not found for RUT:', normalizedRUT, error?.message)
      throw new Error('RUT o contraseña incorrectos')
    }

    if (!executive.is_active) {
      console.warn('[v0] Executive is inactive:', executive.rut)
      throw new Error('El usuario está inactivo')
    }

    // Validar contraseña
    if (!password) {
      throw new Error('La contraseña es requerida')
    }

    const passwordValid = await bcrypt.compare(password, executive.password_hash)
    if (!passwordValid) {
      console.error('[v0] Invalid password for RUT:', normalizedRUT)
      throw new Error('RUT o contraseña incorrectos')
    }

    console.log('[v0] Login successful for executive:', executive.full_name)

    // Obtener la información de la empresa
    const { data: company } = await supabase
      .from('transportistas')
      .select('razon_social, email')
      .eq('id', executive.transportista_id)
      .single()

    return {
      id: executive.id,
      rut: executive.rut,
      name: executive.full_name,
      email: executive.email || company?.email || '',
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
