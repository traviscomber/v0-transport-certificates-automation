'use client'

import { useToast } from '@/lib/toast-context'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-700 text-green-100'
      case 'error':
        return 'bg-red-900/90 border-red-700 text-red-100'
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-700 text-yellow-100'
      case 'info':
        return 'bg-blue-900/90 border-blue-700 text-blue-100'
      default:
        return 'bg-slate-900/90 border-slate-700 text-slate-100'
    }
  }

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
      default:
        return null
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm animate-in fade-in slide-in-from-right-2 ${getToastStyles(toast.type)}`}
        >
          <div className="flex-shrink-0 mt-0.5">{getToastIcon(toast.type)}</div>
          <div className="flex-1 text-sm font-medium">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
