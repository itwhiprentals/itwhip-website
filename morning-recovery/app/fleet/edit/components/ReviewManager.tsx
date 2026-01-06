// app/sys/fleet/edit/components/ReviewManager.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Review, ReviewerProfile, ReviewStats as ReviewStatsType, NewReviewData } from './reviews/utils/reviewHelpers'
import { ReviewCard } from './reviews/ReviewCard'
import { ReviewStats } from './reviews/ReviewStats'
import { AddReviewModal } from './reviews/modals/AddReviewModal'
import { EditReviewModal } from './reviews/modals/EditReviewModal'
import { ReplyModal } from './reviews/modals/ReplyModal'
import { HelpfulCountModal } from './reviews/modals/HelpfulCountModal'
import { BulkReviewModal } from './reviews/modals/BulkReviewModal'

interface ReviewManagerProps {
  carId: string
}

export function ReviewManager({ carId }: ReviewManagerProps) {
  // State management
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewerProfiles, setReviewerProfiles] = useState<ReviewerProfile[]>([])
  const [stats, setStats] = useState<ReviewStatsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [carName, setCarName] = useState('')
  
  // Filter states
  const [showHidden, setShowHidden] = useState(true)
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [replyingToReview, setReplyingToReview] = useState<{ review: Review; type: 'host' | 'support' } | null>(null)
  const [editingHelpfulCount, setEditingHelpfulCount] = useState<Review | null>(null)
  
  // Refs for cleanup
  const isMounted = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    try {
      const response = await fetch(`/sys-2847/fleet/api/cars/${carId}/reviews`, {
        signal: abortControllerRef.current.signal
      })
      
      if (!isMounted.current) return
      
      if (response.ok) {
        const data = await response.json()
        setReviews(data.data?.reviews || [])
        setStats(data.data?.stats || null)
        
        // Extract car name if available
        if (data.data?.reviews?.[0]?.car) {
          const car = data.data.reviews[0].car
          setCarName(`${car.year} ${car.make} ${car.model}`)
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && isMounted.current) {
        console.error('Failed to fetch reviews:', error)
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [carId])

  // Fetch reviewer profiles
  const fetchReviewerProfiles = useCallback(async () => {
    try {
      const response = await fetch('/sys-2847/fleet/api/reviewer-profiles')
      if (response.ok) {
        const data = await response.json()
        setReviewerProfiles(data.data?.profiles || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviewer profiles:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchReviews()
    fetchReviewerProfiles()
  }, [fetchReviews, fetchReviewerProfiles])

  // Handle photo upload
  const handlePhotoUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('files', file)
    
    const response = await fetch('/sys-2847/fleet/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    
    const data = await response.json()
    return data.data[0]
  }

  // Add review
  const handleAddReview = async (reviewData: NewReviewData) => {
    try {
      const response = await fetch(`/sys-2847/fleet/api/cars/${carId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewData,
          source: 'SEED'
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setReviews(prev => [result.data, ...prev])
          await fetchReviewerProfiles()
        }
        setShowAddModal(false)
      } else {
        alert('Failed to add review')
      }
    } catch (error) {
      console.error('Failed to add review:', error)
      alert('Failed to add review')
    }
  }

  // Update review - INCLUDING PROFILE FIELDS AND CREATEDAT
  const handleUpdateReview = async (updatedReview: Review) => {
    try {
      // Extract review fields
      const updateData: any = {
        rating: updatedReview.rating,
        title: updatedReview.title || '',
        comment: updatedReview.comment,
        cleanliness: updatedReview.cleanliness || null,
        accuracy: updatedReview.accuracy || null,
        communication: updatedReview.communication || null,
        convenience: updatedReview.convenience || null,
        value: updatedReview.value || null,
        isVisible: updatedReview.isVisible,
        isPinned: updatedReview.isPinned,
        isVerified: updatedReview.isVerified,
        tripStartDate: updatedReview.tripStartDate || null,
        tripEndDate: updatedReview.tripEndDate || null,
        helpfulCount: updatedReview.helpfulCount || 0,
        hostResponse: updatedReview.hostResponse || null,
        hostRespondedAt: updatedReview.hostRespondedAt || null,
        supportResponse: updatedReview.supportResponse || null,
        supportRespondedAt: updatedReview.supportRespondedAt || null,
        supportRespondedBy: updatedReview.supportRespondedBy || null,
        createdAt: updatedReview.createdAt || null, // ADDED: Include createdAt field
      }

      // Add reviewer profile fields if they exist
      if (updatedReview.reviewerProfile) {
        updateData.reviewerName = updatedReview.reviewerProfile.name
        updateData.profilePhotoUrl = updatedReview.reviewerProfile.profilePhotoUrl
        updateData.reviewerCity = updatedReview.reviewerProfile.city
        updateData.reviewerState = updatedReview.reviewerProfile.state
        updateData.tripCount = updatedReview.reviewerProfile.tripCount
        updateData.reviewCount = updatedReview.reviewerProfile.reviewCount
        updateData.memberSince = updatedReview.reviewerProfile.memberSince
        updateData.isProfileVerified = updatedReview.reviewerProfile.isVerified
      } else if (updatedReview.reviewer) {
        // Fallback to reviewer object if no profile
        updateData.reviewerName = updatedReview.reviewer.name
        updateData.profilePhotoUrl = updatedReview.reviewer.profilePhotoUrl
        updateData.reviewerCity = updatedReview.reviewer.city
        updateData.reviewerState = updatedReview.reviewer.state
      }

      console.log('Sending update with profile data:', updateData) // Debug log

      const response = await fetch(`/sys-2847/fleet/api/reviews/${updatedReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        // Update local state immediately
        setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r))
        setEditingReview(null)
        // Then fetch fresh data to ensure consistency
        await fetchReviews()
        await fetchReviewerProfiles() // Refresh profiles too since they may have changed
      } else {
        const error = await response.json()
        console.error('Update failed:', error)
        alert('Failed to update review: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to update review:', error)
      alert('Failed to update review')
    }
  }

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const response = await fetch(`/sys-2847/fleet/api/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId))
        // Recalculate stats
        await fetchReviews()
      } else {
        alert('Failed to delete review')
      }
    } catch (error) {
      console.error('Failed to delete review:', error)
      alert('Failed to delete review')
    }
  }

  // Add reply
  const handleReply = async (reviewId: string, response: string, responseDate: string, type: 'host' | 'support') => {
    try {
      const updateData: any = {}
      
      if (type === 'host') {
        updateData.hostResponse = response
        updateData.hostRespondedAt = responseDate
      } else {
        updateData.supportResponse = response
        updateData.supportRespondedAt = responseDate
        updateData.supportRespondedBy = 'ItWhip Support'
      }

      const apiResponse = await fetch(`/sys-2847/fleet/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (apiResponse.ok) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...updateData } : r))
        setReplyingToReview(null)
      } else {
        alert('Failed to add response')
      }
    } catch (error) {
      console.error('Failed to add response:', error)
      alert('Failed to add response')
    }
  }

  // Update helpful count
  const handleUpdateHelpfulCount = async (reviewId: string, newCount: number) => {
    try {
      const response = await fetch(`/sys-2847/fleet/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpfulCount: newCount })
      })

      if (response.ok) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: newCount } : r))
        setEditingHelpfulCount(null)
      } else {
        alert('Failed to update helpful count')
      }
    } catch (error) {
      console.error('Failed to update helpful count:', error)
      alert('Failed to update helpful count')
    }
  }

  // Toggle visibility
  const toggleVisibility = async (review: Review) => {
    try {
      const response = await fetch(`/sys-2847/fleet/api/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !review.isVisible })
      })

      if (response.ok) {
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, isVisible: !r.isVisible } : r))
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error)
    }
  }

  // Toggle pin
  const togglePin = async (review: Review) => {
    try {
      const response = await fetch(`/sys-2847/fleet/api/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !review.isPinned })
      })

      if (response.ok) {
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, isPinned: !r.isPinned } : r))
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  // Apply filters and sorting
  const processedReviews = reviews
    .filter(r => {
      if (!showHidden && !r.isVisible) return false
      if (filterVerified === 'verified' && !r.isVerified) return false
      if (filterVerified === 'unverified' && r.isVerified) return false
      return true
    })
    .sort((a, b) => {
      // Pinned reviews always come first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Reviews Management
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Add Review
          </button>
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Quick Add Multiple
          </button>
        </div>
      </div>

      {/* Review Stats */}
      <ReviewStats stats={stats} loading={loading} />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 my-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show Hidden</span>
        </label>
        
        <select
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value as any)}
          className="text-sm px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded"
        >
          <option value="all">All Reviews</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="text-sm px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="rating">Highest Rated</option>
        </select>
        
        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          Showing {processedReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading reviews...
          </div>
        ) : processedReviews.length > 0 ? (
          processedReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={handleDeleteReview}
              onEdit={setEditingReview}
              onToggleVisibility={toggleVisibility}
              onTogglePin={togglePin}
              onReply={(data) => setReplyingToReview(data)}
              onEditHelpfulCount={setEditingHelpfulCount}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filters'}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddReviewModal
          reviewerProfiles={reviewerProfiles}
          onAdd={handleAddReview}
          onClose={() => setShowAddModal(false)}
          onPhotoUpload={handlePhotoUpload}
        />
      )}

      {showBulkModal && (
        <BulkReviewModal
          carId={carId}
          carName={carName || 'this car'}
          reviewerProfiles={reviewerProfiles}
          onClose={() => setShowBulkModal(false)}
          onComplete={() => {
            setShowBulkModal(false)
            fetchReviews()
          }}
        />
      )}

      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onUpdate={handleUpdateReview}
          onClose={() => setEditingReview(null)}
          onPhotoUpload={handlePhotoUpload}
        />
      )}

      {replyingToReview && (
        <ReplyModal
          review={replyingToReview.review}
          type={replyingToReview.type}
          onReply={handleReply}
          onClose={() => setReplyingToReview(null)}
        />
      )}

      {editingHelpfulCount && (
        <HelpfulCountModal
          review={editingHelpfulCount}
          onUpdate={handleUpdateHelpfulCount}
          onClose={() => setEditingHelpfulCount(null)}
        />
      )}
    </div>
  )
}