'use client'

import { useState, useEffect } from 'react'
import { Search, LogOut, User, ChevronDown, Settings, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserProfile } from '@/hooks/use-user-profile'

interface CompanyHeaderProps {
  onMenuClick?: () => void
}

export function CompanyHeader({ onMenuClick }: CompanyHeaderProps) {
  const router = useRouter()
  const { profile } = useUserProfile()
  const [userEmail, setUserEmail] = useState<string>('')
  const [searchValue, setSearchValue] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
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
      router.push(`/dashboard/company/documentos?search=${encodeURIComponent(searchValue)}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[var(--cf-line)] bg-[var(--cf-sidebar)] text-[var(--cf-text)] sm:h-16">
      <div className="flex h-full items-center gap-3 px-3 sm:px-5 lg:px-7">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Abrir navegación"
          className="h-10 w-10 flex-shrink-0 rounded-[5px] text-[var(--cf-text)] hover:bg-[var(--cf-surface-2)] md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden min-w-0 flex-shrink-0 sm:block md:hidden lg:block">
          <p className="truncate text-sm font-medium text-[var(--cf-text)]">ChileFlota</p>
          <p className="text-xs text-[var(--cf-text-muted)]">Transportes Labbé</p>
        </div>

        <form onSubmit={handleSearch} className="mx-auto flex-1 sm:max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cf-text-muted)]" />
            <Input
              type="text"
              aria-label="Buscar documentos"
              placeholder="Buscar documentos, RUT o empresa..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-9 rounded-[5px] border-[var(--cf-line)] bg-[var(--cf-surface-2)] pl-9 text-sm text-[var(--cf-text)] placeholder:text-[var(--cf-text-muted)] focus-visible:border-[var(--cf-burgundy)] focus-visible:ring-[var(--cf-focus-ring)]/30"
            />
          </div>
        </form>

        <div className="relative flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProfileOpen(!profileOpen)}
            className="h-9 rounded-[5px] px-2 text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-2)] hover:text-[var(--cf-text)] sm:px-3"
          >
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="hidden max-w-[220px] truncate text-xs font-normal sm:inline">
              {profile?.full_name || userEmail?.split('@')[0] || 'Perfil'}
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-[5px] border border-[var(--cf-line)] bg-[var(--cf-sidebar)] shadow-xl shadow-black/20">
              <div className="border-b border-[var(--cf-line)] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[5px] bg-[var(--cf-burgundy)] text-[var(--cf-text)]">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || 'Avatar'}
                        className="h-10 w-10 rounded-[5px] object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--cf-text)]">
                      {profile?.full_name || 'Usuario'}
                    </p>
                    <p className="truncate text-xs text-[var(--cf-text-muted)]">
                      {profile?.email || userEmail}
                    </p>
                  </div>
                </div>
              </div>

              {profile?.phone && (
                <div className="border-b border-[var(--cf-line)] px-4 py-3">
                  <p className="text-xs text-[var(--cf-text-muted)]">Teléfono</p>
                  <p className="mt-1 text-sm text-[var(--cf-text-secondary)]">{profile.phone}</p>
                </div>
              )}

              <div className="p-1.5">
                <Link href="/dashboard/company/perfil" className="block">
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex min-h-10 w-full items-center gap-3 rounded-[5px] px-3 py-2 text-left text-sm text-[var(--cf-text-secondary)] transition-colors hover:bg-[var(--cf-surface-2)] hover:text-[var(--cf-text)]"
                  >
                    <Settings className="h-4 w-4 text-[var(--cf-text-muted)]" />
                    <span>Mi Perfil</span>
                  </button>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex min-h-10 w-full items-center gap-3 rounded-[5px] px-3 py-2 text-left text-sm text-[var(--cf-text-secondary)] transition-colors hover:bg-[var(--cf-surface-2)] hover:text-[var(--cf-text)]"
                >
                  <LogOut className="h-4 w-4 text-[var(--cf-danger)]" />
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
