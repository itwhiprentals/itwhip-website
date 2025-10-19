// app/fleet/guests/[id]/permissions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoLockOpenOutline,
  IoLockClosedOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline
} from 'react-icons/io5'

interface Permission {
  key: string
  label: string
  description: string
  risk: 'low' | 'medium' | 'high'
}

const guestPermissions: Permission[] = [
  {
    key: 'canInstantBook',
    label: 'Instant Booking',
    description: 'Guest can book cars instantly without host approval',
    risk: 'medium'
  },
  {
    key: 'isVerified',
    label: 'Basic Verification',
    description: 'Guest has completed basic identity verification',
    risk: 'low'
  },
  {
    key: 'fullyVerified',
    label: 'Full Verification',
    description: 'Guest has completed all verification steps',
    risk: 'low'
  },
  {
    key: 'documentsVerified',
    label: 'Documents Verified',
    description: 'Government ID and driver\'s license verified',
    risk: 'low'
  },
  {
    key: 'insuranceVerified',
    label: 'Insurance Verified',
    description: 'Guest insurance policy verified and active',
    risk: 'medium'
  }
]

export default function GuestPermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [guestId, setGuestId] = useState<string>('')
  const [guest, setGuest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    canInstantBook: false,
    isVerified: false,
    fullyVerified: false,
    documentsVerified: false,
    insuranceVerified: false,
    isActive: true
  })

  // Track changes
  const [hasChanges, setHasChanges] = useState(false)
  const [originalData, setOriginalData] = useState<any>(null)

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setGuestId(resolvedParams.id)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (guestId) {
      loadGuest()
    }
  }, [guestId])

  const loadGuest = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fleet/guests/${guestId}?key=phoenix-fleet-2847`)
      
      if (response.ok) {
        const data = await response.json()
        const guestData = data.guest
        setGuest(guestData)
        
        // Initialize form with current values
        const initialData = {
          canInstantBook: guestData.canInstantBook || false,
          isVerified: guestData.isVerified || false,
          fullyVerified: guestData.fullyVerified || false,
          documentsVerified: guestData.documentsVerified || false,
          insuranceVerified: guestData.insuranceVerified || false,
          isActive: guestData.user?.isActive ?? true
        }
        
        setFormData(initialData)
        setOriginalData(initialData)
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Failed to load guest:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: string) => {
    setFormData(prev => {
      const newData = { ...prev, [key]: !prev[key as keyof typeof prev] }
      
      // Check if there are changes
      const changed = Object.keys(newData).some(
        k => newData[k as keyof typeof newData] !== originalData[k as keyof typeof originalData]
      )
      setHasChanges(changed)
      
      return newData
    })
  }

  const handleSave = async () => {
    if (!hasChanges) return

    // Check for risky changes
    const riskChanges = []
    if (formData.isActive !== originalData.isActive && !formData.isActive) {
      riskChanges.push('suspend account')
    }
    if (formData.canInstantBook !== originalData.canInstantBook && !formData.canInstantBook) {
      riskChanges.push('remove instant booking')
    }
    if (formData.isVerified !== originalData.isVerified && !formData.isVerified) {
      riskChanges.push('revoke verification')
    }

    if (riskChanges.length > 0) {
      const confirmMessage = `You are about to ${riskChanges.join(', ')} for ${guest.name}. This will affect their ability to book. Continue?`
      if (!confirm(confirmMessage)) {
        return
      }
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/fleet/guests/${guestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-fleet-key': 'phoenix-fleet-2847'
        },
        body: JSON.stringify({
          ...formData,
          reason: 'Permissions updated by fleet admin'
        })
      })

      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        await loadGuest()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update permissions')
      }
    } catch (error) {
      console.error('Failed to save permissions:', error)
      alert('Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData)
      setHasChanges(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 dark:text-green-400'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'high':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'Low Risk'
      case 'medium':
        return 'Medium Risk'
      case 'high':
        return 'High Risk'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading permissions...</p>
        </div>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Guest not found</p>
          <Link href="/fleet/guests?key=phoenix-fleet-2847" className="text-purple-600 hover:text-purple-700">
            Back to Guests
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/fleet/guests/${guestId}?key=phoenix-fleet-2847`)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
          >
            <IoArrowBackOutline className="w-5 h-5 mr-2" />
            Back to Guest Details
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Guest Permissions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage {guest.name}'s account privileges and verification status
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <p className="text-green-800 dark:text-green-200 font-medium">
                Permissions updated successfully
              </p>
            </div>
          </div>
        )}

        {/* Warning Banner */}
        {!formData.isActive && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">Account Suspended</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  This guest account is currently suspended. They cannot log in or make new bookings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Account Status Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Status</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start">
                {formData.isActive ? (
                  <IoLockOpenOutline className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 mr-3 flex-shrink-0" />
                ) : (
                  <IoLockClosedOutline className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 mr-3 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Account Active</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formData.isActive 
                      ? 'Guest can log in and make bookings' 
                      : 'Guest is suspended and cannot access the platform'}
                  </p>
                  <span className={`inline-flex items-center mt-2 text-xs font-medium ${getRiskColor('high')}`}>
                    <IoWarningOutline className="w-3 h-3 mr-1" />
                    High Risk - Affects login access
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('isActive')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isActive ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Guest Privileges & Verification
          </h2>

          <div className="space-y-4">
            {guestPermissions.map((permission) => (
              <div
                key={permission.key}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-start flex-1">
                  {formData[permission.key as keyof typeof formData] ? (
                    <IoCheckmarkCircleOutline className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 mr-3 flex-shrink-0" />
                  ) : (
                    <IoCloseCircleOutline className="w-6 h-6 text-gray-400 dark:text-gray-500 mt-1 mr-3 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {permission.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {permission.description}
                    </p>
                    <span className={`inline-flex items-center mt-2 text-xs font-medium ${getRiskColor(permission.risk)}`}>
                      <IoInformationCircleOutline className="w-3 h-3 mr-1" />
                      {getRiskLabel(permission.risk)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(permission.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 flex-shrink-0 ${
                    formData[permission.key as keyof typeof formData] 
                      ? 'bg-green-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData[permission.key as keyof typeof formData] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Current Status Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Permission Summary</h3>
              <div className="mt-3 space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  <strong>Account Status:</strong> {formData.isActive ? 'Active' : 'Suspended'}
                </p>
                <p>
                  <strong>Instant Booking:</strong> {formData.canInstantBook ? 'Enabled' : 'Disabled'}
                </p>
                <p>
                  <strong>Verification Level:</strong>{' '}
                  {formData.fullyVerified ? 'Fully Verified' : 
                   formData.isVerified ? 'Basic Verification' : 'Unverified'}
                </p>
                <p>
                  <strong>Documents:</strong> {formData.documentsVerified ? 'Verified' : 'Not Verified'}
                </p>
                <p>
                  <strong>Insurance:</strong> {formData.insuranceVerified ? 'Verified' : 'Not Verified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                hasChanges && !saving
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleReset}
              disabled={!hasChanges || saving}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                hasChanges && !saving
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Reset
            </button>
          </div>

          <Link
            href={`/fleet/guests/${guestId}/documents?key=phoenix-fleet-2847`}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
          >
            <IoDocumentTextOutline className="w-4 h-4 mr-2" />
            View Documents
          </Link>
        </div>

        {/* Change Indicator */}
        {hasChanges && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
              <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                You have unsaved changes. Click "Save Changes" to apply them.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}