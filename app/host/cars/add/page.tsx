// app/host/cars/add/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoCarOutline,
  IoInformationCircleOutline,
  IoLocationOutline,
  IoPricetagOutline,
  IoSettingsOutline,
  IoImageOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoAddOutline,
  IoCloseOutline,
  IoCloudUploadOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline
} from 'react-icons/io5'

interface CarFormData {
  // Basic Info
  make: string
  model: string
  year: number
  trim: string
  color: string
  licensePlate: string
  vin: string
  
  // Specifications
  carType: string
  seats: number
  doors: number
  transmission: string
  fuelType: string
  mpgCity: number
  mpgHighway: number
  currentMileage: number
  
  // Location
  address: string
  city: string
  state: string
  zipCode: string
  
  // Pricing
  dailyRate: number
  weeklyDiscount: number
  monthlyDiscount: number
  
  // Delivery
  airportPickup: boolean
  hotelDelivery: boolean
  homeDelivery: boolean
  airportFee: number
  hotelFee: number
  homeFee: number
  deliveryRadius: number
  
  // Settings
  instantBook: boolean
  advanceNotice: number
  minTripDuration: number
  maxTripDuration: number
  mileageDaily: number
  mileageOverageFee: number
  insuranceIncluded: boolean
  insuranceDaily: number
  
  // Features & Rules
  features: string[]
  rules: string[]
}

interface InsuranceClassification {
  category: string
  riskLevel: string
  estimatedValue: number
  isInsurable: boolean
  insurabilityReason?: string
  requiresManualReview: boolean
}

interface InsuranceEligibility {
  eligible: boolean
  reason?: string
  tier?: string
  dailyRate?: number
  deductible?: number
  requiresManualReview: boolean
  recommendations?: string[]
}

const CAR_TYPES = [
  { value: 'economy', label: 'Economy' },
  { value: 'compact', label: 'Compact' },
  { value: 'midsize', label: 'Midsize' },
  { value: 'fullsize', label: 'Full Size' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'sports', label: 'Sports Car' }
]

const AVAILABLE_FEATURES = [
  'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Backup Camera',
  'GPS Navigation', 'Heated Seats', 'Sunroof', 'Leather Seats',
  'USB Charger', 'Aux Input', 'Cruise Control', 'Keyless Entry',
  'Push Start', 'All-Wheel Drive', 'Third Row Seating'
]

const DEFAULT_RULES = [
  'No smoking', 'Return with same fuel level', 'No pets without prior approval',
  'Must be 21+ to rent', 'Valid driver\'s license required', 'Report any damage immediately'
]

// Helper function to get category label
const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'ECONOMY': 'Economy',
    'STANDARD': 'Standard',
    'PREMIUM': 'Premium',
    'LUXURY': 'Luxury',
    'EXOTIC': 'Exotic',
    'SUPERCAR': 'Supercar'
  }
  return labels[category] || category
}

// Helper function to get risk level styling
const getRiskLevelStyle = (level: string): string => {
  const styles: Record<string, string> = {
    'LOW': 'text-green-600 bg-green-50',
    'MEDIUM': 'text-yellow-600 bg-yellow-50',
    'HIGH': 'text-orange-600 bg-orange-50',
    'EXTREME': 'text-red-600 bg-red-50'
  }
  return styles[level] || 'text-gray-600 bg-gray-50'
}

export default function AddCarPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Access control states
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [canAccess, setCanAccess] = useState(false)

  // Insurance states
  const [checkingInsurance, setCheckingInsurance] = useState(false)
  const [classification, setClassification] = useState<InsuranceClassification | null>(null)
  const [eligibility, setEligibility] = useState<InsuranceEligibility | null>(null)
  
  const [formData, setFormData] = useState<CarFormData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    color: '',
    licensePlate: '',
    vin: '',
    carType: 'midsize',
    seats: 5,
    doors: 4,
    transmission: 'automatic',
    fuelType: 'gas',
    mpgCity: 25,
    mpgHighway: 35,
    currentMileage: 0,
    address: '',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '',
    dailyRate: 75,
    weeklyDiscount: 15,
    monthlyDiscount: 30,
    airportPickup: true,
    hotelDelivery: true,
    homeDelivery: false,
    airportFee: 0,
    hotelFee: 35,
    homeFee: 50,
    deliveryRadius: 10,
    instantBook: true,
    advanceNotice: 2,
    minTripDuration: 1,
    maxTripDuration: 30,
    mileageDaily: 200,
    mileageOverageFee: 3.0,
    insuranceIncluded: false,
    insuranceDaily: 25,
    features: [],
    rules: [...DEFAULT_RULES]
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check if host can access this page (PENDING hosts should use /edit for their signup car)
  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Fetch host profile to check approval status
        const profileRes = await fetch('/api/host/profile', {
          credentials: 'include'
        })

        if (!profileRes.ok) {
          // Not logged in or error - redirect to dashboard
          router.push('/host/dashboard')
          return
        }

        const profileData = await profileRes.json()
        const profile = profileData.profile || profileData
        const approvalStatus = profile.approvalStatus

        // PENDING or NEEDS_ATTENTION hosts cannot add new cars
        // They should complete their signup car first
        if (approvalStatus === 'PENDING' || approvalStatus === 'NEEDS_ATTENTION') {
          // Fetch their existing cars
          const carsRes = await fetch(`/api/host/cars?hostId=${profile.id}`, {
            credentials: 'include'
          })

          if (carsRes.ok) {
            const carsData = await carsRes.json()
            const cars = carsData.cars || carsData.data || []

            if (cars.length > 0) {
              // Redirect to edit their first car
              router.push(`/host/cars/${cars[0].id}/edit`)
              return
            }
          }

          // No cars found - redirect to dashboard
          router.push('/host/dashboard')
          return
        }

        // APPROVED, DECLINED, or other statuses can access
        setCanAccess(true)
      } catch (error) {
        console.error('Error checking access:', error)
        router.push('/host/dashboard')
      } finally {
        setCheckingAccess(false)
      }
    }

    checkAccess()
  }, [router])

  // Check insurance classification when make/model/year changes
  useEffect(() => {
    if (formData.make && formData.model && formData.year) {
      checkInsuranceClassification()
    }
  }, [formData.make, formData.model, formData.year])

  const checkInsuranceClassification = async () => {
    setCheckingInsurance(true)
    try {
      const response = await fetch('/api/insurance/classify-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: formData.make,
          model: formData.model,
          year: formData.year,
          trim: formData.trim
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setClassification(data.classification)
        setEligibility(data.eligibility)
      }
    } catch (error) {
      console.error('Failed to check insurance:', error)
    } finally {
      setCheckingInsurance(false)
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch(step) {
      case 1: // Basic Info
        if (!formData.make) newErrors.make = 'Make is required'
        if (!formData.model) newErrors.model = 'Model is required'
        if (!formData.year || formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
          newErrors.year = 'Valid year is required'
        }
        if (!formData.color) newErrors.color = 'Color is required'
        break
        
      case 2: // Specs & Location
        if (!formData.address) newErrors.address = 'Address is required'
        if (!formData.city) newErrors.city = 'City is required'
        if (!formData.state) newErrors.state = 'State is required'
        if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required'
        break
        
      case 3: // Pricing & Delivery
        if (!formData.dailyRate || formData.dailyRate < 20) {
          newErrors.dailyRate = 'Daily rate must be at least $20'
        }
        break
        
      case 4: // Features & Rules
        if (formData.features.length === 0) {
          newErrors.features = 'Select at least one feature'
        }
        break
        
      case 5: // Photos
        if (photos.length === 0) {
          newErrors.photos = 'At least one photo is required'
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    setUploadingPhotos(true)
    
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'car')
        
        const response = await fetch('/api/host/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const data = await response.json()
          setPhotos(prev => [...prev, data.url])
        }
      }
    } catch (error) {
      console.error('Error uploading photos:', error)
    } finally {
      setUploadingPhotos(false)
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/host/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          photos
        })
      })
      
      if (response.ok) {
        router.push('/host/cars')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add car')
      }
    } catch (error) {
      console.error('Error adding car:', error)
      alert('Failed to add car')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Make *
                </label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                    errors.make ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Toyota"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                    errors.model ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Camry"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
                {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trim
                </label>
                <input
                  type="text"
                  value={formData.trim}
                  onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="LE, XLE, SE"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                    errors.color ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Silver"
                />
                {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  License Plate (partial)
                </label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="ABC-1234"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                VIN (last 4 digits)
              </label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                maxLength={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="1234"
              />
            </div>
            
            {/* Insurance Classification Section */}
            {(classification || checkingInsurance) && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-5 h-5" />
                  Insurance Classification
                </h3>
                
                {checkingInsurance ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent" />
                  </div>
                ) : classification ? (
                  <div className="space-y-4">
                    {/* Classification Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Category</p>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {getCategoryLabel(classification.category)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskLevelStyle(classification.riskLevel)}`}>
                          {classification.riskLevel}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Est. Value</p>
                        <p className="text-sm font-medium">${classification.estimatedValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <div className="flex items-center gap-1">
                          {classification.isInsurable ? (
                            <>
                              <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600">Insurable</span>
                            </>
                          ) : (
                            <>
                              <IoCloseOutline className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-600">Not Insurable</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Warnings or Notes */}
                    {classification.requiresManualReview && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex gap-2">
                          <IoWarningOutline className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Manual Review Required</p>
                            <p className="text-xs text-yellow-700 mt-1">
                              This vehicle requires manual underwriting before insurance can be approved.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {classification.insurabilityReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex gap-2">
                          <IoAlertCircleOutline className="w-5 h-5 text-red-600 flex-shrink-0" />
                          <p className="text-sm text-red-800">{classification.insurabilityReason}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Eligibility Details */}
                    {eligibility && eligibility.eligible && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-green-800 mb-2">Insurance Coverage Available</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-green-600">Tier:</span>
                            <span className="ml-1 font-medium">{eligibility.tier}</span>
                          </div>
                          <div>
                            <span className="text-green-600">Daily Rate:</span>
                            <span className="ml-1 font-medium">${eligibility.dailyRate}/day</span>
                          </div>
                          <div>
                            <span className="text-green-600">Deductible:</span>
                            <span className="ml-1 font-medium">${eligibility.deductible}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Recommendations */}
                    {eligibility?.recommendations && eligibility.recommendations.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-800 mb-2">Recommendations</p>
                        <ul className="space-y-1">
                          {eligibility.recommendations.map((rec, index) => (
                            <li key={index} className="text-xs text-blue-700 flex items-start gap-1">
                              <span>•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Specifications & Location</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Car Type
                </label>
                <select
                  value={formData.carType}
                  onChange={(e) => setFormData({ ...formData, carType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {CAR_TYPES.map(type => (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seats
                </label>
                <input
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                  min="2"
                  max="9"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Doors
                </label>
                <input
                  type="number"
                  value={formData.doors}
                  onChange={(e) => setFormData({ ...formData, doors: parseInt(e.target.value) })}
                  min="2"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fuel Type
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="gas">Gas</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                  <option value="diesel">Diesel</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Mileage
                </label>
                <input
                  type="number"
                  value={formData.currentMileage}
                  onChange={(e) => setFormData({ ...formData, currentMileage: parseInt(e.target.value) })}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pickup Location</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      maxLength={2}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pricing & Delivery</h2>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Base Pricing</h3>
              <div className="grid gap-4 sm:grid-cols-3">
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
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                        errors.dailyRate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="20"
                    />
                  </div>
                  {errors.dailyRate && <p className="text-red-500 text-xs mt-1">{errors.dailyRate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Weekly Discount %
                  </label>
                  <input
                    type="number"
                    value={formData.weeklyDiscount}
                    onChange={(e) => setFormData({ ...formData, weeklyDiscount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="0"
                    max="50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monthly Discount %
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyDiscount}
                    onChange={(e) => setFormData({ ...formData, monthlyDiscount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="0"
                    max="50"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Delivery Options</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.airportPickup}
                      onChange={(e) => setFormData({ ...formData, airportPickup: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Airport Pickup</p>
                      <p className="text-xs text-gray-500">Available at Sky Harbor</p>
                    </label>
                  </div>
                  {formData.airportPickup && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Fee:</span>
                      <div className="relative">
                        <span className="absolute left-2 top-1 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          value={formData.airportFee}
                          onChange={(e) => setFormData({ ...formData, airportFee: parseFloat(e.target.value) })}
                          className="w-20 pl-6 pr-2 py-1 text-sm border border-gray-300 rounded"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hotelDelivery}
                      onChange={(e) => setFormData({ ...formData, hotelDelivery: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Hotel Delivery</p>
                      <p className="text-xs text-gray-500">Deliver to hotels</p>
                    </label>
                  </div>
                  {formData.hotelDelivery && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Fee:</span>
                      <div className="relative">
                        <span className="absolute left-2 top-1 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          value={formData.hotelFee}
                          onChange={(e) => setFormData({ ...formData, hotelFee: parseFloat(e.target.value) })}
                          className="w-20 pl-6 pr-2 py-1 text-sm border border-gray-300 rounded"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.homeDelivery}
                      onChange={(e) => setFormData({ ...formData, homeDelivery: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Home Delivery</p>
                      <p className="text-xs text-gray-500">Deliver to residence</p>
                    </label>
                  </div>
                  {formData.homeDelivery && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Fee:</span>
                      <div className="relative">
                        <span className="absolute left-2 top-1 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          value={formData.homeFee}
                          onChange={(e) => setFormData({ ...formData, homeFee: parseFloat(e.target.value) })}
                          className="w-20 pl-6 pr-2 py-1 text-sm border border-gray-300 rounded"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Delivery Radius (miles)
                  </label>
                  <input
                    type="number"
                    value={formData.deliveryRadius}
                    onChange={(e) => setFormData({ ...formData, deliveryRadius: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </div>
          </div>
        )
        
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Features & Rules</h2>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Car Features</h3>
              <p className="text-sm text-gray-600 mb-3">Select all features available in your car</p>
              {errors.features && <p className="text-red-500 text-sm mb-2">{errors.features}</p>}
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AVAILABLE_FEATURES.map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, features: [...formData.features, feature] })
                        } else {
                          setFormData({ ...formData, features: formData.features.filter(f => f !== feature) })
                        }
                      }}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Rental Rules</h3>
              <p className="text-sm text-gray-600 mb-3">Set rules for your renters</p>
              
              <div className="space-y-2">
                {formData.rules.map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{rule}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        rules: formData.rules.filter((_, i) => i !== index)
                      })}
                      className="text-red-500 hover:text-red-700"
                    >
                      <IoCloseOutline className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom rule"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      e.preventDefault()
                      setFormData({ 
                        ...formData, 
                        rules: [...formData.rules, e.currentTarget.value]
                      })
                      e.currentTarget.value = ''
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Additional Settings</h3>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Instant Book</p>
                    <p className="text-xs text-gray-500">Allow instant bookings without approval</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.instantBook}
                    onChange={(e) => setFormData({ ...formData, instantBook: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </label>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Advance Notice (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.advanceNotice}
                      onChange={(e) => setFormData({ ...formData, advanceNotice: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min="0"
                      max="72"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Daily Mileage Limit
                    </label>
                    <input
                      type="number"
                      value={formData.mileageDaily}
                      onChange={(e) => setFormData({ ...formData, mileageDaily: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min="50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Photos</h2>
            <p className="text-sm text-gray-600">Add at least one photo of your car. First photo will be the main image.</p>
            {errors.photos && <p className="text-red-500 text-sm">{errors.photos}</p>}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={photo}
                    alt={`Car photo ${index + 1}`}
                    width={200}
                    height={150}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {index === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                      Main Photo
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IoCloseOutline className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhotos}
                className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-purple-500 transition-colors"
              >
                {uploadingPhotos ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent" />
                ) : (
                  <>
                    <IoCloudUploadOutline className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500 mt-1">Add Photo</span>
                  </>
                )}
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        )
        
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Review & Confirm</h2>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Car Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Vehicle:</span>
                  <p className="font-medium">{formData.year} {formData.make} {formData.model} {formData.trim}</p>
                </div>
                <div>
                  <span className="text-gray-500">Color:</span>
                  <p className="font-medium">{formData.color}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium">{formData.carType}</p>
                </div>
                <div>
                  <span className="text-gray-500">Transmission:</span>
                  <p className="font-medium">{formData.transmission}</p>
                </div>
              </div>
            </div>
            
            {/* Insurance Summary */}
            {classification && (
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="font-medium text-gray-900">Insurance Classification</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <p className="font-medium">{getCategoryLabel(classification.category)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Risk Level:</span>
                    <p className="font-medium">{classification.riskLevel}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Estimated Value:</span>
                    <p className="font-medium">${classification.estimatedValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Insurance Status:</span>
                    <p className="font-medium">{classification.isInsurable ? 'Eligible' : 'Not Eligible'}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Location</h3>
              <p className="text-sm text-gray-700">
                {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Pricing</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Daily Rate:</span>
                  <p className="font-medium">${formData.dailyRate}/day</p>
                </div>
                <div>
                  <span className="text-gray-500">Weekly Discount:</span>
                  <p className="font-medium">{formData.weeklyDiscount}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Delivery Options</h3>
              <div className="space-y-2 text-sm">
                {formData.airportPickup && (
                  <div className="flex items-center">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mr-2" />
                    Airport Pickup (${formData.airportFee} fee)
                  </div>
                )}
                {formData.hotelDelivery && (
                  <div className="flex items-center">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mr-2" />
                    Hotel Delivery (${formData.hotelFee} fee)
                  </div>
                )}
                {formData.homeDelivery && (
                  <div className="flex items-center">
                    <IoCheckmarkCircleOutline className="w-4 h-4 text-green-500 mr-2" />
                    Home Delivery (${formData.homeFee} fee)
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex">
                <IoInformationCircleOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-amber-800">
                    By listing your car, you agree to our host terms and conditions. 
                    Your car will be visible to renters once submitted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  // Show loading spinner while checking access
  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking access...</p>
        </div>
      </div>
    )
  }

  // Don't render form if access denied (redirect is in progress)
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/host/cars"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <IoArrowBackOutline className="w-5 h-5" />
            Back to Cars
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Car</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            List your car and start earning
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? (
                    <IoCheckmarkCircleOutline className="w-6 h-6" />
                  ) : (
                    step
                  )}
                </div>
                {step < 6 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">Basic</span>
            <span className="text-xs text-gray-600">Specs</span>
            <span className="text-xs text-gray-600">Pricing</span>
            <span className="text-xs text-gray-600">Features</span>
            <span className="text-xs text-gray-600">Photos</span>
            <span className="text-xs text-gray-600">Review</span>
          </div>
        </div>
        
        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            
            <div className="ml-auto">
              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Adding Car...' : 'Add Car'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}