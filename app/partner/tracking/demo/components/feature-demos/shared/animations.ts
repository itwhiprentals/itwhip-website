// app/partner/tracking/demo/components/feature-demos/shared/animations.ts
import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook for phase-based animations with auto-progression
 */
export function usePhaseAnimation(
  totalPhases: number,
  intervalMs: number = 500,
  autoStart: boolean = false
) {
  const [phase, setPhase] = useState(0)
  const [isRunning, setIsRunning] = useState(autoStart)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    setPhase(0)
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    setPhase(0)
  }, [stop])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setPhase(prev => {
          if (prev >= totalPhases - 1) {
            setIsRunning(false)
            return prev
          }
          return prev + 1
        })
      }, intervalMs)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, totalPhases, intervalMs])

  return { phase, isRunning, start, stop, reset, setPhase }
}

/**
 * Hook for generating signal wave animations
 */
export function useSignalWaves(maxWaves: number = 3, intervalMs: number = 300) {
  const [waveCount, setWaveCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const trigger = useCallback(async () => {
    setIsAnimating(true)
    setWaveCount(0)

    for (let i = 1; i <= maxWaves; i++) {
      await new Promise(resolve => setTimeout(resolve, intervalMs))
      setWaveCount(i)
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs * 2))
    setIsAnimating(false)
    setWaveCount(0)
  }, [maxWaves, intervalMs])

  return { waveCount, isAnimating, trigger }
}

/**
 * Hook for smooth value transitions
 */
export function useAnimatedValue(
  targetValue: number,
  duration: number = 1000,
  easing: 'linear' | 'easeOut' | 'easeInOut' = 'easeOut'
) {
  const [currentValue, setCurrentValue] = useState(targetValue)
  const startValueRef = useRef(targetValue)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    startValueRef.current = currentValue
    startTimeRef.current = null

    const easingFunctions = {
      linear: (t: number) => t,
      easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
      easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easingFunctions[easing](progress)

      const newValue = startValueRef.current + (targetValue - startValueRef.current) * easedProgress
      setCurrentValue(newValue)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [targetValue, duration, easing])

  return currentValue
}

/**
 * Hook for pulsing/breathing animations
 */
export function usePulseAnimation(intervalMs: number = 1000) {
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(prev => !prev)
    }, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs])

  return isPulsing
}

/**
 * Hook for countdown timer
 */
export function useCountdown(initialSeconds: number, autoStart: boolean = false) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)

  const start = useCallback((fromSeconds?: number) => {
    if (fromSeconds !== undefined) {
      setSeconds(fromSeconds)
    }
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setSeconds(initialSeconds)
    setIsRunning(false)
  }, [initialSeconds])

  useEffect(() => {
    if (!isRunning || seconds <= 0) return

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, seconds])

  return { seconds, isRunning, start, stop, reset }
}

/**
 * Format seconds to MM:SS string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
