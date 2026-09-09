'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, LogOut, User, ChevronDown, Settings, Menu, FileText, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserProfile } from '@/hooks/use-user-profile'

interface CompanyHeaderProps {
  onMenuClick?: () => void
}

type SearchSuggestion = {
  id: string
  type: 'company' | 'document'
  label: string
  secondary: string | null
  value: string
  href: string
}

export function CompanyHeader({ onMenuClick }: CompanyHeaderProps) {
  const router = useRouter()
  const { profile } = useUserProfile()
  const searchRef = useRef<HTMLDivElement>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [searchValue, setSearchValue] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
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

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
        setActiveSuggestion(-1)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    const query = searchValue.trim()
    if (query.length < 2) {
      setSuggestions([])
      setSearchLoading(false)
      setActiveSuggestion(-1)
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setSearchLoading(true)
      try {
        const response = await fetch(`/api/company/search-suggestions?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!response.ok) throw new Error(`Search suggestions ${response.status}`)
        const data = await response.json()
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : [])
        setSearchOpen(true)
        setActiveSuggestion(-1)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Search suggestions error:', error)
          setSuggestions([])
        }
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false)
      }
    }, 160)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [searchValue])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigateToSuggestion = (suggestion: SearchSuggestion) => {
    setSearchValue(suggestion.value)
    setSearchOpen(false)
    setActiveSuggestion(-1)
    router.push(suggestion.href)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
      navigateToSuggestion(suggestions[activeSuggestion])
      return
    }

    const query = searchValue.trim()
    if (query) {
      setSearchOpen(false)
      router.push(`/dashboard/company/documentos/aprobados?search=${encodeURIComponent(query)}`)
    }
  }

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchOpen || suggestions.length === 0) {
      if (event.key === 'Escape') setSearchOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveSuggestion((current) => (current + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveSuggestion((current) => (current <= 0 ? suggestions.length - 1 : current - 1))
    } else if (event.key === 'Escape') {
      setSearchOpen(false)
      setActiveSuggestion(-1)
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

        <div className="hidden min-w-0 flex-shrink-0 sm:block md:hidden">
          <p className="truncate text-sm font-medium text-[var(--cf-text)]">ChileFlota</p>
          <p className="text-xs text-[var(--cf-text-muted)]">Transportes Labbé</p>
        </div>

        <form onSubmit={handleSearch} className="mx-auto flex-1 sm:max-w-lg">
          <div ref={searchRef} className="relative w-full">
            <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--cf-text-muted)]" />
            <Input
              type="search"
              aria-label="Buscar documentos"
              aria-autocomplete="list"
              aria-expanded={searchOpen}
              placeholder="Buscar documentos, RUT o empresa..."
              value={searchValue}
              onFocus={() => searchValue.trim().length >= 2 && setSearchOpen(true)}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="h-9 rounded-[5px] border-[var(--cf-line)] bg-[var(--cf-surface-2)] pl-9 text-sm text-[var(--cf-text)] placeholder:text-[var(--cf-text-muted)] focus-visible:border-[var(--cf-burgundy)] focus-visible:ring-[var(--cf-focus-ring)]/30"
            />

            {searchOpen && searchValue.trim().length >= 2 && (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[6px] border border-[var(--cf-line)] bg-[var(--cf-sidebar)] shadow-xl shadow-black/25"
              >
                {searchLoading && suggestions.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-[var(--cf-text-muted)]">Buscando coincidencias…</div>
                ) : suggestions.length > 0 ? (
                  <div className="py-1.5">
                    {suggestions.map((suggestion, index) => {
                      const Icon = suggestion.type === 'company' ? Building2 : FileText
                      return (
                        <button
                          key={suggestion.id}
                          type="button"
                          role="option"
                          aria-selected={activeSuggestion === index}
                          onMouseEnter={() => setActiveSuggestion(index)}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => navigateToSuggestion(suggestion)}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            activeSuggestion === index
                              ? 'bg-[var(--cf-surface-2)]'
                              : 'hover:bg-[var(--cf-surface-2)]'
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0 text-[var(--cf-text-muted)]" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-[var(--cf-text)]">{suggestion.label}</span>
                            {suggestion.secondary && (
                              <span className="mt-0.5 block truncate text-xs text-[var(--cf-text-muted)]">
                                {suggestion.secondary}
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-[var(--cf-text-muted)]">
                            {suggestion.type === 'company' ? 'Empresa' : 'Documento'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-3 text-xs text-[var(--cf-text-muted)]">
                    Sin coincidencias inmediatas. Presiona Enter para buscar en documentos.
                  </div>
                )}
              </div>
            )}
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
