// app/components/claims/fnol-edit/EditOtherPartyModal.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  IoCloseOutline,
  IoSaveOutline,
  IoArrowBackOutline,
  IoAlertCircleOutline,
  IoPersonOutline,
  IoCheckmarkOutline,
  IoCloseCircleOutline,
  IoCallOutline,
  IoCardOutline,
  IoCarOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5'

interface EditOtherPartyModalProps {
  claimId: string
  currentData: {
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
  }
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditOtherPartyModal({
  claimId,
  currentData,
  isOpen,
  onClose,
  onSuccess,
}: EditOtherPartyModalProps) {
  // Form state
  const [otherPartyInvolved, setOtherPartyInvolved] = useState(currentData.otherPartyInvolved ?? false)
  
  // Driver info
  const [driverName, setDriverName] = useState(currentData.otherParty?.driver.name || '')
  const [driverPhone, setDriverPhone] = useState(currentData.otherParty?.driver.phone || '')
  const [driverLicense, setDriverLicense] = useState(currentData.otherParty?.driver.license || '')
  const [licenseState, setLicenseState] = useState(currentData.otherParty?.driver.licenseState || '')
  
  // Vehicle info
  const [vehicleYear, setVehicleYear] = useState(currentData.otherParty?.vehicle.year?.toString() || '')
  const [vehicleMake, setVehicleMake] = useState(currentData.otherParty?.vehicle.make || '')
  const [vehicleModel, setVehicleModel] = useState(currentData.otherParty?.vehicle.model || '')
  const [vehiclePlate, setVehiclePlate] = useState(currentData.otherParty?.vehicle.plate || '')
  const [vehicleVin, setVehicleVin] = useState(currentData.otherParty?.vehicle.vin || '')
  
  // Insurance info
  const [insuranceCarrier, setInsuranceCarrier] = useState(currentData.otherParty?.insurance.carrier || '')
  const [insurancePolicy, setInsurancePolicy] = useState(currentData.otherParty?.insurance.policy || '')

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtherPartyInvolved(currentData.otherPartyInvolved ?? false)
      setDriverName(currentData.otherParty?.driver.name || '')
      setDriverPhone(currentData.otherParty?.driver.phone || '')
      setDriverLicense(currentData.otherParty?.driver.license || '')
      setLicenseState(currentData.otherParty?.driver.licenseState || '')
      setVehicleYear(currentData.otherParty?.vehicle.year?.toString() || '')
      setVehicleMake(currentData.otherParty?.vehicle.make || '')
      setVehicleModel(currentData.otherParty?.vehicle.model || '')
      setVehiclePlate(currentData.otherParty?.vehicle.plate || '')
      setVehicleVin(currentData.otherParty?.vehicle.vin || '')
      setInsuranceCarrier(currentData.otherParty?.insurance.carrier || '')
      setInsurancePolicy(currentData.otherParty?.insurance.policy || '')
      setError('')
      setFieldErrors({})
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, currentData])

  // Validation
  const validate = () => {
    const errors: Record<string, string> = {}

    if (otherPartyInvolved) {
      if (!driverName.trim()) {
        errors.driverName = 'Driver name is required'
      }
      if (!driverPhone.trim()) {
        errors.driverPhone = 'Phone number is required'
      } else if (!/^\+?[\d\s\-\(\)]+$/.test(driverPhone)) {
        errors.driverPhone = 'Invalid phone number format'
      }
      if (vehicleYear && (parseInt(vehicleYear) < 1900 || parseInt(vehicleYear) > new Date().getFullYear() + 1)) {
        errors.vehicleYear = 'Invalid vehicle year'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Check if form has changes
  const hasChanges = () => {
    if (otherPartyInvolved !== (currentData.otherPartyInvolved ?? false)) return true
    
    if (!otherPartyInvolved) return false
    
    return (
      driverName !== (currentData.otherParty?.driver.name || '') ||
      driverPhone !== (currentData.otherParty?.driver.phone || '') ||
      driverLicense !== (currentData.otherParty?.driver.license || '') ||
      licenseState !== (currentData.otherParty?.driver.licenseState || '') ||
      vehicleYear !== (currentData.otherParty?.vehicle.year?.toString() || '') ||
      vehicleMake !== (currentData.otherParty?.vehicle.make || '') ||
      vehicleModel !== (currentData.otherParty?.vehicle.model || '') ||
      vehiclePlate !== (currentData.otherParty?.vehicle.plate || '') ||
      vehicleVin !== (currentData.otherParty?.vehicle.vin || '') ||
      insuranceCarrier !== (currentData.otherParty?.insurance.carrier || '') ||
      insurancePolicy !== (currentData.otherParty?.insurance.policy || '')
    )
  }

  const handleSave = async () => {
    setError('')

    if (!validate()) {
      return
    }

    if (!hasChanges()) {
      setError('No changes detected')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/host/claims/${claimId}/edit-fnol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'other-party',
          data: {
            otherPartyInvolved,
            otherParty: otherPartyInvolved ? {
              driver: {
                name: driverName.trim(),
                phone: driverPhone.trim(),
                license: driverLicense.trim() || null,
                licenseState: licenseState.trim() || null,
              },
              vehicle: {
                year: vehicleYear ? parseInt(vehicleYear) : null,
                make: vehicleMake.trim() || null,
                model: vehicleModel.trim() || null,
                plate: vehiclePlate.trim() || null,
                vin: vehicleVin.trim() || null,
              },
              insurance: {
                carrier: insuranceCarrier.trim() || null,
                policy: insurancePolicy.trim() || null,
              },
            } : null,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update other party information')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error updating other party:', err)
      setError(err.message || 'Failed to update other party information')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (isSaving) return
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60]"
      onClick={handleBackdropClick}
    >
      <div
        className={`
        bg-white dark:bg-gray-800 w-full sm:max-w-3xl sm:mx-4
        flex flex-col
        sm:rounded-lg
        rounded-t-2xl sm:rounded-b-lg
        shadow-xl
        max-h-[85vh] sm:max-h-[75vh]
        animate-slide-up sm:animate-none
      `}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Back"
          >
            <IoArrowBackOutline className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <IoPersonOutline className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Other Party Information
            </h3>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Other Party Involvement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Was another party involved in the incident?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOtherPartyInvolved(true)}
                disabled={isSaving}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    otherPartyInvolved
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <IoCheckmarkOutline
                    className={`w-6 h-6 ${otherPartyInvolved ? 'text-orange-600' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      otherPartyInvolved ? 'text-orange-900 dark:text-orange-200' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Yes, Other Party
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOtherPartyInvolved(false)}
                disabled={isSaving}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    !otherPartyInvolved
                      ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <IoCloseCircleOutline
                    className={`w-6 h-6 ${!otherPartyInvolved ? 'text-gray-600' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      !otherPartyInvolved ? 'text-gray-900 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    No Other Party
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Other Party Details (only if involved) */}
          {otherPartyInvolved && (
            <>
              {/* Driver Information */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IoPersonOutline className="w-4 h-4" />
                  Driver Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Driver Name *
                      </label>
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="e.g., Jane Smith"
                        disabled={isSaving}
                        className={`
                          w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-lg shadow-sm
                          text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                          focus:ring-2 focus:ring-purple-500 focus:border-transparent
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${fieldErrors.driverName ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                        `}
                      />
                      {fieldErrors.driverName && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <IoAlertCircleOutline className="w-4 h-4" />
                          {fieldErrors.driverName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <IoCallOutline className="w-4 h-4" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        placeholder="e.g., (555) 123-4567"
                        disabled={isSaving}
                        className={`
                          w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-lg shadow-sm
                          text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                          focus:ring-2 focus:ring-purple-500 focus:border-transparent
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${fieldErrors.driverPhone ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                        `}
                      />
                      {fieldErrors.driverPhone && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <IoAlertCircleOutline className="w-4 h-4" />
                          {fieldErrors.driverPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <IoCardOutline className="w-4 h-4" />
                        License Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={driverLicense}
                        onChange={(e) => setDriverLicense(e.target.value)}
                        placeholder="e.g., D1234567"
                        disabled={isSaving}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        License State (Optional)
                      </label>
                      <input
                        type="text"
                        value={licenseState}
                        onChange={(e) => setLicenseState(e.target.value)}
                        placeholder="e.g., AZ"
                        maxLength={2}
                        disabled={isSaving}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IoCarOutline className="w-4 h-4" />
                  Vehicle Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Year
                      </label>
                      <input
                        type="number"
                        value={vehicleYear}
                        onChange={(e) => setVehicleYear(e.target.value)}
                        placeholder="2020"
                        disabled={isSaving}
                        className={`
                          w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-lg shadow-sm
                          text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                          focus:ring-2 focus:ring-purple-500 focus:border-transparent
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${fieldErrors.vehicleYear ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                        `}
                      />
                      {fieldErrors.vehicleYear && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <IoAlertCircleOutline className="w-4 h-4" />
                          {fieldErrors.vehicleYear}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Make
                      </label>
                      <input
                        type="text"
                        value={vehicleMake}
                        onChange={(e) => setVehicleMake(e.target.value)}
                        placeholder="Honda"
                        disabled={isSaving}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Model
                      </label>
                      <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        placeholder="Accord"
                        disabled={isSaving}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        License Plate (Optional)
                      </label>
                      <input
                        type="text"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                        placeholder="e.g., ABC1234"
                        disabled={isSaving}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        VIN (Optional)
                      </label>
                      <input
                        type="text"
                        value={vehicleVin}
                        onChange={(e) => setVehicleVin(e.target.value)}
                        placeholder="e.g., 1HGBH41JXMN109186"
                        maxLength={17}
                        disabled={isSaving}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="w-4 h-4" />
                  Insurance Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Insurance Carrier (Optional)
                      </label>
                      <input
                        type="text"
                        value={insuranceCarrier}
                        onChange={(e) => setInsuranceCarrier(e.target.value)}
                        placeholder="e.g., State Farm"
                        disabled={isSaving}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Policy Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={insurancePolicy}
                        onChange={(e) => setInsurancePolicy(e.target.value)}
                        placeholder="e.g., 123456789"
                        disabled={isSaving}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <IoAlertCircleOutline className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Sticky */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges() || isSaving}
            className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <IoSaveOutline className="w-4 h-4" />
                Save Changes
              </>
            )}
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
  )
}