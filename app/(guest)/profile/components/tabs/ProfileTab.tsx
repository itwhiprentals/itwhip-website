// app/(guest)/profile/components/tabs/ProfileTab.tsx
'use client'

import { useState, useRef } from 'react'
import { IoSaveOutline, IoCloseOutline, IoPencilOutline, IoCameraOutline } from 'react-icons/io5'
import Image from 'next/image'

interface ProfileTabProps {
  profile: {
    name: string
    email: string
    phone: string
    bio?: string
    city?: string
    state?: string
    zipCode?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    emergencyContactRelation?: string
    dateOfBirth?: string
  }
  formData: {
    name: string
    phone: string
    bio: string
    city: string
    state: string
    zipCode: string
    emergencyContactName: string
    emergencyContactPhone: string
    emergencyContactRelation: string
    dateOfBirth: string
  }
  editMode: boolean
  saving: boolean
  onEditToggle: () => void
  onSave: () => void
  onCancel: () => void
  onFormChange: (data: Partial<ProfileTabProps['formData']>) => void
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const RELATIONSHIPS = [
  'Mother', 'Father', 'Spouse', 'Partner', 'Sibling', 
  'Child', 'Friend', 'Other'
]

export default function ProfileTab({
  profile,
  formData,
  editMode,
  saving,
  onEditToggle,
  onSave,
  onCancel,
  onFormChange
}: ProfileTabProps) {
  
  const handleInputChange = (field: string, value: string) => {
    onFormChange({ [field]: value })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Personal Information</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Update your profile and emergency contact
          </p>
        </div>
        
        {!editMode && (
          <button
            onClick={onEditToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
          >
            <IoPencilOutline className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Personal Information Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-900 dark:text-white">
                {profile.name || 'Not set'}
              </p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <p className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
              {profile.email}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              Contact support to change your email
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            {editMode ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="+1 (555) 123-4567"
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-900 dark:text-white">
                {profile.phone || 'Not set'}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Date of Birth
            </label>
            {editMode ? (
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-900 dark:text-white">
                {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not set'}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              City
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Phoenix"
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-900 dark:text-white">
                {profile.city || 'Not set'}
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              State
            </label>
            {editMode ? (
              <select
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select State</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-900 dark:text-white">
                {profile.state || 'Not set'}
              </p>
            )}
          </div>

          {/* Zip Code */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Zip Code
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="85001"
                maxLength={5}
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-900 dark:text-white">
                {profile.zipCode || 'Not set'}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Bio
          </label>
          {editMode ? (
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-900 dark:text-white min-h-[70px]">
              {profile.bio || 'No bio added yet'}
            </p>
          )}
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Emergency Contact <span className="text-red-500">*</span>
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          This person will be contacted in case of an emergency during your rental
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Emergency Contact Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="Contact name"
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-900 dark:text-white">
                {profile.emergencyContactName || 'Not set'}
              </p>
            )}
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            {editMode ? (
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                placeholder="+1 (555) 987-6543"
              />
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-900 dark:text-white">
                {profile.emergencyContactPhone || 'Not set'}
              </p>
            )}
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Relationship
            </label>
            {editMode ? (
              <select
                value={formData.emergencyContactRelation}
                onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Relationship</option>
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            ) : (
              <p className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-900 dark:text-white">
                {profile.emergencyContactRelation || 'Not set'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {editMode && (
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 min-h-[36px] text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <IoCloseOutline className="w-4 h-4 inline mr-1.5" />
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 min-h-[36px] text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <IoSaveOutline className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}