// app/(guest)/rentals/manage/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { format, isPast, isFuture, isToday, differenceInDays } from 'date-fns'
import { 
  IoCarOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCallOutline,
  IoMailOutline,
  IoChatbubbleOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoRefreshOutline,
  IoArrowBackOutline,
  IoEllipsisHorizontalOutline,
  IoNavigateOutline,
  IoStarOutline,
  IoKeyOutline,
  IoQrCodeOutline
} from 'react-icons/io5'

interface RentalBooking {
  id: string
  bookingCode: string
  status: string
  car: {
    id: string
    make: string
    model: string
    year: number
    photos: Array<{ url: string; isHero: boolean }>
  }
  host: {
    name: string
    email: string
    phone: string
    profilePhoto?: string
    responseTime?: number
  }
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  pickupLocation: string
  pickupType: string
  deliveryAddress?: string
  totalAmount: number
  depositAmount: number
  paymentStatus: string
  createdAt: string
}

type TabType = 'upcoming' | 'active' | 'past' | 'cancelled'

export default function ManageRentalsPage() {
  const t = useTranslations('ManageRentals')
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const [bookings, setBookings] = useState<RentalBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/rentals/user-bookings')
      const data = await response.json()
      setBookings(data.bookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm(t('confirmCancel'))) return

    try {
      const response = await fetch('/api/rentals/book', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          action: 'cancel'
        })
      })

      if (response.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }

  const filterBookings = (tab: TabType) => {
    const now = new Date()
    
    return bookings.filter(booking => {
      const startDate = new Date(booking.startDate)
      const endDate = new Date(booking.endDate)
      
      switch (tab) {
        case 'upcoming':
          return booking.status === 'CONFIRMED' && isFuture(startDate)
        case 'active':
          return booking.status === 'ACTIVE' || 
                 (booking.status === 'CONFIRMED' && isToday(startDate))
        case 'past':
          return booking.status === 'COMPLETED' || 
                 (booking.status === 'CONFIRMED' && isPast(endDate))
        case 'cancelled':
          return booking.status === 'CANCELLED'
        default:
          return false
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20'
      case 'ACTIVE':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20'
      case 'COMPLETED':
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800'
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800'
    }
  }

  const filteredBookings = filterBookings(activeTab)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/rentals')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <IoArrowBackOutline className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('title')}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('subtitle')}
                  </p>
                </div>
              </div>
              
              <Link
                href="/rentals"
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 
                  transition-colors font-medium flex items-center space-x-2"
              >
                <IoCarOutline className="w-5 h-5" />
                <span>{t('bookNewCar')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'upcoming', label: t('tabUpcoming'), count: filterBookings('upcoming').length },
              { id: 'active', label: t('tabActive'), count: filterBookings('active').length },
              { id: 'past', label: t('tabPast'), count: filterBookings('past').length },
              { id: 'cancelled', label: t('tabCancelled'), count: filterBookings('cancelled').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 
                    py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <IoCarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('noRentals', { tab: activeTab })}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {activeTab === 'upcoming' && t('emptyUpcoming')}
              {activeTab === 'active' && t('emptyActive')}
              {activeTab === 'past' && t('emptyPast')}
              {activeTab === 'cancelled' && t('emptyCancelled')}
            </p>
            <Link
              href="/rentals"
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg 
                hover:bg-amber-700 transition-colors font-medium"
            >
              {t('browseAvailableCars')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map(booking => {
              const startDate = new Date(booking.startDate)
              const endDate = new Date(booking.endDate)
              const daysUntilStart = differenceInDays(startDate, new Date())
              const heroPhoto = booking.car.photos.find(p => p.isHero) || booking.car.photos[0]
              
              return (
                <div 
                  key={booking.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 
                    dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Car Image */}
                      <div className="lg:w-64 h-48 lg:h-40 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {heroPhoto ? (
                          <Image
                            src={heroPhoto.url}
                            alt={`${booking.car.make} ${booking.car.model}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <IoCarOutline className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {booking.car.year} {booking.car.make} {booking.car.model}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {t('bookingCode', { code: booking.bookingCode })}
                            </p>
                          </div>
                          
                          {/* Action Menu */}
                          <div className="relative">
                            <button
                              onClick={() => setSelectedBooking(
                                selectedBooking === booking.id ? null : booking.id
                              )}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <IoEllipsisHorizontalOutline className="w-5 h-5" />
                            </button>
                            
                            {selectedBooking === booking.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg 
                                shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                                <Link
                                  href={`/rentals/manage/${booking.id}`}
                                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                                    hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <IoDocumentTextOutline className="inline w-4 h-4 mr-2" />
                                  {t('viewDetails')}
                                </Link>
                                {booking.status === 'ACTIVE' && (
                                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 
                                    dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <IoKeyOutline className="inline w-4 h-4 mr-2" />
                                    {t('digitalKey')}
                                  </button>
                                )}
                                {booking.status === 'CONFIRMED' && daysUntilStart > 1 && (
                                  <button 
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 
                                      dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <IoAlertCircleOutline className="inline w-4 h-4 mr-2" />
                                    {t('cancelBooking')}
                                  </button>
                                )}
                                {booking.status === 'COMPLETED' && (
                                  <Link
                                    href={`/rentals/${booking.car.id}`}
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 
                                      hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <IoRefreshOutline className="inline w-4 h-4 mr-2" />
                                    {t('bookAgain')}
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Date and Location Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Pickup */}
                          <div className="flex items-start space-x-3">
                            <IoCalendarOutline className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {t('pickup')}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {format(startDate, 'EEE, MMM d, yyyy')}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {booking.startTime} • {booking.pickupLocation}
                              </p>
                            </div>
                          </div>

                          {/* Return */}
                          <div className="flex items-start space-x-3">
                            <IoCalendarOutline className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {t('return')}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {format(endDate, 'EEE, MMM d, yyyy')}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {booking.endTime} • {t('sameLocation')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Host Info and Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            {booking.host.profilePhoto ? (
                              <Image
                                src={booking.host.profilePhoto}
                                alt={booking.host.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full 
                                flex items-center justify-center">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                  {booking.host.name[0]}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {booking.host.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {t('hostResponseTime', { time: booking.host.responseTime || 30 })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {booking.status === 'UPCOMING' && daysUntilStart <= 2 && (
                              <button className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 
                                rounded-lg transition-colors">
                                <IoQrCodeOutline className="w-5 h-5" />
                              </button>
                            )}
                            <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                              dark:hover:bg-gray-700 rounded-lg transition-colors">
                              <IoChatbubbleOutline className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                              dark:hover:bg-gray-700 rounded-lg transition-colors">
                              <IoCallOutline className="w-5 h-5" />
                            </button>
                            {booking.pickupType === 'delivery' && (
                              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                                dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <IoNavigateOutline className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Upcoming Alert */}
                        {booking.status === 'CONFIRMED' && daysUntilStart <= 2 && daysUntilStart >= 0 && (
                          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 
                            dark:border-amber-800 rounded-lg">
                            <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center">
                              <IoTimeOutline className="w-4 h-4 mr-2" />
                              {daysUntilStart === 0
                                ? t('rentalStartsToday')
                                : t('rentalStartsIn', { days: daysUntilStart })
                              }
                            </p>
                          </div>
                        )}

                        {/* Completed - Add Review */}
                        {booking.status === 'COMPLETED' && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg 
                            flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t('howWasExperience')}
                            </p>
                            <button className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg 
                              hover:bg-amber-700 transition-colors flex items-center space-x-1">
                              <IoStarOutline className="w-4 h-4" />
                              <span>{t('leaveReview')}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}