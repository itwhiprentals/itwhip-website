// app/partner/bookings/new/components/DatesStep.tsx

'use client'

import { useTranslations } from 'next-intl'
import {
  IoCarOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoChevronForwardOutline,
  IoShieldOutline,
  IoAlertCircleOutline,
  IoAirplaneOutline,
  IoBusinessOutline,
  IoLocationOutline,
} from 'react-icons/io5'
import { AddressAutocomplete, AddressResult } from '@/app/components/shared/AddressAutocomplete'
import {
  Vehicle,
  AvailabilityResult,
  PartnerAddress,
  PartnerInsurance,
  GuestInsurance,
  ARIZONA_AIRPORTS,
  DELIVERY_FEES,
} from '../types'

// Generate time options (30-min intervals, 6:00 AM – 10:00 PM)
function generateTimeOptions() {
  const options: { value: string; label: string }[] = []
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break // Stop at 10:00 PM
      const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
      const ampm = h >= 12 ? 'PM' : 'AM'
      const label = `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
      options.push({ value, label })
    }
  }
  return options
}

const TIME_OPTIONS = generateTimeOptions()

interface DatesStepProps {
  selectedVehicle: Vehicle | null
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  availability: AvailabilityResult | null
  checkingAvailability: boolean
  pickupType: 'partner' | 'delivery' | 'airport'
  onPickupTypeChange: (type: 'partner' | 'delivery' | 'airport') => void
  pickupLocation: string
  onPickupLocationChange: (location: string) => void
  selectedAirport: string
  onSelectedAirportChange: (airport: string) => void
  partnerAddress: PartnerAddress | null
  partnerInsurance: PartnerInsurance | null
  guestInsurance: GuestInsurance
  onGuestInsuranceChange: (insurance: GuestInsurance) => void
  notes: string
  onNotesChange: (notes: string) => void
  onBack: () => void
  onNext: () => void
  onChangeVehicle: () => void
  getMinEndDate: (start: string, minDays: number) => string
}

export default function DatesStep({
  selectedVehicle,
  startDate,
  endDate,
  startTime,
  endTime,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  availability,
  checkingAvailability,
  pickupType,
  onPickupTypeChange,
  pickupLocation,
  onPickupLocationChange,
  selectedAirport,
  onSelectedAirportChange,
  partnerAddress,
  partnerInsurance,
  guestInsurance,
  onGuestInsuranceChange,
  notes,
  onNotesChange,
  onBack,
  onNext,
  onChangeVehicle,
  getMinEndDate,
}: DatesStepProps) {
  const t = useTranslations('PartnerBookingNew')

  return (
    <div className="space-y-4">
      {/* Selected Vehicle Mini-Card */}
      {selectedVehicle && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
          {selectedVehicle.photo ? (
            <img
              src={selectedVehicle.photo}
              alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
              className="w-24 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-24 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <IoCarOutline className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white truncate">
              {selectedVehicle.year} {selectedVehicle.make}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {selectedVehicle.model}{selectedVehicle.trim ? ` ${selectedVehicle.trim}` : ''}
              {(selectedVehicle.carType || selectedVehicle.currentMileage) && (
                <span className="text-gray-400 dark:text-gray-500">
                  {' · '}{selectedVehicle.carType ? selectedVehicle.carType.charAt(0).toUpperCase() + selectedVehicle.carType.slice(1) : ''}{selectedVehicle.carType && selectedVehicle.currentMileage ? ', ' : ''}{selectedVehicle.currentMileage ? `${selectedVehicle.currentMileage.toLocaleString()} mi` : ''}
                </span>
              )}
            </p>
            <div className="flex items-center flex-wrap gap-2 mt-1">
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                ${selectedVehicle.dailyRate}/{t('day')}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                selectedVehicle.vehicleType === 'RIDESHARE'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {selectedVehicle.vehicleType === 'RIDESHARE' ? t('rideshare') : t('rental')}
              </span>
            </div>
          </div>
          <button
            onClick={onChangeVehicle}
            className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
          >
            {t('change')}
          </button>
        </div>
      )}

      {/* Minimum days notice */}
      {selectedVehicle && selectedVehicle.minTripDuration > 1 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
          <IoAlertCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {selectedVehicle.vehicleType === 'RIDESHARE'
                ? t('rideshareMinDaysTitle', { days: selectedVehicle.minTripDuration })
                : t('vehicleMinDaysTitle', { days: selectedVehicle.minTripDuration })}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
              {t('minDaysDescription', { days: selectedVehicle.minTripDuration })}
            </p>
          </div>
        </div>
      )}

      {/* Date/Time + Availability Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('startDateLabel')}</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
              <select
                value={startTime}
                onChange={(e) => onStartTimeChange(e.target.value)}
                className="w-[120px] px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              >
                {TIME_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('endDateLabel')}</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                min={startDate ? getMinEndDate(startDate, selectedVehicle?.minTripDuration || 1) : new Date().toISOString().split('T')[0]}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
              <select
                value={endTime}
                onChange={(e) => onEndTimeChange(e.target.value)}
                className="w-[120px] px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
              >
                {TIME_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Availability Status */}
        {(startDate && endDate) && (
          <div>
            {checkingAvailability ? (
              <div className="p-4 bg-gray-200/70 dark:bg-gray-700/50 rounded-lg text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('checkingAvailability')}</p>
              </div>
            ) : availability ? (
              <div className={`p-4 rounded-lg ${
                availability.available
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {availability.available ? (
                    <>
                      <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-700 dark:text-green-400">
                        {t('availableDays', { days: availability.tripDays || 0 })}
                      </span>
                    </>
                  ) : (
                    <>
                      <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="font-medium text-red-700 dark:text-red-400">
                        {availability.reason}
                      </span>
                    </>
                  )}
                </div>
                {availability.nextAvailable && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {t('nextAvailable', { date: new Date(availability.nextAvailable).toLocaleDateString() })}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Pickup + Insurance + Notes Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        {/* Pickup Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pickupTypeLabel')}</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { key: 'partner' as const, label: t('pickupPartnerLocation'), icon: IoBusinessOutline, fee: DELIVERY_FEES.partner },
              { key: 'delivery' as const, label: t('pickupDelivery'), icon: IoLocationOutline, fee: DELIVERY_FEES.delivery },
              { key: 'airport' as const, label: t('pickupAirport'), icon: IoAirplaneOutline, fee: DELIVERY_FEES.airport }
            ]).map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  onPickupTypeChange(option.key)
                  if (option.key === 'partner') {
                    onPickupLocationChange('')
                    onSelectedAirportChange('')
                  }
                }}
                className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                  pickupType === option.key
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-2 border-orange-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-transparent'
                }`}
              >
                <option.icon className="w-5 h-5" />
                <span>{option.label}</span>
                {option.fee > 0 && (
                  <span className="text-xs text-gray-500">+${option.fee}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Partner Location Display */}
        {pickupType === 'partner' && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <IoBusinessOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('pickupAtPartnerLocation')}</p>
                {partnerAddress && partnerAddress.address ? (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {partnerAddress.address}, {partnerAddress.city}, {partnerAddress.state} {partnerAddress.zipCode}
                  </p>
                ) : (
                  <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                    {t('businessAddressUsedForPickup')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delivery Address with Mapbox */}
        {pickupType === 'delivery' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('deliveryAddressLabel')}
            </label>
            <AddressAutocomplete
              value={pickupLocation}
              onAddressSelect={(address: AddressResult) => {
                onPickupLocationChange(address.fullAddress)
              }}
              placeholder={t('deliveryAddressPlaceholder')}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <IoLocationOutline className="w-3 h-3" />
              {t('deliveryFeeAmount', { amount: DELIVERY_FEES.delivery })}
            </p>
          </div>
        )}

        {/* Arizona Airports Dropdown */}
        {pickupType === 'airport' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('selectAirportLabel')}
            </label>
            <select
              value={selectedAirport}
              onChange={(e) => {
                onSelectedAirportChange(e.target.value)
                const airport = ARIZONA_AIRPORTS.find(a => a.code === e.target.value)
                if (airport) {
                  onPickupLocationChange(`${airport.name} (${airport.code})`)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="">{t('selectAirportPlaceholder')}</option>
              {ARIZONA_AIRPORTS.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.name} ({airport.code})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <IoAirplaneOutline className="w-3 h-3" />
              {t('airportFeeAmount', { amount: DELIVERY_FEES.airport })}
            </p>
          </div>
        )}

        {/* Insurance Status Indicator */}
        {selectedVehicle && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <IoShieldOutline className="w-4 h-4" />
              {t('insuranceStatusLabel')}
            </label>
            {(() => {
              const hasVehicleInsurance = selectedVehicle.insuranceEligible && selectedVehicle.insuranceInfo?.useForRentals
              const hasPartnerCoverage = partnerInsurance?.hasInsurance &&
                partnerInsurance?.coversDuringRentals &&
                partnerInsurance.rentalCoveredVehicleIds?.includes(selectedVehicle.id)

              if (hasVehicleInsurance) {
                return (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">{t('vehicleInsuranceLabel')}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {t('coveredBy', { provider: selectedVehicle.insuranceInfo?.provider || t('vehiclePolicy') })}
                      </p>
                    </div>
                  </div>
                )
              } else if (hasPartnerCoverage) {
                return (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex items-start gap-2">
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{t('partnerInsuranceLabel')}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        {t('coveredByBusinessInsurance', { provider: partnerInsurance?.insuranceProvider ? ` (${partnerInsurance.insuranceProvider})` : '' })}
                      </p>
                    </div>
                  </div>
                )
              } else {
                return (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2 mb-3">
                      <IoWarningOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('guestMustProvideInsurance')}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {t('noCoverageDescription')}
                        </p>
                      </div>
                    </div>

                    {/* Guest Insurance Options */}
                    <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700 space-y-3">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('addGuestInsuranceOptional')}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={guestInsurance.provider}
                            onChange={(e) => onGuestInsuranceChange({ ...guestInsurance, provider: e.target.value })}
                            placeholder={t('insuranceProviderPlaceholder')}
                            className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={guestInsurance.policyNumber}
                            onChange={(e) => onGuestInsuranceChange({ ...guestInsurance, policyNumber: e.target.value })}
                            placeholder={t('policyNumberPlaceholder')}
                            className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={guestInsurance.hasConfirmed}
                          onChange={(e) => onGuestInsuranceChange({ ...guestInsurance, hasConfirmed: e.target.checked })}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('guestWillBringInsurance')}
                        </span>
                      </label>
                    </div>
                  </div>
                )
              }
            })()}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notesLabel')}</label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
            placeholder={t('notesPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
        >
          {t('back')}
        </button>
        <button
          onClick={onNext}
          disabled={!availability?.available}
          className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
        >
          {t('reviewBooking')}
          <IoChevronForwardOutline className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
