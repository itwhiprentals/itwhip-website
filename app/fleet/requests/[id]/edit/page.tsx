// app/fleet/requests/[id]/edit/page.tsx
// Edit Reservation Request Page

'use client'

import { useState, useEffect, use } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoSaveOutline,
  IoRefreshOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface RequestData {
  id: string
  requestCode: string
  guestName: string
  guestEmail?: string
  guestPhone?: string
  vehicleType?: string
  vehicleMake?: string
  vehicleModel?: string
  quantity: number
  startDate?: string
  endDate?: string
  durationDays?: number
  pickupCity?: string
  pickupState?: string
  offeredRate?: number
  isNegotiable: boolean
  status: string
  priority: string
  source?: string
  guestNotes?: string
  adminNotes?: string
}

export default function EditRequestPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    quantity: 1,
    startDate: '',
    endDate: '',
    durationDays: '',
    pickupCity: 'Phoenix',
    pickupState: 'AZ',
    offeredRate: '',
    isNegotiable: true,
    priority: 'NORMAL',
    status: 'OPEN',
    source: '',
    guestNotes: '',
    adminNotes: ''
  })
  const [requestCode, setRequestCode] = useState('')

  // Email validation state
  const [emailStatus, setEmailStatus] = useState<{
    exists: boolean
    owner: string | null
    type: string | null
  } | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)

  // Fetch existing request data
  useEffect(() => {
    async function fetchRequest() {
      try {
        const response = await fetch(`/api/fleet/requests/${id}?key=${apiKey}`)
        const data = await response.json()

        if (data.success && data.request) {
          const req = data.request as RequestData
          setRequestCode(req.requestCode)
          setFormData({
            guestName: req.guestName || '',
            guestEmail: req.guestEmail || '',
            guestPhone: req.guestPhone || '',
            vehicleType: req.vehicleType || '',
            vehicleMake: req.vehicleMake || '',
            vehicleModel: req.vehicleModel || '',
            quantity: req.quantity || 1,
            startDate: req.startDate ? new Date(req.startDate).toISOString().split('T')[0] : '',
            endDate: req.endDate ? new Date(req.endDate).toISOString().split('T')[0] : '',
            durationDays: req.durationDays?.toString() || '',
            pickupCity: req.pickupCity || 'Phoenix',
            pickupState: req.pickupState || 'AZ',
            offeredRate: req.offeredRate?.toString() || '',
            isNegotiable: req.isNegotiable ?? true,
            priority: req.priority || 'NORMAL',
            status: req.status || 'OPEN',
            source: req.source || '',
            guestNotes: req.guestNotes || '',
            adminNotes: req.adminNotes || ''
          })
        } else {
          setError('Request not found')
        }
      } catch (err) {
        console.error('Failed to fetch request:', err)
        setError('Failed to load request')
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [id, apiKey])

  // Auto-calculate duration when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = end.getTime() - start.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 0) {
        setFormData(prev => ({ ...prev, durationDays: diffDays.toString() }))
      } else {
        setFormData(prev => ({ ...prev, durationDays: '' }))
      }
    } else {
      setFormData(prev => ({ ...prev, durationDays: '' }))
    }
  }, [formData.startDate, formData.endDate])

  // Check guest email against database (debounced)
  useEffect(() => {
    const email = formData.guestEmail?.trim()

    // Clear status if no email
    if (!email) {
      setEmailStatus(null)
      return
    }

    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      setEmailStatus(null)
      return
    }

    // Debounce the check
    const timeoutId = setTimeout(async () => {
      setCheckingEmail(true)
      try {
        const response = await fetch(
          `/api/fleet/prospects/check-email?email=${encodeURIComponent(email)}&key=${apiKey}`
        )
        const data = await response.json()

        // Track if email belongs to verified account OR existing prospect
        if (data.exists) {
          setEmailStatus({
            exists: true,
            owner: data.owner,
            type: data.type  // 'host', 'user', 'guest', or 'prospect'
          })
        } else {
          setEmailStatus({
            exists: false,
            owner: null,
            type: null
          })
        }
      } catch (err) {
        console.error('Failed to check email:', err)
        setEmailStatus(null)
      } finally {
        setCheckingEmail(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.guestEmail, apiKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/fleet/requests/${id}?key=${apiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity) || 1,
          durationDays: formData.durationDays ? Number(formData.durationDays) : undefined,
          offeredRate: formData.offeredRate ? Number(formData.offeredRate) : undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/fleet/requests?key=${apiKey}`)
      } else {
        setError(data.error || 'Failed to update request')
      }
    } catch (err) {
      console.error('Failed to update request:', err)
      setError('Failed to update request')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/fleet/requests/${id}?key=${apiKey}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/fleet/requests?key=${apiKey}`)
      } else {
        setError(data.error || 'Failed to cancel request')
      }
    } catch (err) {
      console.error('Failed to cancel request:', err)
      setError('Failed to cancel request')
    } finally {
      setSaving(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <IoRefreshOutline className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !formData.guestName) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <IoWarningOutline className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">{error}</h2>
            <Link
              href={`/fleet/requests?key=${apiKey}`}
              className="text-red-600 hover:text-red-700 dark:text-red-400 underline"
            >
              Back to Requests
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 px-4 pt-4 pb-2 sm:relative sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href={`/fleet/requests?key=${apiKey}`}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                Edit Request
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                #{requestCode}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
            >
              <IoTrashOutline className="w-4 h-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Request Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              >
                <option value="OPEN">Open</option>
                <option value="CLAIMED">Claimed</option>
                <option value="CAR_ASSIGNED">Car Assigned</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              >
                <option value="">Select source</option>
                <option value="contact_form">Contact Form</option>
                <option value="fb_marketplace">FB Marketplace</option>
                <option value="phone_call">Phone Call</option>
                <option value="email">Email</option>
                <option value="referral">Referral</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Guest Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Guest Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              />
              {/* Email Status Badge */}
              {formData.guestEmail && (
                <div className="mt-2">
                  {checkingEmail ? (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <IoRefreshOutline className="w-3 h-3 animate-spin" />
                      Checking...
                    </span>
                  ) : emailStatus?.exists && emailStatus.type !== 'prospect' ? (
                    // Verified account (host, user, guest/reviewer)
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 rounded-full">
                      <IoShieldCheckmarkOutline className="w-3 h-3" />
                      Linked: {emailStatus.owner}
                    </span>
                  ) : emailStatus?.exists && emailStatus.type === 'prospect' ? (
                    // Existing prospect - we've already contacted them
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-full">
                      <IoAlertCircleOutline className="w-3 h-3" />
                      EXISTING PROSPECT: {emailStatus.owner}
                    </span>
                  ) : emailStatus !== null ? (
                    // Completely new email
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700 rounded-full">
                      <IoAlertCircleOutline className="w-3 h-3" />
                      NEW - Not in our system
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Vehicle Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              >
                <option value="">Any</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Minivan">Minivan</option>
                <option value="Compact">Compact</option>
                <option value="Luxury">Luxury</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Make
              </label>
              <input
                type="text"
                value={formData.vehicleMake}
                onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                placeholder="Honda"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                placeholder="Accord"
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Qty
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Dates & Location</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                min={formData.startDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formData.durationDays ? `${formData.durationDays} days` : '-'}
                readOnly
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-base cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.pickupCity}
                onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.pickupState}
                onChange={(e) => setFormData({ ...formData, pickupState: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
              />
            </div>
          </div>
        </div>

        {/* Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Pricing</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rate/day
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.offeredRate}
                  onChange={(e) => setFormData({ ...formData, offeredRate: e.target.value })}
                  placeholder="22"
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                />
              </div>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNegotiable}
                  onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Rate negotiable</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Guest Notes
              </label>
              <textarea
                rows={3}
                value={formData.guestNotes}
                onChange={(e) => setFormData({ ...formData, guestNotes: e.target.value })}
                placeholder="Special requests from guest..."
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Admin Notes
              </label>
              <textarea
                rows={3}
                value={formData.adminNotes}
                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                placeholder="Internal notes..."
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-base"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Link
            href={`/fleet/requests?key=${apiKey}`}
            className="flex-1 sm:flex-none px-6 py-3 text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !formData.guestName}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <IoRefreshOutline className="w-5 h-5 animate-spin" />
            ) : (
              <IoSaveOutline className="w-5 h-5" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <IoWarningOutline className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              Cancel Request?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
              This will mark the request as cancelled. Any active claims will be expired.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Keep Request
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
