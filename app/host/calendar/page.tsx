// app/host/calendar/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  DollarSign,
  AlertCircle,
  Check,
  X,
  Car,
  User,
  MapPin,
  Clock,
  Settings
} from 'lucide-react'

interface Booking {
  id: string
  carId: string
  guestName: string
  guestEmail: string
  startDate: string
  endDate: string
  status: string
  totalAmount: number
  pickupLocation: string
  pickupType: string
  car: {
    make: string
    model: string
    year: number
  }
}

interface BlockedDate {
  id: string
  carId: string
  date: string
  reason?: string
  customPrice?: number
}

interface Car {
  id: string
  make: string
  model: string
  year: number
  dailyRate: number
  isActive: boolean
  photos: { url: string }[]
}

export default function HostCalendarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cars, setCars] = useState<Car[]>([])
  const [selectedCarId, setSelectedCarId] = useState<string>('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [isBlocking, setIsBlocking] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Calendar view state
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [selectedDateRange, setSelectedDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  })

  useEffect(() => {
    checkSessionAndLoadData()
  }, [])

  useEffect(() => {
    if (selectedCarId) {
      fetchCalendarData()
    }
  }, [selectedCarId, currentDate])

  const checkSessionAndLoadData = async () => {
    try {
      const response = await fetch('/api/host/login', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        router.push('/host/login')
        return
      }

      const data = await response.json()
      if (data.authenticated) {
        fetchCars()
      } else {
        router.push('/host/login')
      }
    } catch (error) {
      console.error('Session check error:', error)
      router.push('/host/login')
    }
  }

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/host/cars', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setCars(data.cars || [])
        if (data.cars?.length > 0) {
          setSelectedCarId(data.cars[0].id)
        }
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching cars:', error)
      setLoading(false)
    }
  }

  const fetchCalendarData = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const response = await fetch(
        `/api/host/calendar?carId=${selectedCarId}&startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`,
        { credentials: 'include' }
      )

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
        setBlockedDates(data.blockedDates || [])
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    }
  }

  const handleBlockDates = async () => {
    if (!selectedDateRange.start || !selectedCarId) return

    setIsBlocking(true)
    try {
      const dates = []
      const current = new Date(selectedDateRange.start)
      const end = selectedDateRange.end || selectedDateRange.start

      while (current <= end) {
        dates.push(new Date(current).toISOString().split('T')[0])
        current.setDate(current.getDate() + 1)
      }

      const response = await fetch('/api/host/calendar/block', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: selectedCarId,
          dates,
          reason: blockReason,
          customPrice: customPrice ? parseFloat(customPrice) : null
        })
      })

      if (response.ok) {
        fetchCalendarData()
        setShowBlockModal(false)
        setBlockReason('')
        setCustomPrice('')
        setSelectedDateRange({ start: null, end: null })
      }
    } catch (error) {
      console.error('Error blocking dates:', error)
    } finally {
      setIsBlocking(false)
    }
  }

  const handleUnblockDate = async (date: string) => {
    try {
      const response = await fetch('/api/host/calendar/unblock', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: selectedCarId,
          date
        })
      })

      if (response.ok) {
        fetchCalendarData()
      }
    } catch (error) {
      console.error('Error unblocking date:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const getDateStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    // Check if blocked
    const blocked = blockedDates.find(b => b.date === dateStr)
    if (blocked) {
      return { type: 'blocked', data: blocked }
    }

    // Check if booked
    const booking = bookings.find(b => {
      const start = new Date(b.startDate)
      const end = new Date(b.endDate)
      return date >= start && date <= end
    })
    if (booking) {
      return { type: 'booked', data: booking }
    }

    return { type: 'available', data: null }
  }

  const handleDateClick = (date: Date) => {
    if (!selectedDateRange.start || (selectedDateRange.start && selectedDateRange.end)) {
      // Start new selection
      setSelectedDateRange({ start: date, end: null })
    } else {
      // Complete selection
      if (date >= selectedDateRange.start) {
        setSelectedDateRange({ ...selectedDateRange, end: date })
      } else {
        setSelectedDateRange({ start: date, end: selectedDateRange.start })
      }
    }
  }

  const isDateInRange = (date: Date) => {
    if (!selectedDateRange.start) return false
    if (!selectedDateRange.end) return date.getTime() === selectedDateRange.start.getTime()
    return date >= selectedDateRange.start && date <= selectedDateRange.end
  }

  const selectedCar = cars.find(c => c.id === selectedCarId)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const renderCalendarDay = (date: Date | null) => {
    if (!date) {
      return <div className="h-24 bg-gray-50 dark:bg-gray-900" />
    }

    const status = getDateStatus(date)
    const isToday = date.toDateString() === new Date().toDateString()
    const isSelected = isDateInRange(date)
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

    return (
      <div
        key={date.toISOString()}
        onClick={() => !isPast && status.type === 'available' && handleDateClick(date)}
        className={`
          h-24 border border-gray-200 dark:border-gray-700 p-2 relative cursor-pointer
          transition-all duration-200
          ${isPast ? 'bg-gray-100 dark:bg-gray-900 opacity-50 cursor-not-allowed' : ''}
          ${status.type === 'available' && !isPast ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''}
          ${status.type === 'booked' ? 'bg-green-50 dark:bg-green-900/20' : ''}
          ${status.type === 'blocked' ? 'bg-red-50 dark:bg-red-900/20' : ''}
          ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''}
        `}
      >
        <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {date.getDate()}
          </span>
          {status.type === 'booked' && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Booked" />
          )}
          {status.type === 'blocked' && (
            <div className="w-2 h-2 bg-red-500 rounded-full" title="Blocked" />
          )}
        </div>

        {status.type === 'booked' && status.data && (
          <div 
            className="text-xs text-green-700 dark:text-green-400 truncate cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedBooking(status.data as Booking)
            }}
          >
            <div className="font-medium truncate">{(status.data as Booking).guestName}</div>
            <div className="text-gray-600 dark:text-gray-400">${(status.data as Booking).totalAmount}</div>
          </div>
        )}

        {status.type === 'blocked' && status.data && (
          <div className="text-xs text-red-700 dark:text-red-400">
            <div className="truncate">{(status.data as BlockedDate).reason || 'Blocked'}</div>
            {(status.data as BlockedDate).customPrice && (
              <div className="font-medium">${(status.data as BlockedDate).customPrice}</div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleUnblockDate((status.data as BlockedDate).date)
              }}
              className="text-red-600 hover:text-red-800 mt-1"
            >
              Unblock
            </button>
          </div>
        )}

        {status.type === 'available' && !isPast && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ${selectedCar?.dailyRate || 0}/day
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your car availability and view upcoming bookings
        </p>
      </div>

      {/* Car Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Car:
            </label>
            <select
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {cars.map(car => (
                <option key={car.id} value={car.id}>
                  {car.year} {car.make} {car.model}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {selectedDateRange.start && (
              <button
                onClick={() => setShowBlockModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Block Selected Dates
              </button>
            )}
            <button
              onClick={() => setSelectedDateRange({ start: null, end: null })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setMonth(newDate.getMonth() - 1)
                setCurrentDate(newDate)
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setMonth(newDate.getMonth() + 1)
                setCurrentDate(newDate)
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Today
          </button>
        </div>

        {/* Calendar Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">Selected</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="bg-gray-50 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {day}
            </div>
          ))}
          {getDaysInMonth(currentDate).map((date, index) => (
            <div key={index}>
              {renderCalendarDay(date)}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upcoming Bookings
        </h3>
        <div className="space-y-3">
          {bookings
            .filter(b => new Date(b.startDate) >= new Date())
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 5)
            .map(booking => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Car className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.guestName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${booking.totalAmount}
                  </p>
                  <button
                    onClick={() => router.push(`/host/bookings/${booking.id}`)}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          {bookings.filter(b => new Date(b.startDate) >= new Date()).length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No upcoming bookings
            </p>
          )}
        </div>
      </div>

      {/* Block Dates Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Block Selected Dates
            </h3>
            
            {selectedDateRange.start && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {selectedDateRange.start.toLocaleDateString()} 
                {selectedDateRange.end && ` - ${selectedDateRange.end.toLocaleDateString()}`}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g., Maintenance, Personal use"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom Price (optional)
                </label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Leave empty to make unavailable"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBlockModal(false)
                  setBlockReason('')
                  setCustomPrice('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isBlocking}
              >
                Cancel
              </button>
              <button
                onClick={handleBlockDates}
                disabled={isBlocking}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {isBlocking ? 'Blocking...' : 'Block Dates'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Booking Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Guest:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedBooking.guestName}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Dates:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(selectedBooking.startDate).toLocaleDateString()} - {new Date(selectedBooking.endDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Pickup:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedBooking.pickupLocation}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${selectedBooking.totalAmount}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => router.push(`/host/bookings/${selectedBooking.id}`)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
      <Footer />
    </>
  )
}