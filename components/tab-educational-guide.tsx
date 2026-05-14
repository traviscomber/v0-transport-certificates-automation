'use client'

import { useState } from 'react'
import { ChevronDown, Lightbulb } from 'lucide-react'

/**
 * COMPONENTE EDUCATIVO - TabEducationalGuide
 * 
 * Propósito: Mostrar una guía educativa compacta y colapsible
 * Características:
 * - Colapsado por defecto (muy compacto)
 * - Solo muestra icono + título cuando está cerrado
 * - Contenido expandible sin ocupar espacio innecesario
 */

interface TabEducationalGuideProps {
  title: string
  content: string
  tips?: string[]
  examples?: string[]
}

export function TabEducationalGuide({ 
  title, 
  content, 
  tips = [],
  examples = []
}: TabEducationalGuideProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mb-2">
      {/* Header colapsado - muy compacto */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-primary/10 transition-colors group"
      >
        <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 group-hover:text-primary/80" />
        <span className="text-xs font-medium text-primary flex-1 group-hover:text-primary/80">{title}</span>
        <ChevronDown 
          className={`w-3 h-3 text-primary/60 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Contenido expandible - compacto */}
      {isOpen && (
        <div className="mt-1 ml-5 pl-2 border-l border-primary/30 space-y-1 text-xs text-foreground/70">
          <p className="leading-tight">{content}</p>
          
          {tips.length > 0 && (
            <div>
              <h4 className="font-semibold text-primary/80 text-xs mb-0.5">💡 Tips:</h4>
              <ul className="space-y-0.5 ml-3">
                {tips.map((tip, i) => (
                  <li key={i} className="text-xs text-foreground/60 list-disc">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {examples.length > 0 && (
            <div>
              <h4 className="font-semibold text-primary/80 text-xs mb-0.5">📝 Ejemplos:</h4>
              <ul className="space-y-0.5 ml-3">
                {examples.map((example, i) => (
                  <li key={i} className="text-xs text-foreground/60 list-disc">{example}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
