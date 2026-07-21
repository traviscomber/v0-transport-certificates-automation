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
  if (!supabase) {
    throw new Error('Error de conexión a base de datos')
  }
  const normalizedInput = normalizeRUT(rut)
  const formattedRUT = formatRUT(normalizedInput)

  console.log('[v0] ========== LOGIN BY RUT START ==========')
  console.log('[v0] Input RUT:', rut)
  console.log('[v0] Password provided:', Boolean(password))
  console.log('[v0] Normalized RUT:', normalizedInput)
  console.log('[v0] Formatted RUT for query:', formattedRUT)

  try {
    // Buscar la empresa por RUT en la tabla transportistas
    console.log('[v0] QUERY: SELECT FROM transportistas WHERE rut =', formattedRUT)
    const { data: company, error } = await (supabase as any)
      .from('transportistas')
      .select('id, rut, razon_social, email, is_active, password_hash')
      .eq('rut', formattedRUT)
      .single()

    const companyData = company as { id: string; rut: string; razon_social: string; email: string; is_active: boolean; password_hash: string } | null
    
    console.log('[v0] Query returned error:', error?.message)
    console.log('[v0] Query returned data:', companyData ? `Found company: ${companyData.razon_social}` : 'No company found')

    if (error || !companyData) {
      console.error('[v0] FAILURE: Company not found for RUT:', formattedRUT)
      console.error('[v0] Error details:', error)
      throw new Error('RUT o contraseña incorrectos')
    }

    console.log('[v0] Company found:', {
      id: companyData.id,
      rut: companyData.rut,
      razon_social: companyData.razon_social,
      is_active: companyData.is_active,
    })
    console.log('[v0] Database RUT:', companyData.rut)
    console.log('[v0] Database password_hash present:', Boolean(companyData.password_hash))
    console.log('[v0] Is active:', companyData.is_active)

    if (!companyData.is_active) {
      console.warn('[v0] Company is inactive:', companyData.rut)
      throw new Error('La empresa está inactiva')
    }

    // Validar contraseña
    console.log('[v0] Comparing passwords:')
    console.log('[v0]   Match:', password === companyData.password_hash)

    if (password !== companyData.password_hash) {
      console.error('[v0] FAILURE: Invalid password for RUT:', formattedRUT)
      throw new Error('RUT o contraseña incorrectos')
    }

    console.log('[v0] ========== LOGIN SUCCESS ==========')

    return {
      id: companyData.id,
      rut: companyData.rut,
      name: companyData.razon_social,
      email: companyData.email || '',
      is_labbe_admin: false,
    }
  } catch (err) {
    console.error('[v0] ========== LOGIN ERROR ==========')
    console.error('[v0] Error:', err)
    throw err
  }
}
