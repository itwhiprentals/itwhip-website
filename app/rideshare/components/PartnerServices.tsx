// app/rideshare/components/PartnerServices.tsx
// Services offered by the partner

'use client'

import {
  IoCarOutline,
  IoBicycleOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'
import { FaUber, FaCarSide } from 'react-icons/fa'
import { SiLyft, SiDoordash, SiInstacart } from 'react-icons/si'

interface Service {
  id: string
  name: string
  description: string
  icon?: string
  platforms?: string[]
  priceRange?: string
}

interface PartnerServicesProps {
  services?: Service[] | null
  companyName?: string
}

// Platform icon mapping with brand colors
const PLATFORM_ICONS: Record<string, { icon: React.ReactNode; bgColor: string }> = {
  'uber': { icon: <FaUber className="w-4 h-4 text-white" />, bgColor: 'bg-black' },
  'lyft': { icon: <SiLyft className="w-4 h-4 text-white" />, bgColor: 'bg-[#FF00BF]' },
  'doordash': { icon: <SiDoordash className="w-4 h-4 text-white" />, bgColor: 'bg-[#FF3008]' },
  'instacart': { icon: <SiInstacart className="w-4 h-4 text-white" />, bgColor: 'bg-[#43B02A]' },
}

// Default services if partner hasn't set custom ones
const DEFAULT_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Rideshare Rentals',
    description: 'Vehicles pre-approved and ready for Uber and Lyft driving',
    platforms: ['uber', 'lyft'],
    priceRange: 'from $249/week'
  },
  {
    id: '2',
    name: 'Delivery Rentals',
    description: 'Fuel-efficient vehicles perfect for DoorDash and Instacart',
    platforms: ['doordash', 'instacart'],
    priceRange: 'from $199/week'
  },
  {
    id: '3',
    name: 'Flexible Terms',
    description: 'Weekly, bi-weekly, and monthly rental options available',
    priceRange: 'Custom pricing'
  },
  {
    id: '4',
    name: 'Full Coverage',
    description: 'Insurance and maintenance included in all rentals',
    priceRange: 'Included'
  }
]

export default function PartnerServices({ services, companyName = 'Our' }: PartnerServicesProps) {
  const displayServices = services && services.length > 0 ? services : DEFAULT_SERVICES

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Services Offered
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          — What {companyName} provides
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayServices.map((service) => (
          <div
            key={service.id}
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:border-orange-200 dark:hover:border-orange-800 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {service.name}
              </h3>
              {service.priceRange && (
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">
                  {service.priceRange}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {service.description}
            </p>

            {/* Platform badges */}
            {service.platforms && service.platforms.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Works with:
                </span>
                <div className="flex items-center gap-1.5">
                  {service.platforms.map((platform) => {
                    const platformData = PLATFORM_ICONS[platform.toLowerCase()]
                    return (
                      <div
                        key={platform}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${platformData?.bgColor || 'bg-gray-600'}`}
                        title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                      >
                        {platformData?.icon || <IoCarOutline className="w-3 h-3 text-white" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
