'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { IoCheckmarkCircle } from 'react-icons/io5'

interface BookingSuccessModalProps {
  bookingSuccess: {
    bookingCode: string
    id?: string
  }
}

export function BookingSuccessModal({ bookingSuccess }: BookingSuccessModalProps) {
  const t = useTranslations('BookingPage')
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <IoCheckmarkCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('bookingSubmitted')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('reference')} <span className="font-mono font-semibold text-gray-900 dark:text-white">{bookingSuccess.bookingCode}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('yourBookingIsUnderReview')}
        </p>
        <button
          onClick={() => {
            if (bookingSuccess.id) {
              router.push(`/rentals/dashboard/bookings/${bookingSuccess.id}?new=1`)
            } else {
              router.push('/rentals/dashboard/bookings')
            }
          }}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          {t('viewBookingStatus')}
        </button>
        <p className="text-xs text-gray-400 mt-3">{t('redirectingAutomatically')}</p>
      </div>
    </div>
  )
}
