import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear all authentication cookies
  response.cookies.delete('supabase_token')
  response.cookies.delete('user_email')
  response.cookies.delete('user_name')
  response.cookies.delete('user_role')

  return response
}
