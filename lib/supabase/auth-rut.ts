import { createClient } from '@/lib/supabase/client'

export interface CompanyLoginResponse {
  id: string
  rut: string
  name: string
  email: string
  is_labbe_admin: boolean
}

/**
 * Normaliza un RUT para comparación (elimina puntos y espacios, mantiene el guión)
 */
function normalizeRUT(rut: string): string {
  return rut.replace(/\./g, '').replace(/\s/g, '').trim()
}

/**
 * Formatea un RUT normalizado a formato con puntos (ej: 783767805 -> 78.376.780-5)
 */
function formatRUT(rut: string): string {
  const cleaned = normalizeRUT(rut)
  if (cleaned.length < 8) return cleaned
  const parts = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)
  return parts.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv
}

/**
 * Autentica una empresa usando RUT y contraseña
 * Busca en la tabla transportistas (funciona en preview y producción)
 * @param rut - RUT de la empresa (puede estar con o sin puntos)
 * @param password - Contraseña
 * @returns Datos de la empresa si es válido
 */
export async function loginByRUT(
  rut: string,
  password: string
): Promise<CompanyLoginResponse> {
  const supabase = createClient()
  const normalizedInput = normalizeRUT(rut)
  const formattedRUT = formatRUT(normalizedInput)

  console.log('[v0] loginByRUT called with RUT:', rut)
  console.log('[v0] Normalized RUT:', normalizedInput)
  console.log('[v0] Formatted RUT for query:', formattedRUT)

  try {
    // Buscar la empresa por RUT en la tabla transportistas
    // La BD almacena RUT con puntos (ej: 78.376.780-5)
    console.log('[v0] Querying transportistas table for RUT:', formattedRUT)
    const { data: company, error } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social, email, is_active, password_hash')
      .eq('rut', formattedRUT)
      .single()

    if (error || !company) {
      console.error('[v0] Company not found for RUT:', formattedRUT, error?.message)
      throw new Error('RUT o contraseña incorrectos')
    }

    console.log('[v0] Company found:', company.razon_social)

    if (!company.is_active) {
      console.warn('[v0] Company is inactive:', company.rut)
      throw new Error('La empresa está inactiva')
    }

    // Validar contraseña
    console.log('[v0] Validating password for RUT:', formattedRUT)
    if (password !== company.password_hash) {
      console.error('[v0] Invalid password for RUT:', formattedRUT)
      throw new Error('RUT o contraseña incorrectos')
    }

    console.log('[v0] Login successful for company:', company.razon_social)

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
