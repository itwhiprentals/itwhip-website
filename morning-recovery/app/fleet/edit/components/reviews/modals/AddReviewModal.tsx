// app/sys-2847/fleet/edit/components/reviews/modals/AddReviewModal.tsx
'use client'

import { useState } from 'react'
import { NewReviewData, ReviewerProfile } from '../utils/reviewHelpers'

interface AddReviewModalProps {
  reviewerProfiles: ReviewerProfile[]
  onAdd: (reviewData: NewReviewData) => void
  onClose: () => void
  onPhotoUpload?: (file: File) => Promise<string>
}

export function AddReviewModal({ 
  reviewerProfiles, 
  onAdd, 
  onClose,
  onPhotoUpload 
}: AddReviewModalProps) {
  const [newReview, setNewReview] = useState<NewReviewData>({
    rating: 5,
    title: '',
    comment: '',
    reviewerName: '',
    profilePhotoUrl: '',
    reviewerCity: 'Phoenix',
    reviewerState: 'AZ',
    tripStartDate: '',
    tripEndDate: '',
    isVerified: false,
    isPinned: false,
    helpfulCount: 0,
    createNewProfile: true,
    selectedProfileId: '',
    createdAt: ''
  })
  
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onPhotoUpload) return
    
    setUploadingPhoto(true)
    try {
      const photoUrl = await onPhotoUpload(file)
      setNewReview({ ...newReview, profilePhotoUrl: photoUrl })
    } catch (error) {
      console.error('Photo upload failed:', error)
      alert('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = () => {
    if (!newReview.reviewerName || !newReview.comment) {
      alert('Please fill in reviewer name and review')
      return
    }

    // Validate dates
    if (newReview.tripStartDate && newReview.tripEndDate) {
      const start = new Date(newReview.tripStartDate)
      const end = new Date(newReview.tripEndDate)
      if (end < start) {
        alert('Trip end date cannot be before start date')
        return
      }
    }

    // If custom review date is set, validate it
    if (newReview.createdAt && newReview.tripEndDate) {
      const tripEnd = new Date(newReview.tripEndDate)
      const reviewDate = new Date(newReview.createdAt)
      if (reviewDate < tripEnd) {
        alert('Review date cannot be before trip end date')
        return
      }
    }

    // If no custom review date, calculate a reasonable one
    if (!newReview.createdAt && newReview.tripEndDate) {
      const tripEnd = new Date(newReview.tripEndDate)
      const reviewDate = new Date(tripEnd)
      // Add 1-7 days randomly after trip end
      const daysToAdd = Math.floor(Math.random() * 7) + 1
      reviewDate.setDate(reviewDate.getDate() + daysToAdd)
      newReview.createdAt = reviewDate.toISOString()
    }

    onAdd(newReview)
  }

  const StarRating = ({ rating, onChange }: { rating: number; onChange: (r: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="cursor-pointer"
        >
          <svg 
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full my-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Review
        </h3>
        
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Profile Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reviewer Profile
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={newReview.createNewProfile}
                  onChange={() => setNewReview({ ...newReview, createNewProfile: true, selectedProfileId: '' })}
                  className="mr-2"
                />
                <span className="text-sm">Create New Profile</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!newReview.createNewProfile}
                  onChange={() => setNewReview({ ...newReview, createNewProfile: false })}
                  className="mr-2"
                />
                <span className="text-sm">Use Existing Profile</span>
              </label>
            </div>
          </div>

          {!newReview.createNewProfile && (
            <div>
              <select
                value={newReview.selectedProfileId}
                onChange={(e) => {
                  const profile = reviewerProfiles.find(p => p.id === e.target.value)
                  setNewReview({ 
                    ...newReview, 
                    selectedProfileId: e.target.value,
                    reviewerName: profile?.name || '',
                    profilePhotoUrl: profile?.profilePhotoUrl || '',
                    reviewerCity: profile?.city || 'Phoenix',
                    reviewerState: profile?.state || 'AZ'
                  })
                }}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
              >
                <option value="">Select a profile...</option>
                {reviewerProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} - {profile.city}, {profile.state} ({profile.reviewCount} reviews)
                  </option>
                ))}
              </select>
            </div>
          )}

          {newReview.createNewProfile && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reviewer Name
                  </label>
                  <input
                    type="text"
                    value={newReview.reviewerName}
                    onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                    placeholder="Sarah M."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newReview.profilePhotoUrl}
                      onChange={(e) => setNewReview({ ...newReview, profilePhotoUrl: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-sm"
                      placeholder="URL or upload"
                      disabled={uploadingPhoto}
                    />
                    {onPhotoUpload && (
                      <label className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer text-sm whitespace-nowrap">
                        {uploadingPhoto ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                      </label>
                    )}
                  </div>
                  {newReview.profilePhotoUrl && (
                    <img 
                      src={newReview.profilePhotoUrl} 
                      alt="Preview" 
                      className="mt-2 w-16 h-16 rounded-full object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={newReview.reviewerCity}
                    onChange={(e) => setNewReview({ ...newReview, reviewerCity: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={newReview.reviewerState}
                    onChange={(e) => setNewReview({ ...newReview, reviewerState: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                    maxLength={2}
                  />
                </div>
              </div>
            </>
          )}

          {/* Trip Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trip Start Date
              </label>
              <input
                type="date"
                value={newReview.tripStartDate}
                onChange={(e) => setNewReview({ ...newReview, tripStartDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trip End Date
              </label>
              <input
                type="date"
                value={newReview.tripEndDate}
                onChange={(e) => setNewReview({ ...newReview, tripEndDate: e.target.value })}
                min={newReview.tripStartDate}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
              />
            </div>
          </div>

          {/* Custom Review Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Review Posted Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={newReview.createdAt}
              onChange={(e) => setNewReview({ ...newReview, createdAt: e.target.value })}
              min={newReview.tripEndDate}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty to auto-generate 1-7 days after trip end
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating
            </label>
            <StarRating 
              rating={newReview.rating} 
              onChange={(r) => setNewReview({ ...newReview, rating: r })}
            />
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Review Title (Optional)
            </label>
            <input
              type="text"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
              placeholder="Amazing experience!"
            />
          </div>
          
          {/* Review Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Review
            </label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
              placeholder="Write the review..."
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newReview.isVerified}
                  onChange={(e) => setNewReview({ ...newReview, isVerified: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Verified Trip</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newReview.isPinned}
                  onChange={(e) => setNewReview({ ...newReview, isPinned: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">Pin to Top</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Initial Helpful Count
              </label>
              <input
                type="number"
                value={newReview.helpfulCount}
                onChange={(e) => setNewReview({ ...newReview, helpfulCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Review
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