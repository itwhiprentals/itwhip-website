// app/partner/tracking/demo/components/feature-demos/FeatureCard.tsx
'use client'

import { IconType } from 'react-icons'

// Color mappings for backgrounds and borders
const COLOR_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-500/10',
    border: 'border-green-200 dark:border-green-500/20',
    text: 'text-green-600 dark:text-green-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-200 dark:border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400'
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    border: 'border-cyan-200 dark:border-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400'
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
    border: 'border-yellow-200 dark:border-yellow-500/20',
    text: 'text-yellow-600 dark:text-yellow-400'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
    text: 'text-red-600 dark:text-red-400'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    border: 'border-orange-200 dark:border-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400'
  }
}

export interface FeatureCardConfig {
  id: string
  icon: IconType
  label: string
  description: string
  providers: string[]
  color: string
}

interface FeatureCardProps {
  feature: FeatureCardConfig
  onClick: () => void
  isActive?: boolean
  className?: string
}

export default function FeatureCard({
  feature,
  onClick,
  isActive = false,
  className = ''
}: FeatureCardProps) {
  const Icon = feature.icon
  const styles = COLOR_STYLES[feature.color] || COLOR_STYLES.blue

  return (
    <button
      onClick={onClick}
      className={`
        group relative text-left p-3 sm:p-4 rounded-lg border transition-all duration-200
        hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${styles.bg} ${styles.border}
        ${isActive ? 'ring-2 ring-blue-500' : ''}
        ${className}
      `}
    >
      {/* Icon */}
      <div className={`mb-2 sm:mb-3 ${styles.text}`}>
        <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
      </div>

      {/* Label */}
      <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1">
        {feature.label}
      </h4>

      {/* Description */}
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {feature.description}
      </p>

      {/* Provider count badge */}
      <div className="mt-2 sm:mt-3 flex items-center gap-1">
        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          {feature.providers.length} provider{feature.providers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Hover indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className={`w-4 h-4 ${styles.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
