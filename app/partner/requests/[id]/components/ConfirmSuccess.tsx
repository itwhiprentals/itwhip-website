// app/partner/requests/[id]/components/ConfirmSuccess.tsx
// Success screen after booking + agreement created and sent

'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { IoCheckmarkCircleOutline } from 'react-icons/io5'

interface ConfirmSuccessProps {
  bookingCode: string
  bookingId: string
  guestName: string
  guestEmail: string
}

export default function ConfirmSuccess({ bookingCode, bookingId, guestName, guestEmail }: ConfirmSuccessProps) {
  const t = useTranslations('PartnerRequestDetail')
  const router = useRouter()

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <IoCheckmarkCircleOutline className="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {t('csBookingCreated')}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        {t('csAgreementSentTo', { guest: guestName, email: guestEmail })}
      </p>
      <p className="text-sm font-mono text-gray-600 dark:text-gray-300 mb-4">
        {bookingCode}
      </p>
      <button
        onClick={() => router.push(`/partner/bookings/${bookingId}`)}
        className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
      >
        {t('csViewBooking')}
      </button>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        {t('csRedirecting')}
      </p>
    </div>
  )
}
