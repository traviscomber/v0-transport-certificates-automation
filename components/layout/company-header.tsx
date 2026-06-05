'use client'

import { useState, useEffect } from 'react'
import { Search, LogOut, User, ChevronDown, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserProfile } from '@/hooks/use-user-profile'

export function CompanyHeader() {
  const router = useRouter()
  const { profile, loading } = useUserProfile()
  const [userEmail, setUserEmail] = useState<string>('')
  const [searchValue, setSearchValue] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    // Get user email from cookie as fallback
    const email = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_email='))
      ?.split('=')[1]
    
    if (email) {
      setUserEmail(decodeURIComponent(email))
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      // Navigate to documents with search query
      router.push(`/dashboard/company/documentos?search=${encodeURIComponent(searchValue)}`)
    }
  }

  return (
    <header className="h-14 sm:h-16 bg-primary text-white shadow-md border-b border-primary/20 sticky top-0 z-40">
      <div className="h-full px-2 sm:px-4 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Logo and Company Name */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
          <div className="h-9 sm:h-10 w-9 sm:w-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xs sm:text-sm font-bold">TL</span>
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-sm sm:text-base font-semibold truncate">Transportes Labbé</h1>
            <p className="text-xs text-white/70">Portal de Empresa</p>
          </div>
        </div>

        {/* Center: Search Bar - Mobile optimized */}
        <form onSubmit={handleSearch} className="flex-1 max-w-full sm:max-w-md mx-1 sm:mx-0">
          <div className="w-full relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 sm:h-4 w-3 sm:w-4 text-white/60" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-7 sm:pl-9 h-8 sm:h-9 text-xs sm:text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
            />
          </div>
        </form>

        {/* Right: Profile Dropdown */}
        <div className="relative flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProfileOpen(!profileOpen)}
            className="text-white hover:bg-white/10 gap-1 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <User className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate max-w-xs text-xs">
              {profile?.full_name || userEmail?.split('@')[0] || 'Perfil'}
            </span>
            <ChevronDown className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
          </Button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
              {/* Profile Header Section */}
              <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-4 text-white">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border-2 border-white/30">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name || 'Avatar'}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">
                      {profile?.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-white/80 truncate">
                      {profile?.email || userEmail}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Phone (if available) */}
              {profile?.phone && (
                <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-600">Teléfono</p>
                  <p className="text-sm font-medium text-foreground">{profile.phone}</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="py-1">
                <Link href="/dashboard/company/perfil" className="block">
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="w-full px-4 py-2 text-left text-foreground hover:bg-gray-50 flex items-center gap-3 text-sm font-medium transition-colors"
                  >
                    <Settings className="h-4 w-4 text-primary" />
                    <span>Mi Perfil</span>
                  </button>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

