// app/components/sections/HotelDeliverySection.tsx
'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import {
  IoBedOutline,
  IoCheckmarkCircle,
  IoChevronDownOutline,
  IoChevronUpOutline
} from 'react-icons/io5'

export default function HotelDeliverySection() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  
  const hotels = {
    'Scottsdale Luxury': [
      'Four Seasons Resort Scottsdale',
      'The Phoenician',
      'Fairmont Scottsdale Princess',
      'W Scottsdale',
      'The Boulders Resort',
      'Andaz Scottsdale Resort',
      'The Westin Kierland',
      'Hyatt Regency Scottsdale',
      'The McCormick Scottsdale',
      'Hotel Valley Ho',
      'The Scottsdale Resort',
      'Talking Stick Resort',
      'Casino Arizona',
      'Sanctuary Camelback Mountain',
      'Mountain Shadows Resort'
    ],
    'Phoenix Hotels': [
      'The Ritz-Carlton Phoenix',
      'Arizona Biltmore',
      'Royal Palms Resort',
      'The Camby',
      'Kimpton Hotel Palomar',
      'Renaissance Phoenix Downtown',
      'The Westin Phoenix',
      'Sheraton Grand Phoenix',
      'Hilton Phoenix Resort',
      'JW Marriott Desert Ridge',
      'Pointe Hilton Tapatio Cliffs',
      'Pointe Hilton Squaw Peak',
      'The Wigwam',
      'Arizona Grand Resort',
      'Boulders on Southern'
    ],
    'Tempe & Airport': [
      'Tempe Mission Palms',
      'Aloft Phoenix Airport',
      'Graduate Tempe',
      'AC Hotel Phoenix Tempe',
      'Moxy Phoenix Tempe',
      'DoubleTree Tempe',
      'Embassy Suites Tempe',
      'Courtyard Tempe Downtown',
      'Four Points Tempe',
      'Hampton Inn Phoenix Airport',
      'Holiday Inn Express Airport',
      'Crowne Plaza Phoenix Airport',
      'Drury Inn Phoenix Airport',
      'Best Western Airport',
      'La Quinta Phoenix Airport'
    ],
    'Mesa & Chandler': [
      'Sheraton Mesa',
      'Delta Hotels Mesa',
      'Marriott Phoenix Mesa',
      'Hilton Phoenix East Mesa',
      'Residence Inn Mesa',
      'Sheraton Wild Horse Pass',
      'Fairfield Inn Chandler',
      'Crowne Plaza Chandler',
      'Hilton Phoenix Chandler',
      'DoubleTree Chandler'
    ]
  }

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  return (
    <section className="py-10 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Free Delivery Network
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
            We Deliver to 50+ Arizona Hotels
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Skip the rental counter. We bring your car directly to your hotel. Free delivery within 15 miles, $29 beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(hotels).map(([category, hotelList]) => {
            const isExpanded = expandedCategory === category
            const visibleHotels = isExpanded ? hotelList : hotelList.slice(0, 4)
            
            return (
              <div key={category} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoBedOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  {category}
                </h3>
                <ul className="space-y-2">
                  {visibleHotels.map(hotel => (
                    <li key={hotel} className="flex items-start gap-2 text-sm">
                      <IoCheckmarkCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{hotel}</span>
                    </li>
                  ))}
                </ul>
                {hotelList.length > 4 && (
                  <button
                    onClick={() => toggleCategory(category)}
                    className="mt-3 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>Show Less <IoChevronUpOutline className="w-4 h-4" /></>
                    ) : (
                      <>View All {hotelList.length} Hotels <IoChevronDownOutline className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA Line */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Not seeing your hotel? We likely deliver there too.{' '}
            <Link 
              href="/hotel-solutions" 
              className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
            >
              View all partners
            </Link>
            <span className="mx-2 text-gray-400">·</span>
            <Link 
              href="/contact" 
              className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:underline"
            >
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}