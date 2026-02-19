// app/fleet/vehicles/[id]/page.tsx
'use client'

import { useState, useEffect, use, useCallback } from 'react'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoCarOutline,
  IoImageOutline,
  IoStarOutline,
  IoCallOutline,
  IoMailOutline,
  IoPersonOutline,
  IoCreateOutline,
  IoLocationOutline,
  IoSwapHorizontalOutline,
  IoSettingsOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoChevronForwardOutline,
  IoCheckmarkOutline,
  IoSendOutline,
  IoCloseOutline,
  IoPhonePortraitOutline,
} from 'react-icons/io5'

// ─── Types ────────────────────────────────────────────────────────────────────

interface VehicleHost {
  id: string
  name: string
  email: string
  phone: string | null
  hostType: string
  approvalStatus: string
  active: boolean
  documentsVerified: boolean
  isVerified: boolean
  photoIdVerified: boolean
  stripeConnected: boolean
  stripePayoutsEnabled: boolean
  stripeChargesEnabled: boolean
  bankVerified: boolean
  commissionRate: number
  rating: number
  totalTrips: number
  profilePhoto: string | null
}

interface Blocker {
  key: string
  label: string
  severity: 'error' | 'warning'
}

interface Booking {
  id: string
  bookingCode: string
  status: string
  startDate: string
  endDate: string
  totalAmount: number
  guestName: string
}

interface VehicleDetail {
  id: string
  name: string
  year: number
  make: string
  model: string
  vin: string | null
  licensePlate: string | null
  isActive: boolean
  vehicleType: string
  carType: string
  hasActiveClaim: boolean
  activeClaimId: string | null
  claimDeactivatedAt: string | null
  safetyHold: boolean
  safetyHoldReason: string | null
  requiresInspection: boolean
  dailyRate: number
  weeklyRate: number | null
  monthlyRate: number | null
  deliveryFee: number
  insuranceDaily: number
  insuranceIncluded: boolean
  noDeposit: boolean
  color: string
  seats: number
  doors: number
  transmission: string
  fuelType: string
  currentMileage: number | null
  instantBook: boolean
  primaryPhoto: string | null
  photos: string[]
  photoCount: number
  features: string
  description: string | null
  address: string
  city: string
  state: string
  zipCode: string
  airportPickup: boolean
  hotelDelivery: boolean
  homeDelivery: boolean
  minTripDuration: number
  maxTripDuration: number
  createdAt: string
  updatedAt: string
  isSearchable: boolean
  blockers: Blocker[]
  host: VehicleHost | null
  recentBookings: Booking[]
  stats: {
    totalRevenue: number
    completedBookings: number
    totalBookings: number
    pendingBookings: number
    confirmedBookings: number
    cancelledBookings: number
    avgRating: number
    reviewCount: number
  }
}

// ─── Inline Edit Component ────────────────────────────────────────────────────

function InlineEdit({
  value,
  onSave,
  saving,
  type = 'text',
  prefix,
  placeholder,
  uppercase,
  inputWidth = 'w-16',
}: {
  value: string
  onSave: (val: string) => void
  saving: boolean
  type?: 'text' | 'number'
  prefix?: string
  placeholder?: string
  uppercase?: boolean
  inputWidth?: string
}) {
  const [editValue, setEditValue] = useState(value)

  return (
    <div className="flex items-center gap-1">
      {prefix && <span className="text-sm text-gray-500">{prefix}</span>}
      <input
        type={type}
        value={editValue}
        onChange={e => setEditValue(uppercase ? e.target.value.toUpperCase() : e.target.value)}
        placeholder={placeholder}
        className={`${inputWidth} px-1.5 py-0.5 text-sm border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${uppercase ? 'uppercase' : ''}`}
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Enter' && editValue) onSave(editValue)
          if (e.key === 'Escape') onSave('')
        }}
      />
      <button
        onClick={() => editValue && onSave(editValue)}
        disabled={!editValue || saving}
        className="p-0.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded disabled:opacity-30"
      >
        <IoCheckmarkOutline className="text-sm" />
      </button>
    </div>
  )
}

// ─── Notify Host Bottom Sheet ─────────────────────────────────────────────────

function NotifyHostSheet({
  vehicle,
  host,
  blockers,
  onClose,
  onSent,
}: {
  vehicle: VehicleDetail
  host: VehicleHost
  blockers: Blocker[]
  onClose: () => void
  onSent: () => void
}) {
  const [email, setEmail] = useState(host.email)
  const [phone, setPhone] = useState(host.phone || '')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const errors = blockers.filter(b => b.severity === 'error')
  const warnings = blockers.filter(b => b.severity === 'warning')
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSend = async () => {
    if (!isValidEmail || sending) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`/api/fleet/vehicles/${vehicle.id}/notify-host?key=phoenix-fleet-2847`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overrideEmail: email !== host.email ? email : undefined,
          overridePhone: phone !== (host.phone || '') ? phone : undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        onSent()
        onClose()
      } else {
        setError(data.error || 'Failed to send email')
      }
    } catch (err) {
      setError('Network error — please try again')
    } finally {
      setSending(false)
    }
  }

  const carName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const totalCount = blockers.length

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sheet — slides up on mobile, centered on desktop */}
      <div className="fixed bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full z-50 bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Notify Host</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{carName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <IoCloseOutline className="text-xl text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* What this email contains */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              This email will list <strong className="text-gray-900 dark:text-white">{totalCount} issue{totalCount !== 1 ? 's' : ''}</strong> and ask {host.name.split(' ')[0]} to fix them before the car can be listed.
            </p>

            {/* Issue preview */}
            <div className="space-y-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              {errors.map(b => (
                <div key={b.key} className="flex items-start gap-2">
                  <IoCloseCircleOutline className="text-red-500 flex-shrink-0 mt-0.5 text-sm" />
                  <span className="text-xs text-red-700 dark:text-red-400">{b.label}</span>
                </div>
              ))}
              {warnings.map(b => (
                <div key={b.key} className="flex items-start gap-2">
                  <IoWarningOutline className="text-yellow-500 flex-shrink-0 mt-0.5 text-sm" />
                  <span className="text-xs text-yellow-700 dark:text-yellow-400">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject preview */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email subject</label>
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs">
              Action needed: {carName} — {totalCount} listing issue{totalCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Editable email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Send to email
              {email !== host.email && (
                <span className="ml-2 text-orange-500 text-xs font-normal">(changed from {host.email})</span>
              )}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Change this if the email on file is incorrect</p>
          </div>

          {/* Editable phone */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              <IoPhonePortraitOutline className="inline mr-1" />
              Send text to
              {phone !== (host.phone || '') && (
                <span className="ml-2 text-orange-500 text-xs font-normal">(changed from {host.phone || 'none'})</span>
              )}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="No phone on file"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {phone ? 'A text message will also be sent to this number' : 'Add a number to also send a text message'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-safe">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!isValidEmail || sending}
              className="flex-2 flex-grow-[2] px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <IoSendOutline />
                  Send Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Listing Status Banner ────────────────────────────────────────────────────

function ListingStatusBanner({
  vehicle,
  toggling,
  activateError,
  onToggle,
}: {
  vehicle: VehicleDetail
  toggling: boolean
  activateError: string | null
  onToggle: () => void
}) {
  const errors = vehicle.blockers.filter(b => b.severity === 'error')

  return (
    <div className={`rounded-lg p-4 mb-4 border ${
      vehicle.isSearchable
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    }`}>
      <div className="flex items-center gap-3">
        {vehicle.isSearchable ? (
          <IoEyeOutline className="text-2xl text-green-600 dark:text-green-400 flex-shrink-0" />
        ) : (
          <IoEyeOffOutline className="text-2xl text-red-600 dark:text-red-400 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className={`font-semibold ${
            vehicle.isSearchable ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
          }`}>
            {vehicle.isSearchable ? 'Listed — Visible to guests in search' : 'Not Listed — Hidden from guest search'}
          </p>
          {!vehicle.isSearchable && errors.length > 0 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
              {errors.length} issue{errors.length > 1 ? 's' : ''} preventing listing
            </p>
          )}
        </div>
        <button
          onClick={onToggle}
          disabled={toggling}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            vehicle.isActive
              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
              : 'bg-green-600 text-white hover:bg-green-700'
          } ${toggling ? 'opacity-50' : ''}`}
        >
          {toggling ? '...' : vehicle.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      {activateError && (
        <div className="mt-3 p-2.5 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">{activateError}</p>
        </div>
      )}
    </div>
  )
}

// ─── Blockers List ────────────────────────────────────────────────────────────

function BlockersList({
  vehicle,
  changingType,
  saving,
  onChangeType,
  onSaveField,
  onOpenSheet,
  emailSent,
}: {
  vehicle: VehicleDetail
  changingType: boolean
  saving: boolean
  onChangeType: () => void
  onSaveField: (field: string, value: any) => void
  onOpenSheet: () => void
  emailSent: boolean
}) {
  const [editingRate, setEditingRate] = useState(false)
  const errors = vehicle.blockers.filter(b => b.severity === 'error')
  const warnings = vehicle.blockers.filter(b => b.severity === 'warning')

  if (vehicle.blockers.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      {errors.map(b => (
        <div key={b.key} className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <IoCloseCircleOutline className="text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-400 flex-1">{b.label}</span>

          {b.key === 'old_vehicle' && vehicle.vehicleType === 'RENTAL' && (
            <button
              onClick={onChangeType}
              disabled={changingType}
              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              {changingType ? 'Changing...' : 'Switch to Rideshare'}
            </button>
          )}

          {b.key === 'no_rate' && !editingRate && (
            <button
              onClick={() => setEditingRate(true)}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              Set Rate
            </button>
          )}
          {b.key === 'no_rate' && editingRate && (
            <InlineEdit
              value=""
              type="number"
              prefix="$"
              placeholder="45"
              saving={saving}
              onSave={(val) => {
                if (val) onSaveField('dailyRate', parseFloat(val))
                setEditingRate(false)
              }}
            />
          )}
        </div>
      ))}

      {warnings.map(b => (
        <div key={b.key} className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <IoWarningOutline className="text-yellow-500 flex-shrink-0" />
          <span className="text-sm text-yellow-700 dark:text-yellow-400 flex-1">{b.label}</span>

          {b.key === 'old_vehicle' && vehicle.vehicleType === 'RENTAL' && (
            <button
              onClick={onChangeType}
              disabled={changingType}
              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              {changingType ? 'Changing...' : 'Switch to Rideshare'}
            </button>
          )}
        </div>
      ))}

      {vehicle.host && (
        <button
          onClick={onOpenSheet}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {emailSent ? (
            <>
              <IoCheckmarkCircleOutline className="text-lg" />
              Email Opened
            </>
          ) : (
            <>
              <IoSendOutline />
              Email Host About All Issues
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ─── Vehicle Photo ────────────────────────────────────────────────────────────

function VehiclePhoto({ vehicle }: { vehicle: VehicleDetail }) {
  return (
    <div className="sm:col-span-1">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden aspect-[4/3]">
        {vehicle.primaryPhoto ? (
          <img src={vehicle.primaryPhoto} alt={vehicle.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <div className="text-center text-gray-400">
              <IoImageOutline className="text-4xl mx-auto mb-1" />
              <p className="text-xs">No Photos</p>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
        {vehicle.photoCount} photo{vehicle.photoCount !== 1 ? 's' : ''} uploaded
      </p>
    </div>
  )
}

// ─── Editable Field Display ───────────────────────────────────────────────────

function EditableFieldDisplay({
  label,
  value,
  displayValue,
  onEdit,
  isEmpty,
  emptyLabel,
}: {
  label: string
  value: string | number | null
  displayValue?: string
  onEdit: () => void
  isEmpty?: boolean
  emptyLabel?: string
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <div className="flex items-center gap-1.5">
        <p className={`text-sm font-medium ${isEmpty ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
          {displayValue || (isEmpty ? (emptyLabel || '— Missing') : String(value))}
        </p>
        <button onClick={onEdit} className="text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" title={`Edit ${label.toLowerCase()}`}>
          <IoCreateOutline />
        </button>
      </div>
    </div>
  )
}

// ─── Vehicle Info Card ────────────────────────────────────────────────────────

function VehicleInfoCard({
  vehicle,
  changingType,
  saving,
  onChangeType,
  onSaveField,
}: {
  vehicle: VehicleDetail
  changingType: boolean
  saving: boolean
  onChangeType: () => void
  onSaveField: (field: string, value: any) => void
}) {
  const [editField, setEditField] = useState<string | null>(null)

  const handleSave = (field: string, value: any) => {
    onSaveField(field, value)
    setEditField(null)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Vehicle Type */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold ${
              vehicle.vehicleType === 'RIDESHARE' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'
            }`}>
              {vehicle.vehicleType}
            </span>
            <button
              onClick={onChangeType}
              disabled={changingType}
              className="text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              title={`Switch to ${vehicle.vehicleType === 'RENTAL' ? 'Rideshare' : 'Rental'}`}
            >
              <IoSwapHorizontalOutline />
            </button>
          </div>
          {vehicle.vehicleType === 'RENTAL' && vehicle.year < 2015 && (
            <p className="text-xs text-red-500 mt-0.5">Pre-2015 — should be Rideshare</p>
          )}
        </div>

        {/* Daily Rate */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Daily Rate</p>
          {editField === 'dailyRate' ? (
            <InlineEdit
              value={vehicle.dailyRate > 0 ? String(vehicle.dailyRate) : ''}
              type="number"
              prefix="$"
              saving={saving}
              onSave={(val) => val ? handleSave('dailyRate', parseFloat(val)) : setEditField(null)}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <p className={`text-sm font-semibold ${vehicle.dailyRate <= 0 ? 'text-red-600' : 'text-green-600 dark:text-green-400'}`}>
                {vehicle.dailyRate > 0 ? `$${vehicle.dailyRate}/day` : '$0 — Not Set'}
              </p>
              <button onClick={() => setEditField('dailyRate')} className="text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                <IoCreateOutline />
              </button>
            </div>
          )}
        </div>

        {/* Static fields */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{vehicle.carType || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Transmission</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{vehicle.transmission || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Fuel</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{vehicle.fuelType || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Seats</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.seats}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">VIN</p>
          <p className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">{vehicle.vin || '—'}</p>
        </div>

        {/* License Plate — editable */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">License Plate</p>
          {editField === 'licensePlate' ? (
            <InlineEdit
              value={vehicle.licensePlate || ''}
              placeholder="ABC1234"
              uppercase
              inputWidth="w-20"
              saving={saving}
              onSave={(val) => val ? handleSave('licensePlate', val) : setEditField(null)}
            />
          ) : (
            <EditableFieldDisplay
              label=""
              value={vehicle.licensePlate}
              isEmpty={!vehicle.licensePlate}
              emptyLabel="— Missing"
              onEdit={() => setEditField('licensePlate')}
            />
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Instant Book</p>
          <p className={`text-sm font-medium ${vehicle.instantBook ? 'text-blue-600' : 'text-gray-500'}`}>
            {vehicle.instantBook ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────

function PricingCard({
  vehicle,
  saving,
  onSaveField,
}: {
  vehicle: VehicleDetail
  saving: boolean
  onSaveField: (field: string, value: any) => void
}) {
  const [editField, setEditField] = useState<string | null>(null)

  const handleSave = (field: string, value: any) => {
    onSaveField(field, value)
    setEditField(null)
  }

  const rates: { key: string; label: string; value: number | null; field: string }[] = [
    { key: 'daily', label: 'Daily', value: vehicle.dailyRate, field: 'dailyRate' },
    { key: 'weekly', label: 'Weekly', value: vehicle.weeklyRate, field: 'weeklyRate' },
    { key: 'monthly', label: 'Monthly', value: vehicle.monthlyRate, field: 'monthlyRate' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Pricing</h3>
      <div className="grid grid-cols-3 gap-3">
        {rates.map(r => (
          <div key={r.key}>
            <p className="text-xs text-gray-500">{r.label}</p>
            {editField === r.field ? (
              <InlineEdit
                value={r.value ? String(r.value) : ''}
                type="number"
                prefix="$"
                inputWidth="w-14"
                saving={saving}
                onSave={(val) => val ? handleSave(r.field, parseFloat(val)) : setEditField(null)}
              />
            ) : (
              <div className="flex items-center gap-1">
                <p className={`text-sm font-bold ${r.key === 'daily' && (r.value || 0) <= 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {r.value ? `$${r.value}` : '—'}
                </p>
                <button onClick={() => setEditField(r.field)} className="text-xs text-gray-400 hover:text-blue-600">
                  <IoCreateOutline />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Delivery: ${vehicle.deliveryFee}</span>
        <span>Insurance: ${vehicle.insuranceDaily}/day</span>
        {vehicle.noDeposit && <span className="text-green-600">No Deposit</span>}
      </div>
    </div>
  )
}

// ─── Host Card ────────────────────────────────────────────────────────────────

function HostCard({ host }: { host: VehicleHost }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Host</h3>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          {host.profilePhoto ? (
            <img src={host.profilePhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <IoPersonOutline className="text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/fleet/hosts/${host.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
              {host.name}
            </Link>
            <StatusBadge status={host.approvalStatus} />
            <HostTypeBadge type={host.hostType} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{host.email}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            <VerificationItem label="Identity" verified={host.photoIdVerified} />
            <VerificationItem label="Documents" verified={host.documentsVerified} />
            <VerificationItem label="Stripe" verified={host.stripeConnected} />
            <VerificationItem label="Payouts" verified={host.stripePayoutsEnabled} />
          </div>

          <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span><IoStarOutline className="inline mr-0.5" />{host.rating.toFixed(1)} rating</span>
            <span>{host.totalTrips} trips</span>
            <span>{(host.commissionRate * 100).toFixed(0)}% commission</span>
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          {host.phone && (
            <a href={`tel:${host.phone}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Call host">
              <IoCallOutline className="text-gray-600 dark:text-gray-400" />
            </a>
          )}
          <a href={`mailto:${host.email}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Email host">
            <IoMailOutline className="text-gray-600 dark:text-gray-400" />
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Location & Delivery ──────────────────────────────────────────────────────

function LocationDelivery({ vehicle }: { vehicle: VehicleDetail }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Location & Delivery</h3>
      <div className="flex items-start gap-2">
        <IoLocationOutline className="text-gray-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-gray-900 dark:text-white">{vehicle.address || 'No address set'}</p>
          <p className="text-xs text-gray-500">{vehicle.city}, {vehicle.state} {vehicle.zipCode}</p>
        </div>
      </div>
      <div className="flex gap-3 mt-2">
        <DeliveryBadge label="Airport" enabled={vehicle.airportPickup} />
        <DeliveryBadge label="Hotel" enabled={vehicle.hotelDelivery} />
        <DeliveryBadge label="Home" enabled={vehicle.homeDelivery} />
      </div>
    </div>
  )
}

// ─── Stats Grid ───────────────────────────────────────────────────────────────

function StatsGrid({ stats }: { stats: VehicleDetail['stats'] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(0)}`} color="text-green-600 dark:text-green-400" />
      <StatCard label="Bookings" value={String(stats.totalBookings)} sub={`${stats.completedBookings} completed`} />
      <StatCard label="Rating" value={stats.avgRating.toFixed(1)} sub={`${stats.reviewCount} reviews`} />
      <StatCard label="Active" value={String(stats.confirmedBookings)} sub={`${stats.pendingBookings} pending`} color="text-blue-600 dark:text-blue-400" />
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-lg font-bold ${color || 'text-gray-900 dark:text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

// ─── Recent Bookings ──────────────────────────────────────────────────────────

function RecentBookings({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Recent Bookings</h3>
      <div className="space-y-2">
        {bookings.slice(0, 5).map(booking => (
          <Link
            key={booking.id}
            href={`/fleet/bookings?search=${booking.bookingCode}`}
            className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookingStatusBadge status={booking.status} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.guestName}</p>
                <p className="text-xs text-gray-500">{booking.bookingCode}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">${booking.totalAmount}</p>
              <p className="text-xs text-gray-500">{new Date(booking.startDate).toLocaleDateString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Actions Panel ────────────────────────────────────────────────────────────

function ActionsPanel({ vehicle }: { vehicle: VehicleDetail }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <ActionLink href={`/fleet/edit/${vehicle.id}`} icon={IoSettingsOutline} label="Full Edit Page" color="blue" />
        {vehicle.host && (
          <ActionLink href={`/fleet/hosts/${vehicle.host.id}`} icon={IoPersonOutline} label="View Host Profile" color="purple" />
        )}
        {vehicle.host && (
          <ActionLink href={`/fleet/hosts/${vehicle.host.id}/cars`} icon={IoCarOutline} label="Host's Other Cars" color="gray" />
        )}
        {vehicle.hasActiveClaim && vehicle.activeClaimId && (
          <ActionLink href={`/fleet/claims?search=${vehicle.activeClaimId}`} icon={IoAlertCircleOutline} label="View Active Claim" color="orange" />
        )}
      </div>
    </div>
  )
}

function ActionLink({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: 'blue' | 'purple' | 'gray' | 'orange'
}) {
  const styles = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30',
    gray: 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30',
  }
  const iconColors = {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    gray: 'text-gray-600 dark:text-gray-400',
    orange: 'text-orange-600 dark:text-orange-400',
  }
  const textColors = {
    blue: 'text-blue-700 dark:text-blue-300',
    purple: 'text-purple-700 dark:text-purple-300',
    gray: 'text-gray-700 dark:text-gray-300',
    orange: 'text-orange-700 dark:text-orange-300',
  }

  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-4 py-3 border rounded-lg transition-colors ${styles[color]}`}
    >
      <div className="flex items-center gap-2">
        <Icon className={iconColors[color]} />
        <span className={`text-sm font-medium ${textColors[color]}`}>{label}</span>
      </div>
      <IoChevronForwardOutline className={iconColors[color]} />
    </Link>
  )
}

// ─── Small Utility Components ─────────────────────────────────────────────────

function VerificationItem({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {verified ? (
        <IoCheckmarkCircleOutline className="text-green-500 text-sm" />
      ) : (
        <IoCloseCircleOutline className="text-red-400 text-sm" />
      )}
      <span className={`text-xs ${verified ? 'text-green-700 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
        {label}
      </span>
    </div>
  )
}

function DeliveryBadge({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${
      enabled
        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
    }`}>
      {enabled ? '\u2713' : '\u2717'} {label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const style = status === 'APPROVED'
    ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
    : status === 'PENDING'
    ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
    : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'

  return <span className={`px-1.5 py-0.5 text-xs rounded-full ${style}`}>{status}</span>
}

function HostTypeBadge({ type }: { type: string }) {
  const isPlatform = type === 'PLATFORM' || type === 'MANAGED'
  return (
    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
      isPlatform
        ? 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30'
        : 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
    }`}>
      {isPlatform ? 'Platform' : 'Partner'}
    </span>
  )
}

function BookingStatusBadge({ status }: { status: string }) {
  const style = status === 'CONFIRMED' ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
    : status === 'PENDING' ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
    : status === 'COMPLETED' ? 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
    : status === 'CANCELLED' ? 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
    : 'text-gray-700 bg-gray-100'

  return <span className={`px-1.5 py-0.5 text-xs rounded-full ${style}`}>{status}</span>
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [changingType, setChangingType] = useState(false)
  const [saving, setSaving] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [showNotifySheet, setShowNotifySheet] = useState(false)
  const [activateError, setActivateError] = useState<string | null>(null)

  const fetchVehicle = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/fleet/vehicles/${id}?key=phoenix-fleet-2847`)
      const data = await res.json()
      if (data.success) setVehicle(data.vehicle)
    } catch (error) {
      console.error('Failed to fetch vehicle:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchVehicle()
  }, [fetchVehicle])

  const handleToggleActive = async () => {
    if (!vehicle) return

    if (!vehicle.isActive) {
      const blockingErrors = vehicle.blockers.filter(b => b.severity === 'error' && b.key !== 'inactive')
      if (blockingErrors.length > 0) {
        setActivateError(`Cannot activate: ${blockingErrors.map(e => e.label).join(', ')}`)
        setTimeout(() => setActivateError(null), 5000)
        return
      }
    }

    setToggling(true)
    setActivateError(null)
    try {
      const action = vehicle.isActive ? 'suspend' : 'activate'
      const res = await fetch(`/api/fleet/vehicles/${id}?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if ((await res.json()).success) fetchVehicle()
    } catch (error) {
      console.error('Failed to toggle:', error)
    } finally {
      setToggling(false)
    }
  }

  const handleChangeVehicleType = async () => {
    if (!vehicle) return
    setChangingType(true)
    try {
      const newType = vehicle.vehicleType === 'RENTAL' ? 'RIDESHARE' : 'RENTAL'
      const res = await fetch(`/fleet/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType: newType }),
      })
      if ((await res.json()).success) fetchVehicle()
    } catch (error) {
      console.error('Failed to change type:', error)
    } finally {
      setChangingType(false)
    }
  }

  const handleSaveField = async (field: string, value: any) => {
    if (!vehicle) return
    setSaving(true)
    try {
      const res = await fetch(`/fleet/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if ((await res.json()).success) fetchVehicle()
    } catch (error) {
      console.error(`Failed to save ${field}:`, error)
    } finally {
      setSaving(false)
    }
  }

  const handleEmailSent = () => {
    setEmailSent(true)
    setTimeout(() => setEmailSent(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading vehicle...</div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <IoCarOutline className="mx-auto text-5xl text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Vehicle not found</h3>
          <Link href="/fleet/vehicles" className="text-blue-600 hover:underline text-sm">Back to vehicles</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 px-4 pt-4 pb-2 sm:relative sm:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/fleet/vehicles" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <IoArrowBackOutline className="text-xl" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {vehicle.color} &bull; {vehicle.city}, {vehicle.state}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <ListingStatusBanner
          vehicle={vehicle}
          toggling={toggling}
          activateError={activateError}
          onToggle={handleToggleActive}
        />

        <BlockersList
          vehicle={vehicle}
          changingType={changingType}
          saving={saving}
          onChangeType={handleChangeVehicleType}
          onSaveField={handleSaveField}
          onOpenSheet={() => setShowNotifySheet(true)}
          emailSent={emailSent}
        />

        {/* Photo + Vehicle Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <VehiclePhoto vehicle={vehicle} />
          <div className="sm:col-span-2 space-y-3">
            <VehicleInfoCard
              vehicle={vehicle}
              changingType={changingType}
              saving={saving}
              onChangeType={handleChangeVehicleType}
              onSaveField={handleSaveField}
            />
            <PricingCard vehicle={vehicle} saving={saving} onSaveField={handleSaveField} />
          </div>
        </div>

        {vehicle.host && <HostCard host={vehicle.host} />}
        <LocationDelivery vehicle={vehicle} />
        <StatsGrid stats={vehicle.stats} />
        <RecentBookings bookings={vehicle.recentBookings} />
        <ActionsPanel vehicle={vehicle} />

        <div className="text-xs text-gray-400 dark:text-gray-500 text-center pb-4">
          Created {new Date(vehicle.createdAt).toLocaleDateString()} &bull; Updated {new Date(vehicle.updatedAt).toLocaleDateString()} &bull; ID: {vehicle.id}
        </div>
      </div>

      <div className="h-16 sm:hidden" />

      {/* Notify Host bottom sheet */}
      {showNotifySheet && vehicle.host && (
        <NotifyHostSheet
          vehicle={vehicle}
          host={vehicle.host}
          blockers={vehicle.blockers}
          onClose={() => setShowNotifySheet(false)}
          onSent={handleEmailSent}
        />
      )}
    </div>
  )
}
