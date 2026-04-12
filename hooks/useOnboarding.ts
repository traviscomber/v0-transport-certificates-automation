'use client'

import { useState, useEffect } from 'react'

export function useOnboarding() {
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasBeenShown, setHasBeenShown] = useState(false)

  useEffect(() => {
    const shown = localStorage.getItem('onboarding_shown')
    setHasBeenShown(!!shown)
    if (shown) setIsCompleted(true)
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_shown', 'true')
    setIsCompleted(true)
    setHasBeenShown(true)
  }

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_shown')
    setIsCompleted(false)
    setHasBeenShown(false)
  }

  return {
    isCompleted,
    hasBeenShown,
    completeOnboarding,
    resetOnboarding,
  }
}
