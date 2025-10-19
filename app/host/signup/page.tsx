// app/host/signup/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoPersonOutline,
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLockClosedOutline,
  IoCarSportOutline,
  IoDocumentTextOutline,
  IoCloudUploadOutline,
  IoBusiness,
  IoLocationOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoAddCircleOutline,
  IoTrashOutline,
  IoCameraOutline
} from 'react-icons/io5'

interface VehicleData {
  make: string
  model: string
  year: string
  vin: string
  licensePlate: string
  mileage: string
  photos: File[]
  address: string
  city: string
  state: string
  zipCode: string
}

export default function HostSignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Form data state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: 'AZ',
    zipCode: ''
  })
  
  const [profileData, setProfileData] = useState({
    profilePhoto: null as File | null,
    bio: '',
    languages: '',
    responseTime: '60',
    education: '',
    work: ''
  })
  
  const [documents, setDocuments] = useState({
    governmentId: null as File | null,
    driversLicense: null as File | null,
    insurance: null as File | null,
    backgroundCheckConsent: false
  })
  
  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [hasVehicles, setHasVehicles] = useState<boolean | null>(null)
  
  const [financialInfo, setFinancialInfo] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    taxId: '',
    payoutSchedule: 'weekly'
  })
  
  const [agreements, setAgreements] = useState({
    termsAccepted: false,
    commissionAccepted: false,
    insuranceRequirements: false,
    backgroundCheck: false
  })

  const totalSteps = 6

  const handleAddVehicle = () => {
    setVehicles([...vehicles, {
      make: '',
      model: '',
      year: '',
      vin: '',
      licensePlate: '',
      mileage: '',
      photos: [],
      address: '',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: ''
    }])
  }

  const handleRemoveVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index))
  }

  const updateVehicle = (index: number, field: string, value: any) => {
    const updated = [...vehicles]
    updated[index] = { ...updated[index], [field]: value }
    setVehicles(updated)
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(personalInfo.firstName && personalInfo.lastName && 
                 personalInfo.email && personalInfo.phone && 
                 personalInfo.password && personalInfo.dateOfBirth)
      case 2:
        return !!(profileData.bio && profileData.languages)
      case 3:
        return !!(documents.governmentId && documents.driversLicense && 
                 documents.backgroundCheckConsent)
      case 4:
        if (hasVehicles === null) return false
        if (!hasVehicles) return true
        return vehicles.length > 0 && vehicles.every(v => 
          v.make && v.model && v.year && v.photos.length >= 5
        )
      case 5:
        return !!(financialInfo.bankName && financialInfo.accountNumber && 
                 financialInfo.routingNumber && financialInfo.taxId)
      case 6:
        return Object.values(agreements).every(v => v === true)
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')
    
    // Prepare the data for the API
    const submitData = {
      name: `${personalInfo.firstName} ${personalInfo.lastName}`,
      email: personalInfo.email,
      password: personalInfo.password,
      phone: personalInfo.phone,
      address: personalInfo.address,
      city: personalInfo.city,
      state: personalInfo.state,
      zipCode: personalInfo.zipCode,
      bio: profileData.bio,
      governmentIdUrl: 'pending_upload',
      driversLicenseUrl: 'pending_upload',
      insuranceDocUrl: documents.insurance ? 'pending_upload' : null,
      bankName: financialInfo.bankName,
      accountNumber: financialInfo.accountNumber,
      routingNumber: financialInfo.routingNumber,
      hasVehicle: hasVehicles || false,
      vehicleMake: vehicles[0]?.make || null,
      vehicleModel: vehicles[0]?.model || null,
      vehicleYear: vehicles[0]?.year || null,
      agreeToTerms: agreements.termsAccepted,
      agreeToCommission: agreements.commissionAccepted
    }
    
    try {
      const response = await fetch('/api/host/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }
      
      // Trigger verification email
      await fetch('/api/host/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hostId: data.data.hostId,
          verificationType: 'email'
        })
      })
      
      // Redirect to verification page
      router.push('/verify?message=check-email')
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit application')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Let's start with your basic information</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={personalInfo.password}
                    onChange={(e) => setPersonalInfo({...personalInfo, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  >
                    {showPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => setPersonalInfo({...personalInfo, dateOfBirth: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={personalInfo.city}
                    onChange={(e) => setPersonalInfo({...personalInfo, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State *
                  </label>
                  <select
                    value={personalInfo.state}
                    onChange={(e) => setPersonalInfo({...personalInfo, state: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="AZ">Arizona</option>
                    <option value="CA">California</option>
                    <option value="NV">Nevada</option>
                    <option value="TX">Texas</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={personalInfo.zipCode}
                    onChange={(e) => setPersonalInfo({...personalInfo, zipCode: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Host Profile</h2>
              <p className="text-gray-600 dark:text-gray-400">This information will be shown to guests</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Photo
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {profileData.profilePhoto ? (
                    <img 
                      src={URL.createObjectURL(profileData.profilePhoto)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IoCameraOutline className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setProfileData({...profileData, profilePhoto: e.target.files[0]})
                    }
                  }}
                  className="text-sm dark:text-gray-300"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio * (Tell guests about yourself)
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Share what makes you a great host..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Languages Spoken *
                </label>
                <input
                  type="text"
                  value={profileData.languages}
                  onChange={(e) => setProfileData({...profileData, languages: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="English, Spanish"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Average Response Time
                </label>
                <select
                  value={profileData.responseTime}
                  onChange={(e) => setProfileData({...profileData, responseTime: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="30">Within 30 minutes</option>
                  <option value="60">Within 1 hour</option>
                  <option value="120">Within 2 hours</option>
                  <option value="240">Within 4 hours</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Education (Optional)
                </label>
                <input
                  type="text"
                  value={profileData.education}
                  onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Arizona State University"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Work/Profession (Optional)
                </label>
                <input
                  type="text"
                  value={profileData.work}
                  onChange={(e) => setProfileData({...profileData, work: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Hospitality"
                />
              </div>
            </div>
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Documents</h2>
              <p className="text-gray-600 dark:text-gray-400">Upload required documents for verification</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Government ID (Front & Back) *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setDocuments({...documents, governmentId: e.target.files[0]})
                      }
                    }}
                    className="hidden"
                    id="gov-id"
                  />
                  <label htmlFor="gov-id" className="cursor-pointer">
                    {documents.governmentId ? (
                      <div className="text-green-600 dark:text-green-400">
                        <IoCheckmarkCircle className="w-12 h-12 mx-auto mb-2" />
                        <p>{documents.governmentId.name}</p>
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500">
                        <IoCloudUploadOutline className="w-12 h-12 mx-auto mb-2" />
                        <p>Click to upload Government ID</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Driver's License *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setDocuments({...documents, driversLicense: e.target.files[0]})
                      }
                    }}
                    className="hidden"
                    id="drivers-license"
                  />
                  <label htmlFor="drivers-license" className="cursor-pointer">
                    {documents.driversLicense ? (
                      <div className="text-green-600 dark:text-green-400">
                        <IoCheckmarkCircle className="w-12 h-12 mx-auto mb-2" />
                        <p>{documents.driversLicense.name}</p>
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500">
                        <IoCloudUploadOutline className="w-12 h-12 mx-auto mb-2" />
                        <p>Click to upload Driver's License</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proof of Insurance
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setDocuments({...documents, insurance: e.target.files[0]})
                      }
                    }}
                    className="hidden"
                    id="insurance"
                  />
                  <label htmlFor="insurance" className="cursor-pointer">
                    {documents.insurance ? (
                      <div className="text-green-600 dark:text-green-400">
                        <IoCheckmarkCircle className="w-12 h-12 mx-auto mb-2" />
                        <p>{documents.insurance.name}</p>
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500">
                        <IoCloudUploadOutline className="w-12 h-12 mx-auto mb-2" />
                        <p>Click to upload Insurance (Optional)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={documents.backgroundCheckConsent}
                    onChange={(e) => setDocuments({...documents, backgroundCheckConsent: e.target.checked})}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Background Check Authorization *</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      I authorize ItWhip to conduct a background check for verification purposes. 
                      This may include criminal history, driving records, and identity verification.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )
        
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Vehicle Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Add vehicles you want to list on the platform</p>
            </div>
            
            {hasVehicles === null && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8 text-center">
                <IoCarSportOutline className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Do you have vehicles to list?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">You can add your own vehicles or manage vehicles for others</p>
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setHasVehicles(true)
                      handleAddVehicle()
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Yes, I have vehicles
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasVehicles(false)}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    No, not yet
                  </button>
                </div>
              </div>
            )}
            
            {hasVehicles === false && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                <IoCheckmarkCircle className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No vehicles at this time</h3>
                <p className="text-gray-600 dark:text-gray-400">You can add vehicles later from your dashboard after approval</p>
                <button
                  type="button"
                  onClick={() => {
                    setHasVehicles(true)
                    handleAddVehicle()
                  }}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Actually, I want to add vehicles
                </button>
              </div>
            )}
            
            {hasVehicles === true && (
              <div className="space-y-6">
                {vehicles.map((vehicle, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 relative bg-white dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={() => handleRemoveVehicle(index)}
                      className="absolute top-4 right-4 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <IoTrashOutline className="w-5 h-5" />
                    </button>
                    
                    <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Vehicle {index + 1}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Make *</label>
                        <input
                          type="text"
                          value={vehicle.make}
                          onChange={(e) => updateVehicle(index, 'make', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Toyota"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model *</label>
                        <input
                          type="text"
                          value={vehicle.model}
                          onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Camry"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year *</label>
                        <input
                          type="text"
                          value={vehicle.year}
                          onChange={(e) => updateVehicle(index, 'year', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder="2022"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">VIN</label>
                        <input
                          type="text"
                          value={vehicle.vin}
                          onChange={(e) => updateVehicle(index, 'vin', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License Plate</label>
                        <input
                          type="text"
                          value={vehicle.licensePlate}
                          onChange={(e) => updateVehicle(index, 'licensePlate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Mileage</label>
                        <input
                          type="text"
                          value={vehicle.mileage}
                          onChange={(e) => updateVehicle(index, 'mileage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pickup Location Address *
                      </label>
                      <input
                        type="text"
                        value={vehicle.address}
                        onChange={(e) => updateVehicle(index, 'address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Where guests will pick up the vehicle"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vehicle Photos * (Minimum 5)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            const files = Array.from(e.target.files)
                            updateVehicle(index, 'photos', files)
                          }
                        }}
                        className="w-full dark:text-gray-300"
                      />
                      {vehicle.photos.length > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          {vehicle.photos.length} photos selected
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center"
                >
                  <IoAddCircleOutline className="w-5 h-5 mr-2" />
                  Add Another Vehicle
                </button>
              </div>
            )}
          </div>
        )
        
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Financial Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Set up your payment and tax information</p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> This information is required for payouts and tax reporting. 
                All information is encrypted and securely stored.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={financialInfo.bankName}
                  onChange={(e) => setFinancialInfo({...financialInfo, bankName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Chase Bank"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={financialInfo.accountNumber}
                    onChange={(e) => setFinancialInfo({...financialInfo, accountNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Routing Number *
                  </label>
                  <input
                    type="text"
                    value={financialInfo.routingNumber}
                    onChange={(e) => setFinancialInfo({...financialInfo, routingNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tax ID / SSN * (For 1099 reporting)
                </label>
                <input
                  type="text"
                  value={financialInfo.taxId}
                  onChange={(e) => setFinancialInfo({...financialInfo, taxId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="XXX-XX-XXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Payout Schedule
                </label>
                <select
                  value={financialInfo.payoutSchedule}
                  onChange={(e) => setFinancialInfo({...financialInfo, payoutSchedule: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
        )
        
      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Terms & Agreements</h2>
              <p className="text-gray-600 dark:text-gray-400">Review and accept our terms to complete your application</p>
            </div>
            
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreements.termsAccepted}
                    onChange={(e) => setAgreements({...agreements, termsAccepted: e.target.checked})}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Terms of Service *</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      I have read and agree to the{' '}
                      <Link href="/terms" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                        ItWhip Host Terms of Service
                      </Link>
                    </p>
                  </div>
                </label>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreements.commissionAccepted}
                    onChange={(e) => setAgreements({...agreements, commissionAccepted: e.target.checked})}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Commission Agreement *</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      I understand and agree to the 20% platform commission on all bookings. 
                      This covers payment processing, insurance coordination, customer support, and platform maintenance.
                    </p>
                  </div>
                </label>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreements.insuranceRequirements}
                    onChange={(e) => setAgreements({...agreements, insuranceRequirements: e.target.checked})}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Insurance Requirements *</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      I acknowledge that I must maintain appropriate insurance coverage for all vehicles 
                      listed on the platform and will provide proof of insurance when requested.
                    </p>
                  </div>
                </label>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreements.backgroundCheck}
                    onChange={(e) => setAgreements({...agreements, backgroundCheck: e.target.checked})}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Background Check Authorization *</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      I authorize ItWhip to conduct periodic background checks for the duration of my 
                      participation as a host on the platform.
                    </p>
                  </div>
                </label>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
            {renderStep()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
              )}
              
              <div className="ml-auto">
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!validateStep(currentStep)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!validateStep(currentStep) || isLoading}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}