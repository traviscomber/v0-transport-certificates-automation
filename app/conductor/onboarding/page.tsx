'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { OnboardingGuide } from '@/components/conductor/onboarding-guide'

export default function ConductorOnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if already completed
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('conductor_onboarding_completed')
      if (completed === 'true') {
        router.push('/conductor/documentos')
      }
    }
  }, [router])

  const handleCompleteOnboarding = () => {
    // Mark onboarding as completed and redirect to documents
    localStorage.setItem('conductor_onboarding_completed', 'true')
    router.push('/conductor/documentos')
  }

  return (
    <OnboardingGuide onComplete={handleCompleteOnboarding} />
  )
}
