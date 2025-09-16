// app/sys-2847/fleet/edit/components/reviews/modals/EditReviewModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Review } from '../utils/reviewHelpers'

interface EditReviewModalProps {
  review: Review
  onUpdate: (updatedReview: Review) => void
  onClose: () => void
  onPhotoUpload?: (file: File) => Promise<string>
}

export function EditReviewModal({ 
  review, 
  onUpdate, 
  onClose,
  onPhotoUpload 
}: EditReviewModalProps) {
  const [editedReview, setEditedReview] = useState<Review>(review)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'dates' | 'profile'>('basic')

  // Initialize with existing review data
  useEffect(() => {
    setEditedReview(review)
  }, [review])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onPhotoUpload) return
    
    setUploadingPhoto(true)
    try {
      const photoUrl = await onPhotoUpload(file)
      setEditedReview(prev => ({
        ...prev,
        reviewerProfile: prev.reviewerProfile ? {
          ...prev.reviewerProfile,
          profilePhotoUrl: photoUrl
        } : undefined,
        reviewer: prev.reviewer ? {
          ...prev.reviewer,
          profilePhotoUrl: photoUrl
        } : undefined
      }))
    } catch (error) {
      console.error('Photo upload failed:', error)
      alert('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = () => {
    // Validate dates
    if (editedReview.tripStartDate && editedReview.tripEndDate) {
      const start = new Date(editedReview.tripStartDate)
      const end = new Date(editedReview.tripEndDate)
      if (end < start) {
        alert('Trip end date cannot be before start date')
        return
      }
    }

    if (editedReview.tripEndDate && editedReview.createdAt) {
      const tripEnd = new Date(editedReview.tripEndDate)
      const reviewDate = new Date(editedReview.createdAt)
      if (reviewDate < tripEnd) {
        alert('Review date cannot be before trip end date')
        return
      }
    }

    onUpdate(editedReview)
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full my-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit Review - Complete Control
        </h3>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 -mb-px font-medium text-sm transition-colors ${
              activeTab === 'basic'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Review Content
          </button>
          <button
            onClick={() => setActiveTab('dates')}
            className={`px-4 py-2 -mb-px font-medium text-sm transition-colors ${
              activeTab === 'dates'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Dates & Timing
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 -mb-px font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Reviewer Profile
          </button>
        </div>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Basic Tab - Review Content */}
          {activeTab === 'basic' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <StarRating 
                  rating={editedReview.rating} 
                  onChange={(r) => setEditedReview({ ...editedReview, rating: r })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={editedReview.title || ''}
                  onChange={(e) => setEditedReview({ ...editedReview, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                  placeholder="Amazing experience!"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Content
                </label>
                <textarea
                  value={editedReview.comment}
                  onChange={(e) => setEditedReview({ ...editedReview, comment: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                  placeholder="Write the review..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Helpful Count
                  </label>
                  <input
                    type="number"
                    value={editedReview.helpfulCount}
                    onChange={(e) => setEditedReview({ 
                      ...editedReview, 
                      helpfulCount: parseInt(e.target.value) || 0 
                    })}
                    min="0"
                    max="999"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editedReview.isVisible}
                      onChange={(e) => setEditedReview({ 
                        ...editedReview, 
                        isVisible: e.target.checked 
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Visible</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editedReview.isPinned}
                      onChange={(e) => setEditedReview({ 
                        ...editedReview, 
                        isPinned: e.target.checked 
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Pinned to Top</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editedReview.isVerified}
                      onChange={(e) => setEditedReview({ 
                        ...editedReview, 
                        isVerified: e.target.checked 
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Verified Trip</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Dates Tab - All Date Controls */}
          {activeTab === 'dates' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trip Start Date
                  </label>
                  <input
                    type="date"
                    value={editedReview.tripStartDate?.split('T')[0] || ''}
                    onChange={(e) => setEditedReview({ 
                      ...editedReview, 
                      tripStartDate: e.target.value 
                    })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trip End Date
                  </label>
                  <input
                    type="date"
                    value={editedReview.tripEndDate?.split('T')[0] || ''}
                    onChange={(e) => setEditedReview({ 
                      ...editedReview, 
                      tripEndDate: e.target.value 
                    })}
                    min={editedReview.tripStartDate?.split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Posted Date
                </label>
                <input
                  type="datetime-local"
                  value={editedReview.createdAt?.slice(0, 16) || ''}
                  onChange={(e) => setEditedReview({ 
                    ...editedReview, 
                    createdAt: e.target.value 
                  })}
                  min={editedReview.tripEndDate?.split('T')[0]}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Reviews are typically posted 1-7 days after trip ends
                </p>
              </div>

              {editedReview.hostRespondedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Host Response Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editedReview.hostRespondedAt?.slice(0, 16) || ''}
                    onChange={(e) => setEditedReview({ 
                      ...editedReview, 
                      hostRespondedAt: e.target.value 
                    })}
                    min={editedReview.createdAt?.slice(0, 16)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                  />
                </div>
              )}

              {editedReview.supportRespondedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Support Response Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editedReview.supportRespondedAt?.slice(0, 16) || ''}
                    onChange={(e) => setEditedReview({ 
                      ...editedReview, 
                      supportRespondedAt: e.target.value 
                    })}
                    min={editedReview.hostRespondedAt || editedReview.createdAt?.slice(0, 16)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                  />
                </div>
              )}
            </>
          )}

          {/* Profile Tab - Reviewer Details */}
          {activeTab === 'profile' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reviewer Name
                  </label>
                  <input
                    type="text"
                    value={
                      editedReview.reviewerProfile?.name || 
                      editedReview.reviewer?.name || 
                      ''
                    }
                    onChange={(e) => {
                      const name = e.target.value
                      setEditedReview(prev => ({
                        ...prev,
                        reviewerProfile: prev.reviewerProfile ? {
                          ...prev.reviewerProfile,
                          name
                        } : undefined,
                        reviewer: prev.reviewer ? {
                          ...prev.reviewer,
                          name
                        } : { name, profilePhotoUrl: '' }
                      }))
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={
                        editedReview.reviewerProfile?.profilePhotoUrl || 
                        editedReview.reviewer?.profilePhotoUrl || 
                        ''
                      }
                      onChange={(e) => {
                        const url = e.target.value
                        setEditedReview(prev => ({
                          ...prev,
                          reviewerProfile: prev.reviewerProfile ? {
                            ...prev.reviewerProfile,
                            profilePhotoUrl: url
                          } : undefined,
                          reviewer: prev.reviewer ? {
                            ...prev.reviewer,
                            profilePhotoUrl: url
                          } : undefined
                        }))
                      }}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-sm"
                      placeholder="Photo URL"
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
                  {(editedReview.reviewerProfile?.profilePhotoUrl || editedReview.reviewer?.profilePhotoUrl) && (
                    <img 
                      src={editedReview.reviewerProfile?.profilePhotoUrl || editedReview.reviewer?.profilePhotoUrl} 
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
                    value={
                      editedReview.reviewerProfile?.city || 
                      editedReview.reviewer?.city || 
                      'Phoenix'
                    }
                    onChange={(e) => {
                      const city = e.target.value
                      setEditedReview(prev => ({
                        ...prev,
                        reviewerProfile: prev.reviewerProfile ? {
                          ...prev.reviewerProfile,
                          city
                        } : undefined,
                        reviewer: prev.reviewer ? {
                          ...prev.reviewer,
                          city
                        } : undefined
                      }))
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={
                      editedReview.reviewerProfile?.state || 
                      editedReview.reviewer?.state || 
                      'AZ'
                    }
                    onChange={(e) => {
                      const state = e.target.value
                      setEditedReview(prev => ({
                        ...prev,
                        reviewerProfile: prev.reviewerProfile ? {
                          ...prev.reviewerProfile,
                          state
                        } : undefined,
                        reviewer: prev.reviewer ? {
                          ...prev.reviewer,
                          state
                        } : undefined
                      }))
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                    maxLength={2}
                  />
                </div>
              </div>

              {editedReview.reviewerProfile && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Trip Count
                      </label>
                      <input
                        type="number"
                        value={editedReview.reviewerProfile.tripCount || 0}
                        onChange={(e) => {
                          const tripCount = parseInt(e.target.value) || 0
                          setEditedReview(prev => ({
                            ...prev,
                            reviewerProfile: prev.reviewerProfile ? {
                              ...prev.reviewerProfile,
                              tripCount
                            } : undefined
                          }))
                        }}
                        min="1"
                        max="999"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Review Count
                      </label>
                      <input
                        type="number"
                        value={editedReview.reviewerProfile.reviewCount || 0}
                        onChange={(e) => {
                          const reviewCount = parseInt(e.target.value) || 0
                          setEditedReview(prev => ({
                            ...prev,
                            reviewerProfile: prev.reviewerProfile ? {
                              ...prev.reviewerProfile,
                              reviewCount
                            } : undefined
                          }))
                        }}
                        min="1"
                        max="999"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Member Since
                    </label>
                    <input
                      type="date"
                      value={editedReview.reviewerProfile.memberSince?.split('T')[0] || ''}
                      onChange={(e) => {
                        const memberSince = e.target.value
                        setEditedReview(prev => ({
                          ...prev,
                          reviewerProfile: prev.reviewerProfile ? {
                            ...prev.reviewerProfile,
                            memberSince
                          } : undefined
                        }))
                      }}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editedReview.reviewerProfile.isVerified || false}
                        onChange={(e) => {
                          const isVerified = e.target.checked
                          setEditedReview(prev => ({
                            ...prev,
                            reviewerProfile: prev.reviewerProfile ? {
                              ...prev.reviewerProfile,
                              isVerified
                            } : undefined
                          }))
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Verified Profile</span>
                    </label>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        
        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save All Changes
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