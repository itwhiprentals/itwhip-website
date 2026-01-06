// app/(guest)/rentals/components/review/GuestReviewForm.tsx

'use client'

import { useState } from 'react'
import { 
  IoStar, 
  IoStarOutline,
  IoInformationCircle
} from 'react-icons/io5'

interface GuestReviewFormProps {
  booking: {
    id: string
    car: {
      make: string
      model: string
      year: number
    }
    host: {
      name: string
    }
    tripStartedAt: string
    tripEndedAt: string
  }
  onSubmit: (reviewData: any) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

interface CategoryRatings {
  cleanliness?: number
  accuracy?: number
  communication?: number
  convenience?: number
  value?: number
}

export default function GuestReviewForm({ 
  booking, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: GuestReviewFormProps) {
  // Form state
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatings>({})
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showCategories, setShowCategories] = useState(false)

  // Character count
  const minCommentLength = 50
  const maxCommentLength = 1000
  const remainingChars = minCommentLength - comment.length

  // Rating categories
  const categories = [
    { key: 'cleanliness', label: 'Cleanliness', description: 'How clean was the vehicle?' },
    { key: 'accuracy', label: 'Accuracy', description: 'Did the car match the listing?' },
    { key: 'communication', label: 'Communication', description: 'How was the host communication?' },
    { key: 'convenience', label: 'Convenience', description: 'How easy was pickup/dropoff?' },
    { key: 'value', label: 'Value', description: 'Was it worth the price?' }
  ]

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (rating === 0) {
      newErrors.rating = 'Please select a rating'
    }

    if (comment.trim().length < minCommentLength) {
      newErrors.comment = `Review must be at least ${minCommentLength} characters`
    }

    if (comment.trim().length > maxCommentLength) {
      newErrors.comment = `Review must be less than ${maxCommentLength} characters`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const reviewData = {
      rating,
      title: title.trim() || null,
      comment: comment.trim(),
      ...categoryRatings
    }

    await onSubmit(reviewData)
  }

  // Star rating component
  const StarRating = ({ 
    value, 
    onChange, 
    size = 'large',
    label 
  }: { 
    value: number
    onChange: (rating: number) => void
    size?: 'small' | 'large'
    label?: string
  }) => {
    const [localHover, setLocalHover] = useState(0)
    const starSize = size === 'large' ? 'w-8 h-8' : 'w-5 h-5'

    return (
      <div className="flex items-center gap-2">
        {label && (
          <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[100px]">
            {label}
          </span>
        )}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setLocalHover(star)}
              onMouseLeave={() => setLocalHover(0)}
              className="transition-transform hover:scale-110"
            >
              {star <= (localHover || value) ? (
                <IoStar className={`${starSize} text-amber-400 fill-current`} />
              ) : (
                <IoStarOutline className={`${starSize} text-gray-300`} />
              )}
            </button>
          ))}
        </div>
        {size === 'large' && value > 0 && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {value === 5 && 'Excellent'}
            {value === 4 && 'Good'}
            {value === 3 && 'Average'}
            {value === 2 && 'Poor'}
            {value === 1 && 'Terrible'}
          </span>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trip Info */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium text-gray-900 dark:text-white mb-1">
            {booking.car.year} {booking.car.make} {booking.car.model}
          </p>
          <p>
            Hosted by {booking.host.name}
          </p>
          <p className="text-xs mt-1">
            Trip: {new Date(booking.tripStartedAt).toLocaleDateString()} - {new Date(booking.tripEndedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Overall Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Overall Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex justify-center">
          <StarRating
            value={rating}
            onChange={(r) => {
              setRating(r)
              setErrors({ ...errors, rating: '' })
              // Show category ratings after selecting overall rating
              if (r > 0 && !showCategories) {
                setShowCategories(true)
              }
            }}
            size="large"
          />
        </div>
        {errors.rating && (
          <p className="mt-2 text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {/* Category Ratings (Optional) */}
      {showCategories && (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rate Specific Aspects (Optional)
            </h4>
            <button
              type="button"
              onClick={() => setShowCategories(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Skip
            </button>
          </div>
          {categories.map(({ key, label, description }) => (
            <div key={key} className="space-y-1">
              <StarRating
                value={categoryRatings[key as keyof CategoryRatings] || 0}
                onChange={(r) => setCategoryRatings({ ...categoryRatings, [key]: r })}
                size="small"
                label={label}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-[108px]">
                {description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Review Title (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Review Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience in a few words"
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Review Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => {
            setComment(e.target.value)
            setErrors({ ...errors, comment: '' })
          }}
          placeholder="Tell others about your experience with this car and host..."
          rows={5}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
            errors.comment ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {remainingChars > 0 ? (
              <span className="text-amber-600">
                {remainingChars} more characters needed
              </span>
            ) : (
              <span>{comment.length} / {maxCommentLength} characters</span>
            )}
          </div>
          {errors.comment && (
            <p className="text-xs text-red-600">{errors.comment}</p>
          )}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <div className="flex gap-2">
          <IoInformationCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-900 dark:text-gray-100 space-y-1">
            <p className="font-medium">Review Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Be honest and constructive</li>
              <li>Focus on your actual experience</li>
              <li>Mention both positives and areas for improvement</li>
              <li>Keep it respectful and professional</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}