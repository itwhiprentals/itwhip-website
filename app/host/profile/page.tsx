// app/host/profile/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import PendingBanner from '@/app/host/components/PendingBanner'
import InsuranceDetailsForm from '@/app/host/components/InsuranceDetailsForm'
import ViewPolicyModal from '@/app/host/components/ViewPolicyModal'
import { IoArrowBackOutline, IoBuildOutline, IoBanOutline, IoWarningOutline } from 'react-icons/io5'

// Import new components
import ProfileHeader from './components/ProfileHeader'
import TabNavigation, { TabType } from './components/TabNavigation'
import ProfileTab from './components/tabs/ProfileTab'
import DocumentsTab from './components/tabs/DocumentsTab'
import BankingTab from './components/tabs/BankingTab'
import InsuranceTab from './components/tabs/InsuranceTab'
import ClaimsTab from './components/tabs/ClaimsTab'
import SettingsTab from './components/tabs/SettingsTab'

interface HostProfile {
  id: string
  email: string
  name: string
  phone: string
  profilePhoto?: string
  bio?: string
  city: string
  state: string
  zipCode?: string
  
  isVerified: boolean
  verifiedAt?: string
  
  responseTime?: number
  responseRate?: number
  acceptanceRate?: number
  totalTrips: number
  rating: number
  
  governmentIdUrl?: string
  driversLicenseUrl?: string
  insuranceDocUrl?: string
  documentsVerified: boolean
  documentStatuses?: any
  
  bankAccountInfo?: any
  bankVerified: boolean
  
  autoApproveBookings: boolean
  requireDeposit: boolean
  depositAmount: number
  commissionRate: number
  
  // Earnings Tier
  earningsTier?: 'BASIC' | 'STANDARD' | 'PREMIUM'
  usingLegacyInsurance?: boolean
  
  // Platform Insurance (assigned by admin)
  insuranceProviderId?: string
  insuranceProvider?: {
    id: string
    name: string
    type: string
    isActive: boolean
    coverageNotes?: string
    contractStart?: string
    contractEnd?: string
    revenueShare?: number
  }
  insurancePolicyNumber?: string
  insuranceActive?: boolean
  insuranceAssignedAt?: string
  insuranceAssignedBy?: string
  
  // Legacy Host Insurance Fields (for backward compatibility)
  hostInsuranceProvider?: string
  hostPolicyNumber?: string
  hostInsuranceExpires?: string
  hostInsuranceStatus?: 'ACTIVE' | 'PENDING' | 'DEACTIVATED' | 'EXPIRED'
  hostInsuranceDeactivatedAt?: string
  
  // New P2P Insurance Fields
  p2pInsuranceStatus?: string
  p2pInsuranceProvider?: string
  p2pPolicyNumber?: string
  p2pInsuranceExpires?: string
  p2pInsuranceActive?: boolean
  
  // New Commercial Insurance Fields
  commercialInsuranceStatus?: string
  commercialInsuranceProvider?: string
  commercialPolicyNumber?: string
  commercialInsuranceExpires?: string
  commercialInsuranceActive?: boolean
  
  approvalStatus: 'PENDING' | 'NEEDS_ATTENTION' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
  pendingActions?: string[]
  restrictionReasons?: string[]
  suspendedReason?: string
  rejectedReason?: string
  active: boolean
  joinedAt: string
}

interface InsuranceData {
  host: {
    id: string
    name: string
    email: string
    insuranceProvider?: any
    insurancePolicyNumber?: string
    insuranceActive?: boolean
    insuranceAssignedAt?: string
    insuranceAssignedBy?: string
    hostInsuranceProvider?: string
    hostPolicyNumber?: string
    hostInsuranceExpires?: string
    hostInsuranceStatus?: string
  }
  vehicles: any[]
  summary: {
    totalVehicles: number
    coveredVehicles: number
    gapVehicles: number
  }
}

// Loading skeleton component
function ProfileLoadingSkeleton() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="animate-pulse space-y-6">
            {/* Back button skeleton */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
            
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
            
            {/* Tabs skeleton */}
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-t w-24"></div>
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
      <Footer />
    </>
  )
}

// Main profile content component (uses useSearchParams)
function HostProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State management
  const [profile, setProfile] = useState<HostProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  
  // Insurance state
  const [showInsuranceForm, setShowInsuranceForm] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)
  const [insuranceFormMode, setInsuranceFormMode] = useState<'submit' | 'update' | 'reactivate'>('submit')
  const [insuranceData, setInsuranceData] = useState<InsuranceData | null>(null)
  const [loadingInsurance, setLoadingInsurance] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    state: '',
    zipCode: '',
    autoApproveBookings: false,
    requireDeposit: true,
    depositAmount: 500
  })

  // Fetch profile on mount and when tab changes
  useEffect(() => {
    fetchProfile()
    
    const tabParam = searchParams.get('tab')
    if (tabParam && ['profile', 'documents', 'banking', 'insurance', 'claims', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam as TabType)
    }
  }, [searchParams])

  // Fetch insurance data when insurance tab is active
  // Insurance tier selection is required for ALL hosts (including PENDING) to complete verification
  useEffect(() => {
    if (activeTab === 'insurance' && profile?.id) {
      fetchInsuranceData()
    }
  }, [activeTab, profile?.id])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/host/profile', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/host/login')
        }
        return
      }
      
      const data = await response.json()
      setProfile(data.profile)
      setFormData({
        name: data.profile.name || '',
        email: data.profile.email || '',
        phone: data.profile.phone || '',
        bio: data.profile.bio || '',
        city: data.profile.city || '',
        state: data.profile.state || '',
        zipCode: data.profile.zipCode || '',
        autoApproveBookings: data.profile.autoApproveBookings || false,
        requireDeposit: data.profile.requireDeposit !== false,
        depositAmount: data.profile.depositAmount || 500
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInsuranceData = async () => {
    if (!profile?.id) return
    
    setLoadingInsurance(true)
    try {
      const response = await fetch(`/api/fleet/hosts/${profile.id}/insurance`)
      if (response.ok) {
        const data = await response.json()
        setInsuranceData(data)
      }
    } catch (error) {
      console.error('Failed to fetch insurance data:', error)
    } finally {
      setLoadingInsurance(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/host/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setEditMode(false)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const response = await fetch('/api/host/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          autoApproveBookings: formData.autoApproveBookings,
          requireDeposit: formData.requireDeposit,
          depositAmount: formData.depositAmount
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        alert('Settings saved successfully')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSavingSettings(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'profile')
    
    try {
      const response = await fetch('/api/host/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(prev => prev ? { ...prev, profilePhoto: data.url } : null)
      }
    } catch (error) {
      console.error('Failed to upload photo:', error)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleInsuranceSuccess = () => {
    setShowInsuranceForm(false)
    fetchProfile()
    fetchInsuranceData()
  }

  const handleDeactivateInsurance = async () => {
    if (!confirm('Are you sure you want to deactivate your insurance? Platform fee will increase to 60%.')) {
      return
    }

    try {
      const response = await fetch('/api/host/insurance', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        alert('Insurance deactivated successfully')
        fetchProfile()
        fetchInsuranceData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to deactivate insurance')
      }
    } catch (error) {
      console.error('Failed to deactivate insurance:', error)
      alert('Failed to deactivate insurance')
    }
  }

  // Computed values
  const isApproved = profile?.approvalStatus === 'APPROVED'
  const isPending = profile?.approvalStatus === 'PENDING' || profile?.approvalStatus === 'NEEDS_ATTENTION'
  const isSuspended = profile?.approvalStatus === 'SUSPENDED'
  const isRejected = profile?.approvalStatus === 'REJECTED'

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Rejected state
  if (isRejected) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="max-w-3xl mx-auto px-4 py-16">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
              <IoBanOutline className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-3">
                Application Rejected
              </h2>
              <p className="text-red-800 dark:text-red-300 mb-6">
                {profile?.rejectedReason || 'Your host application has been rejected. Please contact support for more information.'}
              </p>
              <button
                onClick={() => router.push('/contact')}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!profile) return null

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Pending Banner */}
          {!isApproved && (
            <PendingBanner 
              approvalStatus={profile.approvalStatus}
              page="profile"
              pendingActions={profile.pendingActions}
              restrictionReasons={profile.restrictionReasons}
              onActionClick={() => setActiveTab('documents')}
            />
          )}

          {/* Suspended Banner */}
          {isSuspended && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <IoWarningOutline className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    Account Suspended
                  </p>
                  <p className="text-xs text-red-800 dark:text-red-300">
                    {profile.suspendedReason || 'Your account has been suspended. Contact support for details.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="mb-4 sm:mb-8">
            <button
              onClick={() => router.push('/host/dashboard')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
            >
              <IoArrowBackOutline className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Host Profile</h1>
              {!editMode && activeTab === 'profile' && !isSuspended && (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white text-sm sm:text-base rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <IoBuildOutline className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Header */}
          <ProfileHeader
            profile={profile}
            uploadingPhoto={uploadingPhoto}
            onPhotoUpload={handlePhotoUpload}
            isSuspended={isSuspended}
            isApproved={isApproved}
          />

          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isApproved={isApproved}
          />

          {/* Tab Content */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
            activeTab === 'banking' ? '' : 'p-4 sm:p-6'
          }`}>
            {activeTab === 'profile' && (
              <ProfileTab
                profile={profile}
                formData={formData}
                editMode={editMode}
                saving={saving}
                isSuspended={isSuspended}
                isApproved={isApproved}
                onEditToggle={() => setEditMode(true)}
                onSave={handleSave}
                onCancel={() => {
                  setEditMode(false)
                  fetchProfile()
                }}
                onFormChange={(data) => setFormData({ ...formData, ...data })}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsTab
                profile={profile}
                isApproved={isApproved}
                isSuspended={isSuspended}
                onDocumentUpdate={fetchProfile}
              />
            )}

            {activeTab === 'banking' && (
              <BankingTab
                profile={profile}
                isApproved={isApproved}
                onTabChange={setActiveTab}
              />
            )}

            {activeTab === 'insurance' && (
              <InsuranceTab
                profile={profile}
                insuranceData={insuranceData}
                loadingInsurance={loadingInsurance}
                isApproved={isApproved}
                onShowPolicyModal={() => setShowPolicyModal(true)}
                onShowInsuranceForm={(mode) => {
                  setInsuranceFormMode(mode)
                  setShowInsuranceForm(true)
                }}
                onDeactivateInsurance={handleDeactivateInsurance}
                onTabChange={setActiveTab}
              />
            )}

            {activeTab === 'claims' && (
              <ClaimsTab
                isApproved={isApproved}
                onFileNewClaim={() => router.push('/host/claims/new')}
                onTabChange={setActiveTab}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                profile={profile}
                formData={formData}
                savingSettings={savingSettings}
                isApproved={isApproved}
                isSuspended={isSuspended}
                onFormChange={(data) => setFormData({ ...formData, ...data })}
                onSave={handleSaveSettings}
              />
            )}
          </div>
        </div>
      </div>

      {/* Insurance Form Modal */}
      {showInsuranceForm && (
        <InsuranceDetailsForm
          isOpen={showInsuranceForm}
          onClose={() => setShowInsuranceForm(false)}
          mode={insuranceFormMode}
          currentData={
            profile.hostInsuranceProvider
              ? {
                  provider: profile.hostInsuranceProvider,
                  policyNumber: profile.hostPolicyNumber || '',
                  expirationDate: profile.hostInsuranceExpires || ''
                }
              : undefined
          }
          onSuccess={handleInsuranceSuccess}
        />
      )}

      {/* Policy View Modal */}
      {showPolicyModal && profile.insuranceProvider && (
        <ViewPolicyModal
          isOpen={showPolicyModal}
          onClose={() => setShowPolicyModal(false)}
          provider={profile.insuranceProvider}
        />
      )}

      <Footer />
    </>
  )
}

// Main page component with Suspense wrapper
export default function HostProfilePage() {
  return (
    <Suspense fallback={<ProfileLoadingSkeleton />}>
      <HostProfileContent />
    </Suspense>
  )
}