'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

/**
 * COMPONENTE EDUCATIVO - EducationalTooltip
 * 
 * Propósito: Mostrar explicaciones educativas cuando el usuario pasa el mouse
 * o hace clic en el ícono de información (Info)
 * 
 * Características:
 * - Tooltip que aparece al pasar el mouse
 * - Soporte para dispositivos móviles (clic)
 * - Educativo y no invasivo
 * - Fácil de usar en cualquier lugar
 * 
 * Ejemplo de uso:
 * <EducationalTooltip 
 *   title="¿Qué es un Subcontratista?"
 *   description="Un subcontratista es una empresa que trabaja bajo contrato con tu empresa matriz."
 * />
 */

interface EducationalTooltipProps {
  title: string
  description: string
  children?: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function EducationalTooltip({ 
  title, 
  description, 
  children,
  position = 'top' 
}: EducationalTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  }

  return (
    <div className="relative inline-block group">
      {children ? (
        children
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 transition"
          aria-label="Información educativa"
        >
          <Info className="w-4 h-4" />
        </button>
      )}
      
      {isOpen && (
        <div className={`absolute ${positionClasses[position]} left-1/2 -translate-x-1/2 z-50 w-64 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl`}>
          <div className="text-xs font-semibold text-blue-300 mb-1">{title}</div>
          <div className="text-xs text-slate-300 leading-relaxed">{description}</div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  )
}
