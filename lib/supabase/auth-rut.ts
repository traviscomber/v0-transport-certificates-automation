import { createClient } from '@/lib/supabase/client'

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
  return rut.replace(/\./g, '').replace(/\s/g, '').trim()
}

/**
 * Autentica una empresa usando RUT y contraseña
 * Busca en la tabla transportistas (funciona en preview y producción)
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

  try {
    // Buscar la empresa por RUT en la tabla transportistas
    console.log('[v0] Querying transportistas table for RUT:', normalizedRUT)
    const { data: company, error } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social, email, is_active, password_hash')
      .eq('rut', normalizedRUT)
      .single()

    if (error || !company) {
      console.error('[v0] Company not found for RUT:', normalizedRUT, error?.message)
      throw new Error('RUT o contraseña incorrectos')
    }

    if (!company.is_active) {
      console.warn('[v0] Company is inactive:', company.rut)
      throw new Error('La empresa está inactiva')
    }

    // Validar contraseña
    console.log('[v0] Validating password for RUT:', normalizedRUT)
    if (password !== company.password_hash) {
      console.error('[v0] Invalid password for RUT:', normalizedRUT)
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
