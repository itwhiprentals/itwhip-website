// app/(guest)/profile/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { IoChevronBackOutline } from 'react-icons/io5'

// Import components
import TabNavigation, { TabType } from './components/TabNavigation'
import ProfileTab from './components/tabs/ProfileTab'
import DocumentsTab from './components/tabs/DocumentsTab'
import InsuranceTab from './components/tabs/InsuranceTab'
import PaymentMethodsTab from './components/tabs/PaymentMethodsTab'
import SecurityTab from './components/tabs/SecurityTab'

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

  // Security
  hasPassword?: boolean
  twoFactorEnabled?: boolean

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

  // Driver License
  driverLicenseNumber?: string
  driverLicenseState?: string
  driverLicenseExpiry?: string

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
      {/* Sticky Header skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 py-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
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
  const t = useTranslations('ProfilePage')
  
  const [profile, setProfile] = useState<GuestProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('account')
  
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
    driverLicenseNumber: '',
    driverLicenseState: '',
    driverLicenseExpiry: '',
    preferredLanguage: 'en',
    preferredCurrency: 'USD',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true
  })

  // Helper to format ISO date to YYYY-MM-DD for date input
  const formatDateForInput = (isoDate: string | undefined | null): string => {
    if (!isoDate) return ''
    try {
      const date = new Date(isoDate)
      return date.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

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
    if (tabParam && ['account', 'documents', 'insurance', 'payment', 'security'].includes(tabParam)) {
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
          dateOfBirth: formatDateForInput(data.profile.dateOfBirth),
          emergencyContactName: data.profile.emergencyContactName || '',
          emergencyContactPhone: data.profile.emergencyContactPhone || '',
          emergencyContactRelation: data.profile.emergencyContactRelation || '',
          driverLicenseNumber: data.profile.driverLicenseNumber || '',
          driverLicenseState: data.profile.driverLicenseState || '',
          driverLicenseExpiry: formatDateForInput(data.profile.driverLicenseExpiry),
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
          alert(t('profileUpdated'))
        }
      } else {
        const data = await response.json()
        alert(data.error || t('failedToUpdate'))
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert(t('failedToUpdate'))
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
          alert(t('settingsSaved'))
        }
      } else {
        alert(t('failedToSaveSettings'))
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert(t('failedToSaveSettings'))
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
          alert(t('photoUpdated'))
        }
      } else {
        alert(t('failedToUploadPhoto'))
      }
    } catch (error) {
      console.error('Failed to upload photo:', error)
      alert(t('failedToUploadPhoto'))
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeactivateInsurance = async () => {
    if (!confirm(t('removeInsuranceConfirm'))) {
      return
    }

    try {
      const response = await fetch('/api/guest/insurance', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        alert(t('insuranceRemoved'))
        fetchProfile()
      } else {
        const data = await response.json()
        alert(data.error || t('failedToRemoveInsurance'))
      }
    } catch (error) {
      console.error('Failed to remove insurance:', error)
      alert(t('failedToRemoveInsurance'))
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('loadingProfile')}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">{t('profileNotFound')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <IoChevronBackOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('profile')}</h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          {activeTab === 'account' && (
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
                dateOfBirth: profile.dateOfBirth,
                driverLicenseNumber: profile.driverLicenseNumber,
                driverLicenseState: profile.driverLicenseState,
                driverLicenseExpiry: profile.driverLicenseExpiry,
                profilePhoto: profile.profilePhoto,
                // Verification status
                emailVerified: profile.emailVerified,
                phoneVerified: profile.phoneVerified,
                // Preferences
                emailNotifications: profile.emailNotifications,
                smsNotifications: profile.smsNotifications,
                pushNotifications: profile.pushNotifications,
                preferredLanguage: profile.preferredLanguage,
                preferredCurrency: profile.preferredCurrency
              }}
              formData={formData}
              editMode={editMode}
              saving={saving}
              uploadingPhoto={uploadingPhoto}
              onEditToggle={() => setEditMode(true)}
              onSave={handleSaveProfile}
              onCancel={() => {
                setEditMode(false)
                fetchProfile()
              }}
              onFormChange={(data) => setFormData({ ...formData, ...data })}
              onPhotoUpload={handlePhotoUpload}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab
              profile={{
                driversLicenseUrl: profile.driversLicenseUrl,
                selfieUrl: profile.selfieUrl,
                documentsVerified: profile.documentsVerified,
                documentVerifiedAt: profile.documentVerifiedAt
              } as any}
              onDocumentUpdate={fetchProfile}
            />
          )}

          {activeTab === 'insurance' && (
            <InsuranceTab />
          )}

          {activeTab === 'payment' && (
            <PaymentMethodsTab />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              userEmail={profile.email}
              userStatus={profile.status}
              deletionScheduledFor={profile.deletionScheduledFor}
              hasPassword={profile.hasPassword}
              twoFactorEnabled={profile.twoFactorEnabled}
              onPasswordSet={fetchProfile}
              onRefresh={fetchProfile}
            />
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