// app/host/profile/components/tabs/ProfileTab.tsx
'use client'

import { IoSaveOutline, IoLockClosedOutline } from 'react-icons/io5'

interface HostProfile {
  id: string
  name: string
  email: string
  phone: string
  bio?: string
  city: string
  state: string
  zipCode?: string
  approvalStatus: 'PENDING' | 'NEEDS_ATTENTION' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
}

interface FormData {
  name: string
  email: string
  phone: string
  bio: string
  city: string
  state: string
  zipCode: string
}

interface ProfileTabProps {
  profile: HostProfile
  formData: FormData
  editMode: boolean
  saving: boolean
  isSuspended: boolean
  isApproved: boolean
  onEditToggle: () => void
  onSave: () => void
  onCancel: () => void
  onFormChange: (data: Partial<FormData>) => void
}

export default function ProfileTab({
  profile,
  formData,
  editMode,
  saving,
  isSuspended,
  isApproved,
  onEditToggle,
  onSave,
  onCancel,
  onFormChange
}: ProfileTabProps) {
  const isFieldLocked = (field: 'email' | 'phone') => {
    // Email is always locked, phone is locked until approved
    if (field === 'email') return true
    if (field === 'phone') return !isApproved
    return false
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Name and Email Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
            disabled={!editMode || isSuspended}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
          />
        </div>

        {/* Email (Locked) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            Email
            {isFieldLocked('email') && (
              <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                <IoLockClosedOutline className="w-3 h-3" />
                <span className="hidden sm:inline">Locked</span>
              </span>
            )}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onFormChange({ email: e.target.value })}
            disabled={true}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            Phone Number
            {isFieldLocked('phone') && (
              <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                <IoLockClosedOutline className="w-3 h-3" />
                <span className="hidden sm:inline">Locked until approved</span>
              </span>
            )}
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onFormChange({ phone: e.target.value })}
            disabled={!editMode || isFieldLocked('phone') || isSuspended}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => onFormChange({ bio: e.target.value })}
          disabled={!editMode || isSuspended}
          rows={4}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed resize-none"
          placeholder="Tell guests about yourself..."
        />
      </div>

      {/* Location Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => onFormChange({ city: e.target.value })}
            disabled={!editMode || isSuspended}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => onFormChange({ state: e.target.value })}
            disabled={!editMode || isSuspended}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
          />
        </div>

        {/* ZIP Code */}
        <div className="sm:col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ZIP Code
          </label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => onFormChange({ zipCode: e.target.value })}
            disabled={!editMode || isSuspended}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Action Buttons - Only show in edit mode */}
      {editMode && !isSuspended && (
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <IoSaveOutline className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}