// app/sys-2847/fleet/edit/components/DeliveryOptions.tsx
'use client'

import { useState } from 'react'

interface DeliveryOptionsProps {
  airportPickup?: boolean
  hotelDelivery?: boolean
  homeDelivery?: boolean
  deliveryRadius?: number
  deliveryFee?: number
  freeDeliveryRadius?: number
  airportFee?: number
  hotelFee?: number
  homeFee?: number
  deliveryInstructions?: string
  onChange: (field: string, value: any) => void
}

const AIRPORTS_ARIZONA = [
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport' },
  { code: 'TUS', name: 'Tucson International Airport' },
  { code: 'AZA', name: 'Phoenix-Mesa Gateway Airport' },
  { code: 'FLG', name: 'Flagstaff Pulliam Airport' },
  { code: 'YUM', name: 'Yuma International Airport' }
]

export function DeliveryOptions({
  airportPickup = false,
  hotelDelivery = false,
  homeDelivery = false,
  deliveryRadius = 10,
  deliveryFee = 150,
  freeDeliveryRadius = 5,
  airportFee = 0,
  hotelFee = 35,
  homeFee = 50,
  deliveryInstructions = '',
  onChange
}: DeliveryOptionsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedAirports, setSelectedAirports] = useState<string[]>(['PHX'])

  const handleAirportToggle = (code: string) => {
    const updated = selectedAirports.includes(code)
      ? selectedAirports.filter(a => a !== code)
      : [...selectedAirports, code]
    setSelectedAirports(updated)
    onChange('selectedAirports', updated)
  }

  const anyDeliveryEnabled = airportPickup || hotelDelivery || homeDelivery

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Delivery & Pickup Options
      </h3>

      <div className="space-y-4">
        {/* Main Delivery Options */}
        <div className="space-y-3">
          {/* Airport Pickup */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <input
              type="checkbox"
              id="airportPickup"
              checked={airportPickup}
              onChange={(e) => onChange('airportPickup', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <label htmlFor="airportPickup" className="flex items-center gap-2 cursor-pointer">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M19 10l-2 2m0 0l-2 2m2-2l2 2m-2-2l-2-2M12 14l.01-.01M12 12h.01M12 10h.01M12 15V9" />
                </svg>
                <span className="font-medium text-gray-900 dark:text-white">Airport Pickup</span>
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Meet guests at the airport with the vehicle
              </p>
              
              {airportPickup && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Fee:
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">$</span>
                      <input
                        type="number"
                        value={airportFee}
                        onChange={(e) => onChange('airportFee', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm"
                        min="0"
                      />
                      <span className="text-xs text-gray-500">(0 = free)</span>
                    </div>
                  </div>
                  
                  {/* Airport Selection */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Available airports:</p>
                    <div className="space-y-1">
                      {AIRPORTS_ARIZONA.map(airport => (
                        <label key={airport.code} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedAirports.includes(airport.code)}
                            onChange={() => handleAirportToggle(airport.code)}
                            className="w-3 h-3"
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {airport.code} - {airport.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hotel Delivery */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <input
              type="checkbox"
              id="hotelDelivery"
              checked={hotelDelivery}
              onChange={(e) => onChange('hotelDelivery', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <label htmlFor="hotelDelivery" className="flex items-center gap-2 cursor-pointer">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium text-gray-900 dark:text-white">Hotel Delivery</span>
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Deliver vehicle to hotels and resorts
              </p>
              
              {hotelDelivery && (
                <div className="mt-3 flex items-center gap-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Fee:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">$</span>
                    <input
                      type="number"
                      value={hotelFee}
                      onChange={(e) => onChange('hotelFee', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm"
                      min="0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Home Delivery */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <input
              type="checkbox"
              id="homeDelivery"
              checked={homeDelivery}
              onChange={(e) => onChange('homeDelivery', e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <label htmlFor="homeDelivery" className="flex items-center gap-2 cursor-pointer">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium text-gray-900 dark:text-white">Home Delivery</span>
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Deliver vehicle to guest's home or office
              </p>
              
              {homeDelivery && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Fee:
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">$</span>
                      <input
                        type="number"
                        value={homeFee}
                        onChange={(e) => onChange('homeFee', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Delivery radius:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={deliveryRadius}
                        onChange={(e) => onChange('deliveryRadius', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm"
                        min="1"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">miles</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        {anyDeliveryEnabled && (
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <svg 
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Advanced Delivery Settings
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Free Delivery Radius
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={freeDeliveryRadius}
                      onChange={(e) => onChange('freeDeliveryRadius', parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm"
                      min="0"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      miles (0 = no free delivery)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Delivery is free within this radius
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Base Delivery Fee (outside free radius)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">$</span>
                    <input
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => onChange('deliveryFee', parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Delivery Instructions / Notes
                  </label>
                  <textarea
                    value={deliveryInstructions}
                    onChange={(e) => onChange('deliveryInstructions', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white text-sm"
                    placeholder="e.g., Call 30 minutes before arrival, meet at valet parking, etc."
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delivery Summary */}
        {anyDeliveryEnabled && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Delivery Options Summary
            </h4>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              {airportPickup && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Airport pickup: {airportFee > 0 ? `$${airportFee}` : 'Free'}
                  {selectedAirports.length > 0 && ` (${selectedAirports.join(', ')})`}
                </div>
              )}
              {hotelDelivery && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Hotel delivery: {hotelFee > 0 ? `$${hotelFee}` : 'Free'}
                </div>
              )}
              {homeDelivery && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Home delivery: {homeFee > 0 ? `$${homeFee}` : 'Free'} 
                  {freeDeliveryRadius > 0 && ` (free within ${freeDeliveryRadius} miles)`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            <strong>Tip:</strong> Offering delivery options increases bookings by 30%. 
            Consider free delivery within a small radius to attract more guests.
          </p>
        </div>
      </div>
    </div>
  )
}