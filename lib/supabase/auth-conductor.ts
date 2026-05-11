import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export interface ConductorLoginResponse {
  id: string
  rut: string
  nombre_completo: string
  email: string
  transportista_id: string
}

/**
 * Returns a service-role Supabase client that bypasses RLS.
 * Used only in server-side authentication logic (never exposed to the client).
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase environment variables')
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Removes dots and spaces from a Chilean RUT so it matches the format
 * stored in conductor_auth (e.g. "18012757-7", NOT "18.012.757-7").
 */
function normalizeRUT(rut: string): string {
  return rut.replace(/\./g, '').trim()
}

/**
 * Validates a Chilean RUT check digit.
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
  const calculated = remainder === 0 ? '0' : remainder === 1 ? 'K' : String(11 - remainder)
  return dv === calculated
}

/**
 * Authenticates a conductor using RUT + password.
 * 1. Looks up conductor_auth by normalised RUT for the bcrypt hash.
 * 2. Verifies the password.
 * 3. Fetches the conductor profile from conductores.
 */
export async function loginConductor(
  rut: string,
  password: string
): Promise<ConductorLoginResponse> {
  const supabase = getServiceClient()
  const normalizedRUT = normalizeRUT(rut)
  
  console.log('[v0] Login attempt with RUT:', rut, 'Normalized:', normalizedRUT)

  // Step 1 – auth record
  const { data: authData, error: authError } = await supabase
    .from('conductor_auth')
    .select('conductor_id, password_hash, is_active')
    .eq('rut', normalizedRUT)
    .single()

  console.log('[v0] Auth lookup error:', authError)
  console.log('[v0] Auth data found:', !!authData)

  if (authError || !authData) {
    console.error('[v0] Auth lookup failed:', authError?.message || 'No data')
    throw new Error('RUT o contraseña incorrectos')
  }

  if (!authData.is_active) {
    throw new Error('Tu cuenta está inactiva. Contacta a Transportes Labbe.')
  }

  // Step 2 – password verification
  console.log('[v0] Comparing password with hash')
  const passwordMatch = await bcrypt.compare(password, authData.password_hash)
  console.log('[v0] Password match result:', passwordMatch)
  
  if (!passwordMatch) {
    console.error('[v0] Password does not match')
    throw new Error('RUT o contraseña incorrectos')
  }

  // Step 3 – conductor profile
  const { data: conductor, error: conductorError } = await supabase
    .from('conductores')
    .select('id, rut, nombres, apellido_paterno, email, transportista_id, is_active')
    .eq('id', authData.conductor_id)
    .single()

  if (conductorError || !conductor) {
    throw new Error('Datos del conductor no encontrados')
  }

  if (!conductor.is_active) {
    throw new Error('Tu cuenta está inactiva. Contacta a Transportes Labbe.')
  }

  return {
    id: conductor.id,
    rut: conductor.rut,
    nombre_completo: `${conductor.nombres} ${conductor.apellido_paterno}`.trim(),
    email: conductor.email ?? '',
    transportista_id: conductor.transportista_id,
  }
}

/**
 * Hashes a plain-text password for storage.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}
