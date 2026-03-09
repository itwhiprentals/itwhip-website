// app/(guest)/rentals/components/details/DateRangePicker.tsx
// Compact date range picker — single card with pickup/return rows

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
      className="px-1.5 py-1 bg-transparent text-xs text-gray-700 dark:text-gray-300 cursor-pointer focus:outline-none focus:ring-0 border-0 appearance-none"
      style={{ backgroundImage: 'none' }}
    >
      {Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2)
        const minute = i % 2 === 0 ? '00' : '30'
        const timeValue = `${hour.toString().padStart(2, '0')}:${minute}`
        const display = format.dateTime(new Date(2000, 0, 1, hour, parseInt(minute)), { hour: 'numeric', minute: '2-digit' })
        return (
          <option key={timeValue} value={timeValue}>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {/* Pickup Row */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-400 w-12 flex-shrink-0">{t('pickup')}</span>
          <button
            type="button"
            onClick={() => setShowPickupCalendar(true)}
            className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            <IoCalendarOutline className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <span>{formatDisplayDate(startDate)}</span>
          </button>
          <span className="text-gray-300 dark:text-gray-600 ml-auto">|</span>
          <TimeSelect value={startTime} onChange={onStartTimeChange} format={format} />
        </div>

        {/* Return Row */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-400 w-12 flex-shrink-0">{t('return')}</span>
          <button
            type="button"
            onClick={() => setShowReturnCalendar(true)}
            className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            <IoCalendarOutline className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <span>{formatDisplayDate(endDate)}</span>
          </button>
          <span className="text-gray-300 dark:text-gray-600 ml-auto">|</span>
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
