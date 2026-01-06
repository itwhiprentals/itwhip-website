// app/(guest)/dashboard/widgets/HotelMapWidget.tsx
// Interactive Hotel Map Widget - Shows hotel layout, amenities, and nearby attractions
// Includes room location, facilities, and points of interest

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  IoLocationOutline,
  IoRestaurantOutline,
  IoBedOutline,
  IoFitnessOutline,
  IoWaterOutline,
  IoCarOutline,
  IoCafeOutline,
  IoBusinessOutline,
  IoWifiOutline,
  IoFlowerOutline,
  IoBasketOutline,
  IoMedicalOutline,
  IoAirplaneOutline,
  IoTrainOutline,
  IoBusOutline,
  IoCartOutline,
  IoTicketOutline,
  IoGolfOutline,
  IoLibraryOutline,
  IoMusicalNotesOutline,
  IoExpand,
  IoContract,
  IoNavigateOutline,
  IoInformationCircle,
  IoCloseOutline,
  IoSearchOutline,
  IoLayersOutline,
  IoCompassOutline,
  IoFootstepsOutline
} from 'react-icons/io5'
import { useHotel } from '../components/HotelContext'

// Types
export interface HotelMapWidgetProps {
  hotelId?: string
  roomNumber?: string
  className?: string
  isCompact?: boolean
  onLocationSelect?: (location: MapLocation) => void
}

export interface MapLocation {
  id: string
  name: string
  type: LocationType
  category: LocationCategory
  floor: number
  coordinates: { x: number; y: number }
  description?: string
  hours?: string
  phone?: string
  distance?: number
  walkTime?: number
  amenities?: string[]
  icon: any
  isOpen?: boolean
  isPremium?: boolean
}

export interface MapMarker {
  id: string
  location: MapLocation
  isActive: boolean
  isVisible: boolean
}

type LocationType = 'facility' | 'room' | 'amenity' | 'poi' | 'transport' | 'emergency'
type LocationCategory = 'dining' | 'wellness' | 'business' | 'recreation' | 'shopping' | 'medical' | 'transport' | 'room'
type MapView = 'hotel' | 'area' | 'city'
type FloorLevel = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 'all'

// Sample hotel locations
const HOTEL_LOCATIONS: MapLocation[] = [
  // Hotel Facilities
  {
    id: 'lobby',
    name: 'Main Lobby',
    type: 'facility',
    category: 'business',
    floor: 1,
    coordinates: { x: 50, y: 80 },
    description: 'Hotel entrance and reception',
    hours: '24/7',
    icon: IoBusinessOutline,
    isOpen: true
  },
  {
    id: 'restaurant-main',
    name: 'Skyline Restaurant',
    type: 'facility',
    category: 'dining',
    floor: 1,
    coordinates: { x: 30, y: 60 },
    description: 'Fine dining with city views',
    hours: '6:00 AM - 11:00 PM',
    icon: IoRestaurantOutline,
    isOpen: true,
    isPremium: true
  },
  {
    id: 'cafe',
    name: 'Garden Café',
    type: 'facility',
    category: 'dining',
    floor: 1,
    coordinates: { x: 70, y: 60 },
    description: 'Casual dining and coffee',
    hours: '6:00 AM - 10:00 PM',
    icon: IoCafeOutline,
    isOpen: true
  },
  {
    id: 'pool',
    name: 'Rooftop Pool',
    type: 'amenity',
    category: 'wellness',
    floor: 5,
    coordinates: { x: 50, y: 50 },
    description: 'Heated outdoor pool with bar',
    hours: '7:00 AM - 10:00 PM',
    icon: IoWaterOutline,
    isOpen: true,
    isPremium: true
  },
  {
    id: 'gym',
    name: 'Fitness Center',
    type: 'amenity',
    category: 'wellness',
    floor: 2,
    coordinates: { x: 20, y: 40 },
    description: 'State-of-the-art equipment',
    hours: '5:00 AM - 11:00 PM',
    icon: IoFitnessOutline,
    isOpen: true
  },
  {
    id: 'spa',
    name: 'Serenity Spa',
    type: 'amenity',
    category: 'wellness',
    floor: 2,
    coordinates: { x: 80, y: 40 },
    description: 'Full-service spa and salon',
    hours: '9:00 AM - 9:00 PM',
    icon: IoFlowerOutline,
    isOpen: true,
    isPremium: true
  },
  {
    id: 'business-center',
    name: 'Business Center',
    type: 'facility',
    category: 'business',
    floor: 1,
    coordinates: { x: 40, y: 30 },
    description: 'Computers, printing, meeting rooms',
    hours: '24/7',
    icon: IoBusinessOutline,
    isOpen: true
  },
  {
    id: 'gift-shop',
    name: 'Gift Shop',
    type: 'amenity',
    category: 'shopping',
    floor: 1,
    coordinates: { x: 60, y: 30 },
    description: 'Souvenirs and essentials',
    hours: '8:00 AM - 10:00 PM',
    icon: IoBasketOutline,
    isOpen: true
  },
  {
    id: 'parking',
    name: 'Parking Garage',
    type: 'facility',
    category: 'transport',
    floor: -1,
    coordinates: { x: 50, y: 10 },
    description: 'Valet and self-parking',
    hours: '24/7',
    icon: IoCarOutline,
    isOpen: true
  }
]

// Nearby points of interest
const NEARBY_LOCATIONS: MapLocation[] = [
  {
    id: 'airport',
    name: 'Phoenix Sky Harbor Airport',
    type: 'transport',
    category: 'transport',
    floor: 0,
    coordinates: { x: 20, y: 20 },
    description: 'International Airport',
    distance: 8.5,
    walkTime: 0,
    icon: IoAirplaneOutline
  },
  {
    id: 'shopping-mall',
    name: 'Desert Ridge Mall',
    type: 'poi',
    category: 'shopping',
    floor: 0,
    coordinates: { x: 70, y: 30 },
    description: 'Shopping and dining',
    distance: 0.8,
    walkTime: 10,
    icon: IoCartOutline
  },
  {
    id: 'golf-course',
    name: 'Wildfire Golf Club',
    type: 'poi',
    category: 'recreation',
    floor: 0,
    coordinates: { x: 30, y: 70 },
    description: '36-hole championship course',
    distance: 2.1,
    walkTime: 25,
    icon: IoGolfOutline
  },
  {
    id: 'medical',
    name: 'Phoenix Medical Center',
    type: 'emergency',
    category: 'medical',
    floor: 0,
    coordinates: { x: 85, y: 60 },
    description: '24/7 Emergency care',
    distance: 1.5,
    walkTime: 18,
    icon: IoMedicalOutline
  }
]

export default function HotelMapWidget({
  hotelId,
  roomNumber,
  className = '',
  isCompact = false,
  onLocationSelect
}: HotelMapWidgetProps) {
  const { isAtHotel, hotelName, reservation } = useHotel()
  const mapRef = useRef<HTMLDivElement>(null)
  
  // State
  const [currentView, setCurrentView] = useState<MapView>('hotel')
  const [currentFloor, setCurrentFloor] = useState<FloorLevel>(1)
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLayers, setShowLayers] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeCategories, setActiveCategories] = useState<Set<LocationCategory>>(
    new Set(['dining', 'wellness', 'business', 'recreation', 'shopping', 'medical', 'transport', 'room'])
  )
  
  // Filter locations based on view and floor
  const getVisibleLocations = (): MapLocation[] => {
    let locations: MapLocation[] = []
    
    if (currentView === 'hotel') {
      locations = HOTEL_LOCATIONS.filter(loc => 
        currentFloor === 'all' || loc.floor === currentFloor
      )
    } else if (currentView === 'area' || currentView === 'city') {
      locations = [...HOTEL_LOCATIONS.filter(loc => loc.floor === 1), ...NEARBY_LOCATIONS]
    }
    
    // Filter by search
    if (searchQuery) {
      locations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Filter by category
    locations = locations.filter(loc => activeCategories.has(loc.category))
    
    return locations
  }
  
  // Toggle category visibility
  const toggleCategory = (category: LocationCategory) => {
    const newCategories = new Set(activeCategories)
    if (newCategories.has(category)) {
      newCategories.delete(category)
    } else {
      newCategories.add(category)
    }
    setActiveCategories(newCategories)
  }
  
  // Handle location selection
  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location)
    if (onLocationSelect) {
      onLocationSelect(location)
    }
  }
  
  // Get category icon
  const getCategoryIcon = (category: LocationCategory) => {
    switch (category) {
      case 'dining': return IoRestaurantOutline
      case 'wellness': return IoFitnessOutline
      case 'business': return IoBusinessOutline
      case 'recreation': return IoGolfOutline
      case 'shopping': return IoCartOutline
      case 'medical': return IoMedicalOutline
      case 'transport': return IoCarOutline
      case 'room': return IoBedOutline
      default: return IoLocationOutline
    }
  }
  
  // Get category color
  const getCategoryColor = (category: LocationCategory) => {
    switch (category) {
      case 'dining': return 'text-orange-500 bg-orange-100'
      case 'wellness': return 'text-blue-500 bg-blue-100'
      case 'business': return 'text-gray-500 bg-gray-100'
      case 'recreation': return 'text-green-500 bg-green-100'
      case 'shopping': return 'text-purple-500 bg-purple-100'
      case 'medical': return 'text-red-500 bg-red-100'
      case 'transport': return 'text-indigo-500 bg-indigo-100'
      case 'room': return 'text-yellow-500 bg-yellow-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }
  
  // Calculate walking directions
  const getDirections = (location: MapLocation): string => {
    if (!roomNumber) return ''
    
    // Simple direction logic (would be more complex in real app)
    const directions = []
    if (location.floor !== 1) {
      directions.push(`Take elevator to floor ${location.floor}`)
    }
    directions.push(`Walk ${location.walkTime || 2} minutes`)
    
    return directions.join(', ')
  }
  
  const visibleLocations = getVisibleLocations()
  
  // Compact view for sidebar
  if (isCompact) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Hotel Map</h3>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <IoExpand className="w-4 h-4" />
            </button>
          </div>
          
          {/* Quick locations */}
          <div className="space-y-2">
            {HOTEL_LOCATIONS.slice(0, 5).map((location) => {
              const Icon = location.icon
              return (
                <button
                  key={location.id}
                  onClick={() => handleLocationClick(location)}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`p-1.5 rounded-lg mr-3 ${getCategoryColor(location.category)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{location.name}</p>
                      <p className="text-xs text-gray-500">Floor {location.floor}</p>
                    </div>
                    {location.isOpen && (
                      <span className="text-xs text-green-600">Open</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setIsFullscreen(true)}
            className="w-full mt-3 text-center text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View Full Map →
          </button>
        </div>
      </div>
    )
  }
  
  // Full map view
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className} ${
      isFullscreen ? 'fixed inset-4 z-50' : ''
    }`}>
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold text-gray-900">
              {hotelName || 'Hotel'} Map
            </h3>
            
            {/* View selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('hotel')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentView === 'hotel'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Hotel
              </button>
              <button
                onClick={() => setCurrentView('area')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentView === 'area'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setCurrentView('city')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentView === 'city'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                City
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search locations..."
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <IoSearchOutline className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" />
            </div>
            
            {/* Layers */}
            <button
              onClick={() => setShowLayers(!showLayers)}
              className={`p-2 rounded-lg transition-colors ${
                showLayers ? 'bg-green-100 text-green-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <IoLayersOutline className="w-4 h-4" />
            </button>
            
            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              {isFullscreen ? (
                <IoContract className="w-4 h-4" />
              ) : (
                <IoExpand className="w-4 h-4" />
              )}
            </button>
            
            {isFullscreen && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <IoCloseOutline className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Floor selector for hotel view */}
        {currentView === 'hotel' && (
          <div className="flex items-center space-x-2 mt-3">
            <span className="text-sm font-medium text-gray-700">Floor:</span>
            <div className="flex space-x-1">
              {[-1, 0, 1, 2, 3, 4, 5].map((floor) => (
                <button
                  key={floor}
                  onClick={() => setCurrentFloor(floor as FloorLevel)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentFloor === floor
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {floor === -1 ? 'B1' : floor === 0 ? 'G' : floor}
                </button>
              ))}
              <button
                onClick={() => setCurrentFloor('all')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentFloor === 'all'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Main content */}
      <div className="flex" style={{ height: isFullscreen ? 'calc(100% - 120px)' : '400px' }}>
        {/* Map area */}
        <div className="flex-1 relative bg-gray-50 overflow-hidden" ref={mapRef}>
          {/* Simple SVG map */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Your room marker */}
            {roomNumber && currentView === 'hotel' && (
              <g>
                <circle
                  cx="50%"
                  cy="50%"
                  r="8"
                  className="fill-green-500 animate-pulse"
                />
                <text
                  x="50%"
                  y="48%"
                  textAnchor="middle"
                  className="text-xs font-bold fill-white"
                >
                  YOU
                </text>
              </g>
            )}
            
            {/* Location markers */}
            {visibleLocations.map((location) => {
              const Icon = location.icon
              const isSelected = selectedLocation?.id === location.id
              
              return (
                <g
                  key={location.id}
                  onClick={() => handleLocationClick(location)}
                  className="cursor-pointer"
                  transform={`translate(${location.coordinates.x * 5}, ${location.coordinates.y * 4})`}
                >
                  <circle
                    r={isSelected ? "20" : "16"}
                    className={`${getCategoryColor(location.category).replace('text-', 'fill-').replace('bg-', '')} 
                      transition-all hover:r-20 ${isSelected ? 'stroke-2 stroke-green-500' : ''}`}
                    fillOpacity="0.8"
                  />
                  {location.isPremium && (
                    <circle
                      r="20"
                      fill="none"
                      stroke="gold"
                      strokeWidth="2"
                      strokeDasharray="2 2"
                      className="animate-spin-slow"
                    />
                  )}
                </g>
              )
            })}
          </svg>
          
          {/* Location labels */}
          {visibleLocations.map((location) => {
            const Icon = location.icon
            const isSelected = selectedLocation?.id === location.id
            
            return (
              <div
                key={`label-${location.id}`}
                onClick={() => handleLocationClick(location)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                  ${isSelected ? 'z-10' : 'z-5'}`}
                style={{
                  left: `${location.coordinates.x}%`,
                  top: `${location.coordinates.y}%`
                }}
              >
                <div className={`flex flex-col items-center ${
                  isSelected ? 'scale-110' : 'hover:scale-105'
                } transition-transform`}>
                  <div className={`p-2 rounded-lg shadow-md ${getCategoryColor(location.category)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="mt-1 text-xs font-medium text-gray-700 bg-white px-1 rounded shadow-sm">
                    {location.name}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Sidebar */}
        <div className="w-80 border-l bg-white overflow-y-auto">
          {/* Layers panel */}
          {showLayers && (
            <div className="p-4 border-b">
              <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
              <div className="space-y-2">
                {Array.from(new Set(visibleLocations.map(l => l.category))).map((category) => {
                  const Icon = getCategoryIcon(category)
                  const isActive = activeCategories.has(category)
                  
                  return (
                    <label
                      key={category}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => toggleCategory(category)}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-3"
                        />
                        <Icon className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="text-sm text-gray-700 capitalize">{category}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {visibleLocations.filter(l => l.category === category).length}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Selected location details */}
          {selectedLocation ? (
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedLocation.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedLocation.description}</p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <IoCloseOutline className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                {selectedLocation.hours && (
                  <div className="flex items-start">
                    <IoTimeOutline className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-700">Hours:</span>
                      <p className="text-gray-600">{selectedLocation.hours}</p>
                    </div>
                  </div>
                )}
                
                {selectedLocation.floor !== undefined && (
                  <div className="flex items-center">
                    <IoBusinessOutline className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-700">Floor:</span>
                    <span className="ml-1 text-gray-600">
                      {selectedLocation.floor === -1 ? 'B1' : selectedLocation.floor === 0 ? 'Ground' : selectedLocation.floor}
                    </span>
                  </div>
                )}
                
                {selectedLocation.distance && (
                  <div className="flex items-center">
                    <IoLocationOutline className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-700">Distance:</span>
                    <span className="ml-1 text-gray-600">{selectedLocation.distance} mi</span>
                  </div>
                )}
                
                {selectedLocation.walkTime !== undefined && selectedLocation.walkTime > 0 && (
                  <div className="flex items-center">
                    <IoFootstepsOutline className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-700">Walk time:</span>
                    <span className="ml-1 text-gray-600">{selectedLocation.walkTime} min</span>
                  </div>
                )}
                
                {selectedLocation.amenities && (
                  <div>
                    <span className="font-medium text-gray-700">Amenities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLocation.amenities.map((amenity) => (
                        <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="mt-4 space-y-2">
                {roomNumber && (
                  <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <IoNavigateOutline className="w-4 h-4 inline mr-2" />
                    Get Directions
                  </button>
                )}
                
                {selectedLocation.phone && (
                  <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                    <IoCallOutline className="w-4 h-4 inline mr-2" />
                    Call {selectedLocation.phone}
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Location list
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {currentView === 'hotel' ? 'Hotel Facilities' : 'Nearby Places'}
              </h4>
              <div className="space-y-2">
                {visibleLocations.map((location) => {
                  const Icon = location.icon
                  
                  return (
                    <button
                      key={location.id}
                      onClick={() => handleLocationClick(location)}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-start">
                        <div className={`p-2 rounded-lg mr-3 ${getCategoryColor(location.category)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="font-medium text-gray-900">{location.name}</p>
                            {location.isPremium && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                Premium
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{location.description}</p>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                            {location.floor !== undefined && (
                              <span>Floor {location.floor === -1 ? 'B1' : location.floor}</span>
                            )}
                            {location.distance && (
                              <span>{location.distance} mi</span>
                            )}
                            {location.isOpen !== undefined && (
                              <span className={location.isOpen ? 'text-green-600' : 'text-red-600'}>
                                {location.isOpen ? 'Open' : 'Closed'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              {visibleLocations.length} locations
            </span>
            {roomNumber && (
              <span className="text-gray-600">
                Room {roomNumber}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <IoCompassOutline className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Interactive Map</span>
          </div>
        </div>
      </div>
    </div>
  )
}