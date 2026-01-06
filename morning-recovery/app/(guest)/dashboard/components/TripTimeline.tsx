// app/(guest)/dashboard/components/TripTimeline.tsx
// Trip Timeline Component - Visual journey timeline showing all trip segments
// Displays past, current, and future bookings in chronological order

'use client'

import { useState, useEffect } from 'react'
import { 
  IoCarOutline,
  IoBedOutline,
  IoRestaurantOutline,
  IoAirplaneOutline,
  IoCarSportOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoCheckmarkCircle,
  IoEllipseOutline,
  IoAlertCircle,
  IoChevronForwardOutline,
  IoCalendarOutline,
  IoNavigateOutline,
  IoFlagOutline,
  IoSwapHorizontalOutline,
  IoTimerOutline,
  IoWarningOutline
} from 'react-icons/io5'

// Types
interface TripTimelineProps {
  tripId?: string
  showPast?: boolean
  showFuture?: boolean
  compact?: boolean
  onSegmentClick?: (segment: TimelineSegment) => void
}

interface TimelineSegment {
  id: string
  type: 'flight' | 'ride' | 'hotel' | 'food' | 'rental' | 'activity'
  title: string
  subtitle: string
  status: 'completed' | 'active' | 'upcoming' | 'cancelled'
  startTime: string
  endTime?: string
  location?: string
  price?: number
  icon: any
  color: string
  details?: {
    confirmation?: string
    provider?: string
    notes?: string
  }
}

export default function TripTimeline({
  tripId,
  showPast = true,
  showFuture = true,
  compact = false,
  onSegmentClick
}: TripTimelineProps) {
  // State management
  const [segments, setSegments] = useState<TimelineSegment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all')
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set())

  // Load timeline data
  useEffect(() => {
    loadTimelineData()
  }, [tripId])

  // Load timeline segments
  const loadTimelineData = async () => {
    setIsLoading(true)
    try {
      // This would normally fetch from API
      // For now, using mock data
      const mockSegments: TimelineSegment[] = [
        {
          id: '1',
          type: 'flight',
          title: 'PHX → LAX',
          subtitle: 'American Airlines AA451',
          status: 'upcoming',
          startTime: '2024-12-20T08:00:00',
          endTime: '2024-12-20T09:30:00',
          location: 'Terminal 4, Gate A12',
          price: 247,
          icon: IoAirplaneOutline,
          color: '#EC4899',
          details: {
            confirmation: 'AA451-XYZ123',
            provider: 'American Airlines',
            notes: 'First Class, Seat 2A'
          }
        },
        {
          id: '2',
          type: 'ride',
          title: 'Airport Transfer',
          subtitle: 'LAX → Beverly Hills Hotel',
          status: 'upcoming',
          startTime: '2024-12-20T10:00:00',
          location: 'LAX Arrivals',
          price: 47,
          icon: IoCarOutline,
          color: '#059669',
          details: {
            confirmation: 'RIDE-789456',
            provider: 'ItWhip Premium',
            notes: 'Black SUV, Meet at baggage claim'
          }
        },
        {
          id: '3',
          type: 'hotel',
          title: 'Beverly Hills Hotel',
          subtitle: '3 nights stay',
          status: 'upcoming',
          startTime: '2024-12-20T15:00:00',
          endTime: '2024-12-23T11:00:00',
          location: '9641 Sunset Blvd, Beverly Hills',
          price: 1247,
          icon: IoBedOutline,
          color: '#3B82F6',
          details: {
            confirmation: 'BHH-2024-DEC-456',
            provider: 'Beverly Hills Hotel',
            notes: 'Suite with pool view, Room 412'
          }
        },
        {
          id: '4',
          type: 'food',
          title: 'Dinner Reservation',
          subtitle: 'Spago Beverly Hills',
          status: 'upcoming',
          startTime: '2024-12-20T19:30:00',
          location: '176 N Canon Dr, Beverly Hills',
          price: 250,
          icon: IoRestaurantOutline,
          color: '#F59E0B',
          details: {
            confirmation: 'SPAGO-7890',
            provider: 'Spago',
            notes: 'Table for 2, Wine pairing included'
          }
        },
        {
          id: '5',
          type: 'rental',
          title: 'Tesla Model S',
          subtitle: '2 day rental',
          status: 'upcoming',
          startTime: '2024-12-21T09:00:00',
          endTime: '2024-12-23T09:00:00',
          location: 'Hotel Valet',
          price: 389,
          icon: IoCarSportOutline,
          color: '#8B5CF6',
          details: {
            confirmation: 'TSLA-LA-456',
            provider: 'Hertz Premium',
            notes: 'Full charge, Autopilot enabled'
          }
        }
      ]

      // Filter based on props
      let filtered = mockSegments
      if (!showPast) {
        filtered = filtered.filter(s => s.status !== 'completed')
      }
      if (!showFuture) {
        filtered = filtered.filter(s => s.status !== 'upcoming')
      }

      setSegments(filtered)
    } catch (error) {
      console.error('Failed to load timeline:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Format time display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Calculate duration
  const calculateDuration = (start: string, end?: string) => {
    if (!end) return null
    const startDate = new Date(start)
    const endDate = new Date(end)
    const hours = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
    
    if (hours < 24) {
      return `${hours}h`
    } else {
      const days = Math.floor(hours / 24)
      return `${days}d`
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-gray-400'
      case 'active': return 'text-green-600'
      case 'upcoming': return 'text-blue-600'
      case 'cancelled': return 'text-red-600'
      default: return 'text-gray-400'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return IoCheckmarkCircle
      case 'active': return IoEllipseOutline
      case 'upcoming': return IoTimeOutline
      case 'cancelled': return IoAlertCircle
      default: return IoEllipseOutline
    }
  }

  // Toggle segment expansion
  const toggleSegmentExpansion = (segmentId: string) => {
    setExpandedSegments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(segmentId)) {
        newSet.delete(segmentId)
      } else {
        newSet.add(segmentId)
      }
      return newSet
    })
  }

  // Handle segment click
  const handleSegmentClick = (segment: TimelineSegment) => {
    setSelectedSegment(segment.id)
    if (onSegmentClick) {
      onSegmentClick(segment)
    }
  }

  // Filter segments
  const getFilteredSegments = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    switch(filter) {
      case 'today':
        return segments.filter(s => {
          const segmentDate = new Date(s.startTime)
          return segmentDate >= today && segmentDate < tomorrow
        })
      case 'upcoming':
        return segments.filter(s => s.status === 'upcoming')
      default:
        return segments
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const filteredSegments = getFilteredSegments()

  // Compact view
  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Your Journey</h3>
          <span className="text-sm text-gray-500">
            {filteredSegments.length} stops
          </span>
        </div>
        
        <div className="space-y-2">
          {filteredSegments.map((segment, index) => {
            const Icon = segment.icon
            const StatusIcon = getStatusIcon(segment.status)
            
            return (
              <div
                key={segment.id}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => handleSegmentClick(segment)}
              >
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-${segment.color} to-${segment.color}/80`}
                       style={{ background: segment.color + '20' }}>
                    <Icon className="w-4 h-4" style={{ color: segment.color }} />
                  </div>
                  {index < filteredSegments.length - 1 && (
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-200"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {segment.title}
                    </span>
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(segment.status)}`} />
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(segment.startTime)}
                  </div>
                </div>
                
                <IoChevronForwardOutline className="w-4 h-4 text-gray-400" />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Full view
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Trip Timeline</h2>
            <p className="text-sm text-gray-500 mt-1">
              Your complete journey from start to finish
            </p>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-green-100 text-green-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === 'today' 
                  ? 'bg-green-100 text-green-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === 'upcoming' 
                  ? 'bg-green-100 text-green-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {filteredSegments.length}
            </div>
            <div className="text-xs text-gray-500">Total Stops</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${filteredSegments.reduce((sum, s) => sum + (s.price || 0), 0)}
            </div>
            <div className="text-xs text-gray-500">Total Cost</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredSegments.filter(s => s.status === 'upcoming').length}
            </div>
            <div className="text-xs text-gray-500">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {filteredSegments.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        {filteredSegments.length === 0 ? (
          <div className="text-center py-8">
            <IoCalendarOutline className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No timeline items to display</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Timeline Segments */}
            <div className="space-y-6">
              {filteredSegments.map((segment, index) => {
                const Icon = segment.icon
                const StatusIcon = getStatusIcon(segment.status)
                const isExpanded = expandedSegments.has(segment.id)
                const isSelected = selectedSegment === segment.id
                const duration = calculateDuration(segment.startTime, segment.endTime)
                
                return (
                  <div key={segment.id} className="relative flex items-start">
                    {/* Timeline Node */}
                    <div className="relative z-10">
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                          segment.status === 'active' 
                            ? 'bg-green-100 ring-4 ring-green-200' 
                            : 'bg-white border-2 border-gray-300'
                        }`}
                        style={segment.status === 'upcoming' ? {
                          borderColor: segment.color,
                          backgroundColor: segment.color + '10'
                        } : {}}
                      >
                        <Icon 
                          className="w-8 h-8" 
                          style={{ color: segment.status === 'active' ? '#059669' : segment.color }}
                        />
                      </div>
                      
                      {/* Status Indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center`}>
                        <StatusIcon className={`w-4 h-4 ${getStatusColor(segment.status)}`} />
                      </div>
                    </div>

                    {/* Content Card */}
                    <div 
                      className={`ml-6 flex-1 bg-white border rounded-lg overflow-hidden transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-green-500 shadow-lg' : 'border-gray-200 hover:shadow-md'
                      }`}
                      onClick={() => handleSegmentClick(segment)}
                    >
                      {/* Card Header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {segment.title}
                              </h3>
                              {duration && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  <IoTimerOutline className="mr-1" />
                                  {duration}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{segment.subtitle}</p>
                            
                            {/* Time & Location */}
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <IoCalendarOutline className="w-4 h-4 mr-2" />
                                <span>{formatDate(segment.startTime)}</span>
                                <span className="mx-2">•</span>
                                <span>{formatTime(segment.startTime)}</span>
                                {segment.endTime && (
                                  <>
                                    <IoSwapHorizontalOutline className="w-4 h-4 mx-2" />
                                    <span>{formatTime(segment.endTime)}</span>
                                  </>
                                )}
                              </div>
                              
                              {segment.location && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <IoLocationOutline className="w-4 h-4 mr-2" />
                                  <span>{segment.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Price */}
                          {segment.price && (
                            <div className="text-right ml-4">
                              <div className="text-lg font-semibold text-gray-900">
                                ${segment.price}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Expand/Collapse Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSegmentExpansion(segment.id)
                          }}
                          className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          {isExpanded ? 'Hide Details' : 'Show Details'}
                        </button>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && segment.details && (
                        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            {segment.details.confirmation && (
                              <div>
                                <div className="text-xs text-gray-500">Confirmation</div>
                                <div className="text-sm font-medium text-gray-900">
                                  {segment.details.confirmation}
                                </div>
                              </div>
                            )}
                            {segment.details.provider && (
                              <div>
                                <div className="text-xs text-gray-500">Provider</div>
                                <div className="text-sm font-medium text-gray-900">
                                  {segment.details.provider}
                                </div>
                              </div>
                            )}
                            {segment.status === 'upcoming' && (
                              <div>
                                <div className="text-xs text-gray-500">Action</div>
                                <button className="text-sm font-medium text-green-600 hover:text-green-700">
                                  Modify Booking
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {segment.details.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <IoWarningOutline className="w-4 h-4 text-amber-500 mt-0.5" />
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">Notes</div>
                                  <div className="text-sm text-gray-700">
                                    {segment.details.notes}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {/* Journey End */}
              <div className="relative flex items-center">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                    <IoFlagOutline className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="font-semibold text-gray-900">Journey Complete</h3>
                  <p className="text-sm text-gray-500">Have a great trip!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}