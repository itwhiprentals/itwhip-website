// app/(guest)/rentals/components/AccountBenefitsCard.tsx
'use client'

import { IoCheckmarkCircle, IoGiftOutline, IoFlashOutline, IoCarSportOutline } from 'react-icons/io5'

interface AccountBenefitsCardProps {
  relatedBookingsCount?: number
  isCompact?: boolean
}

export default function AccountBenefitsCard({ 
  relatedBookingsCount = 0, 
  isCompact = false 
}: AccountBenefitsCardProps) {
  const benefits = [
    {
      icon: IoGiftOutline,
      title: "10% Off Next Rental",
      description: "Exclusive member discount"
    },
    {
      icon: IoFlashOutline,
      title: "Express Checkout",
      description: "Skip the forms next time"
    },
    {
      icon: IoCarSportOutline,
      title: "Member-Only Vehicles",
      description: "Access premium cars"
    }
  ]

  if (isCompact) {
    return (
      <div>
        {relatedBookingsCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-semibold text-blue-900">
              🎉 We found {relatedBookingsCount} previous booking{relatedBookingsCount > 1 ? 's' : ''} with your email!
            </p>
            <p className="text-xs text-blue-700 mt-1">
              They'll be automatically imported to your account
            </p>
          </div>
        )}
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-semibold text-gray-800">{benefit.title}</span>
                <span className="text-xs text-gray-600 block">{benefit.description}</span>
              </div>
            </li>
          ))}
          <li className="flex items-start">
            <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-sm font-semibold text-gray-800">Track All Bookings</span>
              <span className="text-xs text-gray-600 block">One dashboard for everything</span>
            </div>
          </li>
        </ul>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Benefits</h3>
      
      {relatedBookingsCount > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-blue-900">
            🎉 Great news! We found {relatedBookingsCount} booking{relatedBookingsCount > 1 ? 's' : ''} with your email
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Create an account and we'll automatically import them for easy tracking
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}