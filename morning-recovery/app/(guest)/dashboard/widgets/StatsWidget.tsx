// app/(guest)/dashboard/widgets/StatsWidget.tsx
// Stats Widget - Displays user statistics and achievements

'use client'

import { useState } from 'react'
import { 
  IoTrophyOutline,
  IoFlameOutline,
  IoRocketOutline,
  IoStarOutline,
  IoTrendingUpOutline,
  IoCalendarOutline,
  IoSparklesOutline,
  IoChevronForwardOutline,
  IoLeafOutline,
  IoCashOutline
} from 'react-icons/io5'

interface StatsWidgetProps {
  stats?: {
    totalSaved?: number
    ridesCompleted?: number
    hotelsBooked?: number
    carbonOffset?: number
    memberSince?: string
    tierStatus?: string
    pointsBalance?: number
    monthlySpend?: number
    servicesUsed?: {
      rides?: boolean
      hotels?: boolean
      food?: boolean
      rentals?: boolean
      flights?: boolean
      bundles?: boolean
    }
  }
}

export default function StatsWidget({ stats }: StatsWidgetProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  // Calculate level based on points
  const calculateLevel = (points: number = 0) => {
    if (points < 1000) return { level: 1, title: 'Bronze', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    if (points < 2500) return { level: 2, title: 'Silver', color: 'text-gray-600', bgColor: 'bg-gray-100' }
    if (points < 5000) return { level: 3, title: 'Gold', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    return { level: 4, title: 'Platinum', color: 'text-purple-600', bgColor: 'bg-purple-100' }
  }

  const level = calculateLevel(stats?.pointsBalance)
  const pointsToNextLevel = level.level < 4 ? 
    (level.level === 1 ? 1000 : level.level === 2 ? 2500 : 5000) - (stats?.pointsBalance || 0) : 0

  // Calculate progress percentage
  const progressPercentage = level.level < 4 ? 
    ((stats?.pointsBalance || 0) % (level.level === 1 ? 1000 : level.level === 2 ? 1500 : 2500)) / 
    (level.level === 1 ? 1000 : level.level === 2 ? 1500 : 2500) * 100 : 100

  // Count services used
  const servicesUsedCount = stats?.servicesUsed ? 
    Object.values(stats.servicesUsed).filter(Boolean).length : 0

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <IoTrophyOutline className="w-5 h-5 mr-2 text-yellow-500" />
          Your Stats
        </h3>
        <div className="flex items-center space-x-1">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as any)}
              className={`px-2 py-1 text-xs rounded ${
                selectedPeriod === period
                  ? 'bg-green-100 text-green-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tier Status */}
      <div className={`${level.bgColor} rounded-lg p-3 mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <IoSparklesOutline className={`w-5 h-5 mr-2 ${level.color}`} />
            <span className={`font-semibold ${level.color}`}>
              {stats?.tierStatus || level.title} Member
            </span>
          </div>
          <span className={`text-sm ${level.color}`}>
            Level {level.level}
          </span>
        </div>
        
        {/* Progress Bar */}
        {level.level < 4 && (
          <div className="mt-2">
            <div className="bg-white/50 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs mt-1 text-gray-600">
              {pointsToNextLevel} points to next level
            </p>
          </div>
        )}
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <IoCashOutline className="w-5 h-5 text-green-600" />
            <IoTrendingUpOutline className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            ${(stats?.totalSaved || 1247.50).toFixed(0)}
          </p>
          <p className="text-xs text-gray-600">Total Saved</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <IoFlameOutline className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">
              {servicesUsedCount}/6
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {stats?.ridesCompleted || 23}
          </p>
          <p className="text-xs text-gray-600">Trips Completed</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <IoStarOutline className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {(stats?.pointsBalance || 3450).toLocaleString()}
          </p>
          <p className="text-xs text-gray-600">Points Balance</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <IoLeafOutline className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {stats?.carbonOffset || 45.2}
            <span className="text-sm font-normal">kg</span>
          </p>
          <p className="text-xs text-gray-600">CO₂ Saved</p>
        </div>
      </div>

      {/* Services Used */}
      <div className="border-t border-gray-100 pt-3 mb-3">
        <p className="text-xs text-gray-500 mb-2">Services Used</p>
        <div className="flex flex-wrap gap-1">
          {[
            { key: 'rides', label: 'Rides', color: 'green' },
            { key: 'hotels', label: 'Hotels', color: 'blue' },
            { key: 'food', label: 'Food', color: 'orange' },
            { key: 'rentals', label: 'Rentals', color: 'purple' },
            { key: 'flights', label: 'Flights', color: 'pink' },
            { key: 'bundles', label: 'Bundles', color: 'red' }
          ].map(service => {
            const isUsed = stats?.servicesUsed?.[service.key as keyof typeof stats.servicesUsed]
            return (
              <span
                key={service.key}
                className={`px-2 py-1 text-xs rounded-full ${
                  isUsed
                    ? `bg-${service.color}-100 text-${service.color}-700 font-medium`
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {service.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Member Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center">
          <IoCalendarOutline className="w-4 h-4 mr-1" />
          <span>Member since {stats?.memberSince || 'Jan 2024'}</span>
        </div>
        <button className="flex items-center text-green-600 hover:text-green-700 font-medium">
          View all
          <IoChevronForwardOutline className="w-3 h-3 ml-1" />
        </button>
      </div>

      {/* Achievement Banner */}
      {stats?.ridesCompleted && stats.ridesCompleted > 20 && (
        <div className="mt-3 p-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
          <div className="flex items-center">
            <IoRocketOutline className="w-5 h-5 text-orange-600 mr-2" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900">Power User!</p>
              <p className="text-xs text-gray-600">You're in the top 10% of users</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}