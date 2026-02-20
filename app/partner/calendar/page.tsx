// app/partner/calendar/page.tsx
// Partner Calendar - Vehicle availability and booking calendar

'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import {
  IoCalendarOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCarOutline,
  IoCloseOutline,
  IoAddOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoLockClosedOutline,
  IoCheckmarkCircleOutline,
  IoEllipseSharp
} from 'react-icons/io5'

interface CalendarEvent {
  id: string
  type: 'booking' | 'blocked'
  title: string
  vehicleId: string
  vehicleName: string
  start: string
  end: string
  status: string
  bookingCode: string
  totalAmount: number
  color: string
}

interface Vehicle {
  id: string
  name: string
  photo: string | null
  status: string
}

interface Availability {
  vehicleId: string
  vehicleName: string
  vehiclePhoto: string | null
  status: string
  totalDays: number
  bookedDays: number
  availableDays: number
  utilizationRate: number
}

export default function PartnerCalendarPage() {
  const t = useTranslations('PartnerCalendar')

  const locale = useLocale()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockData, setBlockData] = useState({
    vehicleId: '',
    startDate: '',
    endDate: '',
    reason: ''
  })
  const [blocking, setBlocking] = useState(false)

  useEffect(() => {
    fetchCalendarData()
  }, [currentDate, selectedVehicle])

  const fetchCalendarData = async () => {
    try {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      let url = `/api/partner/calendar?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      if (selectedVehicle) {
        url += `&vehicleId=${selectedVehicle}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setEvents(data.events)
        setVehicles(data.vehicles)
        setAvailability(data.availability)
      }
    } catch (error) {
      console.error('Failed to fetch calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockDates = async () => {
    if (!blockData.vehicleId || !blockData.startDate || !blockData.endDate) return

    setBlocking(true)
    try {
      const response = await fetch('/api/partner/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockData)
      })

      const data = await response.json()
      if (data.success) {
        setShowBlockModal(false)
        setBlockData({ vehicleId: '', startDate: '', endDate: '', reason: '' })
        fetchCalendarData()
      }
    } catch (error) {
      console.error('Failed to block dates:', error)
    } finally {
      setBlocking(false)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days = []

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      eventStart.setHours(0, 0, 0, 0)
      eventEnd.setHours(23, 59, 59, 999)
      const checkDate = new Date(date)
      checkDate.setHours(12, 0, 0, 0)
      return checkDate >= eventStart && checkDate <= eventEnd
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const days = generateCalendarDays()
  const weekDays = [t('weekdaysSun'), t('weekdaysMon'), t('weekdaysTue'), t('weekdaysWed'), t('weekdaysThu'), t('weekdaysFri'), t('weekdaysSat')]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <IoCalendarOutline className="w-7 h-7 flex-shrink-0" />
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Vehicle Filter */}
          <select
            value={selectedVehicle || ''}
            onChange={(e) => setSelectedVehicle(e.target.value || null)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
          >
            <option value="">{t('allVehicles')}</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>

          {/* Block Dates Button */}
          <button
            onClick={() => setShowBlockModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
          >
            <IoLockClosedOutline className="w-5 h-5 flex-shrink-0" />
            {t('blockDates')}
          </button>
        </div>
      </div>

      {/* Availability Summary */}
      <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-x-visible">
        {availability.slice(0, 4).map(a => (
          <div
            key={a.vehicleId}
            className={`bg-white dark:bg-gray-800 rounded-lg border p-4 cursor-pointer transition-all min-w-[200px] sm:min-w-0 flex-shrink-0 sm:flex-shrink ${
              selectedVehicle === a.vehicleId
                ? 'border-orange-500 ring-2 ring-orange-500/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
            }`}
            onClick={() => setSelectedVehicle(selectedVehicle === a.vehicleId ? null : a.vehicleId)}
          >
            <div className="flex items-center gap-3 mb-3">
              {a.vehiclePhoto ? (
                <Image
                  src={a.vehiclePhoto}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <IoCarOutline className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {a.vehicleName}
                </p>
                <p className={`text-xs ${
                  a.status === 'ACTIVE' ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                }`}>
                  {a.status}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('utilization')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{a.utilizationRate}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${a.utilizationRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{t('booked', { count: a.bookedDays })}</span>
                <span>{t('available', { count: a.availableDays })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoChevronBackOutline className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white min-w-[120px] sm:min-w-[180px] text-center">
              {currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <IoChevronForwardOutline className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {t('today')}
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          {weekDays.map(day => (
            <div key={day} className="py-2 sm:py-3 text-center text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[60px] sm:min-h-[100px] border-b border-r border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30"
                />
              )
            }

            const dayEvents = getEventsForDay(date)
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

            return (
              <div
                key={date.toISOString()}
                className={`min-h-[60px] sm:min-h-[100px] border-b border-r border-gray-100 dark:border-gray-700 p-0.5 sm:p-1 overflow-hidden ${
                  isPast ? 'bg-gray-50 dark:bg-gray-900/30' : ''
                }`}
              >
                <div className={`text-[10px] sm:text-sm font-medium mb-0.5 sm:mb-1 px-0.5 sm:px-1 ${
                  isToday(date)
                    ? 'bg-orange-500 text-white w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-sm'
                    : isPast
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {date.getDate()}
                </div>

                {/* Events */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left px-0.5 sm:px-1.5 py-0.5 text-[8px] sm:text-xs rounded truncate block transition-opacity hover:opacity-80 overflow-hidden ${
                        i > 0 ? 'hidden sm:block' : ''
                      }`}
                      style={{ backgroundColor: event.color, color: 'white' }}
                    >
                      <span className="hidden sm:inline">
                        {event.type === 'blocked' && <IoLockClosedOutline className="w-3 h-3 inline mr-0.5" />}
                        {event.title}
                      </span>
                      <span className="sm:hidden">
                        <IoEllipseSharp className="w-1.5 h-1.5 inline" />
                      </span>
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 px-0.5 sm:px-1 hidden sm:block">
                      {t('moreEvents', { count: dayEvents.length - 3 })}
                    </p>
                  )}
                  {dayEvents.length > 1 && (
                    <p className="text-[8px] text-gray-500 dark:text-gray-400 px-0.5 sm:hidden">
                      +{dayEvents.length - 1}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#22c55e]" />
          <span className="text-gray-600 dark:text-gray-400">{t('confirmed')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#f59e0b]" />
          <span className="text-gray-600 dark:text-gray-400">{t('pending')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#3b82f6]" />
          <span className="text-gray-600 dark:text-gray-400">{t('inProgress')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#94a3b8]" />
          <span className="text-gray-600 dark:text-gray-400">{t('blocked')}</span>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedEvent(null)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedEvent.type === 'booking' ? t('bookingDetails') : t('blockedDates')}
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <IoCloseOutline className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedEvent.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {selectedEvent.status.toLowerCase().replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedEvent.type === 'booking' && (
                    <>
                      <div className="flex items-center gap-3">
                        <IoPersonOutline className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('guest')}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedEvent.title}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <IoCarOutline className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('vehicle')}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedEvent.vehicleName}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-3">
                    <IoCalendarOutline className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('dates')}</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedEvent.start).toLocaleDateString()} - {new Date(selectedEvent.end).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.type === 'booking' && selectedEvent.totalAmount > 0 && (
                    <div className="flex items-center gap-3">
                      <IoCheckmarkCircleOutline className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('total')}</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(selectedEvent.totalAmount)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedEvent.type === 'booking' && (
                  <Link
                    href={`/partner/bookings?id=${selectedEvent.id}`}
                    className="block w-full text-center py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {t('viewBooking')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Dates Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowBlockModal(false)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('blockDatesTitle')}</h3>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <IoCloseOutline className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('vehicle')}
                  </label>
                  <select
                    value={blockData.vehicleId}
                    onChange={(e) => setBlockData(prev => ({ ...prev, vehicleId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">{t('selectVehicle')}</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('startDate')}
                    </label>
                    <input
                      type="date"
                      value={blockData.startDate}
                      onChange={(e) => setBlockData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('endDate')}
                    </label>
                    <input
                      type="date"
                      value={blockData.endDate}
                      onChange={(e) => setBlockData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('reasonOptional')}
                  </label>
                  <input
                    type="text"
                    value={blockData.reason}
                    onChange={(e) => setBlockData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder={t('reasonPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  onClick={handleBlockDates}
                  disabled={!blockData.vehicleId || !blockData.startDate || !blockData.endDate || blocking}
                  className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {blocking ? t('blocking') : t('blockDates')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
