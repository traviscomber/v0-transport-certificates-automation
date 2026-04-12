'use client'

import { useState } from 'react'
import { ChevronDown, Lightbulb } from 'lucide-react'

/**
 * COMPONENTE EDUCATIVO - TabEducationalGuide
 * 
 * Propósito: Mostrar una guía educativa collapsible para cada tab del dashboard
 * Ayuda a los usuarios de LABBE a entender qué hace cada sección
 * 
 * Características:
 * - Se collapsa para no ocupar espacio
 * - Contiene explicación clara del propósito del tab
 * - Muestra pasos o puntos clave
 * - Diseño educativo y no intrusivo
 * 
 * Ejemplo:
 * <TabEducationalGuide
 *   title="¿Qué es la Torre de Control?"
 *   content="La Torre de Control te muestra el estado general de todas tus operaciones..."
 *   tips={['Tip 1', 'Tip 2']}
 * />
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
    <div className="mb-6 border-l-4 border-blue-500 bg-blue-500/5 rounded p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left"
      >
        <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <span className="font-semibold text-sm text-blue-300 flex-1">{title}</span>
        <ChevronDown 
          className={`w-4 h-4 text-blue-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3 text-sm text-slate-300">
          <p>{content}</p>
          
          {tips.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-300 text-xs mb-2">💡 Tips útiles:</h4>
              <ul className="space-y-1 ml-4">
                {tips.map((tip, i) => (
                  <li key={i} className="text-xs text-slate-400 list-disc">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {examples.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-300 text-xs mb-2">📝 Ejemplos:</h4>
              <ul className="space-y-1 ml-4">
                {examples.map((example, i) => (
                  <li key={i} className="text-xs text-slate-400 list-disc">{example}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
