// app/partner/tracking/demo/components/TrackingMap.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapLegend from './MapLegend'
import MapControls, { MapStyle } from './MapControls'
import VehicleInfoOverlay from './VehicleInfoOverlay'
import TripReplayControls from './TripReplayControls'

// Initialize Mapbox token
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
}

// Map style URLs
const MAP_STYLE_URLS: Record<MapStyle, string> = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  streets: 'mapbox://styles/mapbox/streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12'
}

interface Coordinates {
  lat: number
  lng: number
}

interface Geofence {
  id: string
  name: string
  center: Coordinates
  radius: number
  color: string
}

interface Vehicle {
  id: string
  make: string
  model: string
  status: 'moving' | 'parked' | 'idle' | 'disabled' | 'offline'
  coordinates: Coordinates
  speed: number
  heading?: number | string | null
  fuelLevel: number
  interiorTemp: number
  exteriorTemp: number
  isLocked: boolean
  engineRunning: boolean
  acOn: boolean
  location: string
  tripEndsAt: string | null
  isDisabled: boolean
  route: Coordinates[]
  provider: string
  licensePlate: string
}

interface TrackingMapProps {
  vehicles: Vehicle[]
  geofences: Geofence[]
  homeBase: Coordinates
  onVehicleSelect?: (vehicleId: string | null) => void
  selectedVehicleId?: string | null
}

export default function TrackingMap({
  vehicles,
  geofences,
  homeBase,
  onVehicleSelect,
  selectedVehicleId
}: TrackingMapProps) {
  // Map state
  const [mapReady, setMapReady] = useState(false)
  const [mapStyle, setMapStyle] = useState<MapStyle>('dark')
  const [showGeofences, setShowGeofences] = useState(true)
  const [showTrails, setShowTrails] = useState(true)
  const [show3D, setShow3D] = useState(true)
  // Start legend collapsed on mobile (< 640px)
  const [legendExpanded, setLegendExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640
    }
    return true
  })
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Trip replay state
  const [tripReplayActive, setTripReplayActive] = useState(false)
  const [tripReplayData, setTripReplayData] = useState<Array<{ lat: number; lng: number; speed: number; timestamp: string }>>([])
  const [tripReplayIndex, setTripReplayIndex] = useState(0)
  const [tripReplayPlaying, setTripReplayPlaying] = useState(false)
  const [tripReplaySpeed, setTripReplaySpeed] = useState(1)
  const [tripReplayVehicle, setTripReplayVehicle] = useState<string>('')

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const animationRef = useRef<number | null>(null)
  const trailsRef = useRef<{ [key: string]: Coordinates[] }>({})
  const vehiclePositionRef = useRef<{ [key: string]: { lat: number; lng: number; routeIndex: number; heading: number } }>({})

  // Create GeoJSON circle for geofences
  const createGeoJSONCircle = useCallback((center: Coordinates, radiusMiles: number) => {
    const points = 64
    const km = radiusMiles * 1.60934
    const coords: [number, number][] = []
    const distanceX = km / (111.32 * Math.cos(center.lat * Math.PI / 180))
    const distanceY = km / 110.574

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI)
      const x = distanceX * Math.cos(theta)
      const y = distanceY * Math.sin(theta)
      coords.push([center.lng + x, center.lat + y])
    }
    coords.push(coords[0])

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coords]
      },
      properties: {}
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_URLS[mapStyle],
      center: [homeBase.lng, homeBase.lat],
      zoom: 10,
      pitch: show3D ? 45 : 0,
      bearing: -17.6
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100 }), 'bottom-right')

    map.on('load', () => {
      // Add 3D buildings layer
      const layers = map.getStyle().layers
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id

      if (mapStyle === 'dark' || mapStyle === 'streets') {
        map.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 12,
            paint: {
              'fill-extrusion-color': mapStyle === 'dark' ? '#1a1a2e' : '#e5e7eb',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.7
            }
          },
          labelLayerId
        )
      }

      // Add trail sources for each vehicle
      vehicles.forEach(vehicle => {
        trailsRef.current[vehicle.id] = []

        map.addSource(`trail-${vehicle.id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        })

        // Trail glow
        map.addLayer({
          id: `trail-${vehicle.id}-glow`,
          type: 'line',
          source: `trail-${vehicle.id}`,
          paint: {
            'line-color': vehicle.status === 'moving' ? '#60a5fa' : '#4ade80',
            'line-width': 10,
            'line-opacity': 0.3,
            'line-blur': 3
          }
        })

        // Trail line
        map.addLayer({
          id: `trail-${vehicle.id}-line`,
          type: 'line',
          source: `trail-${vehicle.id}`,
          paint: {
            'line-color': vehicle.status === 'moving' ? '#3b82f6' : '#22c55e',
            'line-width': 3,
            'line-opacity': 0.8
          }
        })
      })

      // Add geofences
      geofences.forEach(geofence => {
        const circle = createGeoJSONCircle(geofence.center, geofence.radius)

        map.addSource(`geofence-${geofence.id}`, {
          type: 'geojson',
          data: circle
        })

        // Geofence glow
        map.addLayer({
          id: `geofence-${geofence.id}-glow`,
          type: 'line',
          source: `geofence-${geofence.id}`,
          paint: {
            'line-color': geofence.color,
            'line-width': 8,
            'line-opacity': 0.2,
            'line-blur': 4
          }
        })

        // Geofence fill
        map.addLayer({
          id: `geofence-${geofence.id}-fill`,
          type: 'fill',
          source: `geofence-${geofence.id}`,
          paint: {
            'fill-color': geofence.color,
            'fill-opacity': 0.08
          }
        })

        // Geofence line
        map.addLayer({
          id: `geofence-${geofence.id}-line`,
          type: 'line',
          source: `geofence-${geofence.id}`,
          paint: {
            'line-color': geofence.color,
            'line-width': 2,
            'line-dasharray': [3, 2]
          }
        })

        // Geofence label
        map.addLayer({
          id: `geofence-${geofence.id}-label`,
          type: 'symbol',
          source: `geofence-${geofence.id}`,
          layout: {
            'text-field': geofence.name,
            'text-size': 11,
            'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
            'text-transform': 'uppercase',
            'text-letter-spacing': 0.05
          },
          paint: {
            'text-color': geofence.color,
            'text-halo-color': mapStyle === 'dark' ? '#0f172a' : '#ffffff',
            'text-halo-width': 2
          }
        })
      })

      // Add home base marker
      map.addSource('home-base', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: 'Home Base' },
          geometry: {
            type: 'Point',
            coordinates: [homeBase.lng, homeBase.lat]
          }
        }
      })

      // Home base pulse
      map.addLayer({
        id: 'home-base-pulse',
        type: 'circle',
        source: 'home-base',
        paint: {
          'circle-radius': 25,
          'circle-color': '#f97316',
          'circle-opacity': 0.2
        }
      })

      // Home base point
      map.addLayer({
        id: 'home-base-point',
        type: 'circle',
        source: 'home-base',
        paint: {
          'circle-radius': 8,
          'circle-color': '#f97316',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      })

      // Home base label
      map.addLayer({
        id: 'home-base-label',
        type: 'symbol',
        source: 'home-base',
        layout: {
          'text-field': '🏠 HOME BASE',
          'text-size': 10,
          'text-offset': [0, 2],
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold']
        },
        paint: {
          'text-color': '#f97316',
          'text-halo-color': mapStyle === 'dark' ? '#0f172a' : '#ffffff',
          'text-halo-width': 2
        }
      })

      setMapReady(true)
    })

    mapRef.current = map

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update markers when vehicles change
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    vehicles.forEach(vehicle => {
      // Calculate heading from route
      let heading = 0
      if (vehicle.route.length > 1) {
        const pos = vehiclePositionRef.current[vehicle.id]
        if (pos) {
          const nextIndex = (pos.routeIndex + 1) % vehicle.route.length
          const nextPoint = vehicle.route[nextIndex]
          const dx = nextPoint.lng - pos.lng
          const dy = nextPoint.lat - pos.lat
          heading = Math.atan2(dx, dy) * (180 / Math.PI)
        }
      }

      if (markersRef.current[vehicle.id]) {
        markersRef.current[vehicle.id].setLngLat([vehicle.coordinates.lng, vehicle.coordinates.lat])
        // Update marker rotation
        const el = markersRef.current[vehicle.id].getElement()
        const arrow = el.querySelector('.vehicle-direction-arrow') as HTMLElement
        if (arrow) {
          arrow.style.transform = `rotate(${heading}deg)`
        }
      } else {
        const el = document.createElement('div')
        el.className = 'vehicle-marker cursor-pointer'
        el.innerHTML = `
          <div class="relative group">
            <!-- Direction arrow -->
            <div class="vehicle-direction-arrow absolute -top-3 left-1/2 -translate-x-1/2 transition-transform" style="transform: rotate(${heading}deg)">
              <svg class="w-4 h-4 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l-4 8h8l-4-8z"/>
              </svg>
            </div>
            <!-- Main marker -->
            <div class="w-14 h-14 rounded-xl flex items-center justify-center shadow-2xl transform transition-all hover:scale-110 border-2 ${
              vehicle.isDisabled
                ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-400'
                : vehicle.status === 'moving'
                ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-300'
                : vehicle.status === 'parked'
                ? 'bg-gradient-to-br from-green-500 to-green-700 border-green-300'
                : 'bg-gradient-to-br from-yellow-500 to-yellow-700 border-yellow-300'
            } ${vehicle.status === 'moving' && !vehicle.isDisabled ? 'animate-pulse' : ''}">
              <svg class="w-7 h-7 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <!-- Speed badge -->
            ${vehicle.status === 'moving' && !vehicle.isDisabled ? `
              <div class="absolute -top-1 -right-1 min-w-[24px] h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 ${
                vehicle.speed > 80 ? 'border-red-500' : vehicle.speed > 65 ? 'border-yellow-500' : 'border-blue-500'
              }">
                <span class="text-[10px] font-bold ${
                  vehicle.speed > 80 ? 'text-red-600' : vehicle.speed > 65 ? 'text-yellow-600' : 'text-blue-600'
                } px-1">${vehicle.speed}</span>
              </div>
            ` : ''}
            <!-- Disabled badge -->
            ${vehicle.isDisabled ? `
              <div class="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ` : ''}
            <!-- Label -->
            <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="text-[10px] font-bold text-white bg-gray-900/95 px-2 py-1 rounded-lg shadow-xl backdrop-blur border border-gray-700">
                ${vehicle.make} ${vehicle.model}
              </span>
            </div>
          </div>
        `

        el.addEventListener('click', () => {
          onVehicleSelect?.(vehicle.id)
          mapRef.current?.flyTo({
            center: [vehicle.coordinates.lng, vehicle.coordinates.lat],
            zoom: 15,
            pitch: 60,
            duration: 1500
          })
        })

        const marker = new mapboxgl.Marker(el)
          .setLngLat([vehicle.coordinates.lng, vehicle.coordinates.lat])
          .addTo(mapRef.current!)

        markersRef.current[vehicle.id] = marker
        vehiclePositionRef.current[vehicle.id] = {
          lat: vehicle.coordinates.lat,
          lng: vehicle.coordinates.lng,
          routeIndex: 0,
          heading: 0
        }
      }
    })
  }, [mapReady, vehicles, onVehicleSelect])

  // Animate vehicles and update trails
  useEffect(() => {
    if (!mapReady || !mapRef.current) return

    const animate = () => {
      vehicles.forEach(vehicle => {
        if (vehicle.status === 'moving' && vehicle.route.length > 1 && !vehicle.isDisabled) {
          const position = vehiclePositionRef.current[vehicle.id]
          if (position) {
            const nextIndex = (position.routeIndex + 1) % vehicle.route.length
            const nextPoint = vehicle.route[nextIndex]

            const speed = 0.0006
            const dx = nextPoint.lng - position.lng
            const dy = nextPoint.lat - position.lat
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < speed) {
              position.routeIndex = nextIndex
              position.lat = nextPoint.lat
              position.lng = nextPoint.lng
            } else {
              position.lng += (dx / dist) * speed
              position.lat += (dy / dist) * speed
            }

            // Calculate heading
            position.heading = Math.atan2(dx, dy) * (180 / Math.PI)

            // Update marker
            if (markersRef.current[vehicle.id]) {
              markersRef.current[vehicle.id].setLngLat([position.lng, position.lat])
              const el = markersRef.current[vehicle.id].getElement()
              const arrow = el.querySelector('.vehicle-direction-arrow') as HTMLElement
              if (arrow) {
                arrow.style.transform = `rotate(${position.heading}deg)`
              }
            }

            // Update trail
            if (showTrails) {
              const trail = trailsRef.current[vehicle.id] || []
              trail.push({ lat: position.lat, lng: position.lng })
              if (trail.length > 100) trail.shift()
              trailsRef.current[vehicle.id] = trail

              const source = mapRef.current?.getSource(`trail-${vehicle.id}`) as mapboxgl.GeoJSONSource
              if (source) {
                source.setData({
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: trail.map(p => [p.lng, p.lat])
                  }
                })
              }
            }
          }
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [mapReady, vehicles, showTrails])

  // Handle style change
  const handleStyleChange = useCallback((style: MapStyle) => {
    setMapStyle(style)
    if (mapRef.current) {
      mapRef.current.setStyle(MAP_STYLE_URLS[style])
    }
  }, [])

  // Toggle geofences visibility
  const handleToggleGeofences = useCallback(() => {
    setShowGeofences(prev => {
      const newValue = !prev
      if (mapRef.current) {
        geofences.forEach(geofence => {
          const visibility = newValue ? 'visible' : 'none'
          mapRef.current?.setLayoutProperty(`geofence-${geofence.id}-glow`, 'visibility', visibility)
          mapRef.current?.setLayoutProperty(`geofence-${geofence.id}-fill`, 'visibility', visibility)
          mapRef.current?.setLayoutProperty(`geofence-${geofence.id}-line`, 'visibility', visibility)
          mapRef.current?.setLayoutProperty(`geofence-${geofence.id}-label`, 'visibility', visibility)
        })
      }
      return newValue
    })
  }, [geofences])

  // Toggle trails visibility
  const handleToggleTrails = useCallback(() => {
    setShowTrails(prev => {
      const newValue = !prev
      if (mapRef.current) {
        vehicles.forEach(vehicle => {
          const visibility = newValue ? 'visible' : 'none'
          mapRef.current?.setLayoutProperty(`trail-${vehicle.id}-glow`, 'visibility', visibility)
          mapRef.current?.setLayoutProperty(`trail-${vehicle.id}-line`, 'visibility', visibility)
        })
      }
      return newValue
    })
  }, [vehicles])

  // Toggle 3D
  const handleToggle3D = useCallback(() => {
    setShow3D(prev => {
      const newValue = !prev
      if (mapRef.current) {
        mapRef.current.easeTo({
          pitch: newValue ? 45 : 0,
          duration: 1000
        })
      }
      return newValue
    })
  }, [])

  // Fit all vehicles in view
  const handleFitBounds = useCallback(() => {
    if (!mapRef.current || vehicles.length === 0) return

    const bounds = new mapboxgl.LngLatBounds()
    vehicles.forEach(vehicle => {
      bounds.extend([vehicle.coordinates.lng, vehicle.coordinates.lat])
    })
    bounds.extend([homeBase.lng, homeBase.lat])

    mapRef.current.fitBounds(bounds, {
      padding: 80,
      duration: 1500
    })
  }, [vehicles, homeBase])

  // Start trip replay
  const handleStartTripReplay = useCallback((vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    if (!vehicle) return

    // Generate fake trip data
    const tripData = vehicle.route.map((point, i) => ({
      lat: point.lat,
      lng: point.lng,
      speed: Math.floor(30 + Math.random() * 50),
      timestamp: new Date(Date.now() - (vehicle.route.length - i) * 60000).toLocaleTimeString()
    }))

    setTripReplayData(tripData)
    setTripReplayVehicle(`${vehicle.make} ${vehicle.model}`)
    setTripReplayIndex(0)
    setTripReplayActive(true)
  }, [vehicles])

  // Get selected vehicle data
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId)

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Controls */}
      <MapControls
        currentStyle={mapStyle}
        onStyleChange={handleStyleChange}
        showGeofences={showGeofences}
        onToggleGeofences={handleToggleGeofences}
        showTrails={showTrails}
        onToggleTrails={handleToggleTrails}
        show3D={show3D}
        onToggle3D={handleToggle3D}
        onFitBounds={handleFitBounds}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(prev => !prev)}
      />

      {/* Map Legend */}
      <MapLegend
        isExpanded={legendExpanded}
        onToggle={() => setLegendExpanded(prev => !prev)}
      />

      {/* Vehicle Info Overlay */}
      {selectedVehicle && !tripReplayActive && (
        <VehicleInfoOverlay
          vehicle={{
            ...selectedVehicle,
            heading: vehiclePositionRef.current[selectedVehicle.id]?.heading || 0,
            distanceFromBase: Math.round(
              Math.sqrt(
                Math.pow((selectedVehicle.coordinates.lat - homeBase.lat) * 69, 2) +
                Math.pow((selectedVehicle.coordinates.lng - homeBase.lng) * 54.6, 2)
              )
            )
          }}
          onClose={() => onVehicleSelect?.(null)}
          onStartTrip={() => handleStartTripReplay(selectedVehicle.id)}
        />
      )}

      {/* Trip Replay Controls */}
      {tripReplayActive && (
        <TripReplayControls
          tripData={tripReplayData}
          vehicleName={tripReplayVehicle}
          isPlaying={tripReplayPlaying}
          onPlayPause={() => setTripReplayPlaying(prev => !prev)}
          onSeek={setTripReplayIndex}
          currentIndex={tripReplayIndex}
          playbackSpeed={tripReplaySpeed}
          onSpeedChange={setTripReplaySpeed}
          onClose={() => {
            setTripReplayActive(false)
            setTripReplayPlaying(false)
          }}
        />
      )}

      {/* Loading Overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
