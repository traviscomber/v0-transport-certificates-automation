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
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
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
