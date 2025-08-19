// app/components/BookingCard.tsx

'use client'

import { useState } from 'react'
import { 
  IoLocationOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoChevronDownOutline
} from 'react-icons/io5'

interface BookingCardProps {
  showPortalHint: boolean
  setShowPortalHint: (value: boolean) => void
}

export default function BookingCard({ showPortalHint, setShowPortalHint }: BookingCardProps) {
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [guests, setGuests] = useState(2)
  const [destination, setDestination] = useState('Scottsdale, AZ')

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-5 md:p-6">
            {/* Search Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
              
              {/* Destination - Full width on mobile */}
              <div className="col-span-1 md:col-span-4">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                  Destination
                </label>
                <div className="relative">
                  <IoLocationOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                      focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Phoenix, Scottsdale..."
                  />
                </div>
              </div>
              
              {/* Check-in - Fixed for iOS */}
              <div className="col-span-1 md:col-span-3">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                  Check-in
                </label>
                <div className="relative flex">
                  <IoCalendarOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="flex-1 w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                      focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all
                      appearance-none
                      [&::-webkit-date-and-time-value]:text-left
                      [&::-webkit-calendar-picker-indicator]:absolute
                      [&::-webkit-calendar-picker-indicator]:right-2
                      [&::-webkit-calendar-picker-indicator]:w-5
                      [&::-webkit-calendar-picker-indicator]:h-5
                      [&::-webkit-calendar-picker-indicator]:cursor-pointer
                      [&::-webkit-calendar-picker-indicator]:opacity-50
                      [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                    style={{
                      minHeight: '42px',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield'
                    }}
                  />
                </div>
              </div>
              
              {/* Check-out - Fixed for iOS */}
              <div className="col-span-1 md:col-span-3">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                  Check-out
                </label>
                <div className="relative flex">
                  <IoCalendarOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="flex-1 w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                      focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all
                      appearance-none
                      [&::-webkit-date-and-time-value]:text-left
                      [&::-webkit-calendar-picker-indicator]:absolute
                      [&::-webkit-calendar-picker-indicator]:right-2
                      [&::-webkit-calendar-picker-indicator]:w-5
                      [&::-webkit-calendar-picker-indicator]:h-5
                      [&::-webkit-calendar-picker-indicator]:cursor-pointer
                      [&::-webkit-calendar-picker-indicator]:opacity-50
                      [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                    style={{
                      minHeight: '42px',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield'
                    }}
                  />
                </div>
              </div>
              
              {/* Guests - Full width on mobile */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                  Guests
                </label>
                <div className="relative">
                  <IoPersonOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm appearance-none
                      focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all cursor-pointer"
                    style={{ minHeight: '42px' }}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4+</option>
                  </select>
                  <IoChevronDownOutline className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* Options and Search Button */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-5 gap-3 md:gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500" defaultChecked />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Include transportation
                  </span>
                </label>
                <button 
                  onClick={() => setShowPortalHint(!showPortalHint)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  Learn about hotel tiers
                </button>
              </div>
              
              <button className="w-full md:w-auto px-8 py-3 bg-amber-500 text-white rounded-lg font-bold 
                hover:bg-amber-600 active:bg-amber-700 transition-colors shadow-lg hover:shadow-xl">
                Search Hotels
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}