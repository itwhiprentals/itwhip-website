// app/host/cars/[id]/edit/components/HostAvailabilityCalendar.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  IoCalendarOutline,
  IoListOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoLockClosedOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoCloseOutline
} from 'react-icons/io5'

interface Booking {
  id: string
  startDate: string
  endDate: string
  guestName: string
  status: 'CONFIRMED' | 'PENDING' | 'ACTIVE' | 'COMPLETED'
  bookingCode?: string
}

interface BlockedDate {
  id: string
  date: string
  reason: string
  note?: string
}

interface HostAvailabilityCalendarProps {
  carId: string
  isLocked?: boolean
  onBlockDates?: (dates: Date[], reason: string) => Promise<void>
  onUnblockDate?: (date: string) => Promise<void>
}

export function HostAvailabilityCalendar({
  carId,
  isLocked = false,
  onBlockDates,
  onUnblockDate
}: HostAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [error, setError] = useState('')

  // Fetch calendar data
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true)
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0)

      const response = await fetch(
        `/api/host/calendar?carId=${carId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            'x-host-id': localStorage.getItem('hostId') || ''
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
        setBlockedDates(data.blockedDates || [])
      }
    } catch (err) {
      console.error('Failed to fetch calendar data:', err)
    } finally {
      setLoading(false)
    }
  }, [carId, currentMonth])

  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  // Get days for current month view
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  // Check if date is booked
  const isDateBooked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.some(booking => {
      const start = new Date(booking.startDate).toISOString().split('T')[0]
      const end = new Date(booking.endDate).toISOString().split('T')[0]
      return dateStr >= start && dateStr <= end
    })
  }

  // Check if date is blocked
  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return blockedDates.some(block => block.date.split('T')[0] === dateStr)
  }

  // Get booking for date
  const getBookingForDate = (date: Date): Booking | undefined => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.find(booking => {
      const start = new Date(booking.startDate).toISOString().split('T')[0]
      const end = new Date(booking.endDate).toISOString().split('T')[0]
      return dateStr >= start && dateStr <= end
    })
  }

  // Get block info for date
  const getBlockForDate = (date: Date): BlockedDate | undefined => {
    const dateStr = date.toISOString().split('T')[0]
    return blockedDates.find(block => block.date.split('T')[0] === dateStr)
  }

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isLocked || isDateBooked(date)) return

    const dateStr = date.toISOString().split('T')[0]
    const isSelected = selectedDates.some(d => d.toISOString().split('T')[0] === dateStr)

    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => d.toISOString().split('T')[0] !== dateStr))
    } else {
      setSelectedDates([...selectedDates, date])
    }
  }

  // Handle block dates
  const handleBlockDates = async () => {
    if (selectedDates.length === 0 || !blockReason) return

    setSaving(true)
    setError('')

    try {
      if (onBlockDates) {
        await onBlockDates(selectedDates, blockReason)
      } else {
        // Default API call
        const response = await fetch('/api/host/calendar/block', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-host-id': localStorage.getItem('hostId') || ''
          },
          body: JSON.stringify({
            carId,
            dates: selectedDates.map(d => d.toISOString().split('T')[0]),
            reason: blockReason
          })
        })

        if (!response.ok) {
          throw new Error('Failed to block dates')
        }
      }

      setSelectedDates([])
      setBlockReason('')
      setShowBlockModal(false)
      fetchCalendarData()
    } catch (err) {
      setError('Failed to block dates')
    } finally {
      setSaving(false)
    }
  }

  // Handle unblock date
  const handleUnblockDate = async (dateStr: string) => {
    setSaving(true)
    setError('')

    try {
      if (onUnblockDate) {
        await onUnblockDate(dateStr)
      } else {
        const response = await fetch('/api/host/calendar/unblock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-host-id': localStorage.getItem('hostId') || ''
          },
          body: JSON.stringify({
            carId,
            date: dateStr
          })
        })

        if (!response.ok) {
          throw new Error('Failed to unblock date')
        }
      }

      fetchCalendarData()
    } catch (err) {
      setError('Failed to unblock date')
    } finally {
      setSaving(false)
    }
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const days = getDaysInMonth(currentMonth)
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get upcoming bookings for list view
  const upcomingBookings = bookings
    .filter(b => new Date(b.startDate) >= today)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  // Get upcoming blocked dates for list view
  const upcomingBlocks = blockedDates
    .filter(b => new Date(b.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <IoCalendarOutline className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Availability Calendar
          </h3>
          {isLocked && (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <IoLockClosedOutline className="w-3 h-3" />
              Locked
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            {viewMode === 'calendar' ? (
              <>
                <IoListOutline className="w-4 h-4" />
                List View
              </>
            ) : (
              <>
                <IoCalendarOutline className="w-4 h-4" />
                Calendar View
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === 'calendar' ? (
        <>
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoChevronBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{monthYear}</h4>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoChevronForwardOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="p-2" />
              }

              const isBooked = isDateBooked(date)
              const isBlocked = isDateBlocked(date)
              const isSelected = selectedDates.some(d => d.toISOString().split('T')[0] === date.toISOString().split('T')[0])
              const isToday = date.toDateString() === new Date().toDateString()
              const isPast = date < today
              const booking = getBookingForDate(date)
              const block = getBlockForDate(date)

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => !isPast && !isBooked && handleDateClick(date)}
                  disabled={isPast || isBooked || isLocked}
                  title={
                    isBooked ? `Booked: ${booking?.guestName}` :
                    isBlocked ? `Blocked: ${block?.reason}` :
                    undefined
                  }
                  className={`
                    relative p-2 h-12 text-sm rounded-lg transition-colors
                    ${isBooked ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 cursor-not-allowed' : ''}
                    ${isBlocked && !isBooked ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : ''}
                    ${isSelected ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500 text-purple-700 dark:text-purple-400' : ''}
                    ${!isBooked && !isBlocked && !isSelected && !isPast && !isLocked ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                    ${isPast ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : ''}
                    ${isToday ? 'font-bold ring-2 ring-gray-400 dark:ring-gray-500' : ''}
                    ${!isBooked && !isBlocked && !isPast && !isSelected ? 'text-gray-900 dark:text-white' : ''}
                    ${isLocked && !isBooked ? 'cursor-not-allowed' : ''}
                  `}
                >
                  {date.getDate()}
                  {isBooked && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                  {isBlocked && !isBooked && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded" />
              <span className="text-gray-600 dark:text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded" />
              <span className="text-gray-600 dark:text-gray-400">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 rounded" />
              <span className="text-gray-600 dark:text-gray-400">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500 rounded" />
              <span className="text-gray-600 dark:text-gray-400">Selected</span>
            </div>
          </div>

          {/* Action buttons */}
          {!isLocked && selectedDates.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowBlockModal(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Block {selectedDates.length} Date{selectedDates.length > 1 ? 's' : ''}
              </button>
              <button
                type="button"
                onClick={() => setSelectedDates([])}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}
        </>
      ) : (
        /* List View */
        <div className="space-y-6">
          {/* Upcoming Bookings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <IoPersonOutline className="w-4 h-4" />
              Upcoming Bookings ({upcomingBookings.length})
            </h4>
            <div className="space-y-2">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map(booking => (
                  <div key={booking.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{booking.guestName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      {booking.bookingCode && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">#{booking.bookingCode}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      booking.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  No upcoming bookings
                </p>
              )}
            </div>
          </div>

          {/* Blocked Dates */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <IoTimeOutline className="w-4 h-4" />
              Blocked Dates ({upcomingBlocks.length})
            </h4>
            <div className="space-y-2">
              {upcomingBlocks.length > 0 ? (
                upcomingBlocks.map(block => (
                  <div key={block.id} className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(block.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{block.reason}</p>
                    </div>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleUnblockDate(block.date)}
                        disabled={saving}
                        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        Unblock
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  No blocked dates
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Block Selected Dates
              </h3>
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <IoCloseOutline className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You are about to block {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''}:
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {selectedDates.slice(0, 5).map(date => (
                <span key={date.toISOString()} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              ))}
              {selectedDates.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  +{selectedDates.length - 5} more
                </span>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for blocking
              </label>
              <select
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="">Select reason...</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Personal Use">Personal Use</option>
                <option value="Not Available">Not Available</option>
                <option value="Service Appointment">Service Appointment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBlockDates}
                disabled={!blockReason || saving}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Blocking...' : 'Block Dates'}
              </button>
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HostAvailabilityCalendar
