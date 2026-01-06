// app/sys-2847/fleet/edit/components/reviews/modals/HelpfulCountModal.tsx
'use client'

import { useState } from 'react'
import { Review } from '../utils/reviewHelpers'

interface HelpfulCountModalProps {
  review: Review
  onUpdate: (reviewId: string, newCount: number) => void
  onClose: () => void
}

export function HelpfulCountModal({ 
  review, 
  onUpdate, 
  onClose 
}: HelpfulCountModalProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0)
  const [useRandomDistribution, setUseRandomDistribution] = useState(false)

  const handleSubmit = () => {
    if (helpfulCount < 0) {
      alert('Helpful count cannot be negative')
      return
    }
    if (helpfulCount > 999) {
      alert('Helpful count seems unrealistically high')
      return
    }
    onUpdate(review.id, helpfulCount)
  }

  const generateRealisticCount = () => {
    // Natural distribution - most reviews get few helpful votes
    // Exponential decay pattern
    const random = Math.random()
    let count: number
    
    if (random < 0.40) {
      // 40% get 0-2 helpful votes
      count = Math.floor(Math.random() * 3)
    } else if (random < 0.70) {
      // 30% get 3-7 helpful votes
      count = Math.floor(Math.random() * 5) + 3
    } else if (random < 0.90) {
      // 20% get 8-15 helpful votes
      count = Math.floor(Math.random() * 8) + 8
    } else if (random < 0.98) {
      // 8% get 16-30 helpful votes
      count = Math.floor(Math.random() * 15) + 16
    } else {
      // 2% get 31-50 helpful votes (viral reviews)
      count = Math.floor(Math.random() * 20) + 31
    }
    
    // Adjust based on review age (older reviews might have more)
    if (review.createdAt) {
      const reviewDate = new Date(review.createdAt)
      const now = new Date()
      const monthsOld = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      
      if (monthsOld > 6) {
        count = Math.floor(count * 1.5)
      } else if (monthsOld > 3) {
        count = Math.floor(count * 1.2)
      }
    }
    
    // Adjust based on rating (5-star and 1-star reviews get more engagement)
    if (review.rating === 5 || review.rating === 1) {
      count = Math.floor(count * 1.3)
    }
    
    setHelpfulCount(Math.min(count, 99)) // Cap at 99 for realism
  }

  const incrementBy = (amount: number) => {
    setHelpfulCount(prev => Math.min(prev + amount, 999))
  }

  const decrementBy = (amount: number) => {
    setHelpfulCount(prev => Math.max(prev - amount, 0))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit Helpful Count
        </h3>
        
        {/* Review Context */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {review.reviewerProfile?.name || review.reviewer?.name || 'Guest'}
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i}
                  className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-2">
            "{review.comment.substring(0, 100)}{review.comment.length > 100 ? '...' : ''}"
          </p>
          {review.createdAt && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Posted: {new Date(review.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Manual Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Helpful Count
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={helpfulCount}
                onChange={(e) => setHelpfulCount(parseInt(e.target.value) || 0)}
                min="0"
                max="999"
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-center text-lg font-semibold"
              />
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => incrementBy(1)}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => decrementBy(1)}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Quick Adjustment Buttons */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => incrementBy(5)}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => incrementBy(10)}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => decrementBy(5)}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => decrementBy(10)}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => setHelpfulCount(0)}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
          </div>
          
          {/* Realistic Generation */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Generate Realistic Count
              </label>
              <button
                type="button"
                onClick={generateRealisticCount}
                className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Creates a natural distribution based on review age, rating, and typical engagement patterns
            </p>
          </div>
          
          {/* Distribution Guide */}
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p className="font-semibold mb-1">Typical distribution:</p>
            <p>• 40% of reviews: 0-2 helpful votes</p>
            <p>• 30% of reviews: 3-7 helpful votes</p>
            <p>• 20% of reviews: 8-15 helpful votes</p>
            <p>• 8% of reviews: 16-30 helpful votes</p>
            <p>• 2% of reviews: 31+ (viral reviews)</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            Update Count
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}