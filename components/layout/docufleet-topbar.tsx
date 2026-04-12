'use client'

import { Search, Bell, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DocuFleetTopbar() {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6">
      {/* Logo y nombre */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">TL</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Transportes Labbé</h1>
          <p className="text-xs text-gray-500">Portal Operacional</p>
        </div>
      </div>

      {/* Buscador global - Centro */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar subcontratistas, conductores, documentos..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Acciones derechas */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Usuario */}
        <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-medium">Admin</span>
        </button>

        {/* Logout */}
        <button
          onClick={async () => {
            await fetch('/auth/logout', { method: 'POST' })
            router.push('/')
          }}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
