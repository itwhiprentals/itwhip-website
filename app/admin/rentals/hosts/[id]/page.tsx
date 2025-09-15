// app/admin/rentals/hosts/[id]/page.tsx
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
  IoCarOutline,
  IoStarOutline,
  IoStar,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoTrendingUpOutline,
  IoCalendarOutline,
  IoCreateOutline,
  IoStatsChartOutline,
  IoCashOutline,
  IoSpeedometerOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoImageOutline
} from 'react-icons/io5'

interface HostDetails {
  id: string
  name: string
  email: string
  phone?: string
  profilePhoto?: string
  bio?: string
  isVerified: boolean
  verifiedAt?: string
  verificationLevel?: string
  responseTime?: number
  responseRate?: number
  acceptanceRate?: number
  totalTrips: number
  rating: number
  city: string
  state: string
  zipCode?: string
  active: boolean
  joinedAt: string
  createdAt: string
  cars?: Array<{
    id: string
    make: string
    model: string
    year: number
    color?: string
    carType: string
    dailyRate: number
    isActive: boolean
    totalTrips: number
    rating: number
    photos?: Array<{
      url: string
      isHero?: boolean
    }>
  }>
  reviews?: Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    car?: {
      make: string
      model: string
      year: number
    }
  }>
  bookings?: Array<{
    id: string
    bookingCode: string
    status: string
    startDate: string
    endDate: string
    totalAmount: number
  }>
}

export default function HostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [host, setHost] = useState<HostDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (id) {
      fetchHostDetails()
    }
  }, [id])

  const fetchHostDetails = async () => {
    try {
      setLoading(true)
      // First try to get basic host info
      const response = await fetch(`/sys-2847/fleet/api/hosts/${id}`)
      if (response.ok) {
        const data = await response.json()
        setHost(data.data || data)
      } else {
        // If specific endpoint doesn't exist, get all hosts and filter
        const allHostsResponse = await fetch('/sys-2847/fleet/api/hosts')
        if (allHostsResponse.ok) {
          const allData = await allHostsResponse.json()
          const foundHost = allData.data?.find((h: any) => h.id === id)
          if (foundHost) {
            setHost(foundHost)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch host details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRatingStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<IoStar key={i} className="w-5 h-5 text-yellow-400" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<IoStarOutline key={i} className="w-5 h-5 text-yellow-400" />)
      } else {
        stars.push(<IoStarOutline key={i} className="w-5 h-5 text-gray-300" />)
      }
    }
    return stars
  }

  const getCarPhoto = (car: any) => {
    if (car.photos && car.photos.length > 0) {
      const heroPhoto = car.photos.find((p: any) => p.isHero)
      return heroPhoto?.url || car.photos[0].url
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!host) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <IoPersonOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Host Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The host you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/admin/rentals/hosts')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Hosts
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/rentals/hosts')}
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <IoArrowBackOutline className="w-5 h-5 mr-2" />
                <span>Back to Hosts</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <IoCreateOutline className="w-5 h-5" />
                <span>Edit Host</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Host Profile Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Profile Photo */}
            {host.profilePhoto ? (
              <img
                src={host.profilePhoto}
                alt={host.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <IoPersonOutline className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Host Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{host.name}</h1>
                {host.isVerified && (
                  <IoCheckmarkCircle className="w-6 h-6 text-blue-500" />
                )}
                {host.active ? (
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">Active</span>
                ) : (
                  <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">Inactive</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoMailOutline className="w-4 h-4 mr-2" />
                  {host.email}
                </div>
                {host.phone && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <IoCallOutline className="w-4 h-4 mr-2" />
                    {host.phone}
                  </div>
                )}
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoLocationOutline className="w-4 h-4 mr-2" />
                  {host.city}, {host.state}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <IoCalendarOutline className="w-4 h-4 mr-2" />
                  Joined {new Date(host.joinedAt || host.createdAt).toLocaleDateString()}
                </div>
              </div>

              {host.bio && (
                <p className="mt-3 text-gray-600 dark:text-gray-400">{host.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <IoStarOutline className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">{host.rating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Rating</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <IoCarOutline className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">{host.cars?.length || 0}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Cars</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <IoTrendingUpOutline className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">{host.totalTrips}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Trips</p>
          </div>

          {host.responseTime && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <IoTimeOutline className="w-5 h-5 text-purple-500" />
                <span className="text-2xl font-bold">{host.responseTime}m</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Response Time</p>
            </div>
          )}

          {host.responseRate && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <IoSpeedometerOutline className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold">{host.responseRate}%</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Response Rate</p>
            </div>
          )}

          {host.acceptanceRate && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">{host.acceptanceRate}%</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Acceptance</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-6">
              {['overview', 'cars', 'reviews', 'bookings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Overall Rating</span>
                        <div className="flex items-center">
                          {getRatingStars(host.rating)}
                          <span className="ml-2 font-semibold">{host.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      {host.responseRate && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Response Rate</span>
                          <span className="font-semibold">{host.responseRate}%</span>
                        </div>
                      )}
                      {host.acceptanceRate && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Acceptance Rate</span>
                          <span className="font-semibold">{host.acceptanceRate}%</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Total Trips</span>
                        <span className="font-semibold">{host.totalTrips}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Active Cars</span>
                        <span className="font-semibold">{host.cars?.filter(c => c.isActive).length || 0}</span>
                      </div>
                      {host.responseTime && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Avg Response Time</span>
                          <span className="font-semibold">{host.responseTime} minutes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {host.verificationLevel && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Verification Status</h3>
                    <div className="flex items-center space-x-4">
                      <IoShieldCheckmarkOutline className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="font-semibold">{host.verificationLevel}</p>
                        {host.verifiedAt && (
                          <p className="text-sm text-gray-600">
                            Verified on {new Date(host.verifiedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cars Tab */}
            {activeTab === 'cars' && (
              <div>
                {host.cars && host.cars.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {host.cars.map((car) => {
                      const photo = getCarPhoto(car)
                      return (
                        <div key={car.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <div className="h-40 bg-gray-200 dark:bg-gray-700">
                            {photo ? (
                              <img src={photo} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <IoImageOutline className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold">{car.year} {car.make} {car.model}</h4>
                            <p className="text-sm text-gray-600">{car.color} • {car.carType}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-green-600 font-semibold">${car.dailyRate}/day</span>
                              {car.isActive ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <span>{car.totalTrips} trips</span>
                              {car.rating > 0 && (
                                <span className="ml-3">★ {car.rating.toFixed(1)}</span>
                              )}
                            </div>
                            <Link
                              href={`/sys-2847/fleet/edit/${car.id}`}
                              className="mt-3 block text-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Manage Car
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <IoCarOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No cars listed yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {host.reviews && host.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {host.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              {getRatingStars(review.rating)}
                              <span className="ml-2 text-sm text-gray-600">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                            {review.car && (
                              <p className="text-sm text-gray-500 mt-2">
                                {review.car.year} {review.car.make} {review.car.model}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <IoStarOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No reviews yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                {host.bookings && host.bookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {host.bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 text-sm">{booking.bookingCode}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                booking.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold">
                              ${booking.totalAmount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <IoDocumentTextOutline className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No bookings yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}