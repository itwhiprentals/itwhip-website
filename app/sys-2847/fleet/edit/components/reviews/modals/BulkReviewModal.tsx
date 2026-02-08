// app/sys-2847/fleet/edit/components/reviews/modals/BulkReviewModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { ReviewerProfile } from '../utils/reviewHelpers'

interface BulkReviewModalProps {
  carId: string
  carName: string
  reviewerProfiles: ReviewerProfile[]
  onClose: () => void
  onComplete: () => void
}

interface GeneratedReview {
  id: string
  selected: boolean
  rating: number
  title: string
  comment: string
  reviewerProfile?: ReviewerProfile
  newReviewerName?: string
  newReviewerCity?: string
  newReviewerState?: string
  useExistingProfile: boolean
  tripStartDate: string
  tripEndDate: string
  reviewDate: string
  helpfulCount: number
  isVerified: boolean
  isPinned: boolean
}

export function BulkReviewModal({ carId, carName, reviewerProfiles, onClose, onComplete }: BulkReviewModalProps) {
  // Configuration state
  const [startDate, setStartDate] = useState('2025-01-10')
  const [endDate, setEndDate] = useState('2025-09-10')
  const [reviewCount, setReviewCount] = useState(15)
  const [reviewMix, setReviewMix] = useState<'realistic' | 'positive' | 'custom'>('realistic')
  const [reviewerSelection, setReviewerSelection] = useState<'new' | 'existing' | 'mixed'>('mixed')
  
  // Generated reviews state
  const [generatedReviews, setGeneratedReviews] = useState<GeneratedReview[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [usedProfileIds, setUsedProfileIds] = useState<Set<string>>(new Set())
  
  // Custom mix percentages
  const [customMix, setCustomMix] = useState({
    fiveStar: 65,
    fourStar: 25,
    threeStar: 8,
    twoStar: 2,
    oneStar: 0
  })

  // Get already used profiles for this car
  useEffect(() => {
    fetchUsedProfiles()
  }, [carId])

  const fetchUsedProfiles = async () => {
    try {
      const response = await fetch(`/sys-2847/fleet/api/cars/${carId}/reviews`)
      if (response.ok) {
        const data = await response.json()
        const usedIds = new Set<string>(
          (data.data?.reviews
            ?.filter((r: any) => r.reviewerProfile?.id)
            .map((r: any) => r.reviewerProfile.id) || []) as string[]
        )
        setUsedProfileIds(usedIds)
      }
    } catch (error) {
      console.error('Error fetching used profiles:', error)
    }
  }

  const getAvailableProfiles = () => {
    // Filter out profiles already used for this car
    return reviewerProfiles.filter(p => !usedProfileIds.has(p.id))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/sys-2847/fleet/api/cars/${carId}/reviews/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          count: reviewCount,
          mix: reviewMix,
          customMix: reviewMix === 'custom' ? customMix : undefined,
          reviewerSelection,
          excludeProfileIds: Array.from(usedProfileIds)
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedReviews(data.reviews.map((r: any) => ({ 
          ...r, 
          selected: true,
          useExistingProfile: !!r.reviewerProfile 
        })))
        setShowPreview(true)
      } else {
        alert('Failed to generate reviews')
      }
    } catch (error) {
      console.error('Error generating reviews:', error)
      alert('Failed to generate reviews')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveSelected = async () => {
    const selectedReviews = generatedReviews.filter(r => r.selected)
    if (selectedReviews.length === 0) {
      alert('Please select at least one review to save')
      return
    }

    setIsSaving(true)
    let savedCount = 0
    let failedCount = 0

    for (const review of selectedReviews) {
      try {
        const reviewData: any = {
          source: 'SEED',
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          tripStartDate: review.tripStartDate,
          tripEndDate: review.tripEndDate,
          createdAt: review.reviewDate,
          helpfulCount: review.helpfulCount,
          isVerified: review.isVerified,
          isPinned: review.isPinned,
          isVisible: true
        }

        // Handle reviewer based on type
        if (review.useExistingProfile && review.reviewerProfile) {
          reviewData.reviewerProfileId = review.reviewerProfile.id
        } else {
          // Create new profile
          reviewData.createNewProfile = true
          reviewData.reviewerName = review.newReviewerName || `Guest ${Math.floor(Math.random() * 10000)}`
          reviewData.reviewerCity = review.newReviewerCity || 'Phoenix'
          reviewData.reviewerState = review.newReviewerState || 'AZ'
        }

        const response = await fetch(`/sys-2847/fleet/api/cars/${carId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewData)
        })

        if (response.ok) {
          savedCount++
        } else {
          failedCount++
        }
      } catch (error) {
        console.error('Error saving review:', error)
        failedCount++
      }
    }

    if (failedCount > 0) {
      alert(`Saved ${savedCount} reviews. ${failedCount} failed.`)
    }

    setIsSaving(false)
    onComplete()
  }

  const toggleReviewSelection = (id: string) => {
    setGeneratedReviews(prev => prev.map(r => 
      r.id === id ? { ...r, selected: !r.selected } : r
    ))
  }

  const selectAll = () => {
    setGeneratedReviews(prev => prev.map(r => ({ ...r, selected: true })))
  }

  const deselectAll = () => {
    setGeneratedReviews(prev => prev.map(r => ({ ...r, selected: false })))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const availableProfiles = getAvailableProfiles()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {!showPreview ? (
          // Configuration Screen
          <div className="p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Quick Add Multiple Reviews
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adding reviews for: <span className="font-semibold">{carName}</span>
              </p>
            </div>

            <div className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Number of Reviews */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Reviews: {reviewCount}
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={reviewCount}
                  onChange={(e) => setReviewCount(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>5</span>
                  <span>15</span>
                  <span>30</span>
                </div>
              </div>

              {/* Reviewer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reviewer Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="new"
                      checked={reviewerSelection === 'new'}
                      onChange={(e) => setReviewerSelection(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      All New Reviewers (creates new profiles)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="existing"
                      checked={reviewerSelection === 'existing'}
                      onChange={(e) => setReviewerSelection(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Use Existing Profiles Only ({availableProfiles.length} available)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="mixed"
                      checked={reviewerSelection === 'mixed'}
                      onChange={(e) => setReviewerSelection(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Mix of New and Existing
                    </span>
                  </label>
                </div>
              </div>

              {/* Review Mix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Mix
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="realistic"
                      checked={reviewMix === 'realistic'}
                      onChange={(e) => setReviewMix(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Realistic (65% excellent, 25% good, 10% mixed)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="positive"
                      checked={reviewMix === 'positive'}
                      onChange={(e) => setReviewMix(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      All Positive (100% 4-5 stars)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="custom"
                      checked={reviewMix === 'custom'}
                      onChange={(e) => setReviewMix(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Custom Mix
                    </span>
                  </label>
                </div>
              </div>

              {/* Custom Mix Controls */}
              {reviewMix === 'custom' && (
                <div className="pl-6 space-y-2 border-l-2 border-gray-300 dark:border-gray-600">
                  {Object.entries(customMix).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        {key.replace('Star', ' Star')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => setCustomMix(prev => ({
                          ...prev,
                          [key]: parseInt(e.target.value) || 0
                        }))}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Reviewers Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Status:</strong>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  • {availableProfiles.length} unused profiles available
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  • {usedProfileIds.size} profiles already reviewed this car
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  • Reviews will be distributed naturally across the date range
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (reviewerSelection === 'existing' && availableProfiles.length < reviewCount)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Reviews'}
              </button>
            </div>
          </div>
        ) : (
          // Preview Screen with fixed scrolling
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Preview Generated Reviews
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Deselect All
                </button>
                <span className="text-sm text-gray-500">
                  {generatedReviews.filter(r => r.selected).length} of {generatedReviews.length} selected
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6" style={{ minHeight: 0 }}>
              <div className="space-y-4">
                {generatedReviews.map((review) => (
                  <div
                    key={review.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      review.selected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => toggleReviewSelection(review.id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={review.selected}
                        onChange={() => {}}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg">{renderStars(review.rating)}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {review.useExistingProfile && review.reviewerProfile 
                              ? review.reviewerProfile.name 
                              : review.newReviewerName || 'New Reviewer'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {review.useExistingProfile && review.reviewerProfile
                              ? `${review.reviewerProfile.city}, ${review.reviewerProfile.state}`
                              : `${review.newReviewerCity || 'Phoenix'}, ${review.newReviewerState || 'AZ'}`}
                          </span>
                          {review.useExistingProfile ? (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Existing Profile
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              New Profile
                            </span>
                          )}
                          {review.isVerified && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        {review.title && (
                          <p className="font-medium text-gray-900 dark:text-white mb-1">
                            {review.title}
                          </p>
                        )}
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {review.comment}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Trip: {formatDate(review.tripStartDate)} - {formatDate(review.tripEndDate)}</span>
                          <span>Posted: {formatDate(review.reviewDate)}</span>
                          {review.helpfulCount > 0 && (
                            <span>{review.helpfulCount} found helpful</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowPreview(false)
                    setGeneratedReviews([])
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800"
                >
                  Generate Again
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSelected}
                    disabled={isSaving || generatedReviews.filter(r => r.selected).length === 0}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : `Save ${generatedReviews.filter(r => r.selected).length} Selected Reviews`}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}