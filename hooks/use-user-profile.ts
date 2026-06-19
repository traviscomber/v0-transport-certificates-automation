import { useState, useEffect } from 'react'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/profile')
        
        // 401 means the user is authenticated via user_email cookie (not auth_token).
        // Treat it as "no Supabase profile available" — not a crash-worthy error.
        if (response.status === 401 || response.status === 403) {
          setProfile(null)
          setError(null)
          return
        }

        if (!response.ok) {
          // Non-auth errors: log but don't crash — header has cookie fallback
          setError('Failed to fetch profile')
          return
        }
        
        const data = await response.json()
        setProfile(data)
        setError(null)
      } catch (err) {
        console.error('[v0] Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Error loading profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return { profile, loading, error }
}
