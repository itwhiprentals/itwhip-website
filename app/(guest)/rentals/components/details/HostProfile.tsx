// app/(guest)/rentals/components/details/HostProfile.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  IoStarOutline,
  IoStar,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoChatbubbleOutline,
  IoCarOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoTrophyOutline,
  IoSparklesOutline,
  IoCallOutline,
  IoMailOutline,
  IoPersonOutline,
  IoVerifiedOutline
} from 'react-icons/io5'
import type { RentalHost } from '@/app/lib/dal/types'

interface HostProfileProps {
  host: RentalHost & {
    cars?: Array<{
      id: string
      make: string
      model: string
      year: number
      dailyRate: number
      rating: number
      totalTrips: number
      photos: Array<{ url: string }>
    }>
    _count?: {
      cars: number
      bookings: number
      reviews: number
    }
  }
}

export default function HostProfile({ host }: HostProfileProps) {
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [showAllCars, setShowAllCars] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [messageSent, setMessageSent] = useState(false)
  
  // Calculate host stats
  const memberSince = new Date(host.joinedAt)
  const monthsActive = Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30))
  const responseTimeText = host.responseTime 
    ? host.responseTime < 60 
      ? `${host.responseTime} min`
      : `${Math.floor(host.responseTime / 60)} hours`
    : 'N/A'
  
  // Verification badges
  const verificationBadges = [
    { 
      verified: host.isVerified, 
      label: 'Identity Verified', 
      icon: IoPersonOutline,
      color: 'text-blue-600' 
    },
    { 
      verified: host.verificationLevel === 'phone' || host.verificationLevel === 'id' || host.verificationLevel === 'in-person', 
      label: 'Phone Verified', 
      icon: IoCallOutline,
      color: 'text-green-600' 
    },
    { 
      verified: host.verificationLevel === 'in-person', 
      label: 'Met In Person', 
      icon: IoCheckmarkCircleOutline,
      color: 'text-purple-600' 
    },
    { 
      verified: host.totalTrips >= 10, 
      label: 'Super Host', 
      icon: IoTrophyOutline,
      color: 'text-amber-600' 
    },
  ]
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return
    
    // In real app, this would send via API
    console.log('Sending message:', messageText)
    setMessageSent(true)
    setMessageText('')
    
    setTimeout(() => {
      setMessageSent(false)
    }, 3000)
  }
  
  const displayCars = showAllCars ? host.cars : host.cars?.slice(0, 3)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Host Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          {host.profilePhoto ? (
            <Image
              src={host.profilePhoto}
              alt={host.name}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {host.name.charAt(0).toUpperCase()}
            </div>
          )}
          {host.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1">
              <IoShieldCheckmarkOutline className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {host.name}
            </h3>
            {host.totalTrips >= 10 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
                <IoTrophyOutline className="w-3 h-3" />
                <span>Super Host</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <IoLocationOutline className="w-4 h-4" />
              <span>{host.city}, {host.state}</span>
            </div>
            <div className="flex items-center gap-1">
              <IoCalendarOutline className="w-4 h-4" />
              <span>Joined {memberSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          
          {/* Host Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center gap-1">
                <IoStar className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {host.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {host.totalTrips}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Trips</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {host.responseRate ? `${Math.round(host.responseRate)}%` : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Response rate</p>
            </div>
            
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {responseTimeText}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Response time</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Verification Badges */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Verifications</h4>
        <div className="grid grid-cols-2 gap-2">
          {verificationBadges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  badge.verified 
                    ? 'bg-gray-50 dark:bg-gray-700/50' 
                    : 'bg-gray-50/50 dark:bg-gray-700/30 opacity-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${badge.verified ? badge.color : 'text-gray-400'}`} />
                <span className={`text-sm ${
                  badge.verified 
                    ? 'text-gray-700 dark:text-gray-300' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {badge.label}
                </span>
                {badge.verified && (
                  <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 ml-auto" />
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Bio */}
      {host.bio && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About {host.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {host.bio}
          </p>
        </div>
      )}
      
      {/* Message Host */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Have a question?
        </h4>
        
        {!showContactInfo ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ask about the car, pickup details, or anything else..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white text-sm resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  messageText.trim()
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <IoChatbubbleOutline className="w-4 h-4" />
                <span>Send Message</span>
              </button>
              
              <button
                onClick={() => setShowContactInfo(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <IoCallOutline className="w-4 h-4" />
              </button>
            </div>
            
            {messageSent && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                <IoCheckmarkCircleOutline className="w-5 h-5" />
                <span className="text-sm">Message sent! {host.name} typically responds in {responseTimeText}.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                Contact {host.name} directly:
              </p>
              <div className="space-y-2">
                <a
                  href={`tel:${host.phone}`}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500"
                >
                  <IoCallOutline className="w-4 h-4" />
                  <span>{host.phone}</span>
                </a>
                <a
                  href={`mailto:${host.email}`}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500"
                >
                  <IoMailOutline className="w-4 h-4" />
                  <span>{host.email}</span>
                </a>
              </div>
            </div>
            <button
              onClick={() => setShowContactInfo(false)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Hide contact info
            </button>
          </div>
        )}
      </div>
      
      {/* Host's Other Cars */}
      {host.cars && host.cars.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {host.name}'s other cars ({host._count?.cars || host.cars.length})
            </h4>
            {host.cars.length > 3 && (
              <button
                onClick={() => setShowAllCars(!showAllCars)}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                {showAllCars ? 'Show less' : 'View all'}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {displayCars?.map((car) => (
              <Link
                key={car.id}
                href={`/rentals/${car.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {car.photos?.[0] && (
                  <div className="relative w-16 h-12 flex-shrink-0">
                    <Image
                      src={car.photos[0].url}
                      alt={`${car.year} ${car.make} ${car.model}`}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {car.year} {car.make} {car.model}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>${car.dailyRate}/day</span>
                    {car.rating > 0 && (
                      <div className="flex items-center gap-0.5">
                        <IoStar className="w-3 h-3 text-amber-500" />
                        <span>{car.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {car.totalTrips > 0 && (
                      <span>{car.totalTrips} trips</span>
                    )}
                  </div>
                </div>
                
                <IoCarOutline className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Trust Badge */}
      <div className="mt-6 p-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg">
        <div className="flex items-center gap-2">
          <IoSparklesOutline className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-900 dark:text-amber-300">
            <span className="font-medium">ItWhip Verified Host</span> • 
            Background checked • 
            {host.totalTrips > 0 && ` ${host.totalTrips} successful rentals`}
          </p>
        </div>
      </div>
    </div>
  )
}
