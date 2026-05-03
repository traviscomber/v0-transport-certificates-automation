'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Info } from 'lucide-react'

interface SectionGuide {
  title: string
  description: string
  items: Array<{
    label: string
    explanation: string
  }>
}

interface SectionGuideProps {
  sectionKey: string
}

export function SectionGuide({ sectionKey }: SectionGuideProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [guide, setGuide] = useState<SectionGuide | null>(null)

  useEffect(() => {
    fetch('/onboarding-content.json')
      .then(res => res.json())
      .then(data => {
        const guides = data.section_explanations
        setGuide(guides[sectionKey] || null)
      })
  }, [sectionKey])

  if (!guide) return null

  return (
    <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-blue-500/5 transition"
      >
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-blue-300">{guide.title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-blue-400 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-blue-500/20">
          <p className="text-slate-300 text-sm mb-4">{guide.description}</p>
          <div className="space-y-3">
            {guide.items.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-800/50 rounded border border-slate-700">
                <div className="font-semibold text-slate-200 text-sm">{item.label}</div>
                <div className="text-slate-400 text-xs mt-1">{item.explanation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
