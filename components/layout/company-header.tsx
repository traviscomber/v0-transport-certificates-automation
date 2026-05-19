'use client'

import { useState, useEffect } from 'react'
import { Search, LogOut, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export function CompanyHeader() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string>('')
  const [searchValue, setSearchValue] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    // Get user email from cookie
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
    <header className="h-16 bg-primary text-white shadow-md border-b border-primary/20">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Logo and Company Name */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold">TL</span>
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-base font-semibold truncate">Transportes Labbé</h1>
            <p className="text-xs text-white/70">Portal de Empresa</p>
          </div>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              type="text"
              placeholder="Buscar documentos..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
            />
          </div>
        </form>

        {/* Right: Profile Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProfileOpen(!profileOpen)}
            className="text-white hover:bg-white/10 gap-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline text-sm truncate max-w-xs">
              {userEmail || 'Perfil'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-foreground">Mi Cuenta</p>
                <p className="text-xs text-gray-600 truncate">{userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

