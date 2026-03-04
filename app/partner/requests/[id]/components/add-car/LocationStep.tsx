// app/partner/requests/[id]/components/add-car/LocationStep.tsx
// Address autocomplete, color picker, license plate, and mileage inputs

'use client'

import {
  IoCheckmarkCircle,
  IoLocationOutline,
} from 'react-icons/io5'
import { AddressAutocomplete, AddressResult } from '@/app/components/shared/AddressAutocomplete'
import { CAR_COLORS } from '@/app/host/cars/[id]/edit/types'

interface LocationStepProps {
  color: string
  setColor: (v: string) => void
  licensePlate: string
  setLicensePlate: (v: string) => void
  currentMileage: string
  setCurrentMileage: (v: string) => void
  address: string
  city: string
  state: string
  zipCode: string
  onAddressSelect: (addr: AddressResult) => void
  t: (key: string, values?: Record<string, any>) => string
}

export default function LocationStep({
  color, setColor,
  licensePlate, setLicensePlate,
  currentMileage, setCurrentMileage,
  address, city, state, zipCode,
  onAddressSelect, t
}: LocationStepProps) {
  return (
    <>
      {/* ─── Color ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('addColor')}
        </label>
        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="">{t('addSelectColor')}</option>
          {CAR_COLORS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* ─── License Plate & Mileage ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('addLicensePlate')}
            </label>
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="ABC 1234"
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('addCurrentMileage')}
            </label>
            <input
              type="number"
              value={currentMileage}
              onChange={(e) => setCurrentMileage(e.target.value)}
              placeholder="45,000"
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* ─── Location ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <IoLocationOutline className="w-5 h-5 text-orange-600" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('addVehicleLocation')}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('addLocationDesc')}</p>

        <AddressAutocomplete
          value={address}
          city={city}
          state={state}
          zipCode={zipCode}
          onAddressSelect={onAddressSelect}
          placeholder={t('addLocationPlaceholder')}
        />

        {city && state && (
          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <IoCheckmarkCircle className="w-4 h-4 flex-shrink-0" />
              {address}, {city}, {state} {zipCode}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
