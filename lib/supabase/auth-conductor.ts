import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export interface ConductorLoginResponse {
  id: string
  rut: string
  nombre_completo: string
  email: string
  transportista_id: string
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
 * Valida un RUT usando algoritmo de dígito verificador
 */
export function validateRUTChecksum(rut: string): boolean {
  const cleaned = normalizeRUT(rut)
  if (cleaned.length < 8) return false
  
  const numbers = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1).toUpperCase()
  
  let sum = 0
  let multiplier = 2
  
  for (let i = numbers.length - 1; i >= 0; i--) {
    sum += parseInt(numbers[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  
  const remainder = sum % 11
  const calculatedDv = remainder === 0 ? '0' : remainder === 1 ? 'K' : String(11 - remainder)
  
  return dv === calculatedDv
}

/**
 * Autentica un conductor usando RUT y contraseña
 * @param rut - RUT del conductor (puede estar con o sin puntos)
 * @param password - Contraseña
 * @returns Datos del conductor si es válido
 */
export async function loginConductor(
  rut: string,
  password: string
): Promise<ConductorLoginResponse> {
  const supabase = await createClient()
  if (!supabase) {
    throw new Error('Error de conexión a base de datos')
  }
  
  // Normalizar RUT: remover puntos para buscar en BD
  const normalizedRUT = normalizeRUT(rut)

  console.log('[v0] Conductor login attempt - Input RUT:', rut, 'Normalized:', normalizedRUT)

  try {
    // Buscar autenticación en tabla conductor_auth usando RUT normalizado (sin puntos)
    const { data: authData, error: authError } = await (supabase as any)
      .from('conductor_auth')
      .select('id, conductor_id, password_hash, is_active')
      .eq('rut', normalizedRUT)
      .single()

    if (authError || !authData) {
      console.error('[v0] Conductor auth not found for RUT:', normalizedRUT)
      throw new Error('RUT o contraseña incorrectos')
    }

    if (!authData.is_active) {
      console.warn('[v0] Conductor auth is inactive:', normalizedRUT)
      throw new Error('Tu cuenta está inactiva. Contacta a Transportes Labbe.')
    }

    // Validar contraseña
    const passwordMatch = await bcrypt.compare(password, authData.password_hash || '')
    
    if (!passwordMatch) {
      console.error('[v0] Invalid password for conductor:', normalizedRUT)
      throw new Error('RUT o contraseña incorrectos')
    }

    // Obtener datos del conductor desde tabla conductores
    const { data: conductor, error: conductorError } = await (supabase as any)
      .from('conductores')
      .select('id, rut, nombres, apellido_paterno, email, transportista_id, is_active')
      .eq('id', authData.conductor_id)
      .single()

    if (conductorError || !conductor) {
      console.error('[v0] Conductor record not found:', authData.conductor_id)
      throw new Error('Datos del conductor no encontrados')
    }

    if (!conductor.is_active) {
      console.warn('[v0] Conductor account is inactive:', normalizedRUT)
      throw new Error('Tu cuenta está inactiva. Contacta a Transportes Labbe.')
    }

    console.log('[v0] Conductor login successful:', normalizedRUT)

    return {
      id: conductor.id,
      rut: conductor.rut,
      nombre_completo: `${conductor.nombres} ${conductor.apellido_paterno}`,
      email: conductor.email || '',
      transportista_id: conductor.transportista_id,
    }
  } catch (err) {
    console.error('[v0] Conductor login error:', err)
    throw err
  }
}

/**
 * Hash una contraseña para almacenamiento
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}
