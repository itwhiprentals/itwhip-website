// app/admin/components/RiskIndicator.tsx
'use client'

import React from 'react'
import {
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoAlertCircleOutline,
  IoCloseCircleOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface RiskIndicatorProps {
  score: number
  level?: 'low' | 'medium' | 'high' | 'critical'
  size?: 'small' | 'medium' | 'large'
  showDetails?: boolean
  flags?: string[]
  requiresReview?: boolean
  className?: string
}

export default function RiskIndicator({
  score,
  level,
  size = 'medium',
  showDetails = false,
  flags = [],
  requiresReview = false,
  className = ''
}: RiskIndicatorProps) {
  // Determine risk level from score if not provided
  const riskLevel = level || getRiskLevel(score)
  
  // Get color scheme based on risk level
  const colorScheme = getColorScheme(riskLevel)
  
  // Get size classes
  const sizeClasses = getSizeClasses(size)

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Risk Score Badge */}
      <div className={`relative ${sizeClasses.container}`}>
        {/* Circular Progress Indicator */}
        <div className="relative">
          <svg
            className={`transform -rotate-90 ${sizeClasses.svg}`}
            viewBox="0 0 36 36"
          >
            {/* Background Circle */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-gray-200 dark:stroke-gray-700"
              strokeWidth="2"
            />
            {/* Progress Circle */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className={`${colorScheme.stroke} transition-all duration-500`}
              strokeWidth="2"
              strokeDasharray={`${(score / 100) * 100} 100`}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Score Display */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${sizeClasses.text}`}>
            <span className={`font-bold ${colorScheme.text}`}>
              {score}
            </span>
            {size !== 'small' && (
              <span className={`text-xs ${colorScheme.textMuted}`}>
                risk
              </span>
            )}
          </div>
        </div>

        {/* Risk Level Badge */}
        <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-medium ${colorScheme.badge}`}>
          {riskLevel.toUpperCase()}
        </div>
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="ml-4 flex-1">
          {/* Risk Level with Icon */}
          <div className="flex items-center mb-1">
            {getRiskIcon(riskLevel, colorScheme.text)}
            <span className={`ml-1 font-semibold ${sizeClasses.title} ${colorScheme.text}`}>
              {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
            </span>
            {requiresReview && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Review Required
              </span>
            )}
          </div>

          {/* Top Risk Flags */}
          {flags.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {flags.slice(0, 3).map((flag, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                      getFlagSeverity(flag).color
                    }`}
                  >
                    {getFlagSeverity(flag).icon}
                    <span className="ml-1">{formatFlag(flag)}</span>
                  </span>
                ))}
                {flags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                    +{flags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Risk Breakdown Bar */}
          {size === 'large' && (
            <div className="mt-3">
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
                Risk Distribution
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <div
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${Math.max(0, 30 - score)}%` }}
                />
                <div
                  className="bg-yellow-500 transition-all duration-500"
                  style={{ width: `${score >= 30 && score < 50 ? 20 : 0}%` }}
                />
                <div
                  className="bg-orange-500 transition-all duration-500"
                  style={{ width: `${score >= 50 && score < 70 ? 20 : 0}%` }}
                />
                <div
                  className="bg-red-500 transition-all duration-500"
                  style={{ width: `${score >= 70 ? score - 70 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for tables
export function RiskBadge({ score, level }: { score: number; level?: string }) {
  const riskLevel = level || getRiskLevel(score)
  const colorScheme = getColorScheme(riskLevel)
  
  return (
    <div className="inline-flex items-center">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorScheme.badge}`}>
        {getRiskIcon(riskLevel, 'w-3 h-3 mr-1')}
        {score}
        <span className="ml-1 opacity-75">
          {riskLevel}
        </span>
      </span>
    </div>
  )
}

// Mini version for inline display
export function RiskDot({ score }: { score: number }) {
  const riskLevel = getRiskLevel(score)
  const colorScheme = getColorScheme(riskLevel)
  
  return (
    <span className="relative inline-flex items-center">
      <span className={`inline-flex h-2 w-2 rounded-full ${colorScheme.bg}`} />
      {score >= 70 && (
        <span className={`absolute inline-flex h-2 w-2 rounded-full ${colorScheme.bg} animate-ping`} />
      )}
    </span>
  )
}

// Helper Functions
function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 70) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}

function getColorScheme(level: string) {
  switch (level) {
    case 'critical':
      return {
        stroke: 'stroke-red-500',
        text: 'text-red-600 dark:text-red-400',
        textMuted: 'text-red-500/70',
        bg: 'bg-red-500',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        border: 'border-red-500'
      }
    case 'high':
      return {
        stroke: 'stroke-orange-500',
        text: 'text-orange-600 dark:text-orange-400',
        textMuted: 'text-orange-500/70',
        bg: 'bg-orange-500',
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        border: 'border-orange-500'
      }
    case 'medium':
      return {
        stroke: 'stroke-yellow-500',
        text: 'text-yellow-600 dark:text-yellow-400',
        textMuted: 'text-yellow-500/70',
        bg: 'bg-yellow-500',
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        border: 'border-yellow-500'
      }
    default:
      return {
        stroke: 'stroke-green-500',
        text: 'text-green-600 dark:text-green-400',
        textMuted: 'text-green-500/70',
        bg: 'bg-green-500',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        border: 'border-green-500'
      }
  }
}

function getSizeClasses(size: string) {
  switch (size) {
    case 'small':
      return {
        container: 'w-12 h-12',
        svg: 'w-12 h-12',
        text: 'text-sm',
        title: 'text-sm'
      }
    case 'large':
      return {
        container: 'w-24 h-24',
        svg: 'w-24 h-24',
        text: 'text-lg',
        title: 'text-base'
      }
    default:
      return {
        container: 'w-16 h-16',
        svg: 'w-16 h-16',
        text: 'text-base',
        title: 'text-sm'
      }
  }
}

function getRiskIcon(level: string, className: string) {
  switch (level) {
    case 'critical':
      return <IoCloseCircleOutline className={className} />
    case 'high':
      return <IoAlertCircleOutline className={className} />
    case 'medium':
      return <IoWarningOutline className={className} />
    default:
      return <IoShieldCheckmarkOutline className={className} />
  }
}

function getFlagSeverity(flag: string) {
  // Critical flags
  if (['bot_detected', 'fake_name', 'tor_detected', 'fraudulent_pattern'].includes(flag)) {
    return {
      color: 'bg-red-100 text-red-700',
      icon: <IoCloseCircleOutline className="w-3 h-3" />
    }
  }
  
  // High severity flags
  if (['vpn_detected', 'disposable_email', 'excessive_velocity', 'very_short_session'].includes(flag)) {
    return {
      color: 'bg-orange-100 text-orange-700',
      icon: <IoAlertCircleOutline className="w-3 h-3" />
    }
  }
  
  // Medium severity flags
  if (['high_risk_country', 'copy_paste_used', 'quick_booking'].includes(flag)) {
    return {
      color: 'bg-yellow-100 text-yellow-700',
      icon: <IoWarningOutline className="w-3 h-3" />
    }
  }
  
  // Low severity flags
  return {
    color: 'bg-gray-100 text-gray-700',
    icon: <IoInformationCircleOutline className="w-3 h-3" />
  }
}

function formatFlag(flag: string): string {
  return flag
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}