// app/fleet/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoPeopleOutline,
  IoChatbubblesOutline,
  IoDocumentTextOutline,
  IoMegaphoneOutline,
  IoCalendarOutline,
  IoCarSportOutline,
  IoCloudUploadOutline,
  IoGridOutline,
  IoBriefcaseOutline,
  IoWalletOutline,
  IoReturnDownBackOutline,
  IoSettingsOutline,
  IoGiftOutline
} from 'react-icons/io5'
import { Car, CarStatus } from './types'
import { StatCard, StatusBadge, EmptyState, LoadingSpinner, SectionHeader } from './components'
import AnalyticsWidget from './components/AnalyticsWidget'
import MonitoringWidget from './components/MonitoringWidget'
import SecurityMetricsCard from './components/SecurityMetricsCard'

export default function FleetDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<string>('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [pendingApplications, setPendingApplications] = useState(0)

  // Get API key from URL
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'

  useEffect(() => {
    fetchCars()
    fetchUnreadMessages()
    fetchPendingApplications()
  }, [])

  // Separate effect for client-side only window operations
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('list')
    }
  }, [])

  const fetchCars = async () => {
    try {
      const response = await fetch(`/fleet/api/cars?key=${apiKey}`)
      const data = await response.json()
      if (data.success) {
        setCars(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch cars:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadMessages = async () => {
    try {
      const response = await fetch(`/fleet/api/messages/unread-count?key=${apiKey}`)
      const data = await response.json()
      if (data.success) {
        setUnreadCount(data.data.count || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread messages:', error)
    }
  }

  const fetchPendingApplications = async () => {
    try {
      const response = await fetch(`/api/fleet/partners/applications?status=SUBMITTED&key=${apiKey}`)
      const data = await response.json()
      if (data.success && data.applications) {
        setPendingApplications(data.applications.length)
      }
    } catch (error) {
      console.error('Failed to fetch pending applications:', error)
    }
  }

  const stats = {
    total: cars.length,
    available: cars.filter(c => c.status === CarStatus.AVAILABLE).length,
    booked: cars.filter(c => c.status === CarStatus.BOOKED).length,
    maintenance: cars.filter(c => c.status === CarStatus.MAINTENANCE).length
  }

  const filteredCars = filter === 'all' 
    ? cars 
    : cars.filter(c => c.status === filter)

  // Helper function to get the main photo
  const getCarPhoto = (car: Car) => {
    if (car.photos && car.photos.length > 0) {
      const heroPhoto = car.photos.find(p => p.isHero)
      return heroPhoto?.url || car.photos[0].url
    }
    return null
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="w-full">
      {/* Header with Primary Actions */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fleet Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Managing {cars.length} vehicles</p>
          </div>
          
          {/* Header Actions - Quick Access */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push(`/fleet/add?key=${apiKey}`)}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
            >
              <IoCarSportOutline className="text-lg" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Car</span>
            </button>
            <button
              onClick={() => router.push(`/fleet/bulk-upload?key=${apiKey}`)}
              className="hidden sm:flex px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm items-center gap-2"
            >
              <IoCloudUploadOutline className="text-lg" />
              Bulk Upload
            </button>
            <button
              onClick={() => router.push(`/fleet/templates?key=${apiKey}`)}
              className="hidden sm:flex px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm items-center gap-2"
            >
              <IoGridOutline className="text-lg" />
              Templates
            </button>
          </div>
        </div>
      </div>

      {/* Stats - Mobile responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard title="Total" value={stats.total} color="white" />
        <StatCard title="Available" value={stats.available} color="green" />
        <StatCard title="Booked" value={stats.booked} color="blue" />
        <StatCard title="Maintenance" value={stats.maintenance} color="yellow" />
      </div>

      {/* Navigation Actions - Management Operations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
          Management Hub
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-3">
          {/* Messages */}
          <Link
            href={`/fleet/messages?key=${apiKey}`}
            className="relative px-4 py-3 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 group"
          >
            <IoChatbubblesOutline className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Messages</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-lg">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Hosts */}
          <Link
            href={`/fleet/hosts?key=${apiKey}`}
            className="px-4 py-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 group"
          >
            <IoPersonOutline className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Hosts</span>
          </Link>

          {/* Guests */}
          <Link
            href={`/fleet/guests?key=${apiKey}`}
            className="px-4 py-3 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 group"
          >
            <IoPeopleOutline className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Guests</span>
          </Link>

          {/* Insurance */}
          <Link
            href={`/fleet/insurance?key=${apiKey}`}
            className="px-4 py-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 group"
          >
            <IoShieldCheckmarkOutline className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Insurance</span>
          </Link>

          {/* Claims */}
          <Link
            href={`/fleet/claims?key=${apiKey}`}
            className="px-4 py-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 group"
          >
            <IoDocumentTextOutline className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Claims</span>
          </Link>

          {/* Appeals */}
          <Link
            href={`/fleet/appeals?key=${apiKey}`}
            className="px-4 py-3 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 group"
          >
            <IoMegaphoneOutline className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Appeals</span>
          </Link>

          {/* Bookings */}
          <Link
            href={`/fleet/bookings?key=${apiKey}`}
            className="px-4 py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 group"
          >
            <IoCalendarOutline className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Bookings</span>
          </Link>

          {/* Partners */}
          <Link
            href={`/fleet/partners?key=${apiKey}`}
            className="relative px-4 py-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 group"
          >
            <IoBriefcaseOutline className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Partners</span>
            {pendingApplications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-lg">
                {pendingApplications > 99 ? '99+' : pendingApplications}
              </span>
            )}
          </Link>

          {/* Banking */}
          <Link
            href={`/fleet/hosts?key=${apiKey}&tab=banking`}
            className="px-4 py-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 group"
          >
            <IoWalletOutline className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Banking</span>
          </Link>

          {/* Refunds */}
          <Link
            href={`/fleet/refunds?key=${apiKey}`}
            className="px-4 py-3 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 group"
          >
            <IoReturnDownBackOutline className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Refunds</span>
          </Link>

          {/* Bonuses */}
          <Link
            href={`/fleet/bonuses?key=${apiKey}`}
            className="px-4 py-3 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 group"
          >
            <IoGiftOutline className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Bonuses</span>
          </Link>

          {/* Settings */}
          <Link
            href={`/fleet/settings?key=${apiKey}`}
            className="px-4 py-3 bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg flex flex-col items-center gap-2 group"
          >
            <IoSettingsOutline className="text-2xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>

      {/* Analytics & Monitoring Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <AnalyticsWidget />
        <MonitoringWidget />
      </div>

      {/* Security Metrics */}
      <div className="mb-6">
        <SecurityMetricsCard />
      </div>

      {/* Filter and View Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center mb-6">
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="BOOKED">Booked</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {viewMode === 'grid' ? '☰' : '⊞'}
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredCars.length} of {cars.length} vehicles
        </div>
      </div>

      {/* Cars Display */}
      {cars.length === 0 ? (
        <EmptyState 
          message="No cars in fleet yet"
          actionText="Add First Car"
          onAction={() => router.push(`/fleet/add?key=${apiKey}`)}
        />
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
          : 'space-y-2'
        }>
          {filteredCars.map((car) => {
            const photoUrl = getCarPhoto(car)
            
            return (
              <div
                key={car.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-gray-400 dark:hover:border-gray-600 cursor-pointer transition-all hover:shadow-lg dark:hover:shadow-xl shadow-sm"
                onClick={() => router.push(`/fleet/edit/${car.id}?key=${apiKey}`)}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Car Image */}
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-900">
                      {photoUrl ? (
                        <img 
                          src={photoUrl} 
                          alt={`${car.year} ${car.make} ${car.model}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent && !parent.querySelector('.no-photo')) {
                              const div = document.createElement('div')
                              div.className = 'no-photo absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600'
                              div.innerHTML = `
                                <div class="text-center">
                                  <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span class="text-xs">No Photo</span>
                                </div>
                              `
                              parent.appendChild(div)
                            }
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                          <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs">No Photo</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Photo count badge */}
                      {car.photos && car.photos.length > 0 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          {car.photos.length}
                        </div>
                      )}
                      
                      {/* Status badge overlay */}
                      <div className="absolute top-2 left-2">
                        <StatusBadge status={car.status || CarStatus.AVAILABLE} />
                      </div>
                    </div>
                    
                    {/* Car Details */}
                    <div className="p-4">
                      <div className="mb-2">
                        <div className="font-bold text-gray-900 dark:text-white text-lg">
                          {car.year} {car.make}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {car.model}
                        </div>
                        {car.color && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {car.color}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-start text-sm">
                        <div className="text-gray-600 dark:text-gray-400">
                          <div className="font-semibold text-green-600 dark:text-green-400 text-lg">
                            ${car.dailyRate}<span className="text-xs text-gray-500 dark:text-gray-400">/day</span>
                          </div>
                          <div className="text-xs mt-1">
                            {car.city}, {car.state}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            Host
                          </div>
                          <div className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                            {car.host?.name || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick actions */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex gap-2">
                          {car.instantBook && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                              </svg>
                              Instant
                            </span>
                          )}
                          {car.isActive && (
                            <span className="text-xs bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400 px-2 py-1 rounded flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Active
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/fleet/edit/${car.id}?key=${apiKey}`)
                          }}
                          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          Edit →
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* List View - Mobile Optimized */
                  <div className="flex items-center gap-3 p-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded flex-shrink-0 overflow-hidden">
                      {photoUrl ? (
                        <img 
                          src={photoUrl} 
                          alt={`${car.year} ${car.make} ${car.model}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* List details - Mobile optimized */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="min-w-0 flex-1 mr-2">
                          <div className="font-bold text-gray-900 dark:text-white text-sm truncate">
                            {car.year} {car.make} {car.model}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {car.color} • {car.city}
                          </div>
                        </div>
                        <StatusBadge status={car.status || CarStatus.AVAILABLE} />
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-green-600 dark:text-green-400 font-semibold">
                          ${car.dailyRate}<span className="text-xs text-gray-500">/day</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/fleet/edit/${car.id}?key=${apiKey}`)
                          }}
                          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}