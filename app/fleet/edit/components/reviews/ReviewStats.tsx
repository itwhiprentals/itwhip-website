// app/sys-2847/fleet/edit/components/reviews/ReviewStats.tsx
'use client'

import { ReviewStats as ReviewStatsType } from './utils/reviewHelpers'

interface ReviewStatsProps {
  stats: ReviewStatsType | null
  loading?: boolean
}

export function ReviewStats({ stats, loading }: ReviewStatsProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No reviews yet
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Average Rating */}
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {stats.average.toFixed(1)}
        </div>
        <StarRating rating={Math.round(stats.average)} />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Based on {stats.total} review{stats.total !== 1 ? 's' : ''}
        </p>
        
        {/* Quality Indicator */}
        <div className="mt-4">
          <QualityIndicator average={stats.average} total={stats.total} />
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {stats.distribution.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 w-4">{rating}</span>
            <svg className="w-4 h-4 text-yellow-400 fill-current">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 relative overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-yellow-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
              {count}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500 w-12 text-right">
              {percentage}%
            </span>
          </div>
        ))}
        
        {/* Distribution Analysis */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <DistributionAnalysis distribution={stats.distribution} />
        </div>
      </div>
    </div>
  )
}

// Helper component for star rating display
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map(star => (
        <svg 
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// Quality indicator based on rating and review count
function QualityIndicator({ average, total }: { average: number; total: number }) {
  let label = ''
  let color = ''
  
  if (total === 0) {
    return null
  } else if (average >= 4.8 && total >= 10) {
    label = 'Outstanding'
    color = 'text-green-600 dark:text-green-400'
  } else if (average >= 4.5) {
    label = 'Excellent'
    color = 'text-green-600 dark:text-green-400'
  } else if (average >= 4.0) {
    label = 'Very Good'
    color = 'text-blue-600 dark:text-blue-400'
  } else if (average >= 3.5) {
    label = 'Good'
    color = 'text-yellow-600 dark:text-yellow-400'
  } else if (average >= 3.0) {
    label = 'Fair'
    color = 'text-orange-600 dark:text-orange-400'
  } else {
    label = 'Needs Improvement'
    color = 'text-red-600 dark:text-red-400'
  }
  
  return (
    <span className={`text-sm font-semibold ${color}`}>
      {label}
    </span>
  )
}

// Analysis of the distribution pattern
function DistributionAnalysis({ distribution }: { distribution: ReviewStatsType['distribution'] }) {
  const fiveStarPercentage = distribution.find(d => d.rating === 5)?.percentage || 0
  const oneStarPercentage = distribution.find(d => d.rating === 1)?.percentage || 0
  const fourFivePercentage = (distribution.find(d => d.rating === 5)?.percentage || 0) + 
                             (distribution.find(d => d.rating === 4)?.percentage || 0)
  
  let analysis = ''
  let alertLevel = ''
  
  if (fiveStarPercentage > 90) {
    analysis = 'Suspiciously high 5-star ratio'
    alertLevel = 'text-amber-600 dark:text-amber-400'
  } else if (fourFivePercentage > 85) {
    analysis = 'Excellent satisfaction rate'
    alertLevel = 'text-green-600 dark:text-green-400'
  } else if (fourFivePercentage > 70) {
    analysis = 'Good overall satisfaction'
    alertLevel = 'text-blue-600 dark:text-blue-400'
  } else if (oneStarPercentage > 30) {
    analysis = 'High dissatisfaction rate'
    alertLevel = 'text-red-600 dark:text-red-400'
  } else {
    analysis = 'Mixed feedback'
    alertLevel = 'text-gray-600 dark:text-gray-400'
  }
  
  return (
    <div className="text-xs space-y-1">
      <p className={`font-medium ${alertLevel}`}>{analysis}</p>
      <p className="text-gray-500 dark:text-gray-400">
        {fourFivePercentage.toFixed(0)}% positive (4-5 stars)
      </p>
    </div>
  )
}