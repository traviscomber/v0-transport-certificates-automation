'use client'

import { useEffect, useState } from 'react'
import { Bell, X, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import useSWR from 'swr'

interface Notification {
  id: string
  type: 'status_change' | 'document_uploaded' | 'document_expired'
  title: string
  message: string
  read: boolean
  created_at: string
  related_document_id: string
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch notifications
  const { data: response, mutate: refetch } = useSWR<{ notifications: Notification[] }>(
    '/api/company/notifications',
    async (url) => {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    { revalidateOnFocus: true, refreshInterval: 30000 }
  )

  const notifications = response?.notifications || []
  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/company/notifications/${id}/read`, { method: 'POST' })
      if (res.ok) {
        refetch()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/company/notifications/${id}`, { method: 'DELETE' })
      if (res.ok) {
        refetch()
      }
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'status_change':
        return 'bg-blue-500/20 text-blue-300'
      case 'document_uploaded':
        return 'bg-green-500/20 text-green-300'
      case 'document_expired':
        return 'bg-red-500/20 text-red-300'
      default:
        return 'bg-slate-500/20 text-slate-300'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'status_change':
        return 'Cambio de Estado'
      case 'document_uploaded':
        return 'Documento Subido'
      case 'document_expired':
        return 'Documento Vencido'
      default:
        return type
    }
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Hace unos segundos'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString('es-ES')
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed top-16 right-4 w-96 max-h-96 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[9999]">
          <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-900/95">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Notificaciones</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-slate-800/50 transition-colors ${
                    notif.read ? 'opacity-60' : 'bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getTypeColor(notif.type)}>
                          {getTypeLabel(notif.type)}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {formatTime(notif.created_at)}
                        </span>
                      </div>
                      <p className="font-medium text-white text-sm mb-1">{notif.title}</p>
                      <p className="text-xs text-slate-300">{notif.message}</p>
                    </div>
                    <div className="flex gap-1">
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-green-400"
                          title="Marcar como leído"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
