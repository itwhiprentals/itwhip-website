// app/components/EventBottomSheet.tsx
'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  IoCloseOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoCarSportOutline,
  IoTrendingUpOutline,
  IoArrowForwardOutline,
  IoFlameOutline
} from 'react-icons/io5'

export interface EventData {
  name: string
  month: string
  dates: { start: string; end: string }
  location: string
  description: string
  demandLevel: 'high' | 'medium' | 'low'
  rateMultiplier: number
  category: 'automotive' | 'sports' | 'entertainment' | 'festival'
  tip: string
}

interface EventBottomSheetProps {
  event: EventData | null
  isOpen: boolean
  onClose: () => void
}

// Format date for display
function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const yearOptions: Intl.DateTimeFormatOptions = { year: 'numeric' }

  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}, ${endDate.toLocaleDateString('en-US', yearOptions)}`
}

// Format dates for search URL
function formatSearchDates(start: string, end: string): { pickupDate: string; returnDate: string } {
  return {
    pickupDate: start,
    returnDate: end
  }
}

export default function EventBottomSheet({ event, isOpen, onClose }: EventBottomSheetProps) {
  const t = useTranslations('Home')
  if (!event) return null

  const { pickupDate, returnDate } = formatSearchDates(event.dates.start, event.dates.end)
  const searchUrl = `/rentals/search?location=${encodeURIComponent(event.location)}&pickupDate=${pickupDate}&returnDate=${returnDate}`
  const cityUrl = `/rentals/search?location=${encodeURIComponent(event.location)}`

  const demandBadge = {
    high: { label: t('demandHigh'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    medium: { label: t('demandPeak'), color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    low: { label: t('demandModerate'), color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
  }

  const badge = demandBadge[event.demandLevel]

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          {/* Mobile: bottom sheet, Desktop: centered modal */}
          <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="w-full sm:max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all">
                {/* Drag handle for mobile */}
                <div className="flex justify-center pt-3 sm:hidden">
                  <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between p-4 pb-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                      {event.rateMultiplier > 1.3 && (
                        <IoFlameOutline className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                      {event.name}
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <IoCloseOutline className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Date & Location */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IoCalendarOutline className="w-4 h-4 text-amber-500" />
                      <span>{formatDateRange(event.dates.start, event.dates.end)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <IoLocationOutline className="w-4 h-4 text-amber-500" />
                      <span>{event.location}, {t('eventStateArizona')}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Rate Info */}
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <IoTrendingUpOutline className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        {t('dynamicPricing', { multiplier: event.rateMultiplier })}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {t('hostsEarnMore')}
                    </p>
                  </div>

                  {/* Rental Tip */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <IoCarSportOutline className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {event.tip}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="p-4 pt-0 space-y-3">
                  <Link
                    href={searchUrl}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {t('searchCarsForDates')}
                    <IoArrowForwardOutline className="w-5 h-5" />
                  </Link>
                  <Link
                    href={cityUrl}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('browseLocationRentals', { location: event.location })}
                  </Link>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
