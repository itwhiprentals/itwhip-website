// app/fleet/guests/[id]/components/WarningModal.tsx
'use client'

import { useState } from 'react'
import { 
  IoTimeOutline,
  IoConstructOutline,
  IoColorWandOutline,
  IoResizeOutline,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoCardOutline,
  IoChatbubbleEllipsesOutline,
  IoBanOutline,
  IoPersonOutline,
  IoCloseCircleOutline,
  IoPawOutline,
  IoWaterOutline,
  IoDocumentOutline,
  IoCreateOutline,
  IoFlashOutline,
  IoDiamondOutline,
  IoTrophyOutline,
  IoHandLeftOutline,
  IoAlertCircleOutline,
  IoAlertOutline,
  IoCloseOutline
} from 'react-icons/io5'

interface WarningModalProps {
  isOpen: boolean
  onClose: () => void
  guestId: string
  guestName: string
  currentWarningCount: number
  onSuccess: () => void
}

const WARNING_CATEGORIES = [
  { value: 'LATE_RETURNS', label: 'Late Returns', icon: IoTimeOutline, color: 'orange' },
  { value: 'VEHICLE_DAMAGE', label: 'Vehicle Damage', icon: IoConstructOutline, color: 'red' },
  { value: 'CLEANLINESS_ISSUES', label: 'Cleanliness Issues', icon: IoColorWandOutline, color: 'yellow' },
  { value: 'MILEAGE_VIOLATIONS', label: 'Mileage Violations', icon: IoResizeOutline, color: 'orange' },
  { value: 'POLICY_VIOLATIONS', label: 'Policy Violations', icon: IoDocumentTextOutline, color: 'red' },
  { value: 'FRAUDULENT_ACTIVITY', label: 'Fraudulent Activity', icon: IoWarningOutline, color: 'red' },
  { value: 'PAYMENT_ISSUES', label: 'Payment Issues', icon: IoCardOutline, color: 'red' },
  { value: 'COMMUNICATION_ISSUES', label: 'Communication Issues', icon: IoChatbubbleEllipsesOutline, color: 'yellow' },
  { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Inappropriate Behavior', icon: IoBanOutline, color: 'red' },
  { value: 'UNAUTHORIZED_DRIVER', label: 'Unauthorized Driver', icon: IoPersonOutline, color: 'red' },
  { value: 'SMOKING_VIOLATION', label: 'Smoking Violation', icon: IoCloseCircleOutline, color: 'orange' },
  { value: 'PET_VIOLATION', label: 'Pet Violation', icon: IoPawOutline, color: 'orange' },
  { value: 'FUEL_VIOLATIONS', label: 'Fuel Violations', icon: IoWaterOutline, color: 'yellow' },
  { value: 'DOCUMENTATION_ISSUES', label: 'Documentation Issues', icon: IoDocumentOutline, color: 'yellow' },
  { value: 'OTHER', label: 'Other (Custom)', icon: IoCreateOutline, color: 'gray' }
]

const DURATIONS = [
  { value: '1_WEEK', label: '1 Week', days: 7 },
  { value: '2_WEEKS', label: '2 Weeks', days: 14 },
  { value: '1_MONTH', label: '1 Month', days: 30 },
  { value: '3_MONTHS', label: '3 Months', days: 90 },
  { value: '6_MONTHS', label: '6 Months', days: 180 },
  { value: 'CUSTOM', label: 'Custom Date', days: 0 }
]

const RESTRICTIONS = [
  { 
    value: 'INSTANT_BOOK', 
    label: 'Disable Instant Book', 
    description: 'Guest must wait for host approval',
    icon: IoFlashOutline
  },
  { 
    value: 'LUXURY_CARS', 
    label: 'Disable Luxury Cars', 
    description: 'Cannot book cars $100+/day',
    icon: IoDiamondOutline
  },
  { 
    value: 'PREMIUM_CARS', 
    label: 'Disable Premium Cars', 
    description: 'Cannot book cars $200+/day',
    icon: IoTrophyOutline
  },
  { 
    value: 'MANUAL_APPROVAL', 
    label: 'Require Manual Approval', 
    description: 'All bookings need host approval',
    icon: IoHandLeftOutline
  }
]

export default function WarningModal({
  isOpen,
  onClose,
  guestId,
  guestName,
  currentWarningCount,
  onSuccess
}: WarningModalProps) {
  const [category, setCategory] = useState('')
  const [duration, setDuration] = useState('1_MONTH')
  const [customDate, setCustomDate] = useState('')
  const [restrictions, setRestrictions] = useState<string[]>([])
  const [publicReason, setPublicReason] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const newWarningCount = currentWarningCount + 1

  const handleRestrictionToggle = (restrictionValue: string) => {
    setRestrictions(prev => 
      prev.includes(restrictionValue)
        ? prev.filter(r => r !== restrictionValue)
        : [...prev, restrictionValue]
    )
  }

  const calculateExpirationDate = () => {
    if (duration === 'CUSTOM') {
      return customDate ? new Date(customDate).toISOString() : null
    }
    
    const durationObj = DURATIONS.find(d => d.value === duration)
    if (!durationObj) return null
    
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + durationObj.days)
    return expiresAt.toISOString()
  }

  const handleSubmit = async () => {
    // Validation
    if (!category) {
      setError('Please select a warning category')
      return
    }
    if (!publicReason.trim()) {
      setError('Public reason is required')
      return
    }

    if (duration === 'CUSTOM' && !customDate) {
      setError('Please select a custom expiration date')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const expiresAt = calculateExpirationDate()

      const response = await fetch(`/api/fleet/guests/${guestId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Fleet-Key': 'phoenix-fleet-2847'
        },
        body: JSON.stringify({
          action: 'warn',
          warningCategory: category,
          reason: publicReason.trim(),
          internalNotes: internalNotes.trim() || undefined,
          expiresAt,
          restrictions: restrictions.length > 0 ? restrictions : undefined
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to issue warning')
      }

      // Success
      onSuccess()
      onClose()
      
      // Reset form
      setCategory('')
      setDuration('1_MONTH')
      setCustomDate('')
      setRestrictions([])
      setPublicReason('')
      setInternalNotes('')
      
    } catch (err: any) {
      setError(err.message || 'Failed to issue warning')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCategory = WARNING_CATEGORIES.find(c => c.value === category)
  const severityColor = newWarningCount === 1 ? 'yellow' : newWarningCount === 2 ? 'orange' : 'red'
  const severityText = newWarningCount === 1 ? 'First Warning' : newWarningCount === 2 ? 'Second Warning' : 'Final Warning'

  const SeverityIcon = severityColor === 'yellow' ? IoWarningOutline : severityColor === 'orange' ? IoAlertCircleOutline : IoAlertOutline

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Issue Warning
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Guest: <span className="font-semibold">{guestName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>

        {/* Warning Count Alert */}
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          severityColor === 'yellow' ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700' :
          severityColor === 'orange' ? 'bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700' :
          'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700'
        }`}>
          <div className="flex items-center">
            <SeverityIcon className={`w-8 h-8 mr-3 ${
              severityColor === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
              severityColor === 'orange' ? 'text-orange-600 dark:text-orange-400' :
              'text-red-600 dark:text-red-400'
            }`} />
            <div>
              <p className={`font-bold ${
                severityColor === 'yellow' ? 'text-yellow-800 dark:text-yellow-200' :
                severityColor === 'orange' ? 'text-orange-800 dark:text-orange-200' :
                'text-red-800 dark:text-red-200'
              }`}>
                {severityText} - Total: {newWarningCount} Warning{newWarningCount > 1 ? 's' : ''}
              </p>
              <p className={`text-sm ${
                severityColor === 'yellow' ? 'text-yellow-700 dark:text-yellow-300' :
                severityColor === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                'text-red-700 dark:text-red-300'
              }`}>
                {newWarningCount === 1 && 'First offense - General reminder'}
                {newWarningCount === 2 && 'Second offense - Consider restrictions'}
                {newWarningCount >= 3 && 'Third+ offense - Strong action recommended'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Warning Category */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Warning Category *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {WARNING_CATEGORIES.map(cat => {
              const CategoryIcon = cat.icon
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    category === cat.value
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CategoryIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {cat.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Warning Duration (Probation Period) *
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
            {DURATIONS.map(dur => (
              <button
                key={dur.value}
                type="button"
                onClick={() => setDuration(dur.value)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  duration === dur.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {dur.label}
                </span>
              </button>
            ))}
          </div>
          
          {duration === 'CUSTOM' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          )}
        </div>

        {/* Feature Restrictions */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Feature Restrictions (Optional)
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Select which features to restrict during the probation period
          </p>
          <div className="space-y-2">
            {RESTRICTIONS.map(restriction => {
              const RestrictionIcon = restriction.icon
              return (
                <label
                  key={restriction.value}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={restrictions.includes(restriction.value)}
                    onChange={() => handleRestrictionToggle(restriction.value)}
                    className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <RestrictionIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {restriction.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {restriction.description}
                    </p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Public Reason */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Public Reason (Shown to Guest) *
          </label>
          <textarea
            value={publicReason}
            onChange={(e) => setPublicReason(e.target.value)}
            rows={3}
            placeholder="e.g., Late return on last 2 trips. Please ensure timely vehicle returns."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Internal Notes */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Internal Notes (Admin Only)
          </label>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={2}
            placeholder="Additional context for admin team (not visible to guest)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Summary Box */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h4>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• Category: <span className={`font-medium ${!selectedCategory ? 'text-red-500' : ''}`}>{selectedCategory?.label || 'Not selected'}</span></li>
            <li>• New Warning Count: <span className="font-medium">{newWarningCount}</span></li>
            <li>• Duration: <span className="font-medium">
              {duration === 'CUSTOM' ? (customDate ? new Date(customDate).toLocaleDateString() : 'Not set') : DURATIONS.find(d => d.value === duration)?.label}
            </span></li>
            {restrictions.length > 0 && (
              <li>• Restrictions: <span className="font-medium">{restrictions.length} feature{restrictions.length > 1 ? 's' : ''} disabled</span></li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !publicReason.trim() || !category}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Issuing Warning...' : 'Issue Warning'}
          </button>
        </div>

      </div>
    </div>
  )
}