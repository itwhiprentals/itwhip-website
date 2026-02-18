// app/(guest)/rentals/components/details/CarFeatures.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  IoCarSportOutline,
  IoSpeedometerOutline,
  IoColorPaletteOutline,
  IoSettingsOutline,
  IoFlashOutline,
  IoWaterOutline,
  IoSnowOutline,
  IoWifiOutline,
  IoBluetoothOutline,
  IoPhonePortraitOutline,
  IoVolumeHighOutline,
  IoNavigateOutline,
  IoCameraOutline,
  IoKeyOutline,
  IoShieldCheckmarkOutline,
  IoCarOutline,
  IoBagHandleOutline,
  IoPersonOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoSparklesOutline,
  IoBatteryChargingOutline,
  IoLeafOutline,
  IoRocketOutline,
  IoSunnyOutline,
  IoMoonOutline
} from 'react-icons/io5'
import type { RentalCarWithDetails } from '@/types/rental'

interface CarFeaturesProps {
  car: RentalCarWithDetails
}

// Feature icon mapping
const featureIcons: { [key: string]: any } = {
  // Connectivity
  'Bluetooth': IoBluetoothOutline,
  'Apple CarPlay': IoPhonePortraitOutline,
  'Android Auto': IoPhonePortraitOutline,
  'WiFi Hotspot': IoWifiOutline,
  'Wireless Charging': IoBatteryChargingOutline,
  'USB Ports': IoPhonePortraitOutline,

  // Safety
  'Backup Camera': IoCameraOutline,
  'Blind Spot Monitoring': IoShieldCheckmarkOutline,
  'Lane Assist': IoCarOutline,
  'Adaptive Cruise Control': IoSpeedometerOutline,
  'Automatic Emergency Braking': IoShieldCheckmarkOutline,
  'Parking Sensors': IoCarOutline,

  // Comfort
  'Heated Seats': IoFlashOutline,
  'Cooled Seats': IoSnowOutline,
  'Leather Seats': IoSparklesOutline,
  'Sunroof': IoSunnyOutline,
  'Moonroof': IoMoonOutline,
  'Power Seats': IoSettingsOutline,

  // Convenience
  'Keyless Entry': IoKeyOutline,
  'Push Button Start': IoRocketOutline,
  'Remote Start': IoKeyOutline,
  'Power Liftgate': IoBagHandleOutline,
  'Navigation System': IoNavigateOutline,
  'Premium Audio': IoVolumeHighOutline,

  // Performance
  'All-Wheel Drive': IoCarSportOutline,
  'Sport Mode': IoRocketOutline,
  'Turbo Engine': IoSpeedometerOutline,
  'Hybrid': IoLeafOutline,
  'Electric': IoBatteryChargingOutline,

  // Other
  'Pet Friendly': IoPersonOutline,
  'Child Seat Compatible': IoPersonOutline,
  'Bike Rack': IoCarOutline,
  'Ski Rack': IoSnowOutline,
  'Tow Hitch': IoCarOutline
}

export default function CarFeatures({ car }: CarFeaturesProps) {
  const t = useTranslations('CarFeatures')
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Parse features from JSON string
  const features = typeof car.features === 'string'
    ? JSON.parse(car.features)
    : car.features || []

  // Categorize features
  const categorizedFeatures = {
    connectivity: features.filter((f: string) =>
      ['Bluetooth', 'Apple CarPlay', 'Android Auto', 'WiFi Hotspot', 'Wireless Charging', 'USB Ports'].includes(f)
    ),
    safety: features.filter((f: string) =>
      ['Backup Camera', 'Blind Spot Monitoring', 'Lane Assist', 'Adaptive Cruise Control', 'Automatic Emergency Braking', 'Parking Sensors'].includes(f)
    ),
    comfort: features.filter((f: string) =>
      ['Heated Seats', 'Cooled Seats', 'Leather Seats', 'Sunroof', 'Moonroof', 'Power Seats'].includes(f)
    ),
    convenience: features.filter((f: string) =>
      ['Keyless Entry', 'Push Button Start', 'Remote Start', 'Power Liftgate', 'Navigation System', 'Premium Audio'].includes(f)
    ),
    performance: features.filter((f: string) =>
      ['All-Wheel Drive', 'Sport Mode', 'Turbo Engine', 'Hybrid', 'Electric'].includes(f)
    ),
    other: features.filter((f: string) =>
      !['Bluetooth', 'Apple CarPlay', 'Android Auto', 'WiFi Hotspot', 'Wireless Charging', 'USB Ports',
        'Backup Camera', 'Blind Spot Monitoring', 'Lane Assist', 'Adaptive Cruise Control', 'Automatic Emergency Braking', 'Parking Sensors',
        'Heated Seats', 'Cooled Seats', 'Leather Seats', 'Sunroof', 'Moonroof', 'Power Seats',
        'Keyless Entry', 'Push Button Start', 'Remote Start', 'Power Liftgate', 'Navigation System', 'Premium Audio',
        'All-Wheel Drive', 'Sport Mode', 'Turbo Engine', 'Hybrid', 'Electric'].includes(f)
    )
  }

  // Get features to display based on category and show all state
  const getDisplayFeatures = () => {
    let displayFeatures = selectedCategory === 'all'
      ? features
      : categorizedFeatures[selectedCategory as keyof typeof categorizedFeatures] || []

    if (!showAllFeatures && displayFeatures.length > 8) {
      displayFeatures = displayFeatures.slice(0, 8)
    }

    return displayFeatures
  }

  const displayFeatures = getDisplayFeatures()

  // Category buttons
  const categories = [
    { id: 'all', label: t('allFeatures'), count: features.length },
    { id: 'connectivity', label: t('techConnectivity'), count: categorizedFeatures.connectivity.length },
    { id: 'safety', label: t('safety'), count: categorizedFeatures.safety.length },
    { id: 'comfort', label: t('comfort'), count: categorizedFeatures.comfort.length },
    { id: 'convenience', label: t('convenience'), count: categorizedFeatures.convenience.length },
    { id: 'performance', label: t('performance'), count: categorizedFeatures.performance.length }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('featuresAndAmenities')}
      </h3>

      {/* Quick Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <IoPersonOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('seats')}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{t('seatCount', { count: car.seats })}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <IoSettingsOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('transmission')}</p>
            <p className="font-semibold text-gray-900 dark:text-white capitalize">{car.transmission}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <IoWaterOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('fuel')}</p>
            <p className="font-semibold text-gray-900 dark:text-white capitalize">{car.fuelType}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <IoColorPaletteOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('color')}</p>
            <p className="font-semibold text-gray-900 dark:text-white capitalize">{car.color}</p>
          </div>
        </div>
      </div>

      {/* MPG Info */}
      {(car.mpgCity || car.mpgHighway) && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <IoLeafOutline className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-900 dark:text-green-300">{t('fuelEconomy')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {car.mpgCity && (
              <div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {car.mpgCity} <span className="text-sm font-normal">{t('mpg')}</span>
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">{t('city')}</p>
              </div>
            )}
            {car.mpgHighway && (
              <div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {car.mpgHighway} <span className="text-sm font-normal">{t('mpg')}</span>
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">{t('highway')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Filter */}
      {features.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              category.count > 0 && (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.label}
                  {category.count > 0 && (
                    <span className="ml-1.5 text-xs opacity-80">({category.count})</span>
                  )}
                </button>
              )
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {displayFeatures.map((feature: string, index: number) => {
              const Icon = featureIcons[feature] || IoCheckmarkCircleOutline
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Show More/Less Button */}
          {features.length > 8 && (
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium px-3 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              {showAllFeatures ? (
                <>
                  <IoChevronUpOutline className="w-4 h-4" />
                  {t('showLessFeatures')}
                </>
              ) : (
                <>
                  <IoChevronDownOutline className="w-4 h-4" />
                  {t('showAllFeatures', { count: features.length })}
                </>
              )}
            </button>
          )}
        </>
      )}

      {/* No Features Message */}
      {features.length === 0 && (
        <div className="text-center py-8">
          <IoInformationCircleOutline className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">
            {t('noFeaturesListed')}
          </p>
        </div>
      )}

      {/* Special Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {car.fuelType === 'electric' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
              <IoBatteryChargingOutline className="w-4 h-4" />
              <span>{t('zeroEmissions')}</span>
            </div>
          )}

          {car.fuelType === 'hybrid' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
              <IoLeafOutline className="w-4 h-4" />
              <span>{t('ecoFriendly')}</span>
            </div>
          )}

          {car.instantBook && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium">
              <IoFlashOutline className="w-4 h-4" />
              <span>{t('instantBook')}</span>
            </div>
          )}

          {car.airportPickup && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium">
              <IoCarOutline className="w-4 h-4" />
              <span>{t('airportPickup')}</span>
            </div>
          )}

          {car.hotelDelivery && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-medium">
              <IoCarSportOutline className="w-4 h-4" />
              <span>{t('hotelDelivery')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Insurance Note */}
      {car.insuranceIncluded && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {t('basicInsuranceIncluded')}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                {t('basicInsuranceDescription')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}