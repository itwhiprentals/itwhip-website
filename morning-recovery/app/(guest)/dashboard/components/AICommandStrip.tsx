// app/(guest)/dashboard/components/AICommandStrip.tsx
// AI Command Strip - Smart suggestions based on context and time

'use client'

import { useState, useEffect } from 'react'
import { 
  IoSparklesOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoSunnyOutline,
  IoMoonOutline,
  IoCafeOutline,
  IoRestaurantOutline,
  IoCarOutline,
  IoBedOutline
} from 'react-icons/io5'

interface AICommandStripProps {
  onActionClick: (action: string) => void
  userContext?: {
    isAtHotel: boolean
    hasReservation: boolean
    location: string
  }
}

interface Suggestion {
  id: string
  text: string
  action: string
  icon: any
  time?: string
}

export default function AICommandStrip({ onActionClick, userContext }: AICommandStripProps) {
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    updateGreetingAndSuggestion()
    const interval = setInterval(updateGreetingAndSuggestion, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [userContext])

  const updateGreetingAndSuggestion = () => {
    const hour = new Date().getHours()
    const minute = new Date().getMinutes()
    
    // Set greeting based on time
    if (hour < 12) {
      setGreeting('Good morning')
    } else if (hour < 17) {
      setGreeting('Good afternoon')
    } else {
      setGreeting('Good evening')
    }

    // Generate smart suggestion based on context and time
    const suggestions: Suggestion[] = []

    // Time-based suggestions
    if (hour >= 6 && hour < 9) {
      suggestions.push({
        id: 'breakfast',
        text: 'Order breakfast to your room?',
        action: 'food',
        icon: IoCafeOutline,
        time: 'Delivery in 20 min'
      })
    } else if (hour >= 11 && hour < 14) {
      suggestions.push({
        id: 'lunch',
        text: 'Time for lunch! Browse nearby restaurants',
        action: 'food',
        icon: IoRestaurantOutline,
        time: '23 restaurants open'
      })
    } else if (hour >= 17 && hour < 21) {
      suggestions.push({
        id: 'dinner',
        text: 'Book dinner reservation?',
        action: 'food',
        icon: IoRestaurantOutline,
        time: 'Tables available'
      })
    }

    // Context-based suggestions
    if (userContext?.isAtHotel) {
      suggestions.push({
        id: 'spa',
        text: 'Spa appointment available at 3 PM',
        action: 'spa',
        icon: IoSparklesOutline,
        time: 'Book now'
      })
    }

    if (userContext?.hasReservation && !userContext?.isAtHotel) {
      suggestions.push({
        id: 'ride',
        text: 'Need a ride to your hotel?',
        action: 'ride',
        icon: IoCarOutline,
        time: '3 cars nearby'
      })
    }

    // Default suggestion if no specific ones
    if (suggestions.length === 0) {
      suggestions.push({
        id: 'explore',
        text: 'Explore services available near you',
        action: 'explore',
        icon: IoLocationOutline,
        time: userContext?.location || 'Phoenix, AZ'
      })
    }

    // Pick the most relevant suggestion
    setCurrentSuggestion(suggestions[0])
  }

  if (!currentSuggestion) return null

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* AI Icon */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <IoSparklesOutline className="w-6 h-6 text-green-600" />
          </div>
          
          {/* Suggestion Content */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm text-gray-600">{greeting}!</span>
              <IoTimeOutline className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </div>
            <p className="text-lg font-medium text-gray-900">
              {currentSuggestion.text}
            </p>
            {currentSuggestion.time && (
              <p className="text-sm text-gray-500 mt-1">
                {currentSuggestion.time}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onActionClick(currentSuggestion.action)}
          className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <currentSuggestion.icon className="w-5 h-5" />
          <span className="font-medium">Take Action</span>
        </button>
      </div>

      {/* Additional Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center space-x-4">
        <span className="text-sm text-gray-500">Quick actions:</span>
        <button
          onClick={() => onActionClick('ride')}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Book ride
        </button>
        <span className="text-gray-300">•</span>
        <button
          onClick={() => onActionClick('food')}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Order food
        </button>
        <span className="text-gray-300">•</span>
        <button
          onClick={() => onActionClick('hotel')}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Find hotel
        </button>
      </div>
    </div>
  )
}