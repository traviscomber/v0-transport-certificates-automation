'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FileCheck, BarChart3, CheckCircle2, ScanLine } from 'lucide-react'

const navLinks = [
  { href: '/ocr', label: 'Procesar', icon: ScanLine, exact: true },
  { href: '/ocr/compliance', label: 'Compliance', icon: BarChart3, exact: false },
  { href: '/ocr/review', label: 'Revisión', icon: CheckCircle2, exact: false },
]

export default function OCRLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-md shadow-lg shadow-black/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/ocr" className="flex items-center gap-3 group">
            <div className="w-9 h-9 gradient-accent rounded-lg flex items-center justify-center glow-orange group-hover:scale-110 transition-transform">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-foreground leading-tight">Portal OCR</div>
              <div className="text-xs text-accent font-semibold leading-tight">DocuFleet</div>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
