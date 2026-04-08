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

  // Buscar la empresa por RUT
  const { data: company, error } = await supabase
    .from('companies')
    .select('id, rut, name, email, password_hash, is_labbe_admin')
    .eq('rut', rut)
    .single()

  if (error || !company) {
    throw new Error('RUT o contraseña incorrectos')
  }

  // Verificar la contraseña
  const isPasswordValid = await bcrypt.compare(password, company.password_hash)

  if (!isPasswordValid) {
    throw new Error('RUT o contraseña incorrectos')
  }

  return {
    id: company.id,
    rut: company.rut,
    name: company.name,
    email: company.email,
    is_labbe_admin: company.is_labbe_admin,
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
