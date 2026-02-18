// app/(guest)/rentals/components/details/DateRangePicker.tsx
// Date range picker with blocked dates visual support
// Replaces native <input type="date"> with CalendarModal that grays out unavailable dates

'use client'

import { useState } from 'react'
import { useTranslations, useFormatter } from 'next-intl'
import { IoCalendarOutline } from 'react-icons/io5'
import CalendarModal from '@/app/[locale]/(guest)/components/hero/search-components/CalendarModal'

interface DateRangePickerProps {
  startDate: string          // YYYY-MM-DD
  endDate: string            // YYYY-MM-DD
  startTime: string          // HH:MM
  endTime: string            // HH:MM
  minDate: string            // YYYY-MM-DD (today)
  minEndDate: string         // YYYY-MM-DD (startDate + minDays)
  blockedDates: string[]     // YYYY-MM-DD strings to gray out
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
}

function TimeSelect({ value, onChange, format }: { value: string; onChange: (v: string) => void; format: ReturnType<typeof useFormatter> }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
    >
      {Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0')
        const display = format.dateTime(new Date(2000, 0, 1, i, 0), { hour: 'numeric', minute: '2-digit' })
        return (
          <option key={hour} value={`${hour}:00`}>
            {display}
          </option>
        )
      })}
    </select>
  )
}

export default function DateRangePicker({
  startDate,
  endDate,
  startTime,
  endTime,
  minDate,
  minEndDate,
  blockedDates,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
}: DateRangePickerProps) {
  const t = useTranslations('DateRangePicker')
  const format = useFormatter()
  const [showPickupCalendar, setShowPickupCalendar] = useState(false)
  const [showReturnCalendar, setShowReturnCalendar] = useState(false)

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return t('selectDate')
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return format.dateTime(date, { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <>
      {/* Pickup Card */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{t('pickup')}</span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => setShowPickupCalendar(true)}
            className="w-full px-2 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer text-left flex items-center gap-1.5"
          >
            <IoCalendarOutline className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{formatDisplayDate(startDate)}</span>
          </button>
          <TimeSelect value={startTime} onChange={onStartTimeChange} format={format} />
        </div>
      </div>

      {/* Return Card */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{t('return')}</span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => setShowReturnCalendar(true)}
            className="w-full px-2 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer text-left flex items-center gap-1.5"
          >
            <IoCalendarOutline className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{formatDisplayDate(endDate)}</span>
          </button>
          <TimeSelect value={endTime} onChange={onEndTimeChange} format={format} />
        </div>
      </div>

      {/* Calendar Modals */}
      <CalendarModal
        isOpen={showPickupCalendar}
        onClose={() => setShowPickupCalendar(false)}
        currentDate={startDate}
        minDate={minDate}
        onDateSelect={(date) => {
          onStartDateChange(date)
          setShowPickupCalendar(false)
        }}
        title={t('pickupDate')}
        blockedDates={blockedDates}
      />

      <CalendarModal
        isOpen={showReturnCalendar}
        onClose={() => setShowReturnCalendar(false)}
        currentDate={endDate}
        minDate={minEndDate}
        onDateSelect={(date) => {
          onEndDateChange(date)
          setShowReturnCalendar(false)
        }}
        title={t('returnDate')}
        blockedDates={blockedDates}
      />
    </>
  )
}
