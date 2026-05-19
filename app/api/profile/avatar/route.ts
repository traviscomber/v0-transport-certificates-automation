import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient(url, key)
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const cookieStore = await cookies()
    const session = cookieStore.get('auth_token')

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Decode JWT to get user ID
    const token = session.value
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    const userId = payload.sub

    const body = await request.json()
    const { avatar } = body

    if (!avatar) {
      return NextResponse.json({ error: 'Avatar requerido' }, { status: 400 })
    }

    // Convert base64 to buffer
    const base64Data = avatar.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate unique filename
    const filename = `avatars/${userId}-${Date.now()}.jpg`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filename)

    // Update profile with avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('avatar_url')
      .single()

    if (error) throw error

    return NextResponse.json({
      avatar_url: publicUrl,
      message: 'Avatar actualizado correctamente'
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: 'Error al subir foto de perfil' },
      { status: 500 }
    )
  }
}
