// app/partner/tracking/components/LiveFleetMap.tsx
// Real-time fleet map showing actual Smartcar vehicle locations
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Initialize Mapbox token
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
}

type MapStyle = 'dark' | 'streets' | 'satellite'

const MAP_STYLES: Record<MapStyle, string> = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
}

interface VehicleLocation {
  id: string
  make: string
  model: string
  year: number
  status: 'moving' | 'parked' | 'offline'
  coordinates: { lat: number; lng: number } | null
  fuelLevel: number | null
  batteryLevel: number | null
  odometer: number | null
  lastUpdate: string | null
  provider: string
}

interface LiveFleetMapProps {
  vehicles: VehicleLocation[]
  onVehicleSelect?: (vehicleId: string | null) => void
  selectedVehicleId?: string | null
  onRefresh?: () => void
  isRefreshing?: boolean
}

export default function LiveFleetMap({
  vehicles,
  onVehicleSelect,
  selectedVehicleId,
  onRefresh,
  isRefreshing
}: LiveFleetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({})
  const [mapStyle, setMapStyle] = useState<MapStyle>('dark')
  const [mapReady, setMapReady] = useState(false)

  // Vehicles with valid coordinates
  const locatedVehicles = vehicles.filter(v => v.coordinates)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return

    // Default center: Phoenix, AZ or first vehicle
    const firstVehicle = locatedVehicles[0]
    const center: [number, number] = firstVehicle
      ? [firstVehicle.coordinates!.lng, firstVehicle.coordinates!.lat]
      : [-111.9460, 33.4255] // Phoenix

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[mapStyle],
      center,
      zoom: locatedVehicles.length > 0 ? 11 : 10,
      pitch: 30
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('load', () => {
      setMapReady(true)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when vehicles change
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    // Remove old markers
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (!locatedVehicles.find(v => v.id === id)) {
        marker.remove()
        delete markersRef.current[id]
      }
    })

    // Add/update markers
    locatedVehicles.forEach(vehicle => {
      if (!vehicle.coordinates) return
      const { lat, lng } = vehicle.coordinates

      const existing = markersRef.current[vehicle.id]
      if (existing) {
        // Update position
        existing.setLngLat([lng, lat])
        // Update marker element classes
        const el = existing.getElement()
        if (el) {
          const dot = el.querySelector('.vehicle-dot')
          if (dot) {
            dot.className = `vehicle-dot ${getStatusClass(vehicle.status)}`
          }
        }
        return
      }

      // Create marker element
      const el = document.createElement('div')
      el.className = 'live-vehicle-marker'
      el.style.cursor = 'pointer'
      el.innerHTML = `
        <div style="position: relative; width: 36px; height: 36px;">
          <div class="vehicle-dot ${getStatusClass(vehicle.status)}" style="
            width: 14px; height: 14px; border-radius: 50%;
            border: 2px solid white;
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 8px rgba(0,0,0,0.3);
          "></div>
          ${vehicle.status === 'moving' ? `
            <div style="
              position: absolute; top: 50%; left: 50%;
              transform: translate(-50%, -50%);
              width: 28px; height: 28px; border-radius: 50%;
              border: 2px solid #3b82f6; opacity: 0.4;
              animation: pulse-ring 2s ease-out infinite;
            "></div>
          ` : ''}
        </div>
      `

      el.addEventListener('click', () => {
        onVehicleSelect?.(vehicle.id === selectedVehicleId ? null : vehicle.id)
      })

      // Popup with vehicle info
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'vehicle-popup'
      }).setHTML(`
        <div style="padding: 8px; font-family: system-ui, sans-serif; min-width: 160px;">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">
            ${vehicle.year} ${vehicle.make} ${vehicle.model}
          </div>
          <div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${getStatusColor(vehicle.status)};"></span>
            ${vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
            ${vehicle.provider ? ` · ${vehicle.provider}` : ''}
          </div>
          ${vehicle.odometer ? `<div style="font-size: 11px; color: #6b7280;">${Math.round(vehicle.odometer).toLocaleString()} mi</div>` : ''}
          ${vehicle.fuelLevel ? `<div style="font-size: 11px; color: #6b7280;">Fuel: ${Math.round(vehicle.fuelLevel)}%</div>` : ''}
          ${vehicle.batteryLevel ? `<div style="font-size: 11px; color: #6b7280;">Battery: ${Math.round(vehicle.batteryLevel)}%</div>` : ''}
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current!)

      markersRef.current[vehicle.id] = marker
    })

    // Fit bounds to show all vehicles
    if (locatedVehicles.length > 1) {
      const bounds = new mapboxgl.LngLatBounds()
      locatedVehicles.forEach(v => {
        if (v.coordinates) bounds.extend([v.coordinates.lng, v.coordinates.lat])
      })
      mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 14 })
    }
  }, [vehicles, mapReady, selectedVehicleId, onVehicleSelect, locatedVehicles])

  // Change map style
  const handleStyleChange = useCallback((style: MapStyle) => {
    setMapStyle(style)
    if (mapRef.current) {
      mapRef.current.setStyle(MAP_STYLES[style])
    }
  }, [])

  // No Mapbox token
  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the map
        </p>
      </div>
    )
  }

  // No vehicles with location
  if (locatedVehicles.length === 0 && vehicles.length > 0) {
    return (
      <div className="h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            No vehicle location data yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Location will appear after the first data sync
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Map style switcher */}
      <div className="absolute top-3 left-3 flex gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg p-1 shadow-sm z-10">
        {(['dark', 'streets', 'satellite'] as MapStyle[]).map(style => (
          <button
            key={style}
            onClick={() => handleStyleChange(style)}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
              mapStyle === style
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {style.charAt(0).toUpperCase() + style.slice(1)}
          </button>
        ))}
      </div>

      {/* Vehicle count badge */}
      <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg px-3 py-1.5 shadow-sm z-10">
        <span className="text-xs text-gray-600 dark:text-gray-300">
          {locatedVehicles.length} vehicle{locatedVehicles.length !== 1 ? 's' : ''} on map
        </span>
      </div>

      {/* Refresh button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg px-3 py-1.5 shadow-sm z-10 text-xs text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isRefreshing ? 'Syncing...' : 'Sync Now'}
        </button>
      )}

      {/* CSS for pulse animation */}
      <style jsx global>{`
        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        .vehicle-popup .mapboxgl-popup-content {
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .vehicle-popup .mapboxgl-popup-tip {
          border-top-color: white;
        }
      `}</style>
    </div>
  )
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'moving': return 'bg-blue-500'
    case 'parked': return 'bg-green-500'
    default: return 'bg-gray-400'
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'moving': return '#3b82f6'
    case 'parked': return '#22c55e'
    default: return '#9ca3af'
  }
}
