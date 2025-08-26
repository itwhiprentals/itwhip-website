// app/(guest)/dashboard/modals/ProfileModal.tsx
// User Profile Modal - Manages user account, preferences, and settings
// Includes payment methods, travel preferences, and loyalty programs

'use client'

import { useState, useEffect } from 'react'
import { 
  IoClose,
  IoPersonOutline,
  IoCardOutline,
  IoAirplaneOutline,
  IoSettingsOutline,
  IoNotificationsOutline,
  IoShieldCheckmark,
  IoLocationOutline,
  IoCalendarOutline,
  IoStarOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoCamera,
  IoPencil,
  IoTrashOutline,
  IoAddCircleOutline,
  IoMailOutline,
  IoCallOutline,
  IoGlobeOutline,
  IoWalletOutline,
  IoBedOutline,
  IoCarOutline,
  IoRestaurantOutline,
  IoLogOutOutline,
  IoDocumentTextOutline,
  IoHelpCircleOutline,
  IoChevronForward
} from 'react-icons/io5'
import { useHotel } from '../components/HotelContext'
import { useRouter } from 'next/navigation'

// Types
interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate?: (userData: UserProfile) => void
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  memberSince: Date
  loyaltyStatus: 'bronze' | 'silver' | 'gold' | 'platinum'
  points: number
  preferences: UserPreferences
  paymentMethods: PaymentMethod[]
  addresses: Address[]
  travelDocuments: TravelDocument[]
  stats: UserStats
}

interface UserPreferences {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    marketing: boolean
  }
  travel: {
    seatPreference: 'window' | 'aisle' | 'middle' | 'none'
    mealPreference: 'regular' | 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'none'
    roomPreference: 'high-floor' | 'low-floor' | 'quiet' | 'none'
    carPreference: 'economy' | 'compact' | 'midsize' | 'fullsize' | 'suv' | 'luxury'
  }
  accessibility: {
    wheelchairAccess: boolean
    visualAssistance: boolean
    hearingAssistance: boolean
  }
  language: string
  currency: string
  theme: 'light' | 'dark' | 'auto'
}

interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'apple' | 'google'
  name: string
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
  isDefault: boolean
}

interface TravelDocument {
  id: string
  type: 'passport' | 'license' | 'id'
  number: string
  expiryDate: Date
  country: string
}

interface UserStats {
  totalBookings: number
  totalSpent: number
  totalSaved: number
  ridesCompleted: number
  nightsStayed: number
  flightsTaken: number
  mealsOrdered: number
  carbonOffset: number
}

type TabType = 'profile' | 'preferences' | 'payment' | 'travel' | 'security' | 'stats'

// Mock user data
const MOCK_USER: UserProfile = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  avatar: undefined,
  memberSince: new Date('2022-01-15'),
  loyaltyStatus: 'gold',
  points: 12450,
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: true
    },
    travel: {
      seatPreference: 'aisle',
      mealPreference: 'regular',
      roomPreference: 'high-floor',
      carPreference: 'midsize'
    },
    accessibility: {
      wheelchairAccess: false,
      visualAssistance: false,
      hearingAssistance: false
    },
    language: 'en',
    currency: 'USD',
    theme: 'auto'
  },
  paymentMethods: [
    {
      id: 'pm-1',
      type: 'card',
      name: 'Personal Card',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: 'pm-2',
      type: 'card',
      name: 'Business Card',
      last4: '5555',
      expiryMonth: 8,
      expiryYear: 2024,
      isDefault: false
    }
  ],
  addresses: [
    {
      id: 'addr-1',
      type: 'home',
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'Phoenix',
      state: 'AZ',
      zip: '85001',
      country: 'USA',
      isDefault: true
    }
  ],
  travelDocuments: [
    {
      id: 'doc-1',
      type: 'passport',
      number: 'A12345678',
      expiryDate: new Date('2028-05-15'),
      country: 'USA'
    }
  ],
  stats: {
    totalBookings: 47,
    totalSpent: 8450.00,
    totalSaved: 1247.50,
    ridesCompleted: 23,
    nightsStayed: 15,
    flightsTaken: 8,
    mealsOrdered: 31,
    carbonOffset: 245.5
  }
}

export default function ProfileModal({
  isOpen,
  onClose,
  onUpdate
}: ProfileModalProps) {
  const router = useRouter()
  const { user } = useHotel()
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [profileData, setProfileData] = useState<UserProfile>(MOCK_USER)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [editedData, setEditedData] = useState<Partial<UserProfile>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Tab configuration
  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: IoPersonOutline },
    { id: 'preferences' as TabType, label: 'Preferences', icon: IoSettingsOutline },
    { id: 'payment' as TabType, label: 'Payment', icon: IoCardOutline },
    { id: 'travel' as TabType, label: 'Travel', icon: IoAirplaneOutline },
    { id: 'security' as TabType, label: 'Security', icon: IoShieldCheckmark },
    { id: 'stats' as TabType, label: 'Stats', icon: IoStarOutline }
  ]

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        handleClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isSaving])

  // Handle close
  const handleClose = () => {
    if (isSaving) return
    
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
      setActiveTab('profile')
      setIsEditing(false)
      setEditedData({})
    }, 300)
  }

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update profile data
      const updatedProfile = { ...profileData, ...editedData }
      setProfileData(updatedProfile)
      
      // Call update callback
      if (onUpdate) {
        onUpdate(updatedProfile)
      }
      
      // Show success
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      // Exit edit mode
      setIsEditing(false)
      setEditedData({})
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    // Clear session and redirect
    localStorage.clear()
    router.push('/login')
    handleClose()
  }

  // Get loyalty status color
  const getLoyaltyColor = (status: string) => {
    switch (status) {
      case 'platinum': return 'text-purple-600 bg-purple-100'
      case 'gold': return 'text-yellow-600 bg-yellow-100'
      case 'silver': return 'text-gray-600 bg-gray-200'
      default: return 'text-orange-600 bg-orange-100'
    }
  }

  if (!isOpen) return null

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Avatar and basic info */}
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <IoPersonOutline className="w-10 h-10 text-gray-500" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-1 bg-green-600 text-white rounded-full hover:bg-green-700">
                  <IoCamera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold text-gray-900">{profileData.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLoyaltyColor(profileData.loyaltyStatus)}`}>
                    {profileData.loyaltyStatus.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{profileData.email}</p>
                <p className="text-sm text-gray-600">{profileData.phone}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <IoCalendarOutline className="w-4 h-4 mr-1" />
                  <span>Member since {profileData.memberSince.toLocaleDateString()}</span>
                </div>
              </div>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <IoPencil className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Loyalty points */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Loyalty Points</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {profileData.points.toLocaleString()}
                  </p>
                </div>
                <IoStarOutline className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="mt-3 flex items-center text-sm text-gray-600">
                <span>Next tier: {profileData.loyaltyStatus === 'gold' ? 'Platinum' : 'Gold'}</span>
                <span className="ml-2">({(20000 - profileData.points).toLocaleString()} points needed)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                  style={{ width: `${(profileData.points / 20000) * 100}%` }}
                />
              </div>
            </div>

            {/* Contact information */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editedData.name || profileData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editedData.email || profileData.email}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editedData.phone || profileData.phone}
                    onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <IoMailOutline className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm">{profileData.email}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <IoCallOutline className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm">{profileData.phone}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <IoLocationOutline className="w-5 h-5 mr-3 text-gray-400" />
                  <span className="text-sm">
                    {profileData.addresses[0]?.city}, {profileData.addresses[0]?.state}
                  </span>
                </div>
              </div>
            )}
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            {/* Notification preferences */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Email notifications</span>
                  <input
                    type="checkbox"
                    checked={profileData.preferences.notifications.email}
                    onChange={(e) => {
                      const newPrefs = { ...profileData.preferences }
                      newPrefs.notifications.email = e.target.checked
                      setProfileData({ ...profileData, preferences: newPrefs })
                    }}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Push notifications</span>
                  <input
                    type="checkbox"
                    checked={profileData.preferences.notifications.push}
                    onChange={(e) => {
                      const newPrefs = { ...profileData.preferences }
                      newPrefs.notifications.push = e.target.checked
                      setProfileData({ ...profileData, preferences: newPrefs })
                    }}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">SMS notifications</span>
                  <input
                    type="checkbox"
                    checked={profileData.preferences.notifications.sms}
                    onChange={(e) => {
                      const newPrefs = { ...profileData.preferences }
                      newPrefs.notifications.sms = e.target.checked
                      setProfileData({ ...profileData, preferences: newPrefs })
                    }}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Marketing emails</span>
                  <input
                    type="checkbox"
                    checked={profileData.preferences.notifications.marketing}
                    onChange={(e) => {
                      const newPrefs = { ...profileData.preferences }
                      newPrefs.notifications.marketing = e.target.checked
                      setProfileData({ ...profileData, preferences: newPrefs })
                    }}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                </label>
              </div>
            </div>

            {/* Travel preferences */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Travel Preferences</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seat Preference</label>
                  <select
                    value={profileData.preferences.travel.seatPreference}
                    onChange={(e) => {
                      const newPrefs = { ...profileData.preferences }
                      newPrefs.travel.seatPreference = e.target.value as any
                      setProfileData({ ...profileData, preferences: newPrefs })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="window">Window</option>
                    <option value="aisle">Aisle</option>
                    <option value="middle">Middle</option>
                    <option value="none">No preference</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Preference</label>
                  <select
                    value={profileData.preferences.travel.mealPreference}
                    onChange={(e) => {
                      const newPrefs = { ...profileData.preferences }
                      newPrefs.travel.mealPreference = e.target.value as any
                      setProfileData({ ...profileData, preferences: newPrefs })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="regular">Regular</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="halal">Halal</option>
                    <option value="kosher">Kosher</option>
                    <option value="none">No preference</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Preference</label>
                  <select
                    value={profileData.preferences.travel.roomPreference}
                    onChange={(e) => {
                      const newPrefs = { ...profileData.preferences }
                      newPrefs.travel.roomPreference = e.target.value as any
                      setProfileData({ ...profileData, preferences: newPrefs })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="high-floor">High floor</option>
                    <option value="low-floor">Low floor</option>
                    <option value="quiet">Quiet area</option>
                    <option value="none">No preference</option>
                  </select>
                </div>
              </div>
            </div>

            {/* App preferences */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">App Settings</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <select
                    value={profileData.preferences.theme}
                    onChange={(e) => {
                      const newPrefs = { ...profileData.preferences }
                      newPrefs.theme = e.target.value as any
                      setProfileData({ ...profileData, preferences: newPrefs })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={profileData.preferences.currency}
                    onChange={(e) => {
                      const newPrefs = { ...profileData.preferences }
                      newPrefs.currency = e.target.value
                      setProfileData({ ...profileData, preferences: newPrefs })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-6">
            {/* Payment methods */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Payment Methods</h4>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  <IoAddCircleOutline className="w-5 h-5 inline mr-1" />
                  Add New
                </button>
              </div>
              <div className="space-y-3">
                {profileData.paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <IoCardOutline className="w-5 h-5 text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-600">
                          •••• {method.last4} {method.expiryMonth && `(${method.expiryMonth}/${method.expiryYear})`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Default</span>
                      )}
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing addresses */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Billing Addresses</h4>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  <IoAddCircleOutline className="w-5 h-5 inline mr-1" />
                  Add New
                </button>
              </div>
              <div className="space-y-3">
                {profileData.addresses.map((address) => (
                  <div key={address.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <IoLocationOutline className="w-5 h-5 text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{address.type} Address</p>
                        <p className="text-sm text-gray-600">
                          {address.line1}, {address.city}, {address.state} {address.zip}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {address.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Default</span>
                      )}
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'travel':
        return (
          <div className="space-y-6">
            {/* Travel documents */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Travel Documents</h4>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  <IoAddCircleOutline className="w-5 h-5 inline mr-1" />
                  Add Document
                </button>
              </div>
              <div className="space-y-3">
                {profileData.travelDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <IoDocumentTextOutline className="w-5 h-5 text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{doc.type}</p>
                        <p className="text-sm text-gray-600">
                          {doc.number} • Expires {doc.expiryDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <IoTrashOutline className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequent traveler programs */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Frequent Traveler Programs</h4>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoAirplaneOutline className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="text-sm text-gray-700">Add airline program</span>
                    </div>
                    <IoChevronForward className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoBedOutline className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="text-sm text-gray-700">Add hotel program</span>
                    </div>
                    <IoChevronForward className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoCarOutline className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="text-sm text-gray-700">Add car rental program</span>
                    </div>
                    <IoChevronForward className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            {/* Password */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Password</h4>
              <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Change password</p>
                    <p className="text-xs text-gray-500 mt-1">Last changed 3 months ago</p>
                  </div>
                  <IoChevronForward className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            </div>

            {/* Two-factor authentication */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Two-Factor Authentication</h4>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <IoAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900">Not enabled</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Add an extra layer of security to your account
                    </p>
                    <button className="mt-2 text-sm font-medium text-yellow-900 hover:text-yellow-800">
                      Enable 2FA →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Login activity */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-gray-700">Phoenix, AZ</p>
                    <p className="text-xs text-gray-500">Chrome on Mac • 2 hours ago</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Current</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-gray-700">Los Angeles, CA</p>
                    <p className="text-xs text-gray-500">Safari on iPhone • Yesterday</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-gray-700">New York, NY</p>
                    <p className="text-xs text-gray-500">Chrome on Windows • 3 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account actions */}
            <div className="space-y-2 pt-4 border-t">
              <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center text-gray-700">
                  <IoLogOutOutline className="w-5 h-5 mr-3" />
                  <span className="text-sm">Sign out of all devices</span>
                </div>
              </button>
              <button className="w-full text-left p-3 hover:bg-red-50 rounded-lg transition-colors">
                <div className="flex items-center text-red-600">
                  <IoTrashOutline className="w-5 h-5 mr-3" />
                  <span className="text-sm">Delete account</span>
                </div>
              </button>
            </div>
          </div>
        )

      case 'stats':
        return (
          <div className="space-y-6">
            {/* Lifetime stats */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Lifetime Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Total Bookings</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{profileData.stats.totalBookings}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Total Spent</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    ${profileData.stats.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600">Total Saved</p>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    ${profileData.stats.totalSaved.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600">Carbon Offset</p>
                  <p className="text-xl font-bold text-blue-600 mt-1">
                    {profileData.stats.carbonOffset}kg
                  </p>
                </div>
              </div>
            </div>

            {/* Service breakdown */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Service Usage</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <IoCarOutline className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-sm text-gray-700">Rides Completed</span>
                  </div>
                  <span className="font-medium text-gray-900">{profileData.stats.ridesCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <IoBedOutline className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-sm text-gray-700">Hotel Nights</span>
                  </div>
                  <span className="font-medium text-gray-900">{profileData.stats.nightsStayed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <IoAirplaneOutline className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-sm text-gray-700">Flights Taken</span>
                  </div>
                  <span className="font-medium text-gray-900">{profileData.stats.flightsTaken}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <IoRestaurantOutline className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-sm text-gray-700">Meals Ordered</span>
                  </div>
                  <span className="font-medium text-gray-900">{profileData.stats.mealsOrdered}</span>
                </div>
              </div>
            </div>

            {/* Year overview */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">This Year</h4>
              <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-500">Activity chart coming soon</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isClosing ? 'opacity-0' : 'bg-opacity-50'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className={`w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 ${
            isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}>
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">My Profile</h2>
                <button
                  onClick={handleClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b bg-gray-50">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 max-h-[500px] overflow-y-auto">
              {renderTabContent()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
                >
                  <IoLogOutOutline className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
                
                <div className="flex space-x-3">
                  {isEditing && (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditedData({})
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium disabled:bg-gray-400"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  )}
                  
                  {showSuccess && (
                    <div className="flex items-center text-green-600">
                      <IoCheckmarkCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm">Saved successfully!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}