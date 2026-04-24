import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear authentication cookies
  response.cookies.delete('supabase_token')
  response.cookies.delete('user_email')

  return response
}
