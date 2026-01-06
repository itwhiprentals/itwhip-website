// app/sys-2847/fleet/edit/components/HostBadges.tsx
'use client'

import { useState } from 'react'

interface Badge {
  id: string
  label: string
  description: string
  icon: JSX.Element
  color: string
  requirements?: string[]
  autoQualify?: (stats: HostStats) => boolean
}

interface HostStats {
  rating?: number
  totalTrips?: number
  responseTime?: number
  responseRate?: number
  joinedDate?: string
  hasElectricVehicles?: boolean
  backgroundChecked?: boolean
  identityVerified?: boolean
}

interface HostBadgesProps {
  selectedBadge?: string
  hostStats?: HostStats
  onChange: (badgeId: string | null) => void
}

const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'super-host',
    label: 'Super Host',
    description: '95%+ rating with 10+ trips',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    color: 'yellow',
    requirements: ['4.95+ rating', '10+ completed trips', '95%+ response rate'],
    autoQualify: (stats) => 
      (stats.rating || 0) >= 4.95 && 
      (stats.totalTrips || 0) >= 10 && 
      (stats.responseRate || 0) >= 95
  },
  {
    id: 'all-star',
    label: 'All-Star Host',
    description: '4.8+ rating with 50+ trips',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    color: 'blue',
    requirements: ['4.8+ rating', '50+ completed trips'],
    autoQualify: (stats) => 
      (stats.rating || 0) >= 4.8 && 
      (stats.totalTrips || 0) >= 50
  },
  {
    id: 'quick-response',
    label: 'Quick Response',
    description: 'Responds within 1 hour',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
    color: 'green',
    requirements: ['Average response time < 60 minutes', '90%+ response rate'],
    autoQualify: (stats) => 
      (stats.responseTime || 999) <= 60 && 
      (stats.responseRate || 0) >= 90
  },
  {
    id: 'top-rated',
    label: 'Top Rated',
    description: 'Consistently 5-star reviews',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
      </svg>
    ),
    color: 'purple',
    requirements: ['4.9+ rating', '20+ trips with 80%+ 5-star reviews'],
    autoQualify: (stats) => 
      (stats.rating || 0) >= 4.9 && 
      (stats.totalTrips || 0) >= 20
  },
  {
    id: 'verified-host',
    label: 'Verified Host',
    description: 'ID and background verified',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    color: 'indigo',
    requirements: ['Government ID verified', 'Background check completed'],
    autoQualify: (stats) => 
      stats.identityVerified === true && 
      stats.backgroundChecked === true
  },
  {
    id: 'eco-friendly',
    label: 'Eco-Friendly',
    description: 'Electric/Hybrid vehicles',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z" />
      </svg>
    ),
    color: 'green',
    requirements: ['Has electric or hybrid vehicles in fleet'],
    autoQualify: (stats) => stats.hasElectricVehicles === true
  },
  {
    id: 'experienced',
    label: 'Experienced Host',
    description: 'Hosting for 2+ years',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    color: 'gray',
    requirements: ['Member for 2+ years', '100+ completed trips'],
    autoQualify: (stats) => {
      if (!stats.joinedDate) return false
      const yearsSinceJoined = (Date.now() - new Date(stats.joinedDate).getTime()) / (365 * 24 * 60 * 60 * 1000)
      return yearsSinceJoined >= 2 && (stats.totalTrips || 0) >= 100
    }
  },
  {
    id: 'premium-fleet',
    label: 'Premium Fleet',
    description: 'Luxury and exotic vehicles',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
      </svg>
    ),
    color: 'red',
    requirements: ['Fleet includes luxury or exotic vehicles'],
    autoQualify: () => false // Manual selection only
  }
]

export function HostBadges({
  selectedBadge,
  hostStats = {},
  onChange
}: HostBadgesProps) {
  const [showQualificationDetails, setShowQualificationDetails] = useState(false)

  // Check which badges the host qualifies for
  const qualifiedBadges = AVAILABLE_BADGES.filter(badge => 
    badge.autoQualify ? badge.autoQualify(hostStats) : true
  )

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      yellow: isSelected 
        ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-700 dark:text-yellow-400'
        : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-yellow-400',
      blue: isSelected
        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
        : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-blue-400',
      green: isSelected
        ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400'
        : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-green-400',
      purple: isSelected
        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-400'
        : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-purple-400',
      indigo: isSelected
        ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-400'
        : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-indigo-400',
      gray: isSelected
        ? 'bg-gray-100 dark:bg-gray-800 border-gray-500 text-gray-700 dark:text-gray-300'
        : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-gray-400',
      red: isSelected
        ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400'
        : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-red-400'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const selectedBadgeData = AVAILABLE_BADGES.find(b => b.id === selectedBadge)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Host Badge
        </h3>
        <button
          type="button"
          onClick={() => setShowQualificationDetails(!showQualificationDetails)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {showQualificationDetails ? 'Hide' : 'Show'} Requirements
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Select one badge to display on your listings. Choose the badge that best represents your hosting strengths.
      </p>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AVAILABLE_BADGES.map(badge => {
          const isQualified = badge.autoQualify ? badge.autoQualify(hostStats) : true
          const isSelected = selectedBadge === badge.id
          
          return (
            <div
              key={badge.id}
              className={`
                relative border-2 rounded-lg p-4 cursor-pointer transition-all
                ${getColorClasses(badge.color, isSelected)}
                ${!isQualified ? 'opacity-50' : ''}
              `}
              onClick={() => isQualified && onChange(isSelected ? null : badge.id)}
            >
              {/* Radio Button */}
              <div className="absolute top-3 right-3">
                <div className={`
                  w-4 h-4 rounded-full border-2 
                  ${isSelected 
                    ? 'border-current' 
                    : 'border-gray-400 dark:border-gray-600'
                  }
                `}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-current m-0.5" />
                  )}
                </div>
              </div>

              {/* Badge Content */}
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-lg
                  ${isSelected 
                    ? 'bg-white/50 dark:bg-black/20' 
                    : 'bg-gray-100 dark:bg-gray-800'
                  }
                `}>
                  {badge.icon}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {badge.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {badge.description}
                  </p>
                  
                  {!isQualified && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      Not qualified yet
                    </p>
                  )}
                  
                  {isQualified && badge.autoQualify && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Auto-qualified
                    </p>
                  )}
                </div>
              </div>

              {/* Requirements (if showing) */}
              {showQualificationDetails && badge.requirements && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Requirements:
                  </p>
                  <ul className="space-y-1">
                    {badge.requirements.map((req, i) => (
                      <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Badge Preview */}
      {selectedBadgeData && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Preview: How it appears to guests
          </h4>
          <div className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            ${getColorClasses(selectedBadgeData.color, true)}
          `}>
            {selectedBadgeData.icon}
            <span className="font-medium">{selectedBadgeData.label}</span>
          </div>
        </div>
      )}

      {/* Current Stats */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Your Stats:</strong> 
          {hostStats.rating && ` ${hostStats.rating}★ rating`}
          {hostStats.totalTrips && ` • ${hostStats.totalTrips} trips`}
          {hostStats.responseRate && ` • ${hostStats.responseRate}% response rate`}
          {hostStats.responseTime && ` • ${hostStats.responseTime}min response time`}
        </p>
      </div>
    </div>
  )
}