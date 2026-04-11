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

  console.log('[v0] Attempting login with RUT:', normalizedRUT)

  // Buscar la empresa por RUT en la tabla transportistas
  const { data: company, error } = await supabase
    .from('transportistas')
    .select('id, rut, razon_social, email, is_active')
    .eq('rut', normalizedRUT)
    .single()

  if (error) {
    console.error('[v0] Database error for RUT:', normalizedRUT, error)
    throw new Error('Error al buscar la empresa')
  }

  if (!company) {
    console.error('[v0] Company not found for RUT:', normalizedRUT)
    throw new Error('RUT o contraseña incorrectos')
  }

  if (!company.is_active) {
    throw new Error('La empresa está inactiva')
  }

  // Por ahora, aceptar cualquier contraseña para demo
  // TODO: Implementar verificación de contraseña cuando se agregue password_hash a transportistas
  if (!password) {
    throw new Error('La contraseña es requerida')
  }

  return {
    id: company.id,
    rut: company.rut,
    name: company.razon_social,
    email: company.email || '',
    is_labbe_admin: false,
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
