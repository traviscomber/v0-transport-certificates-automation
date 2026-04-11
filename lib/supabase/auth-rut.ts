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
      .select('id, rut, full_name, email, is_active, transportista_id')
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

    // Validar contraseña - simple comparison
    if (!password) {
      throw new Error('La contraseña es requerida')
    }

    if (password !== 'labbe2024') {
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
