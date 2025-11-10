'use client'

import { useEffect } from 'react'
import soundManager from '@/lib/utils/soundManager'

export function SoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Preload sounds
    soundManager.loadSound('click', '/sounds/click.mp3');
    soundManager.loadSound('hover', '/sounds/hover.mp3');
    soundManager.loadSound('success', '/sounds/success.mp3');
    soundManager.loadSound('error', '/sounds/error.mp3');
  }, [])

  return <>{children}</>
}
