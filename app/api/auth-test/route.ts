import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('[v0] === AUTH TEST DEBUG ===')
  console.log('[v0] URL:', supabaseUrl)
  console.log('[v0] Anon Key:', supabaseAnonKey?.substring(0, 20) + '...')
  console.log('[v0] Email:', email)

  const tokenUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`
  console.log('[v0] Token URL:', tokenUrl)

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey!,
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
      }),
    })

    const data = await response.json()

    console.log('[v0] Response Status:', response.status)
    console.log('[v0] Response Headers:', Object.fromEntries(response.headers))
    console.log('[v0] Response Data:', JSON.stringify(data, null, 2))

    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      data,
      debug: {
        url: tokenUrl,
        email: email.toLowerCase(),
        passwordLength: password.length,
      },
    })
  } catch (error: any) {
    console.error('[v0] Auth test error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
