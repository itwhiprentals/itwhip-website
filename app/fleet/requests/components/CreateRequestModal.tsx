// app/fleet/requests/components/CreateRequestModal.tsx
// Mobile-optimized bottom sheet modal for creating reservation requests

'use client'

import { useState, useEffect, useRef } from 'react'
import { IoCloseCircleOutline } from 'react-icons/io5'

interface CreateRequestModalProps {
  onClose: () => void
  onSuccess: () => void
  apiKey: string
}

export default function CreateRequestModal({
  onClose,
  onSuccess,
  apiKey
}: CreateRequestModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    quantity: 1,
    startDate: '',
    startTime: '10:00',
    endDate: '',
    endTime: '10:00',
    durationDays: '',
    pickupCity: 'Phoenix',
    pickupState: 'AZ',
    offeredRate: '',
    isNegotiable: true,
    priority: 'NORMAL',
    source: '',
    guestNotes: '',
    adminNotes: ''
  })

  // Guest selection state
  const [guestSelectionType, setGuestSelectionType] = useState<'NEW' | 'EXISTING'>('NEW')
  const [guestSearchQuery, setGuestSearchQuery] = useState('')
  const [guestSearchResults, setGuestSearchResults] = useState<any[]>([])
  const [loadingGuests, setLoadingGuests] = useState(false)
  const [selectedExistingGuest, setSelectedExistingGuest] = useState<any | null>(null)
  const guestSearchTimer = useRef<NodeJS.Timeout | null>(null)

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Guest search functions
  const searchGuests = async (query: string) => {
    if (query.length < 2) { setGuestSearchResults([]); return }
    setLoadingGuests(true)
    try {
      const res = await fetch(`/api/fleet/guests/available-for-reassignment?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.success) {
        setGuestSearchResults(data.guests || [])
      }
    } catch (err) {
      console.error('Failed to search guests:', err)
    } finally {
      setLoadingGuests(false)
    }
  }

  const handleGuestSearchChange = (query: string) => {
    setGuestSearchQuery(query)
    if (guestSearchTimer.current) clearTimeout(guestSearchTimer.current)
    guestSearchTimer.current = setTimeout(() => searchGuests(query), 300)
  }

  // When an existing guest is selected, auto-populate ALL form fields from active booking
  const handleSelectGuest = (guest: any) => {
    setSelectedExistingGuest(guest)
    const b = guest.activeBooking
    setFormData(prev => ({
      ...prev,
      guestName: guest.guestName || '',
      guestEmail: guest.guestEmail || '',
      guestPhone: guest.guestPhone || '',
      // Auto-populate from active booking if exists
      ...(b ? {
        vehicleMake: b.carMake || '',
        vehicleModel: b.carModel || '',
        vehicleType: b.carType || '',
        startDate: b.startDate ? new Date(b.startDate).toISOString().split('T')[0] : '',
        endDate: b.endDate ? new Date(b.endDate).toISOString().split('T')[0] : '',
        startTime: b.startTime || '10:00',
        endTime: b.endTime || '10:00',
        offeredRate: b.dailyRate ? String(Math.round(b.dailyRate)) : '',
        pickupCity: b.carCity || 'Phoenix',
        pickupState: b.carState || 'AZ',
      } : {}),
    }))
  }

  // When clearing guest selection, reset form fields
  const handleClearGuest = () => {
    setSelectedExistingGuest(null)
    setGuestSearchQuery('')
    setGuestSearchResults([])
    setFormData(prev => ({
      ...prev,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/fleet/requests?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity) || 1,
          durationDays: formData.durationDays ? Number(formData.durationDays) : undefined,
          offeredRate: formData.offeredRate ? Number(formData.offeredRate) : undefined,
          startDate: formData.startDate || undefined,
          startTime: formData.startTime,
          endDate: formData.endDate || undefined,
          endTime: formData.endTime,
          guestSelectionType,
          existingGuestId: selectedExistingGuest?.guestId || undefined,
          existingBookingId: selectedExistingGuest?.activeBooking?.bookingId || undefined,
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        alert(data.error || 'Failed to create request')
      }
    } catch (error) {
      console.error('Failed to create request:', error)
      alert('Failed to create request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal - Bottom sheet on mobile, centered modal on desktop */}
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-2xl sm:rounded-lg rounded-t-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-xl">
          {/* Drag handle for mobile */}
          <div className="sm:hidden w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3" />

          {/* Header - Sticky */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between rounded-t-2xl sm:rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              New Request
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <IoCloseCircleOutline className="w-6 h-6" />
            </button>
          </div>

          {/* Form - Scrollable */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* Guest Type Toggle */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                Guest Type
              </label>
              <div className="flex rounded-lg overflow-hidden border border-blue-300 dark:border-blue-700">
                <button
                  type="button"
                  onClick={() => { setGuestSelectionType('NEW'); handleClearGuest() }}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    guestSelectionType === 'NEW'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  New Guest
                </button>
                <button
                  type="button"
                  onClick={() => setGuestSelectionType('EXISTING')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    guestSelectionType === 'EXISTING'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Existing Guest
                </button>
              </div>

              {/* Existing Guest Search */}
              {guestSelectionType === 'EXISTING' && (
                <div className="mt-3 space-y-3">
                  {/* Search input */}
                  <input
                    type="text"
                    value={guestSearchQuery}
                    onChange={(e) => handleGuestSearchChange(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Search results list */}
                  {loadingGuests && (
                    <div className="text-sm text-gray-500 py-2">Searching...</div>
                  )}
                  {!loadingGuests && guestSearchQuery.length >= 2 && guestSearchResults.length === 0 && (
                    <div className="text-sm text-gray-500 py-2">No guests found</div>
                  )}
                  {!loadingGuests && guestSearchResults.length > 0 && !selectedExistingGuest && (
                    <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-700 rounded-lg">
                      {guestSearchResults.map((g: any) => (
                        <button
                          key={g.guestId}
                          type="button"
                          onClick={() => handleSelectGuest(g)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{g.guestName}</span>
                            {g.verified && (
                              <span className="px-1 py-0.5 text-[9px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">VERIFIED</span>
                            )}
                            <span className="text-[10px] text-gray-400 ml-auto">{g.tripCount} trip{g.tripCount !== 1 ? 's' : ''}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{g.guestEmail}</p>
                          {g.activeBooking ? (
                            <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                              <span className="text-orange-600 dark:text-orange-400">{g.activeBooking.status}</span>
                              <span className="text-gray-400">&middot;</span>
                              <span className="text-gray-500">{g.activeBooking.car}</span>
                              <span className="text-gray-400">&middot;</span>
                              <span className="text-gray-500">{g.activeBooking.daysSinceCreated}d ago</span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-400 mt-0.5">No active booking</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected guest info card */}
                  {selectedExistingGuest && (
                    <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {selectedExistingGuest.guestName}
                          </span>
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                            EXISTING GUEST
                          </span>
                          {selectedExistingGuest.verified && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                              VERIFIED
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleClearGuest}
                          className="text-xs text-gray-400 hover:text-red-500"
                        >
                          Change
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedExistingGuest.guestEmail}{selectedExistingGuest.guestPhone ? ` · ${selectedExistingGuest.guestPhone}` : ''}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span>{selectedExistingGuest.tripCount} trip{selectedExistingGuest.tripCount !== 1 ? 's' : ''}</span>
                        <span>Member since {new Date(selectedExistingGuest.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      </div>
                      {selectedExistingGuest.activeBooking && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Active Booking</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-gray-900 dark:text-white">{selectedExistingGuest.activeBooking.bookingCode}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium uppercase ${
                              selectedExistingGuest.activeBooking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              selectedExistingGuest.activeBooking.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>{selectedExistingGuest.activeBooking.status}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                            <span>{selectedExistingGuest.activeBooking.car}</span>
                            <span>&middot;</span>
                            <span>Host: {selectedExistingGuest.activeBooking.host}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            <span>{selectedExistingGuest.activeBooking.daysSinceCreated} days since created</span>
                            {selectedExistingGuest.activeBooking.alreadyReplaced && (
                              <span className="text-red-500 font-medium">Already replaced</span>
                            )}
                          </div>
                          <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium mt-1">
                            This will replace booking {selectedExistingGuest.activeBooking.bookingCode}
                          </p>
                        </div>
                      )}
                      {!selectedExistingGuest.activeBooking && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                          <p className="text-xs text-gray-400 italic">No active booking — fresh booking will be created</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Guest Info - Manual fields for NEW, read-only for EXISTING */}
            <fieldset>
              <legend className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Guest Info
              </legend>
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
                    readOnly={guestSelectionType === 'EXISTING' && !!selectedExistingGuest}
                    className={`w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-base ${
                      guestSelectionType === 'EXISTING' && selectedExistingGuest
                        ? 'bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-700'
                    }`}
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
                    readOnly={guestSelectionType === 'EXISTING' && !!selectedExistingGuest}
                    className={`w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-base ${
                      guestSelectionType === 'EXISTING' && selectedExistingGuest
                        ? 'bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                    readOnly={guestSelectionType === 'EXISTING' && !!selectedExistingGuest}
                    className={`w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-base ${
                      guestSelectionType === 'EXISTING' && selectedExistingGuest
                        ? 'bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-700'
                    }`}
                  />
                </div>
                <div>
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
            </fieldset>

            {/* Vehicle Info */}
            <fieldset>
              <legend className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Vehicle
              </legend>
              <div className="grid grid-cols-3 gap-3">
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
              </div>
            </fieldset>

            {/* Dates */}
            <fieldset>
              <legend className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Dates & Duration
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  />
                  <select
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {Array.from({ length: 33 }, (_, i) => {
                      const h = Math.floor(i / 2) + 6
                      const m = (i % 2) * 30
                      const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
                      const hour12 = h % 12 || 12
                      const period = h >= 12 ? 'PM' : 'AM'
                      const label = `${hour12}:${m.toString().padStart(2, '0')} ${period}`
                      return <option key={val} value={val}>{label}</option>
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  />
                  <select
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {Array.from({ length: 33 }, (_, i) => {
                      const h = Math.floor(i / 2) + 6
                      const m = (i % 2) * 30
                      const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
                      const hour12 = h % 12 || 12
                      const period = h >= 12 ? 'PM' : 'AM'
                      const label = `${hour12}:${m.toString().padStart(2, '0')} ${period}`
                      return <option key={val} value={val}>{label}</option>
                    })}
                  </select>
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
            </fieldset>

            {/* Location & Rate */}
            <fieldset>
              <legend className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Location & Rate
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNegotiable}
                  onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Rate negotiable</span>
              </label>
            </fieldset>

            {/* Notes */}
            <fieldset>
              <legend className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Notes
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Guest Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.guestNotes}
                    onChange={(e) => setFormData({ ...formData, guestNotes: e.target.value })}
                    placeholder="Special requests..."
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.adminNotes}
                    onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                    placeholder="Internal notes..."
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none text-base"
                  />
                </div>
              </div>
            </fieldset>
          </form>

          {/* Footer - Sticky */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex gap-3 safe-area-bottom">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-request-form"
              onClick={handleSubmit}
              disabled={loading || !formData.guestName}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
