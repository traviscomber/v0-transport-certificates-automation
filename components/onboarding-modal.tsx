'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<any[]>([])

  useEffect(() => {
    // Cargar contenido de onboarding
    fetch('/onboarding-content.json')
      .then(res => res.json())
      .then(data => setSteps(data.onboarding_steps))

    // Mostrar onboarding si es primera vez
    const shown = localStorage.getItem('onboarding_shown')
    if (!shown) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('onboarding_shown', 'true')
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen || steps.length === 0) return null

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-lg max-w-md w-full p-6 border border-slate-700">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-white">{step.title}</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-300 mb-6">{step.content}</p>

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition ${
                  i === currentStep ? 'bg-orange-500 w-6' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">{currentStep + 1} / {steps.length}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2"
          >
            {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
