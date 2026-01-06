// app/(guest)/profile/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoArrowBackOutline } from 'react-icons/io5'

// Import components
import ProfileHeader from './components/ProfileHeader'
import VerificationProgress from './components/VerificationProgress'
import TabNavigation, { TabType } from './components/TabNavigation'
import ProfileTab from './components/tabs/ProfileTab'
import StatusTab from './components/tabs/StatusTab'
import DocumentsTab from './components/tabs/DocumentsTab'
import InsuranceTab from './components/tabs/InsuranceTab'
import PaymentMethodsTab from './components/tabs/PaymentMethodsTab'
import SettingsTab from './components/tabs/SettingsTab'
import ReviewsTab from './components/tabs/ReviewsTab'

interface GuestProfile {
  id: string
  email: string
  name: string
  phone: string
  profilePhoto?: string
  bio?: string
  city?: string
  state?: string
  zipCode?: string
  dateOfBirth?: string

  // Account Status (GDPR)
  status?: 'ACTIVE' | 'PENDING_DELETION' | 'DELETED' | 'SUSPENDED'
  deletionScheduledFor?: string | null

  // Emergency Contact
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string

  // Verification
  emailVerified: boolean
  phoneVerified: boolean
  governmentIdUrl?: string
  governmentIdType?: string
  driversLicenseUrl?: string
  selfieUrl?: string
  documentsVerified: boolean
  documentVerifiedAt?: string
  fullyVerified: boolean
  canInstantBook: boolean

  // Insurance
  insuranceProvider?: string
  insurancePolicyNumber?: string
  insuranceExpires?: string
  insuranceCardUrl?: string
  insuranceVerified: boolean
  insuranceVerifiedAt?: string

  // Stats
  totalTrips: number
  averageRating: number
  loyaltyPoints: number
  memberTier: string
  memberSince: string

  // Preferences
  preferredLanguage: string
  preferredCurrency: string
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
}

// Loading skeleton component
function GuestProfileLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        <div className="animate-pulse space-y-6">
          {/* Back button skeleton */}
          <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          
          {/* Header skeleton */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          
          {/* Profile card skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-4">
              <div className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
          
          {/* Verification progress skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
          
          {/* Tabs skeleton */}
          <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            ))}
          </div>
          
          {/* Content skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main profile content component (uses useSearchParams)
function GuestProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [profile, setProfile] = useState<GuestProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    name: '',
    phone: '',
    bio: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    preferredLanguage: 'en',
    preferredCurrency: 'USD',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true
  })

  // Helper to split name into first/last
  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) return { firstName: parts[0], lastName: '' }
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
  }

  // ✅ FIXED: Fetch profile only once on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  // ✅ FIXED: Handle tab changes separately
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['profile', 'status', 'documents', 'insurance', 'payment', 'settings', 'reviews'].includes(tabParam)) {
      setActiveTab(tabParam as TabType)
    }
  }, [searchParams])

  const fetchProfile = async (retryCount = 0) => {
    try {
      setLoading(true)
      const response = await fetch('/api/guest/profile', {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        // Retry once on server errors (often caused by DB connection issues)
        if (response.status >= 500 && retryCount < 1) {
          console.log('[Profile] Server error, retrying...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchProfile(retryCount + 1)
        }
        const errorText = await response.text()
        console.error('[Profile] API error:', response.status, errorText)
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.profile) {
        setProfile(data.profile)
        // Parse first/last name from full name
        const { firstName, lastName } = splitName(data.profile.name || '')
        setFormData({
          firstName: data.profile.firstName || firstName,
          lastName: data.profile.lastName || lastName,
          name: data.profile.name || '',
          phone: data.profile.phone || '',
          bio: data.profile.bio || '',
          city: data.profile.city || '',
          state: data.profile.state || '',
          zipCode: data.profile.zipCode || '',
          dateOfBirth: data.profile.dateOfBirth || '',
          emergencyContactName: data.profile.emergencyContactName || '',
          emergencyContactPhone: data.profile.emergencyContactPhone || '',
          emergencyContactRelation: data.profile.emergencyContactRelation || '',
          preferredLanguage: data.profile.preferredLanguage || 'en',
          preferredCurrency: data.profile.preferredCurrency || 'USD',
          emailNotifications: data.profile.emailNotifications !== false,
          smsNotifications: data.profile.smsNotifications !== false,
          pushNotifications: data.profile.pushNotifications !== false
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/guest/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.profile) {
          setProfile(data.profile)
          setEditMode(false)
          alert('Profile updated successfully!')
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/guest/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          preferredLanguage: formData.preferredLanguage,
          preferredCurrency: formData.preferredCurrency,
          emailNotifications: formData.emailNotifications,
          smsNotifications: formData.smsNotifications,
          pushNotifications: formData.pushNotifications
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.profile) {
          setProfile(data.profile)
          alert('Settings saved successfully!')
        }
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/guest/profile/photo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.url) {
          setProfile(prev => prev ? { ...prev, profilePhoto: data.url } : null)
          alert('Profile photo updated successfully!')
        }
      } else {
        alert('Failed to upload photo')
      }
    } catch (error) {
      console.error('Failed to upload photo:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeactivateInsurance = async () => {
    if (!confirm('Are you sure you want to remove your insurance? Your deposit amount will increase.')) {
      return
    }

    try {
      const response = await fetch('/api/guest/insurance', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        alert('Insurance removed successfully')
        fetchProfile()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to remove insurance')
      }
    } catch (error) {
      console.error('Failed to remove insurance:', error)
      alert('Failed to remove insurance. Please try again.')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        {/* Page Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 min-h-[44px] active:scale-95 transition-all"
          >
            <IoArrowBackOutline className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
        </div>

        {/* Profile Header */}
        <div className="mb-4">
          <ProfileHeader
            profile={{
              id: profile.id,
              name: profile.name,
              email: profile.email,
              profilePhoto: profile.profilePhoto,
              memberSince: profile.memberSince,
              totalTrips: profile.totalTrips,
              averageRating: profile.averageRating,
              loyaltyPoints: profile.loyaltyPoints,
              memberTier: profile.memberTier,
              fullyVerified: profile.fullyVerified
            }}
            uploadingPhoto={uploadingPhoto}
            onPhotoUpload={handlePhotoUpload}
            canEdit={true}
          />
        </div>

        {/* Verification Progress */}
        <div className="mb-4">
          <VerificationProgress
            documentsVerified={profile.documentsVerified}
            emailVerified={profile.emailVerified}
            phoneVerified={profile.phoneVerified}
            insuranceVerified={profile.insuranceVerified}
            fullyVerified={profile.fullyVerified}
            email={profile.email}
            phone={profile.phone}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-gray-300 dark:border-gray-600 p-4 sm:p-6">
          {activeTab === 'profile' && (
            <ProfileTab
              profile={{
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                bio: profile.bio,
                city: profile.city,
                state: profile.state,
                zipCode: profile.zipCode,
                emergencyContactName: profile.emergencyContactName,
                emergencyContactPhone: profile.emergencyContactPhone,
                emergencyContactRelation: profile.emergencyContactRelation,
                dateOfBirth: profile.dateOfBirth
              }}
              formData={formData}
              editMode={editMode}
              saving={saving}
              onEditToggle={() => setEditMode(true)}
              onSave={handleSaveProfile}
              onCancel={() => {
                setEditMode(false)
                fetchProfile()
              }}
              onFormChange={(data) => setFormData({ ...formData, ...data })}
            />
          )}

          {activeTab === 'status' && (
            <StatusTab guestId={profile.id} />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab
              profile={{
                governmentIdUrl: profile.governmentIdUrl,
                governmentIdType: profile.governmentIdType,
                driversLicenseUrl: profile.driversLicenseUrl,
                selfieUrl: profile.selfieUrl,
                documentsVerified: profile.documentsVerified,
                documentVerifiedAt: profile.documentVerifiedAt
              }}
              onDocumentUpdate={fetchProfile}
            />
          )}

          {activeTab === 'insurance' && (
            <InsuranceTab
              profile={{
                insuranceProvider: profile.insuranceProvider,
                insurancePolicyNumber: profile.insurancePolicyNumber,
                insuranceExpires: profile.insuranceExpires,
                insuranceCardUrl: profile.insuranceCardUrl,
                insuranceVerified: profile.insuranceVerified,
                insuranceVerifiedAt: profile.insuranceVerifiedAt
              }}
              onShowInsuranceForm={(mode) => {
                console.log('Show insurance form:', mode)
              }}
              onDeactivateInsurance={handleDeactivateInsurance}
            />
          )}

          {activeTab === 'payment' && (
            <PaymentMethodsTab />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              profile={{
                preferredLanguage: profile.preferredLanguage,
                preferredCurrency: profile.preferredCurrency,
                emailNotifications: profile.emailNotifications,
                smsNotifications: profile.smsNotifications,
                pushNotifications: profile.pushNotifications
              }}
              formData={formData}
              saving={saving}
              onFormChange={(data) => setFormData({ ...formData, ...data })}
              onSave={handleSaveSettings}
              userEmail={profile.email}
              userStatus={profile.status}
              deletionScheduledFor={profile.deletionScheduledFor}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab />
          )}
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense wrapper
export default function GuestProfilePage() {
  return (
    <Suspense fallback={<GuestProfileLoadingSkeleton />}>
      <GuestProfileContent />
    </Suspense>
  )
}