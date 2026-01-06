// app/sys-2847/fleet/edit/[id]/page.tsx
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Car, CarFormData } from '../../types'
import { SectionHeader, Alert, LoadingSpinner } from '../../components'
import { geocodeAddress, getCityFallbackCoordinates } from '@/app/lib/geocoding/mapbox'
import { LocationPicker } from '../components/LocationPicker'

// Import all 12 components
import { AvailabilityCalendar } from '../components/AvailabilityCalendar'
import { PhotoManager } from '../components/PhotoManager'
import { HostSection } from '../components/HostSection'
import { ReviewManager } from '../components/ReviewManager'
import { PricingSection } from '../components/PricingSection'
import { VehicleSpecs } from '../components/VehicleSpecs'
import { FeaturesEditor } from '../components/FeaturesEditor'
import { RentalGuidelines } from '../components/RentalGuidelines'
import { DeliveryOptions } from '../components/DeliveryOptions'
import { InsuranceSettings } from '../components/InsuranceSettings'
import { TripSettings } from '../components/TripSettings'
import { HostBadges } from '../components/HostBadges'

export default function EditCarPage() {
  const router = useRouter()
  const params = useParams()
  const carId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [car, setCar] = useState<Car | null>(null)
  const [formData, setFormData] = useState<Partial<CarFormData>>({})
  const [photos, setPhotos] = useState<string[]>([])
  const [hosts, setHosts] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [blockedDates, setBlockedDates] = useState<any[]>([])
  const [isGeocoding, setIsGeocoding] = useState(false)
  
  // Use a ref to track if we should redirect
  const shouldRedirectRef = useRef(false)
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  // Only redirect when explicitly set via the ref
  useEffect(() => {
    if (success && shouldRedirectRef.current) {
      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/fleet')
      }, 2000)
    }
  }, [success, router])

  useEffect(() => {
    fetchHosts()
    fetchCar()
    fetchBookings()
  }, [carId])

  const fetchHosts = async () => {
    try {
      const response = await fetch('/sys-2847/fleet/api/hosts')
      const data = await response.json()
      if (data.success) {
        setHosts(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch hosts:', error)
    }
  }

  const fetchCar = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/sys-2847/fleet/api/cars/${carId}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const carData = data.data
        setCar(carData)
        
        // Properly set ALL form data including location fields
        // Use the correct field names from database (latitude/longitude not locationLat/locationLng)
        setFormData({
          ...carData,
          hostId: carData.hostId || carData.host?.id,
          // Ensure location fields are included with correct names
          address: carData.address || '',
          city: carData.city || 'Phoenix',
          state: carData.state || 'AZ',
          zipCode: carData.zipCode || '',
          latitude: carData.latitude || null,
          longitude: carData.longitude || null,
          pickupInstructions: carData.pickupInstructions || ''
        })
        
        // Extract photo URLs
        if (carData.photos && Array.isArray(carData.photos) && carData.photos.length > 0) {
          const photoUrls = carData.photos
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((p: any) => {
              if (typeof p === 'string') return p
              return p.url || ''
            })
            .filter((url: string) => url !== '')
          
          setPhotos(photoUrls)
        } else {
          setPhotos([])
        }
      } else {
        setError('Car not found')
      }
    } catch (err) {
      console.error('Error fetching car:', err)
      setError('Failed to load car')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/sys-2847/fleet/api/cars/${carId}/bookings`)
      
      if (!response.ok) {
        console.log('Bookings endpoint not available yet')
        return
      }
      
      const text = await response.text()
      if (!text) {
        console.log('Empty response from bookings endpoint')
        return
      }
      
      const data = JSON.parse(text)
      if (data.success) {
        setBookings(data.bookings || [])
        setBlockedDates(data.blockedDates || [])
      }
    } catch (error) {
      console.log('Bookings fetch skipped:', error)
    }
  }

  const handleGeocode = async () => {
    if (!formData.address || !formData.city || !formData.state) {
      setError('Please enter complete address information')
      return
    }

    setIsGeocoding(true)
    setError('')
    
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
        setError('Could not geocode exact address, using city center as fallback')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      setError('Failed to geocode address')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear any existing redirect timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
    }
    
    // Reset states
    setSuccess(false)
    setError('')
    shouldRedirectRef.current = false
    
    // Validation before saving
    if (!formData.hostId) {
      setError('Please select a host for this vehicle')
      return
    }
    
    // Validate location data
    if (!formData.address) {
      setError('Please provide a pickup address for this vehicle')
      return
    }
    
    if (!formData.latitude || !formData.longitude) {
      // Try to geocode before showing error
      const result = await geocodeAddress(
        formData.address,
        formData.city || 'Phoenix',
        formData.state || 'AZ'
      )
      
      if (result) {
        formData.latitude = result.latitude
        formData.longitude = result.longitude
      } else {
        // Use city center as last resort
        const fallback = getCityFallbackCoordinates(formData.city || 'Phoenix')
        formData.latitude = fallback.lat
        formData.longitude = fallback.lng
      }
    }
    
    setSaving(true)
    
    // Include all location fields in the update with correct field names
    const updateData = {
      ...formData,
      photos: photos.length > 0 ? photos : undefined,
      // Explicitly include location fields with correct names
      address: formData.address,
      city: formData.city || 'Phoenix',
      state: formData.state || 'AZ',
      zipCode: formData.zipCode,
      latitude: formData.latitude,  // Changed from locationLat
      longitude: formData.longitude, // Changed from locationLng
      pickupInstructions: formData.pickupInstructions
    }
    
    try {
      const response = await fetch(`/sys-2847/fleet/api/cars/${carId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Set success state and mark that we should redirect
        setSuccess(true)
        shouldRedirectRef.current = true
        // The redirect will happen via the useEffect
      } else {
        setError(result.error || 'Failed to update car')
        setSuccess(false)
        shouldRedirectRef.current = false
      }
    } catch (err) {
      console.error('Request failed:', err)
      setError('Network error - failed to update car')
      setSuccess(false)
      shouldRedirectRef.current = false
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this car from listings?')) return
    
    try {
      const response = await fetch(`/sys-2847/fleet/api/cars/${carId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      if (result.success) {
        router.push('/fleet')
      } else {
        setError(result.error || 'Failed to delete car')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete car')
    }
  }

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Log updates for debugging
    console.log(`Field updated: ${field} =`, value)
  }

  const handleBlockDates = async (dates: { start: Date; end: Date; reason: string }) => {
    try {
      const response = await fetch(`/sys-2847/fleet/api/cars/${carId}/block-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dates)
      })
      
      if (response.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error('Failed to block dates:', error)
    }
  }

  const handleUnblockDates = async (blockId: string) => {
    try {
      const response = await fetch(`/sys-2847/fleet/api/cars/${carId}/block-dates/${blockId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error('Failed to unblock dates:', error)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!car) return <Alert type="error" message="Car not found" />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader 
        title={`Edit: ${car.year} ${car.make} ${car.model}`}
        description={`ID: ${car.id} | Location: ${formData.address || 'Not set'}`}
      />

      {error && <Alert type="error" message={error} />}
      {success && shouldRedirectRef.current && (
        <Alert type="success" message="Car updated successfully! Redirecting..." />
      )}
      {success && !shouldRedirectRef.current && (
        <Alert type="success" message="Changes saved successfully!" />
      )}

      {/* Main Grid Layout - Contains both form and non-form elements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Form Content */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Specifications */}
            <VehicleSpecs
              make={formData.make}
              model={formData.model}
              year={formData.year}
              color={formData.color}
              vin={formData.vin}
              licensePlate={formData.licensePlate}
              transmission={formData.transmission}
              fuelType={formData.fuelType}
              carType={formData.carType}
              seats={formData.seats}
              doors={formData.doors}
              mpgCity={formData.mpgCity}
              mpgHighway={formData.mpgHighway}
              currentMileage={formData.currentMileage}
              engineSize={formData.engineSize}
              driveType={formData.driveType}
              // LOCATION FIELDS - Using correct field names
              address={formData.address}
              city={formData.city}
              state={formData.state}
              zipCode={formData.zipCode}
              locationLat={formData.latitude}  // Map to correct prop name for component
              locationLng={formData.longitude} // Map to correct prop name for component
              pickupInstructions={formData.pickupInstructions}
              onChange={updateForm}
            />

            {/* Location Section with Map */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Location & Coordinates</h3>
              
              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={formData.address || ''}
                  onChange={(e) => updateForm('address', e.target.value)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded sm:col-span-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city || ''}
                  onChange={(e) => updateForm('city', e.target.value)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={formData.zipCode || ''}
                  onChange={(e) => updateForm('zipCode', e.target.value)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

              {/* Fix Coordinates Button */}
              <button
                type="button"
                onClick={handleGeocode}
                disabled={isGeocoding}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {isGeocoding ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Geocoding...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Fix Coordinates
                  </>
                )}
              </button>
              
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
            <PhotoManager
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={20}
            />

            {/* Pricing */}
            <PricingSection
              dailyRate={formData.dailyRate}
              weeklyRate={formData.weeklyRate}
              monthlyRate={formData.monthlyRate}
              weeklyDiscount={formData.weeklyDiscount}
              monthlyDiscount={formData.monthlyDiscount}
              deliveryFee={formData.deliveryFee}
              insuranceDaily={formData.insuranceDaily}
              cleaningFee={formData.cleaningFee}
              lateFeePerHour={formData.lateFeePerHour}
              additionalMileageFee={formData.additionalMileageFee}
              onChange={updateForm}
            />

            {/* Features - FIXED */}
            <FeaturesEditor
              selectedFeatures={formData.features}
              onFeaturesChange={(features) => updateForm('features', features)}
            />

            {/* Rental Guidelines - FIXED */}
            <RentalGuidelines
              selectedRules={formData.rules || []}
              onChange={updateForm}
            />

            {/* Delivery Options - FIXED */}
            <DeliveryOptions
              airportPickup={formData.airportPickup}
              hotelDelivery={formData.hotelDelivery}
              homeDelivery={formData.homeDelivery}
              deliveryRadius={formData.deliveryRadius}
              deliveryFee={formData.deliveryFee}
              airportFee={formData.airportFee}
              hotelFee={formData.hotelFee}
              homeFee={formData.homeFee}
              freeDeliveryRadius={formData.freeDeliveryRadius}
              onChange={updateForm}
            />

            {/* Trip Settings - FIXED */}
            <TripSettings
              minTripDuration={formData.minTripDuration}
              maxTripDuration={formData.maxTripDuration}
              advanceNotice={formData.advanceNotice}
              instantBook={formData.instantBook}
              mileageDaily={formData.mileageDaily}
              mileageWeekly={formData.mileageWeekly}
              mileageMonthly={formData.mileageMonthly}
              mileageOverageFee={formData.mileageOverageFee}
              bufferTime={formData.bufferTime}
              cancellationPolicy={formData.cancellationPolicy}
              checkInTime={formData.checkInTime}
              checkOutTime={formData.checkOutTime}
              onChange={updateForm}
            />

            {/* Insurance Settings - FIXED */}
            <InsuranceSettings
              insuranceIncluded={formData.insuranceIncluded}
              insuranceDaily={formData.insuranceDaily}
              insuranceRequired={formData.insuranceRequired}
              additionalCoverage={formData.additionalCoverage}
              onChange={updateForm}
            />

            {/* Actions - Part of the form */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors w-full sm:w-auto"
              >
                Delete Car
              </button>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/fleet')}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || hosts.length === 0 || !formData.hostId || !formData.address}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                  title={
                    !formData.hostId ? 'Please select a host' : 
                    !formData.address ? 'Please enter a pickup address' : ''
                  }
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Non-form Components */}
        <div className="space-y-6">
          {/* Host Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <HostSection
              hosts={hosts}
              selectedHostId={formData.hostId}
              onHostChange={(hostId) => {
                updateForm('hostId', hostId)
              }}
            />
          </div>

          {/* Host Badges */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <HostBadges
              selectedBadge={formData.hostBadge}
              hostStats={{
                rating: car.host?.rating || 0,
                totalTrips: car.host?.totalTrips || 0,
                responseRate: car.host?.responseRate || 0,
                responseTime: car.host?.responseTime || 0
              }}
              onChange={(badge) => updateForm('hostBadge', badge)}
            />
          </div>

          {/* Location Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Current Location</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Address:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {formData.address || 'Not set'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">City:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {formData.city || 'Phoenix'}, {formData.state || 'AZ'} {formData.zipCode}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Coordinates:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {formData.latitude && formData.longitude ? 
                    `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}` : 
                    'Not set'}
                </span>
              </div>
              {formData.pickupInstructions && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Instructions:</span>
                  <p className="mt-1 text-gray-900 dark:text-white text-xs">
                    {formData.pickupInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Availability Calendar */}
          <AvailabilityCalendar
            carId={carId}
            bookings={bookings}
            blockedDates={blockedDates}
            onBlockDates={handleBlockDates}
            onUnblockDates={handleUnblockDates}
          />

          {/* Reviews */}
          <ReviewManager carId={carId} />
        </div>
      </div>
    </div>
  )
}