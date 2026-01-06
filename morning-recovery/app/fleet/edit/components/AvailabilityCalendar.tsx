// app/sys-2847/fleet/edit/components/AvailabilityCalendar.tsx
'use client'

import { useState, useEffect } from 'react'

interface Booking {
  id: string
  startDate: string
  endDate: string
  guestName: string
  status: 'CONFIRMED' | 'PENDING' | 'ACTIVE' | 'COMPLETED'
}

interface BlockedDate {
  id: string
  startDate: string
  endDate: string
  reason: string
  type: 'MAINTENANCE' | 'PERSONAL' | 'OTHER'
}

interface AvailabilityCalendarProps {
  carId: string
  bookings?: Booking[]
  blockedDates?: BlockedDate[]
  onBlockDates?: (dates: { start: Date; end: Date; reason: string }) => void
  onUnblockDates?: (blockId: string) => void
}

export function AvailabilityCalendar({
  carId,
  bookings = [],
  blockedDates = [],
  onBlockDates,
  onUnblockDates
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [blockReason, setBlockReason] = useState('')
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')

  // Get calendar days for current month
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

  // Check if a date is booked
  const isDateBooked = (date: Date) => {
    return bookings.some(booking => {
      const start = new Date(booking.startDate)
      const end = new Date(booking.endDate)
      return date >= start && date <= end
    })
  }

  // Check if a date is blocked
  const isDateBlocked = (date: Date) => {
    return blockedDates.some(block => {
      const start = new Date(block.startDate)
      const end = new Date(block.endDate)
      return date >= start && date <= end
    })
  }

  // Get booking for a specific date
  const getBookingForDate = (date: Date) => {
    return bookings.find(booking => {
      const start = new Date(booking.startDate)
      const end = new Date(booking.endDate)
      return date >= start && date <= end
    })
  }

  // Get block for a specific date
  const getBlockForDate = (date: Date) => {
    return blockedDates.find(block => {
      const start = new Date(block.startDate)
      const end = new Date(block.endDate)
      return date >= start && date <= end
    })
  }

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isDateBooked(date)) return // Can't select booked dates
    
    const dateStr = date.toISOString().split('T')[0]
    const isSelected = selectedDates.some(d => d.toISOString().split('T')[0] === dateStr)
    
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => d.toISOString().split('T')[0] !== dateStr))
    } else {
      setSelectedDates([...selectedDates, date])
    }
  }

  // Handle block dates
  const handleBlockDates = () => {
    if (selectedDates.length === 0) return
    
    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime())
    const start = sortedDates[0]
    const end = sortedDates[sortedDates.length - 1]
    
    if (onBlockDates) {
      onBlockDates({
        start,
        end,
        reason: blockReason || 'Manual block'
      })
    }
    
    setSelectedDates([])
    setBlockReason('')
    setShowBlockModal(false)
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Availability Calendar
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'month' ? 'list' : 'month')}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {viewMode === 'month' ? 'List View' : 'Calendar View'}
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <>
          {/* Calendar Navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{monthYear}</h4>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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
              const isToday = new Date().toDateString() === date.toDateString()
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
              const booking = getBookingForDate(date)
              const block = getBlockForDate(date)
              
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => !isPast && !isBooked && handleDateClick(date)}
                  disabled={isPast || isBooked}
                  className={`
                    relative p-2 h-12 text-sm rounded-lg transition-colors
                    ${isBooked ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 cursor-not-allowed' : ''}
                    ${isBlocked && !isBooked ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : ''}
                    ${isSelected ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : ''}
                    ${!isBooked && !isBlocked && !isSelected && !isPast ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                    ${isPast ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : ''}
                    ${isToday ? 'font-bold ring-2 ring-gray-400' : ''}
                    ${!isBooked && !isBlocked && !isPast ? 'text-gray-900 dark:text-white' : ''}
                  `}
                  title={
                    isBooked ? `Booked: ${booking?.guestName}` :
                    isBlocked ? `Blocked: ${block?.reason}` :
                    ''
                  }
                >
                  {date.getDate()}
                  {isBooked && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
                  )}
                  {isBlocked && !isBooked && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded" />
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
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500 rounded" />
              <span className="text-gray-600 dark:text-gray-400">Selected</span>
            </div>
          </div>

          {/* Block Dates Button */}
          {selectedDates.length > 0 && (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowBlockModal(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Block {selectedDates.length} Date{selectedDates.length > 1 ? 's' : ''}
              </button>
              <button
                type="button"
                onClick={() => setSelectedDates([])}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Clear Selection
              </button>
            </div>
          )}
        </>
      ) : (
        /* List View */
        <div className="space-y-4">
          {/* Upcoming Bookings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Upcoming Bookings ({bookings.filter(b => new Date(b.startDate) > new Date()).length})
            </h4>
            <div className="space-y-2">
              {bookings
                .filter(b => new Date(b.startDate) > new Date())
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map(booking => (
                  <div key={booking.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{booking.guestName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              {bookings.filter(b => new Date(b.startDate) > new Date()).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming bookings</p>
              )}
            </div>
          </div>

          {/* Blocked Dates */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Blocked Dates ({blockedDates.length})
            </h4>
            <div className="space-y-2">
              {blockedDates.map(block => (
                <div key={block.id} className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{block.reason}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(block.startDate).toLocaleDateString()} - {new Date(block.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUnblockDates && onUnblockDates(block.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Unblock
                  </button>
                </div>
              ))}
              {blockedDates.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No blocked dates</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Block Selected Dates
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for blocking
              </label>
              <select
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
              >
                <option value="">Select reason...</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Personal Use">Personal Use</option>
                <option value="Not Available">Not Available</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBlockDates}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Block Dates
              </button>
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
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