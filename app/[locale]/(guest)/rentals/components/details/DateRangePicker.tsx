// app/(guest)/rentals/components/details/DateRangePicker.tsx
// Compact date range picker — single card with pickup/return rows

'use client'

import { useState, useEffect } from 'react'
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
  advanceNotice?: number     // car.advanceNotice hours (default 2)
  allow24HourPickup?: boolean // removes overnight restrictions
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
}

// ─── Shared Arizona time utilities — re-exported from booking-time-rules.ts ──
// Keeping these exports so existing consumers don't break while migrating.
export {
  getArizonaNowMinutes,
  isArizonaToday,
  getArizonaTodayString,
  minutesToTimeString as earliestMinutesToTime,
} from '@/app/lib/booking/booking-time-rules'

import { getArizonaNowMinutes, isArizonaToday, calculateEarliestPickup, minutesToTimeString } from '@/app/lib/booking/booking-time-rules'

// Legacy export: returns earliest pickup minutes for today (default 2-hr buffer)
export function getEarliestPickupMinutes(): number {
  const nowMinutes = getArizonaNowMinutes()
  return Math.ceil((nowMinutes + 120) / 30) * 30
}
// ─────────────────────────────────────────────────────────────────────────────

function TimeSelect({ value, onChange, format, isPickupToday, advanceNotice, allow24HourPickup }: { value: string; onChange: (v: string) => void; format: ReturnType<typeof useFormatter>; isPickupToday?: boolean; advanceNotice?: number; allow24HourPickup?: boolean }) {
  const { time: earliestTime } = isPickupToday ? calculateEarliestPickup(advanceNotice, { allow24HourPickup }) : { time: '00:00' }
  const [eh, em] = earliestTime.split(':').map(Number)
  const earliestMinutes = eh * 60 + em

  // Auto-correct: when date changes to today, bump if current value is before earliest allowed
  useEffect(() => {
    if (!isPickupToday) return
    const [h, m] = value.split(':').map(Number)
    if (h * 60 + m < earliestMinutes) {
      onChange(minutesToTimeString(earliestMinutes))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPickupToday])

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
        const slotMinutes = hour * 60 + parseInt(minute)
        // Standard cars: hide overnight slots (1AM–5AM) and after 10PM
        if (!allow24HourPickup) {
          const inBlackout = slotMinutes >= 60 && slotMinutes < 300 // 1AM–5AM
          const afterCutoff = slotMinutes > 22 * 60 // after 10PM
          if (inBlackout || afterCutoff) return null
        }
        const disabled = isPickupToday && slotMinutes < earliestMinutes
        const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        const ampm = hour < 12 ? 'AM' : 'PM'
        const display = `${h12}:${minute} ${ampm}`
        return (
          <option key={timeValue} value={timeValue} disabled={disabled}>
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
  advanceNotice,
  allow24HourPickup = false,
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
          <TimeSelect value={startTime} onChange={onStartTimeChange} format={format} isPickupToday={isArizonaToday(startDate)} advanceNotice={advanceNotice} allow24HourPickup={allow24HourPickup} />
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
          <TimeSelect value={endTime} onChange={onEndTimeChange} format={format} allow24HourPickup={allow24HourPickup} />
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
