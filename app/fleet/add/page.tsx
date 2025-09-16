// app/sys-2847/fleet/add/page.tsx
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CarFormData } from '../types'
import { 
  CAR_CATEGORIES, 
  TRANSMISSION_TYPES, 
  FUEL_TYPES, 
  FEATURES_LIST,
  DEFAULT_RULES,
  CITIES_ARIZONA
} from '../constants'
import { SectionHeader, Alert } from '../components'
import { LocationPicker } from '../edit/components/LocationPicker'
import { geocodeAddress, getCityFallbackCoordinates } from '@/app/lib/geocoding/mapbox'

export default function AddCarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [hosts, setHosts] = useState<any[]>([])
  const [isGeocoding, setIsGeocoding] = useState(false)
  
  const [formData, setFormData] = useState<Partial<CarFormData>>({
    seats: 4,
    doors: 4,
    transmission: 'AUTOMATIC',
    fuelType: 'PREMIUM',
    category: 'LUXURY',
    carType: 'SEDAN',
    city: 'Phoenix',
    state: 'AZ',
    rules: DEFAULT_RULES,
    instantBook: true,
    isActive: true,
    airportPickup: true,
    hotelDelivery: true,
    homeDelivery: true,
    minTripDuration: 1,
    maxTripDuration: 30,
    advanceNotice: 24,
    weeklyDiscount: 10,
    monthlyDiscount: 20,
    deliveryFee: 150,
    insuranceDaily: 99,
    latitude: null,
    longitude: null
  })

  useEffect(() => {
    fetchHosts()
  }, [])

  const fetchHosts = async () => {
    try {
      const response = await fetch('/sys-2847/fleet/api/hosts')
      const data = await response.json()
      if (data.success && data.data.length > 0) {
        setHosts(data.data)
        // Set the first host as default if no hostId is set
        if (!formData.hostId) {
          setFormData(prev => ({ ...prev, hostId: data.data[0].id }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch hosts')
    }
  }

  // Auto-geocode when address, city, or zipcode changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.address && formData.city && formData.state) {
        handleAutoGeocode()
      }
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(timer)
  }, [formData.address, formData.city, formData.zipCode])

  const handleAutoGeocode = async () => {
    if (!formData.address || formData.address.length < 5) return
    
    setIsGeocoding(true)
    try {
      const result = await geocodeAddress(
        formData.address,
        formData.city || 'Phoenix',
        formData.state || 'AZ'
      )
      
      if (result) {
        setFormData(prev => ({
          ...prev,
          latitude: result.latitude,
          longitude: result.longitude
        }))
      } else {
        // Use city fallback if geocoding fails
        const fallback = getCityFallbackCoordinates(formData.city || 'Phoenix')
        setFormData(prev => ({
          ...prev,
          latitude: fallback.lat,
          longitude: fallback.lng
        }))
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    
    setUploadingPhotos(true)
    const formData = new FormData()
    
    Array.from(e.target.files).forEach(file => {
      formData.append('files', file)
    })
    
    try {
      const response = await fetch('/sys-2847/fleet/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        setPhotos([...photos, ...data.data])
      }
    } catch (err) {
      setError('Failed to upload photos')
    } finally {
      setUploadingPhotos(false)
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Ensure we have coordinates
    if (!formData.latitude || !formData.longitude) {
      // Try to geocode one more time
      if (formData.address && formData.city) {
        const result = await geocodeAddress(
          formData.address,
          formData.city,
          formData.state || 'AZ'
        )
        if (result) {
          formData.latitude = result.latitude
          formData.longitude = result.longitude
        } else {
          // Use city center as last resort
          const fallback = getCityFallbackCoordinates(formData.city)
          formData.latitude = fallback.lat
          formData.longitude = fallback.lng
        }
      }
    }
    
    // Calculate rates if not set
    const dailyRate = parseFloat(formData.dailyRate as any) || 500
    const data = {
      ...formData,
      dailyRate,
      weeklyRate: formData.weeklyRate || dailyRate * 6.3,
      monthlyRate: formData.monthlyRate || dailyRate * 24,
      photos
    }
    
    try {
      const response = await fetch('/sys-2847/fleet/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/fleet')
        }, 2000)
      } else {
        setError(result.error || 'Failed to create car')
      }
    } catch (err) {
      setError('Failed to create car')
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader 
        title="Add New Car" 
        description="Add a new vehicle to your fleet"
      />

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message="Car created successfully! Redirecting..." />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Host Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Host Assignment</h3>
          {hosts.length > 0 ? (
            <select
              value={formData.hostId}
              onChange={(e) => updateForm('hostId', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {hosts.map(host => (
                <option key={host.id} value={host.id}>
                  {host.name} ({host.email})
                </option>
              ))}
            </select>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Loading hosts...</p>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Vehicle Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Make"
              value={formData.make || ''}
              onChange={(e) => updateForm('make', e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Model"
              value={formData.model || ''}
              onChange={(e) => updateForm('model', e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Year"
              value={formData.year || ''}
              onChange={(e) => updateForm('year', parseInt(e.target.value))}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Color"
              value={formData.color || ''}
              onChange={(e) => updateForm('color', e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={formData.category}
              onChange={(e) => updateForm('category', e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CAR_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <select
              value={formData.transmission}
              onChange={(e) => updateForm('transmission', e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TRANSMISSION_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              value={formData.fuelType}
              onChange={(e) => updateForm('fuelType', e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {FUEL_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Seats"
              value={formData.seats || ''}
              onChange={(e) => updateForm('seats', parseInt(e.target.value))}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Pricing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Daily Rate ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="500"
                value={formData.dailyRate || ''}
                onChange={(e) => updateForm('dailyRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Weekly Rate ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Auto-calculated"
                value={formData.weeklyRate || ''}
                onChange={(e) => updateForm('weeklyRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Monthly Rate ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Auto-calculated"
                value={formData.monthlyRate || ''}
                onChange={(e) => updateForm('monthlyRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Location with Map */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Location</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Street Address"
              value={formData.address || ''}
              onChange={(e) => updateForm('address', e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded sm:col-span-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <select
              value={formData.city}
              onChange={(e) => updateForm('city', e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CITIES_ARIZONA.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="ZIP Code"
              value={formData.zipCode || ''}
              onChange={(e) => updateForm('zipCode', e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {/* Coordinates Display */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Latitude</label>
              <input
                type="text"
                value={formData.latitude || ''}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                readOnly
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Longitude</label>
              <input
                type="text"
                value={formData.longitude || ''}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                readOnly
              />
            </div>
          </div>

          {isGeocoding && (
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-4">
              Getting coordinates...
            </div>
          )}
          
          {/* Map Preview */}
          <LocationPicker
            address={formData.address || ''}
            city={formData.city || 'Phoenix'}
            state={formData.state || 'AZ'}
            latitude={formData.latitude}
            longitude={formData.longitude}
            onCoordinatesChange={handleCoordinatesChange}
          />
        </div>

        {/* Photos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Photos</h3>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploadingPhotos}
            className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-white hover:file:bg-gray-200 dark:hover:file:bg-gray-600 cursor-pointer"
          />
          {uploadingPhotos && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Uploading photos...</p>}
          
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              {photos.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={url} 
                    alt={`Photo ${idx + 1}`} 
                    className="w-full h-24 object-cover rounded border border-gray-200 dark:border-gray-700" 
                  />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                      MAIN
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Features</h3>
          <textarea
            placeholder="Enter features separated by commas (e.g., Leather Seats, Navigation, Bluetooth)"
            value={formData.features || ''}
            onChange={(e) => updateForm('features', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded h-24 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Rules */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Rental Rules</h3>
          <textarea
            placeholder="Enter rental rules and requirements"
            value={formData.rules || ''}
            onChange={(e) => updateForm('rules', e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded h-24 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-8">
          <button
            type="button"
            onClick={() => router.push('/fleet')}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || hosts.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
          >
            {loading ? 'Creating...' : 'Create Car'}
          </button>
        </div>
      </form>
    </div>
  )
}