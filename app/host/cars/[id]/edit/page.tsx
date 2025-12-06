// app/host/cars/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ServiceHistoryList from '@/app/components/host/ServiceHistoryList'
import ServiceDueAlerts from '@/app/components/host/ServiceDueAlerts'
import AddServiceRecordModal from '@/app/components/host/AddServiceRecordModal'
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
  IoSaveOutline,
  IoShieldOutline,
  IoLockClosedOutline,
  IoDocumentTextOutline,
  IoInformationCircleOutline,
  IoCalendarOutline
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
  
  // Description
  description?: string
  
  // Registration & Documentation Fields
  registeredOwner?: string
  registrationState?: string
  registrationExpiryDate?: string
  titleStatus?: string
  garageAddress?: string
  garageCity?: string
  garageState?: string
  garageZip?: string
  estimatedValue?: number
  hasLien?: boolean
  lienholderName?: string
  lienholderAddress?: string
  hasAlarm?: boolean
  hasTracking?: boolean
  hasImmobilizer?: boolean
  isModified?: boolean
  modifications?: string
  annualMileage?: number
  primaryUse?: string
  
  // Claim information
  hasActiveClaim?: boolean
  activeClaimCount?: number
  activeClaim?: {
    id: string
    type: string
    status: string
    createdAt: string
    bookingCode: string
  }
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

const titleStatuses = [
  { value: 'Clean', label: 'Clean Title' },
  { value: 'Salvage', label: 'Salvage Title' },
  { value: 'Rebuilt', label: 'Rebuilt Title' },
  { value: 'Lemon', label: 'Lemon Law Buyback' },
  { value: 'Flood', label: 'Flood Damage' }
]

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
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
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  
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
    insuranceDaily: 25,
    
    // Description
    description: '',
    
    // Registration & Documentation Fields
    registeredOwner: '',
    registrationState: 'AZ',
    registrationExpiryDate: '',
    titleStatus: 'Clean',
    garageAddress: '',
    garageCity: '',
    garageState: 'AZ',
    garageZip: '',
    estimatedValue: 0,
    hasLien: false,
    lienholderName: '',
    lienholderAddress: '',
    hasAlarm: false,
    hasTracking: false,
    hasImmobilizer: false,
    isModified: false,
    modifications: '',
    annualMileage: 12000,
    primaryUse: 'Rental'
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
        const carData = data.car
        setCar(carData)
        setPhotos(carData.photos || [])
        
        // Populate form with existing data
      setFormData({
        make: carData.make,
        model: carData.model,
        year: carData.year,
        trim: carData.trim || '',
        color: carData.color,
        licensePlate: carData.licensePlate || '',
        vin: carData.vin || '',
        carType: carData.carType,
        seats: carData.seats,
        doors: carData.doors,
        transmission: carData.transmission,
        fuelType: carData.fuelType,
        mpgCity: carData.mpgCity || 0,
        mpgHighway: carData.mpgHighway || 0,
        currentMileage: carData.currentMileage || 0,
        dailyRate: carData.dailyRate,
        weeklyRate: carData.weeklyRate || carData.dailyRate * 6.5,
        monthlyRate: carData.monthlyRate || carData.dailyRate * 25,
        weeklyDiscount: carData.weeklyDiscount || 15,
        monthlyDiscount: carData.monthlyDiscount || 30,
        deliveryFee: carData.deliveryFee || 35,
        features: carData.features || [],
        address: carData.address,
        city: carData.city,
        state: carData.state,
        zipCode: carData.zipCode,
        airportPickup: carData.airportPickup,
        hotelDelivery: carData.hotelDelivery,
        homeDelivery: carData.homeDelivery,
        isActive: carData.isActive,
        instantBook: carData.instantBook,
        advanceNotice: carData.advanceNotice,
        minTripDuration: carData.minTripDuration,
        maxTripDuration: carData.maxTripDuration,
        rules: carData.rules || [],
        insuranceIncluded: carData.insuranceIncluded,
        insuranceDaily: carData.insuranceDaily,
        // Description
        description: carData.description || '',
        // ✅ FIXED: Registration fields with proper date formatting
        registeredOwner: carData.registeredOwner || '',
        registrationState: carData.registrationState || 'AZ',
        registrationExpiryDate: carData.registrationExpiryDate 
          ? new Date(carData.registrationExpiryDate).toISOString().split('T')[0]
          : '',
        titleStatus: carData.titleStatus || 'Clean',
        garageAddress: carData.garageAddress || '',
        garageCity: carData.garageCity || '',
        garageState: carData.garageState || 'AZ',
        garageZip: carData.garageZip || '',
        estimatedValue: carData.estimatedValue || 0,
        hasLien: carData.hasLien || false,
        lienholderName: carData.lienholderName || '',
        lienholderAddress: carData.lienholderAddress || '',
        hasAlarm: carData.hasAlarm || false,
        hasTracking: carData.hasTracking || false,
        hasImmobilizer: carData.hasImmobilizer || false,
        isModified: carData.isModified || false,
        modifications: carData.modifications || '',
        annualMileage: carData.annualMileage || 12000,
        primaryUse: carData.primaryUse || 'Rental'
      })
      } else if (response.status === 404) {
        router.push('/host/cars')
      } else if (response.status === 403) {
        const errorData = await response.json()
        if (errorData.reason === 'ACTIVE_CLAIM') {
          setErrors({ 
            claim: `Cannot edit vehicle - ${errorData.claimCount} active claim${errorData.claimCount > 1 ? 's' : ''}`
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch car details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (car?.hasActiveClaim) {
      alert('Cannot save changes while vehicle has an active claim. Please wait for claim resolution.')
      return
    }

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
        await fetchCarDetails()
      } else {
        const data = await response.json()
        if (data.reason === 'ACTIVE_CLAIM') {
          setErrors({ general: `Cannot edit vehicle - ${data.claimCount} active claim${data.claimCount > 1 ? 's' : ''}` })
        } else {
          setErrors({ general: data.error || 'Failed to update car' })
        }
      }
    } catch (error) {
      console.error('Failed to save car:', error)
      setErrors({ general: 'An error occurred while saving' })
    } finally {
      setSaving(false)
    }
  }

  // ✅ FIXED: Photo upload with type field and multiple file support
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploadingPhoto(true)
    
    try {
      const uploadFormData = new FormData()
      
      // ✅ Support multiple files
      for (let i = 0; i < files.length; i++) {
        uploadFormData.append('file', files[i])
      }
      
      uploadFormData.append('carId', carId)
      uploadFormData.append('type', 'carPhoto')  // ✅ THIS WAS MISSING!
      
      const response = await fetch('/api/host/upload', {
        method: 'POST',
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        },
        body: uploadFormData
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Handle multiple photos response
        if (data.photos && Array.isArray(data.photos)) {
          const newPhotos: CarPhoto[] = data.photos.map((p: any) => ({
            id: p.id,
            url: p.url,
            isHero: p.isHero,
            order: p.order
          }))
          setPhotos([...photos, ...newPhotos])
        } else if (data.photo) {
          // Single photo backward compatibility
          const newPhoto: CarPhoto = {
            id: data.photo.id,
            url: data.photo.url,
            isHero: photos.length === 0,
            order: photos.length
          }
          setPhotos([...photos, newPhoto])
        }
      } else {
        const errorData = await response.json()
        console.error('Upload failed:', errorData.error)
        alert(errorData.error || 'Failed to upload photo')
      }
    } catch (error) {
      console.error('Failed to upload photo:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
      // Reset the input so the same file can be uploaded again if needed
      e.target.value = ''
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
    if (car?.hasActiveClaim) return
    
    setFormData({
      ...formData,
      features: formData.features.includes(feature)
        ? formData.features.filter(f => f !== feature)
        : [...formData.features, feature]
    })
  }

  const toggleRule = (rule: string) => {
    if (car?.hasActiveClaim) return
    
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
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

  const isLocked = car.hasActiveClaim || false

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
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
                  {isLocked && <IoLockClosedOutline className="inline w-6 h-6 mr-2 text-red-500" />}
                  Edit {formData.year} {formData.make} {formData.model}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{car.totalTrips} trips completed</span>
                  <span>⭐ {car.rating.toFixed(1)} rating</span>
                </div>
              </div>
              
              <button
                onClick={handleSave}
                disabled={saving || isLocked}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isLocked
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } ${saving ? 'opacity-50' : ''}`}
              >
                {isLocked ? (
                  <>
                    <IoLockClosedOutline className="w-5 h-5" />
                    Locked
                  </>
                ) : (
                  <>
                    <IoSaveOutline className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Claim Warning Banner */}
          {isLocked && car.activeClaim && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <IoShieldOutline className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                    Vehicle Editing Locked - Active Claim
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                    This vehicle cannot be edited while a claim is active. All form fields are read-only until the claim is resolved.
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 p-3 mb-3">
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Claim Status:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {car.activeClaim.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Booking:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {car.activeClaim.bookingCode}
                        </span>
                      </div>
                      {car.activeClaimCount && car.activeClaimCount > 1 && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-600 dark:text-gray-400">Total Active Claims:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {car.activeClaimCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/host/claims/${car.activeClaim.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      View Claim Details →
                    </Link>
                    <button
                      onClick={() => router.push('/host/claims')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      View All Claims
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-sm">
              <p className="text-green-700 dark:text-green-300 flex items-center gap-2">
                <IoCheckmarkCircleOutline className="w-5 h-5" />
                {successMessage}
              </p>
            </div>
          )}
          
          {errors.general && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-sm">
              <p className="text-red-700 dark:text-red-300">{errors.general}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
            <div className="flex overflow-x-auto">
              {['details', 'registration', 'pricing', 'photos', 'features', 'availability', 'service'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab === 'registration' ? 'Registration' : tab === 'service' ? 'Service & Maintenance' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Make *
                    </label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.make ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.color ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Vehicle Description</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={isLocked}
                      rows={4}
                      maxLength={2000}
                      placeholder="Describe your vehicle to potential renters. Highlight special features, recent upgrades, or what makes it a great choice..."
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description.length}/2000 characters
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Location</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        disabled={isLocked}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                          errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                        disabled={isLocked}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                          disabled={isLocked}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                          disabled={isLocked}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                            errors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          } ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                        />
                        {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'registration' && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <IoInformationCircleOutline className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                      Registration & Documentation Information
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      This information is required for insurance claims and regulatory compliance. Complete vehicle registration details ensure smooth claim processing and legal compliance with DMV/ADOT requirements.
                    </p>
                  </div>
                </div>

                {isLocked && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Registration information cannot be modified while vehicle has an active claim
                    </p>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Identification & Ownership</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      VIN (Vehicle Identification Number) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                      disabled={isLocked}
                      maxLength={17}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono uppercase ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      placeholder="17-character VIN"
                    />
                    <p className="text-xs text-gray-500 mt-1">Found on vehicle dashboard or door jamb</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      License Plate Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white uppercase ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      placeholder="ABC1234"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State of Registration <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.registrationState}
                      onChange={(e) => setFormData({ ...formData, registrationState: e.target.value })}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                    >
                      {usStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">State where vehicle is registered</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Registration Expiration Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.registrationExpiryDate}
                      onChange={(e) => setFormData({ ...formData, registrationExpiryDate: e.target.value })}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed !bg-gray-50 dark:!bg-gray-900' : ''}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Date shown on registration card</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Registered Owner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.registeredOwner}
                      onChange={(e) => setFormData({ ...formData, registeredOwner: e.target.value })}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      placeholder="Name exactly as shown on title"
                    />
                    <p className="text-xs text-gray-500 mt-1">Must match vehicle title</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.titleStatus}
                      onChange={(e) => setFormData({ ...formData, titleStatus: e.target.value })}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                    >
                      {titleStatuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estimated Vehicle Value <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) })}
                        disabled={isLocked}
                        min="0"
                        step="1000"
                        className={`w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                        placeholder="Current market value"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Current fair market value</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Odometer Reading
                    </label>
                    <input
                      type="number"
                      value={formData.currentMileage}
                      onChange={(e) => setFormData({ ...formData, currentMileage: parseInt(e.target.value) })}
                      disabled={isLocked}
                      min="0"
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      placeholder="Miles"
                    />
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Garage/Storage Location</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Where the vehicle is normally parked overnight (Required for insurance)</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Garage Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.garageAddress}
                        onChange={(e) => setFormData({ ...formData, garageAddress: e.target.value })}
                        disabled={isLocked}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                        placeholder="Where vehicle is parked overnight"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.garageCity}
                        onChange={(e) => setFormData({ ...formData, garageCity: e.target.value })}
                        disabled={isLocked}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.garageState}
                          onChange={(e) => setFormData({ ...formData, garageState: e.target.value })}
                          disabled={isLocked}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                        >
                          {usStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ZIP <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.garageZip}
                          onChange={(e) => setFormData({ ...formData, garageZip: e.target.value })}
                          disabled={isLocked}
                          maxLength={10}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Lien Information</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">If vehicle is financed or leased</p>
                  
                  <div className="space-y-4">
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.hasLien}
                        onChange={(e) => setFormData({ ...formData, hasLien: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Vehicle has a lien (financed/leased)</span>
                    </label>
                    
                    {formData.hasLien && (
                      <div className="ml-7 grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lienholder Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.lienholderName}
                            onChange={(e) => setFormData({ ...formData, lienholderName: e.target.value })}
                            disabled={isLocked}
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                            placeholder="e.g., Chase Auto Finance"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lienholder Address
                          </label>
                          <input
                            type="text"
                            value={formData.lienholderAddress}
                            onChange={(e) => setFormData({ ...formData, lienholderAddress: e.target.value })}
                            disabled={isLocked}
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                            placeholder="Lienholder's mailing address"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Safety & Anti-Theft Features</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">These features may reduce insurance premiums</p>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.hasAlarm}
                        onChange={(e) => setFormData({ ...formData, hasAlarm: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Car Alarm System</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.hasTracking}
                        onChange={(e) => setFormData({ ...formData, hasTracking: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">GPS Tracking Device</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.hasImmobilizer}
                        onChange={(e) => setFormData({ ...formData, hasImmobilizer: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Engine Immobilizer</span>
                    </label>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Vehicle Modifications & Usage</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Primary Use
                      </label>
                      <select
                        value={formData.primaryUse}
                        onChange={(e) => setFormData({ ...formData, primaryUse: e.target.value })}
                        disabled={isLocked}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      >
                        <option value="Rental">Rental Only</option>
                        <option value="Personal">Personal & Rental</option>
                        <option value="Business">Business Use</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Annual Mileage Estimate
                      </label>
                      <input
                        type="number"
                        value={formData.annualMileage}
                        onChange={(e) => setFormData({ ...formData, annualMileage: parseInt(e.target.value) })}
                        disabled={isLocked}
                        min="0"
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                        placeholder="Miles driven per year"
                      />
                    </div>
                    
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.isModified}
                        onChange={(e) => setFormData({ ...formData, isModified: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Vehicle has aftermarket modifications</span>
                    </label>
                    
                    {formData.isModified && (
                      <div className="ml-7">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Describe Modifications
                        </label>
                        <textarea
                          value={formData.modifications}
                          onChange={(e) => setFormData({ ...formData, modifications: e.target.value })}
                          disabled={isLocked}
                          rows={3}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                          placeholder="List modifications (engine, suspension, body kit, etc.)"
                        />
                      </div>
                    )}
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
                        disabled={isLocked}
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                          errors.dailyRate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                        disabled={isLocked}
                        className={`w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                        disabled={isLocked}
                        className={`w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Suggested: ${(formData.dailyRate * 25).toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Delivery Options</h4>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.airportPickup}
                        onChange={(e) => setFormData({ ...formData, airportPickup: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Airport Pickup Available</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.hotelDelivery}
                        onChange={(e) => setFormData({ ...formData, hotelDelivery: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Hotel Delivery Available</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.homeDelivery}
                        onChange={(e) => setFormData({ ...formData, homeDelivery: e.target.checked })}
                        disabled={isLocked}
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
                        disabled={isLocked}
                        className={`w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                  <label className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isLocked
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                  }`}>
                    <IoAddOutline className="w-5 h-5" />
                    {uploadingPhoto ? 'Uploading...' : 'Add Photos'}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto || isLocked}
                    />
                  </label>
                </div>
                
                {isLocked && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Photo uploads are disabled while vehicle has an active claim
                    </p>
                  </div>
                )}
                
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
                        {!isLocked && (
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
                        )}
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
                
                {isLocked && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Features cannot be modified while vehicle has an active claim
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {features.map((feature) => (
                    <label key={feature} className={`flex items-center gap-2 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </label>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Rental Rules</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rules.map((rule) => (
                      <label key={rule} className={`flex items-center gap-2 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="checkbox"
                          checked={formData.rules.includes(rule)}
                          onChange={() => toggleRule(rule)}
                          disabled={isLocked}
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
                
                {isLocked && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Availability settings cannot be modified while vehicle has an active claim
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      disabled={isLocked}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                    />
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Car is Active</span>
                      <p className="text-sm text-gray-500">Make this car available for booking</p>
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.instantBook}
                      onChange={(e) => setFormData({ ...formData, instantBook: e.target.checked })}
                      disabled={isLocked}
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
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
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
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'service' && (
              <div className="space-y-6">
                {/* Header with Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Service & Maintenance History
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Track all vehicle maintenance for compliance and insurance claims
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddServiceModal(true)}
                    disabled={isLocked}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                      isLocked
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <IoAddOutline className="w-5 h-5" />
                    Add Service Record
                  </button>
                </div>

                {/* Lock Warning (if vehicle has active claim) */}
                {isLocked && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                          Service records locked during active claim
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          You cannot add or modify service records while this vehicle has an active insurance claim.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Service Due Alerts */}
                <ServiceDueAlerts carId={carId} />

                {/* Service History List */}
                <ServiceHistoryList carId={carId} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Service Record Modal */}
      {showAddServiceModal && (
        <AddServiceRecordModal
          carId={carId}
          onClose={() => setShowAddServiceModal(false)}
          onSuccess={() => {
            setShowAddServiceModal(false)
            fetchCarDetails()
          }}
        />
      )}

      <Footer />
    </>
  )
}