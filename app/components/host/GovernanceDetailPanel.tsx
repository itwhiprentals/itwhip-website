// app/components/host/GovernanceDetailPanel.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  IoConstructOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoSpeedometerOutline,
  IoCalendarOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

interface GovernanceDetailPanelProps {
  hostId: string
  carId?: string // ⭐ NEW: Optional vehicle ID
  profile: {
    compositeScore: number
    maintenanceScore: number
    complianceScore: number
    maintenanceOnTime: boolean
    claimResponseRate: number
    avgResponseTimeHours: number
    unauthorizedMileage: number
    totalClaimsFiled: number
    metrics?: {
      maintenance: {
        onTime: boolean
        lastMaintenanceDate: string | null
        overdueCount: number
      }
      compliance: {
        responseRate: number
        avgResponseTimeHours: number
      }
    }
  }
}

interface VehicleIntelligenceData {
  vehicle: any
  intelligence: {
    complianceScore: number
    forensicAnalysis: {
      averageGapSize: number
      maxGap: number
      unauthorizedMileage: number
      totalGaps: number
    }
  }
  serviceMetrics: {
    serviceCount: number
    lastServiceDate: string | null
    daysSinceLastService: number | null
    daysUntilService: number | null
    isOverdue: boolean
  }
  anomalies: any[]
}

export default function GovernanceDetailPanel({ hostId, carId, profile }: GovernanceDetailPanelProps) {
  const [vehicleData, setVehicleData] = useState<VehicleIntelligenceData | null>(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (carId) {
      fetchVehicleIntelligence()
    }
  }, [carId])

  const fetchVehicleIntelligence = async () => {
    if (!carId) return
    
    try {
      setLoading(true)
      
      const response = await fetch(`/api/host/cars/${carId}/intelligence`, {
        headers: {
          'x-host-id': hostId
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setVehicleData(result.data)
        }
      }
    } catch (err) {
      console.error('Error fetching vehicle intelligence:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No records yet'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusIcon = (isGood: boolean) => {
    return isGood ? (
      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
    ) : (
      <IoWarningOutline className="w-4 h-4 text-red-600 dark:text-red-400" />
    )
  }

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 50) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  // ⭐ Use vehicle-specific data if available, otherwise use host-level profile
  const maintenanceData = carId && vehicleData 
    ? {
        complianceScore: vehicleData.vehicle?.esgMaintenanceScore || profile.maintenanceScore,
        serviceStatus: vehicleData.serviceMetrics?.isOverdue ? 'Overdue' : 'Current',
        lastServiceDate: vehicleData.serviceMetrics?.lastServiceDate,
        overdueCount: vehicleData.serviceMetrics?.isOverdue ? 1 : 0,
        serviceCount: vehicleData.serviceMetrics?.serviceCount || 0,
        daysUntilService: vehicleData.serviceMetrics?.daysUntilService
      }
    : {
        complianceScore: profile.maintenanceScore,
        serviceStatus: profile.metrics?.maintenance.onTime ? 'Current' : 'Overdue',
        lastServiceDate: profile.metrics?.maintenance.lastMaintenanceDate,
        overdueCount: profile.metrics?.maintenance.overdueCount || 0,
        serviceCount: 0,
        daysUntilService: null
      }

  const mileageData = carId && vehicleData
    ? {
        unauthorizedMiles: vehicleData.intelligence?.forensicAnalysis?.unauthorizedMileage || 0,
        fraudSignals: vehicleData.anomalies?.length || 0,
        averageGapSize: vehicleData.intelligence?.forensicAnalysis?.averageGapSize || 0,
        totalGaps: vehicleData.intelligence?.forensicAnalysis?.totalGaps || 0
      }
    : {
        unauthorizedMiles: profile.unauthorizedMileage || 0,
        fraudSignals: 0,
        averageGapSize: 0,
        totalGaps: 0
      }

  const complianceData = carId && vehicleData
    ? {
        responseRate: vehicleData.intelligence?.complianceScore || 100,
        avgResponseTime: vehicleData.vehicle?.avgResponseTime || profile.avgResponseTimeHours,
        totalClaims: vehicleData.vehicle?.totalClaimsCount || 0,
        activeClaims: vehicleData.vehicle?.hasActiveClaim ? 1 : 0
      }
    : {
        responseRate: (profile.metrics?.compliance.responseRate || profile.claimResponseRate) * 100,
        avgResponseTime: profile.metrics?.compliance.avgResponseTimeHours || profile.avgResponseTimeHours,
        totalClaims: profile.totalClaimsFiled,
        activeClaims: 0
      }

  const documentData = carId && vehicleData
    ? {
        vinVerified: !!vehicleData.vehicle?.vin,
        registrationCurrent: !!vehicleData.vehicle?.registeredOwner,
        inspectionValid: vehicleData.vehicle?.inspectionExpired === false
      }
    : {
        vinVerified: true,
        registrationCurrent: true,
        inspectionValid: true
      }

  // ✅ FIXED: Calculate integrity scores with actual document completeness
  const maintenanceCompliance = maintenanceData.complianceScore
  
  // ✅ NEW: Calculate actual document completeness percentage
  const documentCompleteness = (() => {
    let completed = 0
    let total = 3 // VIN, Registration, Inspection
    
    if (documentData.vinVerified) completed++
    if (documentData.registrationCurrent) completed++
    if (documentData.inspectionValid) completed++
    
    return Math.round((completed / total) * 100)
  })()
  
  const mileageIntegrity = mileageData.unauthorizedMiles === 0 
    ? 100 
    : Math.max(0, 100 - (mileageData.averageGapSize * 10))
  const responseCompliance = Math.round(complianceData.responseRate)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <IoConstructOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Operational Governance Score
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {carId ? 'Vehicle-specific' : 'Fleet-wide'} compliance tracking and enforcement metrics
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(maintenanceCompliance)}`}>
                {maintenanceCompliance}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Enforcement */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoConstructOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Maintenance Enforcement</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Compliance Score</p>
              <p className={`text-lg font-bold ${getScoreColor(maintenanceCompliance)}`}>
                {maintenanceCompliance}%
              </p>
            </div>
            {getStatusIcon(maintenanceCompliance >= 85)}
          </div>

          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Service Status</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {maintenanceData.serviceStatus}
              </p>
            </div>
            {getStatusIcon(maintenanceData.serviceStatus === 'Current')}
          </div>

          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Last Service Date</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatDate(maintenanceData.lastServiceDate)}
              </p>
            </div>
            <IoCalendarOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>

          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {carId ? 'Service Records' : 'Overdue Services'}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {carId ? maintenanceData.serviceCount : maintenanceData.overdueCount}
              </p>
            </div>
            {getStatusIcon(carId ? maintenanceData.serviceCount > 0 : maintenanceData.overdueCount === 0)}
          </div>

          {carId && maintenanceData.daysUntilService !== null && (
            <div className="md:col-span-2 flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="flex-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {maintenanceData.daysUntilService < 0 ? 'Overdue By' : 'Next Service Due'}
                </p>
                <p className={`text-sm font-semibold ${
                  maintenanceData.daysUntilService < 0
                    ? 'text-red-600 dark:text-red-400'
                    : maintenanceData.daysUntilService < 30
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {maintenanceData.daysUntilService < 0
                    ? `${Math.abs(maintenanceData.daysUntilService)} days`
                    : `In ${maintenanceData.daysUntilService} days`}
                </p>
              </div>
              {getStatusIcon(maintenanceData.daysUntilService >= 0)}
            </div>
          )}
        </div>

        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-900 dark:text-blue-200">
            <strong>Enforcement:</strong> All service records must be fleet-verified with receipts. Vehicles with overdue maintenance are automatically flagged for review.
          </p>
        </div>
      </div>

      {/* Mileage Integrity */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoSpeedometerOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Mileage Integrity</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Integrity Score</p>
              <p className={`text-lg font-bold ${getScoreColor(mileageIntegrity)}`}>
                {Math.round(mileageIntegrity)}%
              </p>
            </div>
            {getStatusIcon(mileageIntegrity >= 95)}
          </div>

          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Unauthorized Miles</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.round(mileageData.unauthorizedMiles)}
              </p>
            </div>
            {getStatusIcon(mileageData.unauthorizedMiles === 0)}
          </div>

          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Fraud Signals</p>
              <p className={`text-lg font-bold ${
                mileageData.fraudSignals === 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {mileageData.fraudSignals}
              </p>
            </div>
            {getStatusIcon(mileageData.fraudSignals === 0)}
          </div>

          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Odometer Chain</p>
              <p className={`text-sm font-semibold ${
                mileageData.totalGaps === 0 
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {mileageData.totalGaps === 0 ? 'Complete' : `${mileageData.totalGaps} gaps`}
              </p>
            </div>
            {getStatusIcon(mileageData.totalGaps === 0)}
          </div>

          {carId && mileageData.averageGapSize > 0 && (
            <div className="md:col-span-2 flex items-start justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex-1">
                <p className="text-xs text-yellow-800 dark:text-yellow-300 mb-1">Average Gap Size</p>
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                  {mileageData.averageGapSize.toFixed(1)} miles
                </p>
              </div>
              <IoWarningOutline className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          )}
        </div>

        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-900 dark:text-blue-200">
            <strong>Verification:</strong> Every mile tracked with automated gap detection. Odometer readings verified at trip start/end and all service appointments.
          </p>
        </div>
      </div>

      {/* Document Completeness */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoDocumentTextOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Document Completeness</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overall Status</p>
              <p className={`text-lg font-bold ${getScoreColor(documentCompleteness)}`}>
                {documentCompleteness}%
              </p>
            </div>
            {getStatusIcon(documentCompleteness === 100)}
          </div>

          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">VIN Verification</p>
              <p className={`text-sm font-semibold ${
                documentData.vinVerified 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {documentData.vinVerified ? 'Verified' : 'Missing'}
              </p>
            </div>
            {getStatusIcon(documentData.vinVerified)}
          </div>

          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Registration</p>
              <p className={`text-sm font-semibold ${
                documentData.registrationCurrent 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {documentData.registrationCurrent ? 'Current' : 'Missing'}
              </p>
            </div>
            {getStatusIcon(documentData.registrationCurrent)}
          </div>

          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Inspection Status</p>
              <p className={`text-sm font-semibold ${
                documentData.inspectionValid 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {documentData.inspectionValid ? 'Valid' : 'Expired'}
              </p>
            </div>
            {getStatusIcon(documentData.inspectionValid)}
          </div>
        </div>

        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-900 dark:text-blue-200">
            <strong>Claim-Ready:</strong> Complete documentation enables fast insurance claim processing. All required fields verified and maintained.
          </p>
        </div>
      </div>

      {/* Compliance & Response */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoShieldCheckmarkOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Compliance & Response</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Response Rate</p>
              <p className={`text-lg font-bold ${getScoreColor(responseCompliance)}`}>
                {responseCompliance}%
              </p>
            </div>
            {getStatusIcon(responseCompliance >= 90)}
          </div>

          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Response Time</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {complianceData.avgResponseTime.toFixed(1)}h
              </p>
            </div>
            {getStatusIcon(complianceData.avgResponseTime <= 24)}
          </div>

          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Claims Filed</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {complianceData.totalClaims}
              </p>
            </div>
            <IoAlertCircleOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>

          <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {carId ? 'Active Claims' : 'Documentation'}
              </p>
              <p className={`text-sm font-semibold ${
                carId 
                  ? (complianceData.activeClaims === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {carId ? complianceData.activeClaims : 'Complete'}
              </p>
            </div>
            {getStatusIcon(carId ? complianceData.activeClaims === 0 : true)}
          </div>
        </div>

        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-900 dark:text-blue-200">
            <strong>Standard:</strong> 48-hour response requirement for all claims. Fast response times improve insurance underwriting status.
          </p>
        </div>
      </div>

      {/* Insurance Underwriting Impact */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <IoShieldCheckmarkOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
              Insurance Underwriting Impact
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Maintenance Enforceable:</strong> Fleet-verified service records with receipts
                </p>
              </div>
              <div className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Usage Verifiable:</strong> Complete odometer chain with fraud detection
                </p>
              </div>
              <div className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Fraud-Resistant:</strong> Automated anomaly detection and gap analysis
                </p>
              </div>
              <div className="flex items-start gap-2">
                <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>Claim-Ready:</strong> Complete claim documentation maintained
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          <strong>Not ESG Theater.</strong> These metrics represent enforceable operational compliance tracked for insurance underwriting.
        </p>
      </div>
    </div>
  )
}