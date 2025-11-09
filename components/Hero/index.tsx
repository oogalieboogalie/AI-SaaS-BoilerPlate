'use client'

import React, { useState, useEffect } from 'react'
import Hero3D from '@/components/Hero3D'

const Hero = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    setIsMobile(mediaQuery.matches)

    const handleResize = () => setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleResize)

    return () => mediaQuery.removeEventListener('change', handleResize)
  }, [])

  return isMobile ? (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {children}
    </div>
  ) : (
    <Hero3D>
      {children}
    </Hero3D>
  )
}

export default Hero
