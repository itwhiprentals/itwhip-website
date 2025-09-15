// app/(guest)/rentals/components/review/GuestReviewModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { IoClose, IoStar, IoCheckmarkCircle } from 'react-icons/io5'
import GuestReviewForm from './GuestReviewForm'
import GuestReviewSuccess from './GuestReviewSuccess'
import GuestReviewDisplay from './GuestReviewDisplay'

interface GuestReviewModalProps {
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
    tripStatus?: string
    fraudulent?: boolean
    guestName?: string
    guestEmail?: string
  }
  guestToken: string
  onClose?: () => void
}

type ModalState = 'loading' | 'form' | 'success' | 'existing' | 'error' | 'ineligible'

export default function GuestReviewModal({ 
  booking, 
  guestToken,
  onClose 
}: GuestReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalState, setModalState] = useState<ModalState>('loading')
  const [existingReview, setExistingReview] = useState<any>(null)
  const [submittedReview, setSubmittedReview] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eligibilityError, setEligibilityError] = useState<string | null>(null)

  // Check for existing review when component mounts
  useEffect(() => {
    checkExistingReview()
  }, [booking.id])

  // Check if review exists
  const checkExistingReview = async () => {
    try {
      const response = await fetch(`/api/rentals/bookings/${booking.id}/review`, {
        headers: {
          'X-Guest-Token': guestToken
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data.hasReview) {
          setExistingReview(data.data.review)
          setModalState('existing')
        } else {
          // Check eligibility
          const eligibilityCheck = checkEligibility()
          if (!eligibilityCheck.eligible) {
            setEligibilityError(eligibilityCheck.reason)
            setModalState('ineligible')
          } else {
            setModalState('form')
          }
        }
      } else {
        setModalState('form')
      }
    } catch (error) {
      console.error('Error checking review:', error)
      setModalState('form')
    }
  }

  // Check if booking is eligible for review
  const checkEligibility = () => {
    // Check if trip has ended
    if (!booking.tripEndedAt) {
      return { 
        eligible: false, 
        reason: 'You can only review after completing your trip.' 
      }
    }

    // Check trip status
    const eligibleStatuses = ['COMPLETED', 'ENDED_PENDING_REVIEW']
    if (booking.tripStatus && !eligibleStatuses.includes(booking.tripStatus)) {
      return { 
        eligible: false, 
        reason: 'This booking is not eligible for review.' 
      }
    }

    // Check if fraudulent
    if (booking.fraudulent) {
      return { 
        eligible: false, 
        reason: 'Account under review. Please contact support.' 
      }
    }

    // Check review period (30 days)
    const daysSinceEnd = Math.floor(
      (Date.now() - new Date(booking.tripEndedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceEnd > 30) {
      return { 
        eligible: false, 
        reason: 'The review period has expired (30 days after trip completion).' 
      }
    }

    return { eligible: true, reason: null }
  }

  // Handle review submission
  const handleSubmitReview = async (reviewData: any) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/rentals/bookings/${booking.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Guest-Token': guestToken
        },
        body: JSON.stringify(reviewData)
      })

      const data = await response.json()

      if (response.ok) {
        setSubmittedReview(data.data)
        setModalState('success')
      } else {
        setError(data.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      setError('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open modal
  const openModal = () => {
    setIsOpen(true)
    if (!existingReview && modalState === 'loading') {
      checkExistingReview()
    }
  }

  // Close modal
  const closeModal = () => {
    setIsOpen(false)
    if (onClose) {
      onClose()
    }
  }

  // Handle success close
  const handleSuccessClose = () => {
    setExistingReview(submittedReview)
    setModalState('existing')
    setTimeout(() => {
      closeModal()
    }, 500)
  }

  // Calculate average rating if existing review has category ratings
  const getAverageRating = (review: any) => {
    if (!review) return 0
    
    const ratings = [
      review.rating,
      review.cleanliness,
      review.accuracy,
      review.communication,
      review.convenience,
      review.value
    ].filter(r => r !== null && r !== undefined)
    
    return ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : review.rating
  }

  return (
    <>
      {/* Trigger Button or Display */}
      {!isOpen && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          {existingReview ? (
            // Show submitted review summary
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Your Review
                </h4>
                <div className="flex items-center gap-1">
                  <IoCheckmarkCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">Submitted</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <IoStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < existingReview.rating 
                          ? 'text-amber-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(existingReview.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {existingReview.title && (
                <p className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                  {existingReview.title}
                </p>
              )}
              
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {existingReview.comment}
              </p>
              
              <button
                onClick={openModal}
                className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                View Full Review
              </button>
            </div>
          ) : (
            // Show review prompt
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Rate Your Experience
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                How was your trip with the {booking.car.year} {booking.car.make} {booking.car.model}?
              </p>
              
              {/* Star Preview */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      onClick={openModal}
                      className="text-gray-300 hover:text-amber-400 transition-colors"
                    >
                      <IoStar className="w-6 h-6" />
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={openModal}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Leave a Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {modalState === 'existing' ? 'Your Review' : 'Leave a Review'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {modalState === 'loading' && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                </div>
              )}

              {modalState === 'form' && (
                <>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}
                  <GuestReviewForm
                    booking={booking}
                    onSubmit={handleSubmitReview}
                    onCancel={closeModal}
                    isSubmitting={isSubmitting}
                  />
                </>
              )}

              {modalState === 'success' && submittedReview && (
                <GuestReviewSuccess
                  review={submittedReview}
                  onClose={handleSuccessClose}
                />
              )}

              {modalState === 'existing' && existingReview && (
                <GuestReviewDisplay
                  review={existingReview}
                  onClose={closeModal}
                />
              )}

              {modalState === 'ineligible' && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <IoClose className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Unable to Leave Review
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {eligibilityError}
                  </p>
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}