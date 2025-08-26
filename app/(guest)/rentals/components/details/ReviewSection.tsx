// app/(guest)/rentals/components/details/ReviewSection.tsx
'use client'

import { IoStarOutline, IoStar } from 'react-icons/io5'

interface ReviewSectionProps {
  carId: string
  reviews?: any[]
}

export default function ReviewSection({ carId, reviews = [] }: ReviewSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Reviews
      </h2>
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <IoStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < (review.rating || 0) ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {review.date || 'Recently'}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{review.comment || 'No comment'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                - {review.reviewer || 'Anonymous'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
      )}
    </div>
  )
}
