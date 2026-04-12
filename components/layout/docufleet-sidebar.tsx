'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, AlertCircle, Clock, Users, Truck, FileText, Zap, History, Settings, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface SidebarSection {
  title: string
  items: {
    label: string
    href: string
    icon: React.ReactNode
    badge?: number
  }[]
}

const sections: SidebarSection[] = [
  {
    title: 'OPERACIONAL',
    items: [
      { label: 'Control', href: '/operacional/control', icon: <BarChart3 className="w-5 h-5" /> },
      { label: 'Operaciones Hoy', href: '/operacional/operaciones-hoy', icon: <Zap className="w-5 h-5" /> },
      { label: 'Alertas', href: '/operacional/alertas', icon: <AlertCircle className="w-5 h-5" />, badge: 3 },
    ]
  },
  {
    title: 'GESTIÓN',
    items: [
      { label: 'Conductores', href: '/operacional/conductores', icon: <Users className="w-5 h-5" /> },
      { label: 'Vehículos', href: '/operacional/vehiculos', icon: <Truck className="w-5 h-5" /> },
      { label: 'Documentos', href: '/operacional/documentos', icon: <FileText className="w-5 h-5" /> },
    ]
  },
  {
    title: 'ADMINISTRACIÓN',
    items: [
      { label: 'Historial', href: '/operacional/historial', icon: <History className="w-5 h-5" /> },
      { label: 'Configuración', href: '/operacional/configuracion', icon: <Settings className="w-5 h-5" /> },
    ]
  }
]

export function DocuFleetSidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['OPERACIONAL', 'GESTIÓN']))

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(title)) {
      newExpanded.delete(title)
    } else {
      newExpanded.add(title)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <div className="p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider hover:text-blue-600 transition-colors"
            >
              {section.title}
              <ChevronDown 
                className={`w-4 h-4 transition-transform ${expandedSections.has(section.title) ? 'rotate-180' : ''}`}
              />
            </button>
            
            {expandedSections.has(section.title) && (
              <nav className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</span>
                        {item.label}
                      </div>
                      {item.badge && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
