// app/components/cards/CarCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { generateCarUrl } from '@/app/lib/utils/urls'
import { capitalizeCarMake } from '@/app/lib/utils/formatters'
import CarImage from './CarImage'
import {
  IoFlashOutline,
  IoStarOutline,
  IoArrowForwardOutline,
  IoLocationOutline,
  IoStarSharp,
  IoCarSportOutline,
  IoLeaf
} from 'react-icons/io5'

interface CarCardProps {
  car: any
  showHostAvatar?: boolean
}

// Check if host photo URL is valid (not a placeholder/default)
const isValidHostPhoto = (url: string | undefined | null): boolean => {
  if (!url) return false
  // Filter out default/placeholder URLs
  if (url === '/default-avatar.svg') return false
  if (url.includes('default-avatar')) return false
  if (url.includes('placeholder')) return false
  // Must start with http or be a valid path to actual image
  return url.startsWith('http') || url.startsWith('https')
}

export default function CarCard({ car, showHostAvatar = false }: CarCardProps) {
  const [hostAvatarError, setHostAvatarError] = useState(false)
  const isTraditional = car.provider_type === 'traditional'
  const showLocalHostBadge = car.host && !car.instantBook
  const tripCount = car.trips || car.totalTrips || car.rating?.count || 0
  const carUrl = generateCarUrl(car)
  const esgScore = car.esgScore || car.impactScore || car.esg_score || null
  const showEcoElite = esgScore && esgScore >= 50
  const isElectric = car.fuelType === 'ELECTRIC' || car.fuelType === 'electric' || car.isElectric

  return (
    <Link href={carUrl} className="group block">
      <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <CarImage car={car} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {showLocalHostBadge && (
              <span className="px-3 py-1 bg-black/80 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                <IoStarSharp className="w-3 h-3" /> LOCAL HOST
              </span>
            )}
            {car.vehicleType?.toUpperCase() === 'RIDESHARE' ? (
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                <IoCarSportOutline className="w-3 h-3" /> RIDESHARE
              </span>
            ) : car.instantBook && (
              <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                <IoFlashOutline className="w-3 h-3" /> INSTANT
              </span>
            )}
            {isElectric && (
              <span className="px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                <IoFlashOutline className="w-3 h-3" /> EV
              </span>
            )}
            {isTraditional && car.provider && (
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                {car.provider.toUpperCase()}
              </span>
            )}
          </div>

          {/* Bottom-right price */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-lg px-4 py-2.5 shadow-xl border border-white/20">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900 dark:text-white">${car.dailyRate || car.totalDaily}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">/day</span>
              </div>
            </div>
          </div>

          {/* Host avatar and name - bottom-left */}
          {showHostAvatar && car.host && (() => {
            const hostFirstName = (car.host.name || 'Host').split(' ')[0]
            const hostInitial = hostFirstName.charAt(0).toUpperCase()
            const hostPhotoUrl = car.host.profilePhoto || car.host.avatar
            const hasValidPhoto = isValidHostPhoto(hostPhotoUrl) && !hostAvatarError
            return (
              <div className="absolute bottom-3 left-3">
                <div className="flex items-center gap-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full pl-1 pr-3 py-1 shadow-md border border-white/20">
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                    {hasValidPhoto ? (
                      <img
                        src={hostPhotoUrl}
                        alt={hostFirstName}
                        className="w-full h-full object-cover"
                        onError={() => setHostAvatarError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-500 text-white font-bold text-xs">
                        {hostInitial}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {hostFirstName}
                  </span>
                </div>
              </div>
            )
          })()}
        </div>

        <div className="p-5 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                {car.year} {capitalizeCarMake(car.make)}
              </h3>
              {showEcoElite && (
                <div className="group/tooltip relative">
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <IoLeaf className="w-3 h-3" /> Eco Elite
                  </span>
                  <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-10">
                    <div className="bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                      Impact Score: {esgScore}/100
                      <div className="text-[10px] text-gray-300 mt-0.5">CSRD Compliant • Scope 3 Ready</div>
                      <div className="absolute -top-1 right-4 w-2 h-2 bg-black transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {car.model}
            </h4>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {car.rating && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <IoStarOutline
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(car.rating.average || car.rating) ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {(car.rating.average || car.rating).toFixed(1)}
                  </span>
                </div>
              )}
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <IoCarSportOutline className="w-3.5 h-3.5" /> {tripCount} trips
              </span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <IoLocationOutline className="w-3 h-3" /> {car.location?.city || 'Phoenix'}, {car.location?.state || 'AZ'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-400">
              Airport Delivery
            </span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-400">
              Hotel Delivery
            </span>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
            <div className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
              <IoLocationOutline className="w-3.5 h-3.5" />
              {car.location?.lat ? (() => {
                const R = 3959
                const dLat = (car.location.lat - 33.4484) * Math.PI / 180
                const dLon = (car.location.lng - -112.0740) * Math.PI / 180
                const a = Math.sin(dLat/2)**2 + Math.cos(33.4484 * Math.PI / 180) * Math.cos(car.location.lat * Math.PI / 180) * Math.sin(dLon/2)**2
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
                let d = R * c
                if (d < 1) d = 1.1 + (car.id.charCodeAt(0) % 9) / 10
                return `${d.toFixed(1)} mi away`
              })() : `${car.location?.city || 'Phoenix'}, ${car.location?.state || 'AZ'}`}
            </div>
            <div className="flex items-center text-amber-600 dark:text-amber-400 font-semibold group-hover:gap-2 transition-all">
              View <IoArrowForwardOutline className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}