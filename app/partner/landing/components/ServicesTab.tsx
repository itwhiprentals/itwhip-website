// app/partner/landing/components/ServicesTab.tsx
// Service settings tab - which services appear on landing page

'use client'

import { useEffect, useState } from 'react'
import {
  IoSaveOutline,
  IoCarSportOutline,
  IoKeyOutline,
  IoCartOutline,
  IoCalendarOutline,
  IoSwapHorizontalOutline,
  IoMailOutline
} from 'react-icons/io5'
import { LandingPageData } from './types'

interface ServicesTabProps {
  data: LandingPageData
  onChange: (updates: Partial<LandingPageData>) => void
  onSave: () => void
  isSaving: boolean
}

interface VehicleCounts {
  rideshare: number
  rental: number
  total: number
}

// Core services that can be enabled/disabled
const CORE_SERVICES = [
  {
    id: 'enableRideshare' as const,
    label: 'Rideshare Rentals',
    description: 'Vehicles for Uber, Lyft, and other rideshare platforms',
    icon: IoCarSportOutline,
    countKey: 'rideshare' as const
  },
  {
    id: 'enableRentals' as const,
    label: 'Standard Rentals',
    description: 'Includes Peer-to-Peers, Managed Hosts and Partners',
    icon: IoKeyOutline,
    countKey: 'rental' as const
  }
]

// Premium services that require contacting sales
const PREMIUM_SERVICES = [
  {
    id: 'enableSales' as const,
    label: 'Vehicle Sales',
    description: 'Buy vehicles outright from your inventory',
    icon: IoCartOutline
  },
  {
    id: 'enableLeasing' as const,
    label: 'Leasing Options',
    description: 'Long-term vehicle leasing programs',
    icon: IoCalendarOutline
  },
  {
    id: 'enableRentToOwn' as const,
    label: 'Rent-to-Own',
    description: 'Rent with the option to purchase the vehicle',
    icon: IoSwapHorizontalOutline
  }
]

export default function ServicesTab({ data, onChange, onSave, isSaving }: ServicesTabProps) {
  const [vehicleCounts, setVehicleCounts] = useState<VehicleCounts>({ rideshare: 0, rental: 0, total: 0 })
  const [isLoadingCounts, setIsLoadingCounts] = useState(true)

  useEffect(() => {
    fetchVehicleCounts()
  }, [])

  const fetchVehicleCounts = async () => {
    try {
      const res = await fetch('/api/partner/fleet?countOnly=true')
      const result = await res.json()
      if (result.success) {
        // Count vehicles by type
        const vehicles = result.vehicles || []
        const rideshareCount = vehicles.filter((v: any) => v.vehicleType === 'RIDESHARE').length
        const rentalCount = vehicles.filter((v: any) => v.vehicleType === 'RENTAL' || !v.vehicleType).length
        setVehicleCounts({
          rideshare: rideshareCount,
          rental: rentalCount,
          total: vehicles.length
        })
      }
    } catch (error) {
      console.error('Failed to fetch vehicle counts:', error)
    } finally {
      setIsLoadingCounts(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Available Services
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Select which services to display on your landing page. Visitors will see tabs for each enabled service.
        </p>
      </div>

      {/* Core Services - Can be toggled */}
      <div className="space-y-4">
        {CORE_SERVICES.map((service) => {
          const Icon = service.icon
          const isEnabled = data[service.id]
          const count = vehicleCounts[service.countKey]

          return (
            <label
              key={service.id}
              className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                isEnabled
                  ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => onChange({ [service.id]: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <div className={`p-2 rounded-lg ${
                isEnabled
                  ? 'bg-orange-100 dark:bg-orange-900/30'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <Icon className={`w-5 h-5 ${
                  isEnabled
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  isEnabled
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {service.label}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {service.description}
                </p>
              </div>
              {/* Vehicle Count Badge */}
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                isEnabled
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {isLoadingCounts ? '...' : `${count} vehicle${count !== 1 ? 's' : ''}`}
              </div>
            </label>
          )
        })}
      </div>

      {/* Premium Services - Contact Sales */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Premium services require approval. Contact our sales team to get started.
        </p>
        <div className="space-y-4">
          {PREMIUM_SERVICES.map((service) => {
            const Icon = service.icon

            return (
              <div
                key={service.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {service.label}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {service.description}
                  </p>
                </div>
                <a
                  href="mailto:sales@itwhip.com?subject=Premium Service Inquiry"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors flex-shrink-0"
                >
                  <IoMailOutline className="w-4 h-4" />
                  Contact Sales
                </a>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info note */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Note:</strong> Enabling a service creates a tab on your landing page. Make sure you have vehicles configured for each enabled service type. Your page will be published when you have a valid slug and at least one core service enabled.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <IoSaveOutline className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Services'}
        </button>
      </div>
    </div>
  )
}
