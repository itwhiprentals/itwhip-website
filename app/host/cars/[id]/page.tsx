// app/host/cars/[id]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams, useSearchParams } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import VehicleIntelligenceHeader from '@/app/components/host/VehicleIntelligenceHeader'
import MileageForensicsCard from '@/app/components/host/MileageForensicsCard'
import UsageComplianceCard from '@/app/components/host/UsageComplianceCard'
import VehicleESGCard from '@/app/components/host/VehicleESGCard'
import VehicleTabNavigation from './components/VehicleTabNavigation'
import ClaimsFNOLVault from './components/ClaimsFNOLVault'
import DocumentLifecyclePanel from './components/DocumentLifecyclePanel'
import MaintenanceDeepDive from './components/MaintenanceDeepDive'
import AuditTimeline from './components/AuditTimeline'
import PerformanceMetrics from './components/PerformanceMetrics'
// ✅ NEW: Import compliance components
import ComplianceWarningBanner from './components/ComplianceWarningBanner'
import UpdateDeclarationModal from './components/UpdateDeclarationModal'
import { 
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoConstructOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoSpeedometerOutline,
  IoChevronForwardOutline,
  IoInformationCircleOutline,
  IoCarOutline,
  IoLeafOutline,
  IoFlashOutline,
  IoLockClosedOutline,
  IoAlertCircleOutline,
  IoDocumentsOutline,
  IoCameraOutline,
  IoReceiptOutline,
  IoCalendarOutline,
  IoTrendingUpOutline,
  IoPencilOutline,
  IoClipboardOutline,
  IoHelpCircleOutline,
  IoStatsChartOutline,
  IoFingerPrintOutline,
  IoRibbonOutline
} from 'react-icons/io5'

// Import declaration system helpers
import { calculateIntegrityScore } from '@/app/lib/compliance/declaration-helpers'
import { getDeclarationConfig } from '@/app/lib/constants/declarations'
import type { DeclarationType } from '@/app/types/compliance'

interface VehicleIntelligenceData {
  vehicle: any
  intelligence: any
  summary: any
  insuranceImpact: any
  serviceMetrics: any
  timeline: any[]
  anomalies: any[]
  claimsHistory: any[]
  // ✅ NEW: Declaration and earnings tier data
  declaration?: any
  earningsTier?: any
}

interface IntegrityTier {
  label: string
  color: string
  bgClass: string
  borderClass: string
  textClass: string
  icon: any
}

export default function VehicleIntelligencePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const carId = params.id as string
  
  const [data, setData] = useState<VehicleIntelligenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // ✅ NEW: State for declaration modal
  const [showDeclarationModal, setShowDeclarationModal] = useState(false)

  useEffect(() => {
    // Get tab from URL if present
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  useEffect(() => {
    fetchIntelligenceData()
  }, [carId])

  const fetchIntelligenceData = async () => {
    try {
      setLoading(true)
      
      // Get host ID from session
      const sessionResponse = await fetch('/api/host/login', {
        credentials: 'include'
      })
      
      if (!sessionResponse.ok) {
        router.push('/host/login')
        return
      }
      
      const sessionData = await sessionResponse.json()
      const hostId = sessionData.host?.id
      
      if (!hostId) {
        router.push('/host/login')
        return
      }
      
      // Fetch intelligence data
      const response = await fetch(`/api/host/cars/${carId}/intelligence`, {
        headers: {
          'x-host-id': hostId
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch vehicle intelligence')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setData(result.data)
      } else {
        throw new Error('Invalid data format')
      }
    } catch (err) {
      console.error('Error fetching intelligence:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    // Update URL without page reload
    const newUrl = `${window.location.pathname}?tab=${tabId}`
    window.history.pushState({}, '', newUrl)
  }

  // Get integrity tier with static Tailwind classes
  const getIntegrityTier = (score: number): IntegrityTier => {
    if (score >= 90) {
      return { 
        label: 'Excellent', 
        color: 'green',
        bgClass: 'bg-green-50 dark:bg-green-900/20',
        borderClass: 'border-green-200 dark:border-green-800',
        textClass: 'text-green-700 dark:text-green-400',
        icon: IoRibbonOutline
      }
    }
    if (score >= 75) {
      return { 
        label: 'Good', 
        color: 'blue',
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        borderClass: 'border-blue-200 dark:border-blue-800',
        textClass: 'text-blue-700 dark:text-blue-400',
        icon: IoCheckmarkCircleOutline
      }
    }
    if (score >= 60) {
      return { 
        label: 'Fair', 
        color: 'yellow',
        bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderClass: 'border-yellow-200 dark:border-yellow-800',
        textClass: 'text-yellow-700 dark:text-yellow-400',
        icon: IoWarningOutline
      }
    }
    return { 
      label: 'Needs Attention', 
      color: 'red',
      bgClass: 'bg-red-50 dark:bg-red-900/20',
      borderClass: 'border-red-200 dark:border-red-800',
      textClass: 'text-red-700 dark:text-red-400',
      icon: IoAlertCircleOutline
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <div className="animate-pulse">
              <div className="h-24 md:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 md:mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2">
                  <div className="h-64 md:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 md:mb-6"></div>
                  <div className="h-48 md:h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div className="hidden lg:block">
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <div className="text-center py-8 md:py-12">
              <IoWarningOutline className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Unable to Load Vehicle Intelligence
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6">
                {error || 'Something went wrong'}
              </p>
              <button
                onClick={() => router.push('/host/cars')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm md:text-base"
              >
                Back to Fleet
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const { vehicle, intelligence, summary, insuranceImpact, serviceMetrics } = data

  // Calculate integrity score using declaration system
  const declaration = (vehicle.primaryUse || 'Rental') as DeclarationType
  const averageGap = intelligence.forensicAnalysis?.averageGapSize || 0
  const complianceScore = intelligence.complianceScore || 50
  const hasActiveClaim = vehicle.hasActiveClaim || false

  // Use the new calculation function
  const integrityScoreBreakdown = calculateIntegrityScore(
    complianceScore,
    averageGap,
    declaration,
    hasActiveClaim
  )

  const integrityScore = integrityScoreBreakdown.overallScore

  const tier = getIntegrityTier(integrityScore)
  const TierIcon = tier.icon

  // ✅ NEW: Get declaration config for compliance check
  const declarationConfig = getDeclarationConfig(declaration)
  const isNonCompliant = averageGap > declarationConfig.maxGap

  // ✅ FIXED: Calculate correct tier display from insurance type
  const getTierDisplay = () => {
    const insuranceType = vehicle.insuranceType || 'none'
    
    // Normalize insurance type (handle different cases)
    const normalizedType = insuranceType.toLowerCase()
    
    if (normalizedType === 'commercial') {
      return { percentage: 90, label: '90% (Commercial)' }
    }
    if (normalizedType === 'p2p') {
      return { percentage: 75, label: '75% (P2P)' }
    }
    return { percentage: 40, label: '40% (Platform)' }
  }

  const tierDisplay = getTierDisplay()

  // ✅ NEW: Find active claim from claims history
  const activeClaim = data.claimsHistory?.find((claim: any) => 
    claim.status === 'PENDING' || 
    claim.status === 'UNDER_REVIEW' ||
    claim.status === 'GUEST_RESPONSE_PENDING'
  )

  // ✅ ADD THIS DEBUG - CRITICAL FOR DIAGNOSIS
  console.log('🚗 CLAIMS DEBUG:', {
    'vehicle.hasActiveClaim': vehicle.hasActiveClaim,
    'data.claimsHistory': data.claimsHistory,
    'activeClaim found?': !!activeClaim,
    'activeClaim': activeClaim,
    'All claim statuses': data.claimsHistory?.map((c: any) => c.status)
  })

  // Calculate badge counts for tabs
  const claimsCount = vehicle.totalClaimsCount || 0
  const documentsExpiring = 0 // TODO: Calculate from document data
  const servicesOverdue = serviceMetrics?.daysUntilService < 0 ? 1 : 0

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          
          {/* 1. Vehicle Identity & Trust Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-4 md:mb-6">
            {/* Mobile Layout */}
            <div className="block lg:hidden">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {vehicle.year} {vehicle.make}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {vehicle.model}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {vehicle.hasActiveClaim && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-xs font-medium flex items-center gap-1 whitespace-nowrap">
                      <IoLockClosedOutline className="w-3 h-3" />
                      Claim
                    </span>
                  )}
                  {vehicle.isActive && !vehicle.hasActiveClaim && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs font-medium flex items-center gap-1 whitespace-nowrap">
                      <IoCheckmarkCircleOutline className="w-3 h-3" />
                      Active
                    </span>
                  )}
                  
                  <div className={`text-center px-2 py-1 rounded ${tier.bgClass} border ${tier.borderClass}`}>
                    <div className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                      {integrityScore}
                    </div>
                    <div className={`text-xs font-medium ${tier.textClass} flex items-center gap-1 justify-center mt-0.5`}>
                      <TierIcon className="w-2.5 h-2.5" />
                      <span className="text-xs">{tier.label}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                {vehicle.licensePlate && (
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {vehicle.licensePlate}
                  </span>
                )}
                {vehicle.vin && (
                  <span className="font-mono">
                    VIN: {vehicle.vin.slice(-8)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <IoCarOutline className="w-3 h-3" />
                  {declaration}
                </span>
                <span className="flex items-center gap-1">
                  <IoShieldCheckmarkOutline className="w-3 h-3" />
                  {tierDisplay.label}
                </span>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  {vehicle.hasActiveClaim && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium flex items-center gap-1">
                      <IoLockClosedOutline className="w-3 h-3" />
                      Claim Lock
                    </span>
                  )}
                  {vehicle.isActive && !vehicle.hasActiveClaim && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium flex items-center gap-1">
                      <IoCheckmarkCircleOutline className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {vehicle.licensePlate && (
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {vehicle.licensePlate}
                    </span>
                  )}
                  {vehicle.vin && (
                    <span className="font-mono text-xs">
                      VIN: {vehicle.vin}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <IoCarOutline className="w-4 h-4" />
                    {declaration}
                  </span>
                  <span className="flex items-center gap-1">
                    <IoShieldCheckmarkOutline className="w-4 h-4" />
                    {tierDisplay.label}
                  </span>
                </div>
              </div>
              
              {/* Integrity Score */}
              <div className="flex items-center gap-4">
                <div className={`text-center p-3 rounded-lg ${tier.bgClass} border ${tier.borderClass}`}>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {integrityScore}
                  </div>
                  <div className={`text-xs font-medium ${tier.textClass} flex items-center gap-1 justify-center mt-1`}>
                    <TierIcon className="w-3 h-3" />
                    {tier.label}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ FIXED: Compliance Warning Banner (shows when non-compliant) */}
          {isNonCompliant && vehicle.totalTrips > 0 && (
            <ComplianceWarningBanner
              carId={carId}
              declaration={declaration}
              actualAvgGap={averageGap}
              allowedGap={declarationConfig.maxGap}
              hasActiveClaim={hasActiveClaim}
              activeClaim={activeClaim}
              earningsTier={tierDisplay.percentage}
              insuranceType={vehicle.insuranceType || 'none'}
              onSuccess={() => fetchIntelligenceData()}
            />
          )}

          {/* Tab Navigation */}
          <VehicleTabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            claimsCount={claimsCount}
            documentsExpiring={documentsExpiring}
            servicesOverdue={servicesOverdue}
          />

          {/* Tab Content */}
          <div className="space-y-4 md:space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                {/* Row 1: ESG & Usage Trust */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <VehicleESGCard carId={carId} />
                  <UsageComplianceCard
                    primaryUse={declaration}
                    complianceScore={intelligence.complianceScore}
                    averageGap={averageGap}
                    maxGap={intelligence.forensicAnalysis?.maxGap || 0}
                    totalTrips={vehicle.totalTrips}
                    insuranceType={vehicle.insuranceType || 'none'}
                    revenueSplit={vehicle.revenueSplit || 40}
                    recommendations={intelligence.recommendations}
                    carId={carId}
                  />
                </div>
                
                {/* Row 2: Mileage Integrity & Maintenance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <MileageForensicsCard
                    analysis={intelligence.forensicAnalysis}
                    primaryUse={declaration}
                    carId={carId}
                  />
                  
                  {/* Maintenance Compliance Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <IoConstructOutline className="w-5 h-5" />
                      Maintenance Compliance
                    </h3>
                    
                    <div className="space-y-4">
                      {serviceMetrics && (
                        <>
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Last Service</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {serviceMetrics.daysSinceLastService ? 
                                `${serviceMetrics.daysSinceLastService} days ago` : 
                                'No records'}
                            </span>
                          </div>
                          
                          {serviceMetrics.daysUntilService !== null && (
                            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Next Service</span>
                              <span className={`text-sm font-medium ${
                                serviceMetrics.daysUntilService < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : serviceMetrics.daysUntilService < 30
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}>
                                {serviceMetrics.daysUntilService < 0
                                  ? `${Math.abs(serviceMetrics.daysUntilService)} days overdue!`
                                  : `In ${serviceMetrics.daysUntilService} days`}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Service Records</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {serviceMetrics.serviceCount || 0} on file
                            </span>
                          </div>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleTabChange('maintenance')}
                        className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        View Full History
                        <IoChevronForwardOutline className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Row 3: Claims & Evidence */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  
                  {/* Claims & Risk Readiness */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <IoShieldCheckmarkOutline className="w-4 h-4 md:w-5 md:h-5" />
                      Claims & Risk Readiness
                    </h3>
                    
                    <div className="space-y-3">
                      {vehicle.hasActiveClaim && (
                        <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-0.5">
                            Active Claim in Progress
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-400">
                            Vehicle editing locked until resolution
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                            {vehicle.totalClaimsCount || 0}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Total Claims</p>
                        </div>
                        
                        <div className="text-center p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                            {insuranceImpact.claimApprovalLikelihood}%
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Approval Rate</p>
                        </div>
                      </div>
                      
                      {insuranceImpact.riskFactors && insuranceImpact.riskFactors.length > 0 && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Risk Factors:
                          </p>
                          <ul className="space-y-1">
                            {insuranceImpact.riskFactors.slice(0, 3).map((risk: string, index: number) => (
                              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                                <span className="text-yellow-500">•</span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleTabChange('claims')}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-xs md:text-sm font-medium"
                      >
                        View Full Claims History
                        <IoChevronForwardOutline className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Evidence Locker Preview */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <IoDocumentsOutline className="w-4 h-4 md:w-5 md:h-5" />
                      Evidence Locker
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2.5 rounded-lg border ${
                        vehicle.vin 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-700'
                      }`}>
                        <IoFingerPrintOutline className={`w-5 h-5 mb-1 ${
                          vehicle.vin ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                        }`} />
                        <p className="text-xs font-medium text-gray-900 dark:text-white">VIN</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 justify-center">
                          {vehicle.vin ? (
                            <>
                              <IoCheckmarkCircleOutline className="w-3 h-3 text-green-600 dark:text-green-400" />
                              Verified
                            </>
                          ) : (
                            'Missing'
                          )}
                        </p>
                      </div>
                      
                      <div className={`p-2.5 rounded-lg border ${
                        vehicle.currentMileage 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-700'
                      }`}>
                        <IoSpeedometerOutline className={`w-5 h-5 mb-1 ${
                          vehicle.currentMileage ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                        }`} />
                        <p className="text-xs font-medium text-gray-900 dark:text-white">Odometer</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {vehicle.currentMileage ? `${vehicle.currentMileage.toLocaleString()} mi` : 'Not recorded'}
                        </p>
                      </div>
                      
                      <div className={`p-2.5 rounded-lg border ${
                        vehicle.inspectionExpired === false 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      }`}>
                        <IoCameraOutline className={`w-5 h-5 mb-1 ${
                          vehicle.inspectionExpired === false ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                        }`} />
                        <p className="text-xs font-medium text-gray-900 dark:text-white">Inspection</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 justify-center">
                          {vehicle.inspectionExpired === false ? (
                            <>
                              <IoCheckmarkCircleOutline className="w-3 h-3 text-green-600 dark:text-green-400" />
                              Current
                            </>
                          ) : (
                            <>
                              <IoWarningOutline className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                              Due
                            </>
                          )}
                        </p>
                      </div>
                      
                      <div className={`p-2.5 rounded-lg border ${
                        serviceMetrics?.serviceCount > 0 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-700'
                      }`}>
                        <IoReceiptOutline className={`w-5 h-5 mb-1 ${
                          serviceMetrics?.serviceCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                        }`} />
                        <p className="text-xs font-medium text-gray-900 dark:text-white">Service</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {serviceMetrics?.serviceCount || 0} records
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleTabChange('documents')}
                      className="w-full mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-xs md:text-sm font-medium"
                    >
                      View All Documents
                      <IoChevronForwardOutline className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>

                {/* Performance Metrics (Overview Summary) */}
                <PerformanceMetrics carId={carId} />
              </>
            )}

            {/* CLAIMS TAB */}
            {activeTab === 'claims' && (
              <ClaimsFNOLVault carId={carId} />
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <DocumentLifecyclePanel carId={carId} />
            )}

            {/* MAINTENANCE TAB */}
            {activeTab === 'maintenance' && (
              <MaintenanceDeepDive carId={carId} />
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <AuditTimeline carId={carId} />
            )}
            
          </div>
        </div>
      </div>
      <Footer />
      
      {/* ✅ FIXED: Declaration Modal */}
      {showDeclarationModal && (
        <UpdateDeclarationModal
          carId={carId}
          currentDeclaration={declaration}
          actualAvgGap={averageGap}
          earningsTier={tierDisplay.percentage}
          insuranceType={vehicle.insuranceType || 'none'}
          hasActiveClaim={hasActiveClaim}
          activeClaim={activeClaim}
          onClose={() => setShowDeclarationModal(false)}
          onSuccess={() => {
            setShowDeclarationModal(false)
            fetchIntelligenceData()
          }}
        />
      )}
    </>
  )
}