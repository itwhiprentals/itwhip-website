// app/(guest)/dashboard/components/ActiveServices.tsx
// Active Services Component - Shows current bookings and active services

'use client'

import { useState } from 'react'
import { 
  IoCarOutline,
  IoBedOutline,
  IoRestaurantOutline,
  IoCarSportOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoCheckmarkCircleOutline,
  IoEllipsisHorizontalOutline,
  IoCallOutline,
  IoNavigateOutline,
  IoCloseOutline
} from 'react-icons/io5'

interface Service {
  id: string
  type: 'ride' | 'hotel' | 'food' | 'rental'
  status: string
  title: string
  subtitle: string
  time: string
  price?: number
  driver?: string
  vehicle?: string
  nights?: number
  room?: string
  items?: number
}

interface ActiveServicesProps {
  services: Service[]
  onServiceClick: (serviceId: string) => void
}

export default function ActiveServices({ services, onServiceClick }: ActiveServicesProps) {
  const [expandedService, setExpandedService] = useState<string | null>(null)

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'ride':
        return IoCarOutline
      case 'hotel':
        return IoBedOutline
      case 'food':
        return IoRestaurantOutline
      case 'rental':
        return IoCarSportOutline
      default:
        return IoCheckmarkCircleOutline
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'active':
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 0) {
      return 'Past due'
    } else if (diffMins < 60) {
      return `${diffMins} min`
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    }
  }

  if (services.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Active Services</h2>
        <span className="text-sm text-gray-500">{services.length} active</span>
      </div>

      <div className="space-y-4">
        {services.map((service) => {
          const Icon = getServiceIcon(service.type)
          const isExpanded = expandedService === service.id

          return (
            <div
              key={service.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Main Service Row */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedService(isExpanded ? null : service.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Service Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      service.type === 'ride' ? 'bg-green-100' :
                      service.type === 'hotel' ? 'bg-blue-100' :
                      service.type === 'food' ? 'bg-orange-100' :
                      'bg-purple-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        service.type === 'ride' ? 'text-green-600' :
                        service.type === 'hotel' ? 'text-blue-600' :
                        service.type === 'food' ? 'text-orange-600' :
                        'text-purple-600'
                      }`} />
                    </div>

                    {/* Service Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{service.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{service.subtitle}</p>
                      
                      {/* Additional Details */}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <IoTimeOutline className="w-4 h-4 mr-1" />
                          {formatTime(service.time)}
                        </span>
                        {service.driver && (
                          <span>Driver: {service.driver}</span>
                        )}
                        {service.vehicle && (
                          <span>{service.vehicle}</span>
                        )}
                        {service.room && (
                          <span>Room: {service.room}</span>
                        )}
                        {service.items && (
                          <span>{service.items} items</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center space-x-4">
                    {service.price && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${service.price.toFixed(2)}
                        </p>
                      </div>
                    )}
                    <IoEllipsisHorizontalOutline className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Expanded Actions */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {service.type === 'ride' && (
                        <>
                          <button className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                            <IoNavigateOutline className="w-4 h-4" />
                            <span>Track</span>
                          </button>
                          <button className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                            <IoCallOutline className="w-4 h-4" />
                            <span>Call Driver</span>
                          </button>
                        </>
                      )}
                      
                      {service.type === 'hotel' && (
                        <>
                          <button className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                            <IoLocationOutline className="w-4 h-4" />
                            <span>Directions</span>
                          </button>
                          <button className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                            <IoCallOutline className="w-4 h-4" />
                            <span>Call Hotel</span>
                          </button>
                        </>
                      )}
                      
                      {service.type === 'food' && (
                        <>
                          <button className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                            <IoNavigateOutline className="w-4 h-4" />
                            <span>Track Order</span>
                          </button>
                          <button className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                            <IoCallOutline className="w-4 h-4" />
                            <span>Contact</span>
                          </button>
                        </>
                      )}
                    </div>

                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">
                      <IoCloseOutline className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}