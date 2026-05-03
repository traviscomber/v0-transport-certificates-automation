'use client'

import { useState } from 'react'
import { X, BookOpen } from 'lucide-react'

/**
 * COMPONENTE EDUCATIVO - EducationalModal
 * 
 * Propósito: Mostrar explicaciones detalladas en un modal
 * Para conceptos más complejos que no caben en un tooltip
 * 
 * Características:
 * - Modal limpio y educativo
 * - Secciones expandibles
 * - Ejemplos visuales
 * - Botón de cerrar fácil
 */

interface EducationalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  sections: Array<{
    heading: string
    content: string
  }>
  examples?: string[]
  tips?: string[]
}

export function EducationalModal({
  isOpen,
  onClose,
  title,
  sections,
  examples,
  tips
}: EducationalModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-slate-900 rounded-lg border border-slate-700 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">{section.heading}</h3>
              <p className="text-slate-300 leading-relaxed">{section.content}</p>
            </div>
          ))}

          {examples && examples.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
              <h4 className="font-semibold text-blue-300 mb-3">📝 Ejemplos Prácticos:</h4>
              <ul className="space-y-2">
                {examples.map((example, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-300">
                    <span className="text-blue-400 font-bold flex-shrink-0">{idx + 1}.</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tips && tips.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded p-4">
              <h4 className="font-semibold text-green-300 mb-3">💡 Consejos Útiles:</h4>
              <ul className="space-y-2">
                {tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-300">
                    <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 bg-slate-800 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold text-white transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook para manejar modales educativos fácilmente
 * 
 * Uso:
 * const { isOpen, open, close } = useEducationalModal()
 * <button onClick={() => open()}>Ver Ayuda</button>
 * <EducationalModal isOpen={isOpen} onClose={close} ... />
 */
export function useEducationalModal() {
  const [isOpen, setIsOpen] = useState(false)

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen)
  }
}
