// app/partner/bookings/[id]/components/EditBookingSheet.tsx
// Edit Booking BottomSheet — modern date/time pickers, pickup location

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import BottomSheet from '@/app/components/BottomSheet'
import { IoCalendarOutline, IoTimeOutline, IoLocationOutline } from 'react-icons/io5'

interface EditBookingSheetProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  pickupLocation: string | null
  onSuccess: () => void
  showToast: (type: 'success' | 'error', message: string) => void
}

// Generate time options in 1-hour intervals with AM/PM
const TIME_OPTIONS: { value: string; label: string }[] = []
for (let h = 0; h < 24; h++) {
  const value = `${h.toString().padStart(2, '0')}:00`
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  const label = `${hour12}:00 ${period}`
  TIME_OPTIONS.push({ value, label })
}

export default function EditBookingSheet({
  isOpen,
  onClose,
  bookingId,
  startDate,
  endDate,
  startTime,
  endTime,
  pickupLocation,
  onSuccess,
  showToast
}: EditBookingSheetProps) {
  const t = useTranslations('PartnerBookings')
  const [saving, setSaving] = useState(false)

  const [newStartDate, setNewStartDate] = useState<Date | null>(new Date(startDate))
  const [newEndDate, setNewEndDate] = useState<Date | null>(new Date(endDate))
  const [newStartTime, setNewStartTime] = useState(startTime)
  const [newEndTime, setNewEndTime] = useState(endTime)
  const [newPickupLocation, setNewPickupLocation] = useState(pickupLocation || '')

  const handleSubmit = async () => {
    if (!newStartDate || !newEndDate) return
    setSaving(true)
    try {
      const response = await fetch(`/api/partner/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: newStartDate.toISOString().split('T')[0],
          endDate: newEndDate.toISOString().split('T')[0],
          startTime: newStartTime,
          endTime: newEndTime,
          pickupLocation: newPickupLocation,
        })
      })
      const data = await response.json()
      if (data.success) {
        showToast('success', t('bdBookingUpdatedSuccess'))
        onClose()
        onSuccess()
      } else {
        showToast('error', data.error || t('bdFailedUpdateBooking'))
      }
    } catch {
      showToast('error', t('bdFailedUpdateBooking'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('bdEditBooking')}
      size="large"
    >
      <div className="space-y-5 px-1">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <IoCalendarOutline className="w-3.5 h-3.5" />
              {t('bdStartDate')}
            </label>
            <DatePicker
              selected={newStartDate}
              onChange={(date: Date | null) => {
                setNewStartDate(date)
                if (date && newEndDate && date >= newEndDate) {
                  const next = new Date(date)
                  next.setDate(next.getDate() + 1)
                  setNewEndDate(next)
                }
              }}
              minDate={new Date()}
              dateFormat="MMM d, yyyy"
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <IoCalendarOutline className="w-3.5 h-3.5" />
              {t('bdEndDate')}
            </label>
            <DatePicker
              selected={newEndDate}
              onChange={(date: Date | null) => setNewEndDate(date)}
              minDate={newStartDate ? new Date(Math.max(newStartDate.getTime() + 86400000, new Date().getTime())) : new Date()}
              dateFormat="MMM d, yyyy"
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <IoTimeOutline className="w-3.5 h-3.5" />
              {t('bdPickupTime')}
            </label>
            <select
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {TIME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <IoTimeOutline className="w-3.5 h-3.5" />
              {t('bdReturnTime')}
            </label>
            <select
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {TIME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pickup Location */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            <IoLocationOutline className="w-3.5 h-3.5" />
            {t('bdPickupLocation')}
          </label>
          <input
            type="text"
            value={newPickupLocation}
            onChange={(e) => setNewPickupLocation(e.target.value)}
            placeholder={t('bdEnterPickupLocation')}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
          >
            {t('bdCancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !newStartDate || !newEndDate}
            className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg text-sm font-medium"
          >
            {saving ? t('bdUpdating') : t('bdSaveChanges')}
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
