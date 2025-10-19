// app/host/cars/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { 
  IoArrowBackOutline,
  IoCarOutline,
  IoLocationOutline,
  IoCashOutline,
  IoImageOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTrashOutline,
  IoAddOutline,
  IoStarOutline,
  IoStar,
  IoReorderThreeOutline,
  IoWarningOutline,
  IoSaveOutline
} from 'react-icons/io5'

interface CarPhoto {
  id: string
  url: string
  isHero: boolean
  order: number
}

interface CarDetails {
  id: string
  make: string
  model: string
  year: number
  trim?: string
  color: string
  licensePlate?: string
  vin?: string
  
  // Specifications
  carType: string
  seats: number
  doors: number
  transmission: string
  fuelType: string
  mpgCity?: number
  mpgHighway?: number
  currentMileage?: number
  
  // Pricing
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  weeklyDiscount?: number
  monthlyDiscount?: number
  deliveryFee: number
  
  // Features
  features: string[]
  
  // Location
  address: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number
  
  // Delivery options
  airportPickup: boolean
  hotelDelivery: boolean
  homeDelivery: boolean
  
  // Availability
  isActive: boolean
  instantBook: boolean
  advanceNotice: number
  minTripDuration: number
  maxTripDuration: number
  
  // Rules
  rules?: string[]
  
  // Insurance
  insuranceIncluded: boolean
  insuranceDaily: number
  
  // Photos
  photos: CarPhoto[]
  
  // Stats
  totalTrips: number
  rating: number
}

const carTypes = [
  { value: 'economy', label: 'Economy' },
  { value: 'compact', label: 'Compact' },
  { value: 'midsize', label: 'Midsize' },
  { value: 'fullsize', label: 'Full Size' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'truck', label: 'Truck' },
  { value: 'exotic', label: 'Exotic' }
]

const features = [
  'Bluetooth',
  'Backup Camera',
  'Apple CarPlay',
  'Android Auto',
  'USB Charger',
  'Aux Input',
  'GPS Navigation',
  'Cruise Control',
  'Heated Seats',
  'Leather Seats',
  'Sunroof',
  'All-Wheel Drive',
  'Keyless Entry',
  'Remote Start',
  'Third Row Seating',
  'Bike Rack',
  'Roof Rack',
  'Tow Hitch',
  'Pet Friendly',
  'Child Seat'
]

const rules = [
  'No smoking',
  'No pets',
  'Return with same fuel level',
  'Clean return required',
  'No off-roading',
  'Valid license required',
  'Insurance required',
  'Age 21+ only',
  'Age 25+ only',
  'Local renters only',
  'Maximum 500 miles per day',
  'No commercial use'
]

export default function EditCarPage() {
  const router = useRouter()
  const params = useParams()
  const carId = params.id as string
  
  const [car, setCar] = useState<CarDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic details
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    color: '',
    licensePlate: '',
    vin: '',
    
    // Specifications
    carType: 'midsize',
    seats: 5,
    doors: 4,
    transmission: 'automatic',
    fuelType: 'gas',
    mpgCity: 0,
    mpgHighway: 0,
    currentMileage: 0,
    
    // Pricing
    dailyRate: 0,
    weeklyRate: 0,
    monthlyRate: 0,
    weeklyDiscount: 15,
    monthlyDiscount: 30,
    deliveryFee: 35,
    
    // Features
    features: [] as string[],
    
    // Location
    address: '',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '',
    
    // Delivery
    airportPickup: false,
    hotelDelivery: true,
    homeDelivery: false,
    
    // Availability
    isActive: true,
    instantBook: true,
    advanceNotice: 2,
    minTripDuration: 1,
    maxTripDuration: 30,
    
    // Rules
    rules: [] as string[],
    
    // Insurance
    insuranceIncluded: false,
    insuranceDaily: 25
  })
  
  const [photos, setPhotos] = useState<CarPhoto[]>([])

  useEffect(() => {
    fetchCarDetails()
  }, [carId])

  const fetchCarDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/host/cars/${carId}`, {
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCar(data.car)
        setPhotos(data.car.photos || [])
        
        // Populate form with existing data
        setFormData({
          make: data.car.make,
          model: data.car.model,
          year: data.car.year,
          trim: data.car.trim || '',
          color: data.car.color,
          licensePlate: data.car.licensePlate || '',
          vin: data.car.vin || '',
          carType: data.car.carType,
          seats: data.car.seats,
          doors: data.car.doors,
          transmission: data.car.transmission,
          fuelType: data.car.fuelType,
          mpgCity: data.car.mpgCity || 0,
          mpgHighway: data.car.mpgHighway || 0,
          currentMileage: data.car.currentMileage || 0,
          dailyRate: data.car.dailyRate,
          weeklyRate: data.car.weeklyRate || data.car.dailyRate * 6.5,
          monthlyRate: data.car.monthlyRate || data.car.dailyRate * 25,
          weeklyDiscount: data.car.weeklyDiscount || 15,
          monthlyDiscount: data.car.monthlyDiscount || 30,
          deliveryFee: data.car.deliveryFee || 35,
          features: data.car.features || [],
          address: data.car.address,
          city: data.car.city,
          state: data.car.state,
          zipCode: data.car.zipCode,
          airportPickup: data.car.airportPickup,
          hotelDelivery: data.car.hotelDelivery,
          homeDelivery: data.car.homeDelivery,
          isActive: data.car.isActive,
          instantBook: data.car.instantBook,
          advanceNotice: data.car.advanceNotice,
          minTripDuration: data.car.minTripDuration,
          maxTripDuration: data.car.maxTripDuration,
          rules: data.car.rules || [],
          insuranceIncluded: data.car.insuranceIncluded,
          insuranceDaily: data.car.insuranceDaily
        })
      } else if (response.status === 404) {
        router.push('/host/cars')
      }
    } catch (error) {
      console.error('Failed to fetch car details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Validate required fields
    const newErrors: Record<string, string> = {}
    
    if (!formData.make) newErrors.make = 'Make is required'
    if (!formData.model) newErrors.model = 'Model is required'
    if (!formData.color) newErrors.color = 'Color is required'
    if (formData.dailyRate <= 0) newErrors.dailyRate = 'Daily rate must be greater than 0'
    if (!formData.address) newErrors.address = 'Address is required'
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setSaving(true)
    setErrors({})
    
    try {
      const response = await fetch(`/api/host/cars/${carId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-host-id': localStorage.getItem('hostId') || ''
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setSuccessMessage('Car details updated successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
        await fetchCarDetails() // Refresh data
      } else {
        const data = await response.json()
        setErrors({ general: data.error || 'Failed to update car' })
      }
    } catch (error) {
      console.error('Failed to save car:', error)
      setErrors({ general: 'An error occurred while saving' })
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('carId', carId)
    
    try {
      const response = await fetch('/api/host/upload', {
        method: 'POST',
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        },
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        const newPhoto: CarPhoto = {
          id: data.photo.id,
          url: data.photo.url,
          isHero: photos.length === 0,
          order: photos.length
        }
        setPhotos([...photos, newPhoto])
      }
    } catch (error) {
      console.error('Failed to upload photo:', error)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSetHeroPhoto = async (photoId: string) => {
    try {
      const response = await fetch(`/api/host/cars/${carId}/photos/${photoId}/hero`, {
        method: 'POST',
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })
      
      if (response.ok) {
        setPhotos(photos.map(p => ({
          ...p,
          isHero: p.id === photoId
        })))
      }
    } catch (error) {
      console.error('Failed to set hero photo:', error)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return
    
    try {
      const response = await fetch(`/api/host/cars/${carId}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })
      
      if (response.ok) {
        setPhotos(photos.filter(p => p.id !== photoId))
      }
    } catch (error) {
      console.error('Failed to delete photo:', error)
    }
  }

  const toggleFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features.includes(feature)
        ? formData.features.filter(f => f !== feature)
        : [...formData.features, feature]
    })
  }

  const toggleRule = (rule: string) => {
    setFormData({
      ...formData,
      rules: formData.rules.includes(rule)
        ? formData.rules.filter(r => r !== rule)
        : [...formData.rules, rule]
    })
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading car details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!car) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <IoWarningOutline className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-lg font-semibold">Car not found</p>
              <Link href="/host/cars" className="text-purple-600 hover:underline mt-2 inline-block">
                Back to My Cars
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href="/host/cars" 
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
            >
              <IoArrowBackOutline className="w-5 h-5" />
              Back to My Cars
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Edit {formData.year} {formData.make} {formData.model}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{car.totalTrips} trips completed</span>
                  <span>⭐ {car.rating.toFixed(1)} rating</span>
                </div>
              </div>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <IoSaveOutline className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-300 flex items-center gap-2">
                <IoCheckmarkCircleOutline className="w-5 h-5" />
                {successMessage}
              </p>
            </div>
          )}
          
          {errors.general && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300">{errors.general}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
            <div className="flex overflow-x-auto">
              {['details', 'pricing', 'photos', 'features', 'availability'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle Details</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Make *
                    </label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.make ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.make && <p className="text-red-500 text-xs mt-1">{errors.make}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color *
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.color ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={formData.carType}
                      onChange={(e) => setFormData({ ...formData, carType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {carTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Transmission
                    </label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Location</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                          errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                            errors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing & Fees</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Daily Rate *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.dailyRate}
                        onChange={(e) => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) })}
                        min="0"
                        step="10"
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                          errors.dailyRate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                    </div>
                    {errors.dailyRate && <p className="text-red-500 text-xs mt-1">{errors.dailyRate}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weekly Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.weeklyRate}
                        onChange={(e) => setFormData({ ...formData, weeklyRate: parseFloat(e.target.value) })}
                        min="0"
                        step="10"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Suggested: ${(formData.dailyRate * 6.5).toFixed(0)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Monthly Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.monthlyRate}
                        onChange={(e) => setFormData({ ...formData, monthlyRate: parseFloat(e.target.value) })}
                        min="0"
                        step="10"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Suggested: ${(formData.dailyRate * 25).toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Delivery Options</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.airportPickup}
                        onChange={(e) => setFormData({ ...formData, airportPickup: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Airport Pickup Available</span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.hotelDelivery}
                        onChange={(e) => setFormData({ ...formData, hotelDelivery: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Hotel Delivery Available</span>
                    </label>
                    
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.homeDelivery}
                        onChange={(e) => setFormData({ ...formData, homeDelivery: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Home Delivery Available</span>
                    </label>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Fee
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.deliveryFee}
                        onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) })}
                        min="0"
                        step="5"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Photos</h3>
                  <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer flex items-center gap-2">
                    <IoAddOutline className="w-5 h-5" />
                    {uploadingPhoto ? 'Uploading...' : 'Add Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
                
                {photos.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <IoImageOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No photos uploaded yet</p>
                    <p className="text-sm text-gray-500 mt-1">Add photos to showcase your vehicle</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <Image
                          src={photo.url}
                          alt="Car photo"
                          width={300}
                          height={200}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleSetHeroPhoto(photo.id)}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800"
                            title="Set as main photo"
                          >
                            {photo.isHero ? (
                              <IoStar className="w-5 h-5 text-yellow-500" />
                            ) : (
                              <IoStarOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800"
                            title="Delete photo"
                          >
                            <IoTrashOutline className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                        {photo.isHero && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                            Main Photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features & Amenities</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {features.map((feature) => (
                    <label key={feature} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </label>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Rental Rules</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rules.map((rule) => (
                      <label key={rule} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.rules.includes(rule)}
                          onChange={() => toggleRule(rule)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{rule}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Availability Settings</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                    />
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Car is Active</span>
                      <p className="text-sm text-gray-500">Make this car available for booking</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.instantBook}
                      onChange={(e) => setFormData({ ...formData, instantBook: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                    />
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Instant Book</span>
                      <p className="text-sm text-gray-500">Allow guests to book without your approval</p>
                    </div>
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Advance Notice (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.advanceNotice}
                      onChange={(e) => setFormData({ ...formData, advanceNotice: parseInt(e.target.value) })}
                      min="0"
                      max="72"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">How far in advance can guests book</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Minimum Trip Duration (days)
                    </label>
                    <input
                      type="number"
                      value={formData.minTripDuration}
                      onChange={(e) => setFormData({ ...formData, minTripDuration: parseInt(e.target.value) })}
                      min="1"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Maximum Trip Duration (days)
                    </label>
                    <input
                      type="number"
                      value={formData.maxTripDuration}
                      onChange={(e) => setFormData({ ...formData, maxTripDuration: parseInt(e.target.value) })}
                      min="1"
                      max="365"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}