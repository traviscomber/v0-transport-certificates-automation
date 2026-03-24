import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user to check their role and redirect accordingly
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user has a profile, if not create one
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        
        if (!profile) {
          // Create default profile with 'driver' role
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            role: 'driver',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
          })
        }
        
        // Redirect based on role
        const role = profile?.role || 'driver'
        let redirectUrl = next
        
        if (next === '/dashboard') {
          switch (role) {
            case 'admin':
              redirectUrl = '/admin'
              break
            case 'dispatcher':
              redirectUrl = '/dispatcher'
              break
            case 'driver':
              redirectUrl = '/driver'
              break
            case 'mandante':
              redirectUrl = '/dashboard'
              break
            case 'transportista':
              redirectUrl = '/dashboard'
              break
            default:
              redirectUrl = '/dashboard'
          }
        }
        
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}
