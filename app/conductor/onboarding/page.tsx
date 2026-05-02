'use client'

import { useRouter } from 'next/navigation'
import { OnboardingGuide } from '@/components/conductor/onboarding-guide'

export default function ConductorOnboardingPage() {
  const router = useRouter()

  const handleCompleteOnboarding = () => {
    // Mark onboarding as completed and redirect to documents
    localStorage.setItem('conductor_onboarding_completed', 'true')
    router.push('/conductor/documentos')
  }

  return (
    <OnboardingGuide onComplete={handleCompleteOnboarding} />
  )
}
