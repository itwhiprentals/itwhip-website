// app/partner/bookings/[id]/components/AddChargeSheet.tsx
// Add Charge BottomSheet — charge type, amount, description

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import BottomSheet from '@/app/components/BottomSheet'
import { IoReceiptOutline } from 'react-icons/io5'

interface AddChargeSheetProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  onSuccess: () => void
  showToast: (type: 'success' | 'error', message: string) => void
}

export default function AddChargeSheet({
  isOpen,
  onClose,
  bookingId,
  onSuccess,
  showToast
}: AddChargeSheetProps) {
  const t = useTranslations('PartnerBookings')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const chargeType = formData.get('chargeType') as string
    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string

    try {
      const response = await fetch(`/api/partner/bookings/${bookingId}/charges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chargeType, amount, description })
      })
      const data = await response.json()
      if (data.success) {
        showToast('success', t('bdChargeAddedSuccess'))
        onClose()
        onSuccess()
      } else {
        showToast('error', data.error || t('bdFailedAddCharge'))
      }
    } catch {
      showToast('error', t('bdFailedAddCharge'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('bdAddCharge')}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4 px-1">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            <IoReceiptOutline className="w-3.5 h-3.5" />
            {t('bdChargeType')}
          </label>
          <select
            name="chargeType"
            required
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="DELIVERY">{t('bdDelivery')}</option>
            <option value="CONCIERGE">{t('bdConcierge')}</option>
            <option value="CLEANING">{t('bdCleaning')}</option>
            <option value="FUEL">{t('bdFuelPrep')}</option>
            <option value="EQUIPMENT">{t('bdEquipment')}</option>
            <option value="OTHER">{t('bdOther')}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            {t('bdAmount')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-gray-500">$</span>
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            {t('bdDescription')}
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder={t('bdDescribeCharge')}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
          >
            {t('bdCancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg text-sm font-medium"
          >
            {saving ? t('bdUpdating') : t('bdAddCharge')}
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
