// app/(guest)/dashboard/widgets/LiveFeed.tsx
// Live Feed Widget - Shows real-time activity in the city

'use client'

import { useState, useEffect } from 'react'
import { 
  IoFlashOutline,
  IoCarOutline,
  IoRestaurantOutline,
  IoBedOutline,
  IoTrendingUpOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoTimeOutline
} from 'react-icons/io5'

interface LiveFeedProps {
  city?: string
  limit?: number
}

interface FeedItem {
  id: string
  type: 'ride' | 'food' | 'hotel' | 'trending'
  message: string
  time: string
  icon: any
  color: string
}

export default function LiveFeed({ city = 'Phoenix', limit = 5 }: LiveFeedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Initialize with mock data
    generateMockFeed()
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        addNewFeedItem()
      }
    }, 5000) // Add new item every 5 seconds

    return () => clearInterval(interval)
  }, [isLive])

  const generateMockFeed = () => {
    const mockItems: FeedItem[] = [
      {
        id: '1',
        type: 'ride',
        message: 'John saved $47 on airport ride',
        time: '2 min ago',
        icon: IoCarOutline,
        color: 'text-green-600'
      },
      {
        id: '2',
        type: 'food',
        message: "Sarah's order delivered in 18 min",
        time: '5 min ago',
        icon: IoRestaurantOutline,
        color: 'text-orange-600'
      },
      {
        id: '3',
        type: 'trending',
        message: '12 rides completed in last hour',
        time: '8 min ago',
        icon: IoTrendingUpOutline,
        color: 'text-blue-600'
      },
      {
        id: '4',
        type: 'hotel',
        message: 'Marriott Downtown: 3 rooms left',
        time: '15 min ago',
        icon: IoBedOutline,
        color: 'text-purple-600'
      },
      {
        id: '5',
        type: 'ride',
        message: 'Surge pricing ended in Downtown',
        time: '22 min ago',
        icon: IoLocationOutline,
        color: 'text-green-600'
      }
    ]
    
    setFeedItems(mockItems.slice(0, limit))
  }

  const addNewFeedItem = () => {
    const templates = [
      { type: 'ride', message: 'New ride request in {area}', icon: IoCarOutline, color: 'text-green-600' },
      { type: 'food', message: '{restaurant} has 20% off right now', icon: IoRestaurantOutline, color: 'text-orange-600' },
      { type: 'hotel', message: '{hotel} just dropped prices by $30', icon: IoBedOutline, color: 'text-purple-600' },
      { type: 'trending', message: '{number} people booking rides to airport', icon: IoTrendingUpOutline, color: 'text-blue-600' },
      { type: 'ride', message: 'Driver {name} completed 100th ride', icon: IoCarOutline, color: 'text-green-600' }
    ]

    const areas = ['Downtown', 'Airport', 'Scottsdale', 'Tempe', 'Mesa']
    const restaurants = ["Joe's Pizza", "Thai Palace", "Burger Hub", "Sushi Bar"]
    const hotels = ['Hilton', 'Hyatt', 'Holiday Inn', 'Marriott']
    const names = ['Mike', 'Lisa', 'David', 'Emma', 'Chris']
    const numbers = [3, 5, 8, 12, 15]

    const template = templates[Math.floor(Math.random() * templates.length)]
    let message = template.message
      .replace('{area}', areas[Math.floor(Math.random() * areas.length)])
      .replace('{restaurant}', restaurants[Math.floor(Math.random() * restaurants.length)])
      .replace('{hotel}', hotels[Math.floor(Math.random() * hotels.length)])
      .replace('{name}', names[Math.floor(Math.random() * names.length)])
      .replace('{number}', numbers[Math.floor(Math.random() * numbers.length)].toString())

    const newItem: FeedItem = {
      id: Date.now().toString(),
      type: template.type as any,
      message,
      time: 'just now',
      icon: template.icon,
      color: template.color
    }

    setFeedItems(prev => {
      const updated = [newItem, ...prev]
      return updated.slice(0, limit)
    })

    // Update times for existing items
    setFeedItems(prev => prev.map((item, index) => {
      if (index === 0) return item
      
      // Simple time progression
      if (item.time === 'just now') return { ...item, time: '1 min ago' }
      if (item.time === '1 min ago') return { ...item, time: '2 min ago' }
      
      const match = item.time.match(/(\d+) min ago/)
      if (match) {
        const mins = parseInt(match[1])
        return { ...item, time: `${mins + 1} min ago` }
      }
      
      return item
    }))
  }

  const formatTime = (time: string) => {
    return time
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <IoFlashOutline className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Live Activity</h3>
          {isLive && (
            <span className="flex items-center">
              <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="ml-1 text-xs text-red-500 font-medium">LIVE</span>
            </span>
          )}
        </div>
        
        <button
          onClick={() => setIsLive(!isLive)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {isLive ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* City Info */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center text-sm text-gray-600">
          <IoLocationOutline className="w-4 h-4 mr-1" />
          <span>{city}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <IoPeopleOutline className="w-4 h-4 mr-1" />
          <span>2.3k active</span>
        </div>
      </div>

      {/* Feed Items */}
      <div className="space-y-3">
        {feedItems.map((item, index) => {
          const Icon = item.icon
          
          return (
            <div
              key={item.id}
              className={`flex items-start space-x-3 ${
                index === 0 ? 'animate-slide-in' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                item.type === 'ride' ? 'bg-green-100' :
                item.type === 'food' ? 'bg-orange-100' :
                item.type === 'hotel' ? 'bg-purple-100' :
                'bg-blue-100'
              }`}>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 break-words">
                  {item.message}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <IoTimeOutline className="w-3 h-3 mr-1" />
                  {formatTime(item.time)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* View More */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <button className="text-sm text-green-600 hover:text-green-700 font-medium">
          View all activity →
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}