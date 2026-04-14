// app/fleet/analytics/components/shared/AnimatedCounter.tsx
// Smooth animated number counter using framer-motion

'use client'

import { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  className?: string
  /** Format the number (e.g., add commas, percentage) */
  format?: (n: number) => string
  /** Duration of animation in seconds */
  duration?: number
}

export default function AnimatedCounter({
  value,
  className = '',
  format,
  duration = 0.8,
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (current) => {
    const rounded = Math.round(current)
    return format ? format(rounded) : rounded.toLocaleString()
  })
  const prevValue = useRef(0)

  useEffect(() => {
    // Only animate if value actually changed
    if (value !== prevValue.current) {
      motionValue.set(value)
      prevValue.current = value
    }
  }, [value, motionValue])

  return <motion.span className={className}>{display}</motion.span>
}
