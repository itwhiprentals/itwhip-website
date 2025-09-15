// app/sys-2847/fleet/edit/components/reviews/modals/ReplyModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Review, calculateSuggestedResponseDate } from '../utils/reviewHelpers'

interface ReplyModalProps {
  review: Review
  type: 'host' | 'support'
  onReply: (reviewId: string, response: string, responseDate: string, type: 'host' | 'support') => void
  onClose: () => void
}

export function ReplyModal({ 
  review, 
  type, 
  onReply, 
  onClose 
}: ReplyModalProps) {
  const [response, setResponse] = useState('')
  const [responseDate, setResponseDate] = useState('')
  const [useCustomDate, setUseCustomDate] = useState(false)
  
  // Calculate suggested response date on mount
  useEffect(() => {
    if (!useCustomDate) {
      const suggestedDate = calculateSuggestedResponseDate(review.createdAt, type)
      setResponseDate(suggestedDate)
    }
  }, [review.createdAt, type, useCustomDate])
  
  const handleSubmit = () => {
    if (!response.trim()) {
      alert('Please enter a response')
      return
    }
    if (!responseDate) {
      alert('Please select a response date')
      return
    }
    
    // Validate response date is after review date
    const reviewDate = new Date(review.createdAt)
    const selectedDate = new Date(responseDate)
    
    if (selectedDate < reviewDate) {
      alert('Response date cannot be before the review date')
      return
    }
    
    // If support response, check it's after host response (if exists)
    if (type === 'support' && review.hostRespondedAt) {
      const hostResponseDate = new Date(review.hostRespondedAt)
      if (selectedDate < hostResponseDate) {
        alert('Support response date cannot be before host response date')
        return
      }
    }
    
    onReply(review.id, response, responseDate, type)
  }

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Reply as {type === 'host' ? 'Host' : 'ItWhip Support'}
        </h3>
        
        {/* Review Context */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded">
          <div className="flex items-start gap-3 mb-2">
            {review.reviewerProfile?.profilePhotoUrl || review.reviewer?.profilePhotoUrl ? (
              <img 
                src={review.reviewerProfile?.profilePhotoUrl || review.reviewer?.profilePhotoUrl}
                alt={review.reviewerProfile?.name || review.reviewer?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {review.reviewerProfile?.name || review.reviewer?.name || 'Guest'}
              </p>
              <div className="flex gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-3">
            "{review.comment}"
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Review date: {new Date(review.createdAt).toLocaleDateString()}
          </p>
          {review.hostRespondedAt && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Host responded: {new Date(review.hostRespondedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Response Date Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Response Date
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={useCustomDate}
                  onChange={(e) => {
                    setUseCustomDate(e.target.checked)
                    if (!e.target.checked) {
                      // Reset to suggested date
                      const suggestedDate = calculateSuggestedResponseDate(review.createdAt, type)
                      setResponseDate(suggestedDate)
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-gray-600 dark:text-gray-400">Custom date</span>
              </label>
            </div>
            
            {useCustomDate ? (
              <input
                type="datetime-local"
                value={formatDateForInput(responseDate)}
                onChange={(e) => setResponseDate(e.target.value)}
                min={formatDateForInput(
                  type === 'support' && review.hostRespondedAt 
                    ? review.hostRespondedAt 
                    : review.createdAt
                )}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
              />
            ) : (
              <input
                type="date"
                value={responseDate}
                onChange={(e) => setResponseDate(e.target.value)}
                min={review.createdAt.split('T')[0]}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
              />
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {type === 'host' 
                ? 'Hosts typically respond within 1-7 days' 
                : 'Support usually responds within 3-10 days or after escalation'}
            </p>
          </div>
          
          {/* Response Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Response
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
              placeholder={
                type === 'host' 
                  ? "Thank you for your review! We're glad you enjoyed..." 
                  : "Thank you for your feedback. We've addressed..."
              }
            />
            
            {/* Quick Templates */}
            <div className="mt-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quick templates:</p>
              <div className="flex flex-wrap gap-1">
                {type === 'host' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setResponse("Thank you so much for the kind review! It was a pleasure hosting you, and I'm thrilled you enjoyed the car. Hope to see you again soon!")}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Positive
                    </button>
                    <button
                      type="button"
                      onClick={() => setResponse("Thank you for your feedback. I apologize for the issue you experienced and have taken steps to ensure this doesn't happen again. I appreciate your understanding.")}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Apologetic
                    </button>
                    <button
                      type="button"
                      onClick={() => setResponse("Thanks for taking such great care of the vehicle! Your feedback is valuable and helps me improve the rental experience. Safe travels!")}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Neutral
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setResponse("ItWhip Support: We're glad to hear you had a great experience! Thank you for choosing ItWhip for your rental needs.")}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Positive
                    </button>
                    <button
                      type="button"
                      onClick={() => setResponse("ItWhip Support: We've reviewed this situation and worked with the host to ensure a better experience going forward. Thank you for bringing this to our attention.")}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Resolution
                    </button>
                    <button
                      type="button"
                      onClick={() => setResponse("ItWhip Support: We take all feedback seriously and have documented your concerns. Our team will follow up to ensure quality standards are maintained.")}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Follow-up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            className={`flex-1 px-4 py-2 text-white rounded ${
              type === 'host' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Post Response
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