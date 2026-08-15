'use client'

import { useCallback } from 'react'
import soundManager from '@/lib/utils/soundManager'

export function useSound() {
  const playSound = useCallback((soundName: string) => {
    soundManager.playSound(soundName)
  }, [])

  return playSound
}
