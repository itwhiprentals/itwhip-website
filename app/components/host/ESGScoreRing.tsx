// app/components/host/ESGScoreRing.tsx
'use client'

import { useEffect, useState } from 'react'

interface ESGScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  showLabel?: boolean
  animated?: boolean
  strokeWidth?: number
}

export default function ESGScoreRing({
  score,
  size = 'md',
  label,
  showLabel = true,
  animated = true,
  strokeWidth,
}: ESGScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0)

  // Animate score on mount
  useEffect(() => {
    if (animated) {
      const duration = 1000 // 1 second
      const steps = 60
      const increment = score / steps
      let currentStep = 0

      const timer = setInterval(() => {
        currentStep++
        setDisplayScore(Math.min(Math.round(increment * currentStep), score))

        if (currentStep >= steps) {
          clearInterval(timer)
        }
      }, duration / steps)

      return () => clearInterval(timer)
    } else {
      setDisplayScore(score)
    }
  }, [score, animated])

  // Size configurations (REDUCED by ~20%)
  const sizeConfig = {
    sm: {
      width: 64,
      height: 64,
      radius: 26,
      stroke: strokeWidth || 5,
      fontSize: 'text-base',
      labelSize: 'text-xs',
    },
    md: {
      width: 96,
      height: 96,
      radius: 38,
      stroke: strokeWidth || 6,
      fontSize: 'text-xl',
      labelSize: 'text-sm',
    },
    lg: {
      width: 128,
      height: 128,
      radius: 52,
      stroke: strokeWidth || 8,
      fontSize: 'text-2xl',
      labelSize: 'text-base',
    },
    xl: {
      width: 160,
      height: 160,
      radius: 64,
      stroke: strokeWidth || 10,
      fontSize: 'text-3xl',
      labelSize: 'text-lg',
    },
  }

  const config = sizeConfig[size]
  const circumference = 2 * Math.PI * config.radius
  const offset = circumference - (displayScore / 100) * circumference

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10B981' // green-500
    if (score >= 70) return '#F59E0B' // yellow-500
    if (score >= 50) return '#F97316' // orange-500
    return '#EF4444' // red-500
  }

  // Get text color class
  const getTextColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 50) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const strokeColor = getScoreColor(score)
  const textColorClass = getTextColor(score)

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${config.fontSize} ${textColorClass}`}>
            {displayScore}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">/ 100</span>
        </div>
      </div>

      {/* Label below ring */}
      {showLabel && label && (
        <p className={`mt-2 font-medium text-gray-700 dark:text-gray-300 ${config.labelSize} text-center`}>
          {label}
        </p>
      )}
    </div>
  )
}