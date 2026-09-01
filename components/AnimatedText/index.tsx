'use client'

import React, { useEffect, useRef } from 'react'
import styles from './AnimatedText.module.css'

interface AnimatedTextProps {
  text: string
  animationType:
    | 'typewriter'
    | 'letter-by-letter'
    | 'glitch'
    | 'gradient'
    | 'word-morph'
    | '3d-transform'
    | 'scroll-path'
    | 'kinetic'
  speed?: number
  delay?: number
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  animationType,
  speed = 150,
  delay = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (animationType === 'gradient') {
      container.innerHTML = `<span class="${styles.gradient}">${text}</span>`
      return
    }
    if (animationType === '3d-transform') {
      container.innerHTML = `<span class="${styles.transform}">${text}</span>`
      return
    }
    if (animationType === 'kinetic') {
      container.innerHTML = `<span class="${styles.kinetic}">${text}</span>`
      return
    }

    let animationFrameId: number
    let startTime: number
    let lastUpdateTime = 0
    let charIndex = 0

    const glitchChars = '`¡™£¢∞§¶•ªº–≠œ∑´®†¥¨ˆøπ“‘«åß∂ƒ©˙∆˚¬…æΩ≈ç√∫˜µ≤≥÷/?'

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp
        lastUpdateTime = timestamp
      }

      const elapsedTimeSinceStart = timestamp - startTime
      const elapsedTimeSinceUpdate = timestamp - lastUpdateTime

      if (elapsedTimeSinceStart > delay && elapsedTimeSinceUpdate > speed) {
        lastUpdateTime = timestamp
        if (animationType === 'typewriter') {
          const textToShow = text.slice(0, charIndex + 1)
          container.textContent = textToShow
        } else if (animationType === 'letter-by-letter') {
          const letters = text.split('').map((letter, index) => {
            return `<span style="opacity: ${
              index <= charIndex ? 1 : 0
            }; transition: opacity 0.5s;">${letter}</span>`
          })
          container.innerHTML = letters.join('')
        } else if (animationType === 'glitch') {
          if (charIndex < text.length) {
            let displayText = ''
            for (let i = 0; i < text.length; i++) {
              if (i <= charIndex) {
                displayText += text[i]
              } else {
                displayText +=
                  glitchChars[Math.floor(Math.random() * glitchChars.length)]
              }
            }
            container.textContent = displayText
          } else {
            container.textContent = text
          }
        } else if (animationType === 'word-morph') {
          const words = text.split(' ')
          const currentWord = words[charIndex % words.length]
          container.textContent = currentWord
          charIndex++
        } else if (animationType === 'scroll-path') {
          const scrollY = window.scrollY
          container.style.transform = `translateX(${scrollY}px)`
        }

        if (charIndex < text.length) {
          charIndex++
        }
      }

      if (
        animationType === 'word-morph' ||
        animationType === 'scroll-path' ||
        (charIndex < text.length &&
          animationType !== 'word-morph' &&
          animationType !== 'scroll-path')
      ) {
        animationFrameId = requestAnimationFrame(animate)
      } else if (animationType === 'glitch') {
        container.textContent = text
      }
    }

    const startAnimation = () => {
      animationFrameId = requestAnimationFrame(animate)
    }

    if (animationType === 'scroll-path') {
      window.addEventListener('scroll', startAnimation)
    } else {
      const timeoutId = setTimeout(startAnimation, delay)
      return () => {
        clearTimeout(timeoutId)
        cancelAnimationFrame(animationFrameId)
      }
    }

    return () => {
      if (animationType === 'scroll-path') {
        window.removeEventListener('scroll', startAnimation)
      }
      cancelAnimationFrame(animationFrameId)
    }
  }, [text, animationType, speed, delay])

  return <div ref={containerRef} className={styles.container}></div>
}

export default AnimatedText
