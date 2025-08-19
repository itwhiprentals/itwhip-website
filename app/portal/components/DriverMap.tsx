// app/portal/components/DriverMap.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  ScaleControl,
  Source,
  Layer
} from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  IoCarSportOutline,
  IoBusinessOutline,
  IoStarOutline,
  IoLocationOutline,
  IoCallOutline,
  IoClose
} from 'react-icons/io5'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

interface Driver {
  id: string
  name: string
  vehicle: string
  vehicleColor: string
  licensePlate: string
  rating: string
  status: 'online' | 'busy' | 'break' | 'offline'
  location: { lat: number; lng: number }
  distance: string
  eta: number
  currentRide?: {
    pickup: string
    dropoff: string
    passenger: string
    fare: number
  }
}

interface DriverMapProps {
  drivers: Driver[]
  hotelLocation?: { lat: number; lng: number }
  onDriverSelect?: (driver: Driver) => void
  selectedDriver?: Driver | null
  showSurgeZones?: boolean
  showTraffic?: boolean
  mapStyle?: 'streets' | 'dark' | 'satellite' | 'navigation'
}

const mapStyles = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  navigation: 'mapbox://styles/mapbox/navigation-night-v1'
}

// Simple surge zones
const surgeZones = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { intensity: 2.5 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-112.0840, 33.4584],
          [-112.0640, 33.4584],
          [-112.0640, 33.4384],
          [-112.0840, 33.4384],
          [-112.0840, 33.4584]
        ]]
      }
    }
  ]
}

export default function DriverMap({
  drivers,
  hotelLocation = { lat: 33.4484, lng: -112.0740 },
  onDriverSelect,
  selectedDriver,
  showSurgeZones = true,
  showTraffic = false,
  mapStyle = 'dark'
}: DriverMapProps) {
  const mapRef = useRef<any>(null)
  const [viewState, setViewState] = useState({
    longitude: hotelLocation.lng,
    latitude: hotelLocation.lat,
    zoom: 13,
    bearing: 0,
    pitch: 0
  })
  const [popupInfo, setPopupInfo] = useState<Driver | null>(null)

  // Simple driver marker color
  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981'
      case 'busy': return '#3B82F6'
      case 'break': return '#F59E0B'
      default: return '#6B7280'
    }
  }

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyles[mapStyle]}
        mapboxAccessToken={MAPBOX_TOKEN}
        reuseMaps
      >
        {/* Simple surge zone */}
        {showSurgeZones && (
          <Source id="surge" type="geojson" data={surgeZones}>
            <Layer
              id="surge-layer"
              type="fill"
              paint={{
                'fill-color': '#F59E0B',
                'fill-opacity': 0.2
              }}
            />
          </Source>
        )}

        {/* Simple controls */}
        <NavigationControl position="top-left" />
        <ScaleControl position="bottom-right" />

        {/* Hotel Marker - Simple */}
        <Marker
          longitude={hotelLocation.lng}
          latitude={hotelLocation.lat}
          anchor="bottom"
        >
          <div className="relative">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <IoBusinessOutline className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap shadow">
              Hotel
            </div>
          </div>
        </Marker>

        {/* Driver Markers - Simple */}
        {drivers.map(driver => (
          <Marker
            key={driver.id}
            longitude={driver.location.lng}
            latitude={driver.location.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setPopupInfo(driver)
              if (onDriverSelect) {
                onDriverSelect(driver)
              }
            }}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shadow cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: getMarkerColor(driver.status) }}
            >
              <IoCarSportOutline className="w-5 h-5 text-white" />
            </div>
          </Marker>
        ))}

        {/* Simple Popup */}
        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.location.lng}
            latitude={popupInfo.location.lat}
            onClose={() => setPopupInfo(null)}
            closeButton={false}
          >
            <div className="p-3 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{popupInfo.name}</h3>
                <button
                  onClick={() => setPopupInfo(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <IoClose className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span>{popupInfo.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    popupInfo.status === 'online' ? 'bg-green-100 text-green-700' :
                    popupInfo.status === 'busy' ? 'bg-blue-100 text-blue-700' :
                    popupInfo.status === 'break' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {popupInfo.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center">
                    <IoStarOutline className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="ml-1">{popupInfo.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span>{popupInfo.distance} mi</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t flex space-x-2">
                <button className="flex-1 px-2 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-700">
                  Assign
                </button>
                <button className="p-1 bg-gray-100 hover:bg-gray-200 rounded">
                  <IoCallOutline className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Popup>
        )}

        {/* Simple Stats */}
        <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg shadow p-3">
          <div className="text-xs space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online: {drivers.filter(d => d.status === 'online').length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Busy: {drivers.filter(d => d.status === 'busy').length}</span>
            </div>
          </div>
        </div>
      </Map>
    </div>
  )
}