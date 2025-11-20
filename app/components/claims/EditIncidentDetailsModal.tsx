// app/components/claims/EditIncidentDetailsModal.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoChevronForwardOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCarOutline,
  IoCloudOutline,
  IoShieldOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoMedicalOutline,
} from 'react-icons/io5'

// ✅ Import all nested modals
import EditVehicleConditionModal from '@/app/components/claims/fnol-edit/EditVehicleConditionModal'
import EditIncidentConditionsModal from '@/app/components/claims/fnol-edit/EditIncidentConditionsModal'
import EditPoliceReportModal from '@/app/components/claims/fnol-edit/EditPoliceReportModal'
import EditWitnessesModal from '@/app/components/claims/fnol-edit/EditWitnessesModal'
import EditOtherPartyModal from '@/app/components/claims/fnol-edit/EditOtherPartyModal'
import EditInjuriesModal from '@/app/components/claims/fnol-edit/EditInjuriesModal'

interface EditIncidentDetailsModalProps {
  claimId: string
  currentData: {
    // Vehicle Condition
    odometerAtIncident: number | null
    vehicleDrivable: boolean | null
    vehicleLocation: string | null
    
    // Incident Conditions
    weatherConditions: string | null
    weatherDescription: string | null
    roadConditions: string | null
    roadDescription: string | null
    estimatedSpeed: number | null
    trafficConditions: string | null
    
    // Police Report
    wasPoliceContacted: boolean | null
    policeDepartment: string | null
    officerName: string | null
    officerBadge: string | null
    policeReportNumber: string | null
    policeReportFiled: boolean | null
    policeReportDate: string | null
    
    // Witnesses
    witnesses: Array<{
      name: string
      phone: string
      email: string | null
      statement: string | null
    }>
    
    // Other Party
    otherPartyInvolved: boolean | null
    otherParty: {
      driver: {
        name: string
        phone: string
        license: string | null
        licenseState: string | null
      }
      vehicle: {
        year: number | null
        make: string | null
        model: string | null
        plate: string | null
        vin: string | null
      }
      insurance: {
        carrier: string | null
        policy: string | null
      }
    } | null
    
    // Injuries
    wereInjuries: boolean | null
    injuries: Array<{
      person: string
      description: string
      severity: string
      medicalAttention: boolean
      hospital: string | null
    }>
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditIncidentDetailsModal({
  claimId,
  currentData,
  isOpen,
  onClose,
  onSuccess,
}: EditIncidentDetailsModalProps) {
  // Track which nested modal is open (null = show main list)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Debug log
  useEffect(() => {
    console.log('activeSection changed to:', activeSection)
  }, [activeSection])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !activeSection) {
      onClose()
    }
  }

  // Section preview helpers
  const getVehicleConditionSummary = () => {
    if (!currentData.odometerAtIncident) return 'Not recorded'
    return `${currentData.odometerAtIncident.toLocaleString()} mi • ${
      currentData.vehicleDrivable ? 'Drivable' : 'Not drivable'
    }`
  }

  const getIncidentConditionsSummary = () => {
    if (!currentData.weatherConditions) return 'Not recorded'
    return `${currentData.weatherConditions} • ${currentData.roadConditions || 'Unknown road conditions'}`
  }

  const getPoliceReportSummary = () => {
    if (currentData.wasPoliceContacted === null) return 'Not recorded'
    if (!currentData.wasPoliceContacted) return 'Police not contacted'
    return `${currentData.policeDepartment || 'Police contacted'}${
      currentData.policeReportNumber ? ` • #${currentData.policeReportNumber}` : ''
    }`
  }

  const getWitnessesSummary = () => {
    const count = currentData.witnesses?.length || 0
    if (count === 0) return 'No witnesses'
    return `${count} witness${count !== 1 ? 'es' : ''} recorded`
  }

  const getOtherPartySummary = () => {
    if (currentData.otherPartyInvolved === null) return 'Not recorded'
    if (!currentData.otherPartyInvolved) return 'No other party involved'
    return currentData.otherParty?.driver?.name || 'Other party involved'
  }

  const getInjuriesSummary = () => {
    if (currentData.wereInjuries === null) return 'Not recorded'
    if (!currentData.wereInjuries) return 'No injuries reported'
    const count = currentData.injuries?.length || 0
    return `${count} ${count === 1 ? 'injury' : 'injuries'} reported`
  }

  const handleEditSection = (section: string) => {
    console.log(`Opening section: ${section}`)
    setActiveSection(section)
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        {/* Mobile: Bottom Sheet | Desktop: Centered Modal */}
        <div className={`
          bg-white dark:bg-gray-800 w-full sm:max-w-2xl sm:mx-4
          flex flex-col
          sm:rounded-lg
          rounded-t-2xl sm:rounded-b-lg
          shadow-xl
          max-h-[90vh] sm:max-h-[85vh]
          animate-slide-up sm:animate-none
        `}>
          {/* Mobile drag handle */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Incident Details
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              aria-label="Close"
            >
              <IoCloseOutline className="w-6 h-6" />
            </button>
          </div>

          {/* Content - Scrollable Section List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-3">
              {/* Section 1: Vehicle Condition */}
              <button
                onClick={() => handleEditSection('vehicle-condition')}
                className="w-full p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <IoCarOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                        Vehicle Condition
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {getVehicleConditionSummary()}
                      </div>
                    </div>
                  </div>
                  <IoChevronForwardOutline className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0 ml-2" />
                </div>
              </button>

              {/* Section 2: Incident Conditions */}
              <button
                onClick={() => handleEditSection('incident-conditions')}
                className="w-full p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                      <IoCloudOutline className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                        Incident Conditions
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {getIncidentConditionsSummary()}
                      </div>
                    </div>
                  </div>
                  <IoChevronForwardOutline className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0 ml-2" />
                </div>
              </button>

              {/* Section 3: Police Report */}
              <button
                onClick={() => handleEditSection('police-report')}
                className="w-full p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <IoShieldOutline className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                        Police Report
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {getPoliceReportSummary()}
                      </div>
                    </div>
                  </div>
                  <IoChevronForwardOutline className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0 ml-2" />
                </div>
              </button>

              {/* Section 4: Witnesses */}
              <button
                onClick={() => handleEditSection('witnesses')}
                className="w-full p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <IoPeopleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                        Witnesses
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {getWitnessesSummary()}
                      </div>
                    </div>
                  </div>
                  <IoChevronForwardOutline className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0 ml-2" />
                </div>
              </button>

              {/* Section 5: Other Party */}
              <button
                onClick={() => handleEditSection('other-party')}
                className="w-full p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                      <IoPersonOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                        Other Party Information
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {getOtherPartySummary()}
                      </div>
                    </div>
                  </div>
                  <IoChevronForwardOutline className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0 ml-2" />
                </div>
              </button>

              {/* Section 6: Injuries */}
              <button
                onClick={() => handleEditSection('injuries')}
                className="w-full p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <IoMedicalOutline className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                        Injuries Reported
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {getInjuriesSummary()}
                      </div>
                    </div>
                  </div>
                  <IoChevronForwardOutline className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0 ml-2" />
                </div>
              </button>
            </div>

            {/* Info box */}
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Tip:</strong> Edit each section individually. All changes are tracked and will appear in the claim timeline.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <button
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes slide-up {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
        `}</style>
      </div>

      {/* ✅ Render Nested Modals */}
      {activeSection === 'vehicle-condition' && (
        <EditVehicleConditionModal
          claimId={claimId}
          currentData={{
            odometerAtIncident: currentData.odometerAtIncident,
            vehicleDrivable: currentData.vehicleDrivable,
            vehicleLocation: currentData.vehicleLocation,
          }}
          isOpen={activeSection === 'vehicle-condition'}
          onClose={() => setActiveSection(null)}
          onSuccess={() => {
            setActiveSection(null)
            onSuccess()
          }}
        />
      )}

      {activeSection === 'incident-conditions' && (
        <EditIncidentConditionsModal
          claimId={claimId}
          currentData={{
            weatherConditions: currentData.weatherConditions,
            weatherDescription: currentData.weatherDescription,
            roadConditions: currentData.roadConditions,
            roadDescription: currentData.roadDescription,
            estimatedSpeed: currentData.estimatedSpeed,
            trafficConditions: currentData.trafficConditions,
          }}
          isOpen={activeSection === 'incident-conditions'}
          onClose={() => setActiveSection(null)}
          onSuccess={() => {
            setActiveSection(null)
            onSuccess()
          }}
        />
      )}

      {activeSection === 'police-report' && (
        <EditPoliceReportModal
          claimId={claimId}
          currentData={{
            wasPoliceContacted: currentData.wasPoliceContacted,
            policeDepartment: currentData.policeDepartment,
            officerName: currentData.officerName,
            officerBadge: currentData.officerBadge,
            policeReportNumber: currentData.policeReportNumber,
            policeReportFiled: currentData.policeReportFiled,
            policeReportDate: currentData.policeReportDate,
          }}
          isOpen={activeSection === 'police-report'}
          onClose={() => setActiveSection(null)}
          onSuccess={() => {
            setActiveSection(null)
            onSuccess()
          }}
        />
      )}

      {activeSection === 'witnesses' && (
        <EditWitnessesModal
          claimId={claimId}
          currentData={{
            witnesses: currentData.witnesses,
          }}
          isOpen={activeSection === 'witnesses'}
          onClose={() => setActiveSection(null)}
          onSuccess={() => {
            setActiveSection(null)
            onSuccess()
          }}
        />
      )}

      {activeSection === 'other-party' && (
        <EditOtherPartyModal
          claimId={claimId}
          currentData={{
            otherPartyInvolved: currentData.otherPartyInvolved,
            otherParty: currentData.otherParty,
          }}
          isOpen={activeSection === 'other-party'}
          onClose={() => setActiveSection(null)}
          onSuccess={() => {
            setActiveSection(null)
            onSuccess()
          }}
        />
      )}

      {activeSection === 'injuries' && (
        <EditInjuriesModal
          claimId={claimId}
          currentData={{
            wereInjuries: currentData.wereInjuries,
            injuries: currentData.injuries,
          }}
          isOpen={activeSection === 'injuries'}
          onClose={() => setActiveSection(null)}
          onSuccess={() => {
            setActiveSection(null)
            onSuccess()
          }}
        />
      )}
    </>
  )
}