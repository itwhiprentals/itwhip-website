// app/partner/insurance/page.tsx
// Partner Insurance Settings - Standalone partner insurance management

'use client'

import { useState, useEffect } from 'react'
import {
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoCarOutline,
  IoInformationCircleOutline,
  IoSaveOutline,
  IoRefreshOutline,
  IoCloudUploadOutline,
  IoWarningOutline,
  IoCodeSlashOutline,
  IoLinkOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoSettingsOutline
} from 'react-icons/io5'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface InsuranceSettings {
  hasPartnerInsurance: boolean
  insuranceProvider: string | null
  policyNumber: string | null
  policyExpires: string | null
  coversVehicles: boolean
  coversDuringRentals: boolean
  requireGuestInsurance: boolean
  acknowledgedNoInsurance: boolean
}

interface Stats {
  totalVehicles: number
  vehiclesWithInsurance: number
  vehiclesWithoutInsurance: number
}

interface VehicleInsurance {
  id: string
  make: string
  model: string
  year: number
  photo: string | null
  hasOwnInsurance: boolean
  insuranceProvider: string | null
  policyNumber: string | null
  policyExpires: string | null
  useForRentals: boolean
}

interface VehicleEditForm {
  hasOwnInsurance: boolean
  insuranceProvider: string
  policyNumber: string
  policyExpires: string
  useForRentals: boolean
}

export default function InsurancePage() {
  const t = useTranslations('PartnerInsurance')
  const [stats, setStats] = useState<Stats | null>(null)
  const [vehicles, setVehicles] = useState<VehicleInsurance[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [revenuePath, setRevenuePath] = useState<string | null>(null)
  const [revenueTier, setRevenueTier] = useState<string | null>(null)

  // Vehicle expansion state
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null)
  const [vehicleEditForm, setVehicleEditForm] = useState<VehicleEditForm>({
    hasOwnInsurance: false,
    insuranceProvider: '',
    policyNumber: '',
    policyExpires: '',
    useForRentals: false
  })

  // Form state
  const [hasInsurance, setHasInsurance] = useState(false)
  const [insuranceProvider, setInsuranceProvider] = useState('')
  const [policyNumber, setPolicyNumber] = useState('')
  const [policyExpires, setPolicyExpires] = useState('')
  const [coversVehicles, setCoversVehicles] = useState(false)
  const [coversDuringRentals, setCoversDuringRentals] = useState(false)
  const [acknowledgedNoInsurance, setAcknowledgedNoInsurance] = useState(false)

  // Track which vehicles are covered by partner insurance
  const [coveredVehicleIds, setCoveredVehicleIds] = useState<string[]>([])
  const [rentalCoveredVehicleIds, setRentalCoveredVehicleIds] = useState<string[]>([])

  useEffect(() => {
    fetchInsurance()
    fetchVehicles()
  }, [])

  const fetchInsurance = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/partner/insurance')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)

        // Populate form from API response
        const ins = data.insurance
        setHasInsurance(ins.hasPartnerInsurance || false)
        setInsuranceProvider(ins.insuranceProvider || '')
        setPolicyNumber(ins.policyNumber || '')
        setPolicyExpires(ins.policyExpires?.split('T')[0] || '')
        setCoversVehicles(ins.coversVehicles || false)
        setCoversDuringRentals(ins.coversDuringRentals || false)
        setAcknowledgedNoInsurance(ins.acknowledgedNoInsurance || false)

        // Load covered vehicle IDs
        setCoveredVehicleIds(ins.coveredVehicleIds || [])
        setRentalCoveredVehicleIds(ins.rentalCoveredVehicleIds || [])

        // Load revenue path from API response
        setRevenuePath(data.revenuePath || null)
        setRevenueTier(data.revenueTier || null)
      }
    } catch (error) {
      console.error('Failed to fetch insurance:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/partner/fleet')
      const data = await response.json()

      if (data.success) {
        // Map vehicles to insurance info
        const vehicleInsurance: VehicleInsurance[] = data.vehicles.map((v: any) => {
          let insuranceInfo = null
          if (v.insuranceNotes) {
            try {
              insuranceInfo = JSON.parse(v.insuranceNotes)
            } catch {
              // Invalid JSON
            }
          }
          return {
            id: v.id,
            make: v.make,
            model: v.model,
            year: v.year,
            photo: v.photo,
            hasOwnInsurance: insuranceInfo?.hasOwnInsurance || false,
            insuranceProvider: insuranceInfo?.provider || null,
            policyNumber: insuranceInfo?.policyNumber || null,
            policyExpires: insuranceInfo?.policyExpires || null,
            useForRentals: insuranceInfo?.useForRentals || false
          }
        })
        setVehicles(vehicleInsurance)
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  // Handle expanding a vehicle card
  const handleExpandVehicle = (vehicle: VehicleInsurance) => {
    if (expandedVehicleId === vehicle.id) {
      // Collapse if already expanded
      setExpandedVehicleId(null)
    } else {
      // Expand and populate form
      setExpandedVehicleId(vehicle.id)
      setVehicleEditForm({
        hasOwnInsurance: vehicle.hasOwnInsurance,
        insuranceProvider: vehicle.insuranceProvider || '',
        policyNumber: vehicle.policyNumber || '',
        policyExpires: vehicle.policyExpires?.split('T')[0] || '',
        useForRentals: vehicle.useForRentals
      })
    }
  }

  // Save vehicle insurance
  const handleSaveVehicleInsurance = async (vehicleId: string) => {
    setSavingVehicle(true)
    try {
      const response = await fetch(`/api/partner/fleet/${vehicleId}/insurance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hasOwnInsurance: vehicleEditForm.hasOwnInsurance,
          insuranceProvider: vehicleEditForm.hasOwnInsurance ? vehicleEditForm.insuranceProvider : null,
          policyNumber: vehicleEditForm.hasOwnInsurance ? vehicleEditForm.policyNumber : null,
          policyExpires: vehicleEditForm.hasOwnInsurance && vehicleEditForm.policyExpires ? vehicleEditForm.policyExpires : null,
          useForRentals: vehicleEditForm.hasOwnInsurance ? vehicleEditForm.useForRentals : false
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: t('vehicleInsuranceUpdated') })
        setExpandedVehicleId(null)
        fetchVehicles() // Refresh the list
        fetchInsurance() // Refresh stats
      } else {
        setMessage({ type: 'error', text: data.error || t('failedToUpdateVehicleInsurance') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('failedToUpdateVehicleInsurance') })
    } finally {
      setSavingVehicle(false)
    }
  }

  const handleSave = async () => {
    // Check if there's ANY form of insurance coverage
    const hasPartnerCoverage = hasInsurance && coversDuringRentals && rentalCoveredVehicleIds.length > 0
    const hasAnyVehicleCoverage = vehicles.some(v => v.hasOwnInsurance && v.useForRentals)
    const hasAnyCoverage = hasPartnerCoverage || hasAnyVehicleCoverage

    // Validate - if no coverage anywhere, must acknowledge
    if (!hasAnyCoverage && !acknowledgedNoInsurance) {
      setMessage({ type: 'error', text: t('acknowledgeNoInsurance') })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/partner/insurance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hasPartnerInsurance: hasInsurance,
          insuranceProvider: hasInsurance ? insuranceProvider : null,
          policyNumber: hasInsurance ? policyNumber : null,
          policyExpires: hasInsurance && policyExpires ? policyExpires : null,
          coversVehicles: hasInsurance ? coversVehicles : false,
          coversDuringRentals: hasInsurance ? coversDuringRentals : false,
          // Only require acknowledgment if there's no coverage at all
          acknowledgedNoInsurance: !hasAnyCoverage ? acknowledgedNoInsurance : false,
          // Covered vehicle IDs
          coveredVehicleIds: hasInsurance && coversVehicles ? coveredVehicleIds : [],
          rentalCoveredVehicleIds: hasInsurance && coversDuringRentals ? rentalCoveredVehicleIds : []
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: t('insuranceSettingsSaved') })
        fetchInsurance()
        fetchVehicles() // Refresh to update coverage status
      } else {
        setMessage({ type: 'error', text: data.error || t('failedToSaveSettings') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('failedToSaveSettings') })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <IoShieldCheckmarkOutline className="w-7 h-7 text-orange-600" />
            {t('title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={fetchInsurance}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium text-sm transition-colors"
        >
          <IoRefreshOutline className="w-5 h-5" />
          {t('refresh')}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {message.type === 'success' ? (
            <IoCheckmarkCircleOutline className="w-5 h-5" />
          ) : (
            <IoCloseCircleOutline className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Revenue Path Context Banner */}
      {revenuePath === 'insurance' && !revenueTier && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {t('platformInsuranceBanner')}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {t('platformInsuranceBannerDesc')}
              </p>
              <Link href="/partner/revenue" className="text-xs text-orange-600 dark:text-orange-400 hover:underline mt-2 inline-block">
                {t('setRevenuePathLink')}
              </Link>
            </div>
          </div>
        </div>
      )}
      {revenuePath === 'insurance' && revenueTier === 'p2p' && (
        <div className="mb-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <IoAlertCircleOutline className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                {t('p2pInsuranceBanner')}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                {t('p2pInsuranceBannerDesc')}
              </p>
            </div>
          </div>
        </div>
      )}
      {revenuePath === 'insurance' && revenueTier === 'commercial' && (
        <div className="mb-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <IoAlertCircleOutline className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                {t('commercialInsuranceBanner')}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {t('commercialInsuranceBannerDesc')}
              </p>
            </div>
          </div>
        </div>
      )}
      {revenuePath === 'tiers' && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {t('tiersPathBanner')}
              </p>
            </div>
          </div>
        </div>
      )}
      {!revenuePath && (
        <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <IoInformationCircleOutline className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('noRevenuePathBanner')}
              </p>
              <Link href="/partner/revenue" className="text-xs text-orange-600 dark:text-orange-400 hover:underline mt-1 inline-block">
                {t('setRevenuePathLink')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <IoCarOutline className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalVehicles || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('totalVehicles')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <IoShieldCheckmarkOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              {revenuePath === 'insurance' && !revenueTier ? (
                <>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.totalVehicles || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('platformCovered')}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.vehiclesWithInsurance || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('withVehicleInsurance')}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            {revenuePath === 'insurance' && !revenueTier ? (
              <>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{t('covered')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('rentalCoverage')}</p>
                </div>
              </>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  hasInsurance && coversDuringRentals
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-amber-100 dark:bg-amber-900/30'
                }`}>
                  {hasInsurance && coversDuringRentals ? (
                    <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <p className={`text-lg font-bold ${
                    hasInsurance && coversDuringRentals
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {hasInsurance && coversDuringRentals ? t('covered') : t('notCovered')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('rentalCoverage')}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${revenuePath === 'insurance' && !revenueTier ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Left Column - Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Partner Insurance Toggle */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('yourBusinessInsurance')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('businessInsuranceQuestion')}
            </p>

            {/* Has Insurance Toggle */}
            <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              hasInsurance
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasInsurance}
                    onChange={(e) => {
                      setHasInsurance(e.target.checked)
                      if (!e.target.checked) {
                        setCoversVehicles(false)
                        setCoversDuringRentals(false)
                      }
                    }}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{t('iHaveBusinessInsurance')}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('businessInsuranceDescription')}
                    </p>
                  </div>
                </div>
                {hasInsurance && (
                  <IoCheckmarkCircleOutline className="w-6 h-6 text-green-500" />
                )}
              </div>
            </label>
          </div>

          {/* Insurance Details Form - Only show if has insurance */}
          {hasInsurance && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoDocumentTextOutline className="w-5 h-5" />
                {t('insurancePolicyDetails')}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('insuranceProviderLabel')}
                    </label>
                    <input
                      type="text"
                      value={insuranceProvider}
                      onChange={(e) => setInsuranceProvider(e.target.value)}
                      placeholder={t('insuranceProviderPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('policyNumberLabel')}
                    </label>
                    <input
                      type="text"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      placeholder={t('policyNumberPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('policyExpirationDate')}
                  </label>
                  <input
                    type="date"
                    value={policyExpires}
                    onChange={(e) => setPolicyExpires(e.target.value)}
                    className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Document Upload - Placeholder for future */}
                <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                  <IoCloudUploadOutline className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('documentUploadComingSoon')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('uploadCertificateNote')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Coverage Options - Only show if has insurance */}
          {hasInsurance && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('coverageOptions')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('coverageOptionsDescription')}
              </p>

              <div className="space-y-6">
                {/* Covers Vehicles */}
                <div className={`rounded-lg transition-colors ${
                  coversVehicles
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
                }`}>
                  <label className="flex items-center justify-between p-4 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={coversVehicles}
                        onChange={(e) => {
                          setCoversVehicles(e.target.checked)
                          if (!e.target.checked) {
                            setCoveredVehicleIds([])
                          }
                        }}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('coversMyVehicles')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('coversMyVehiclesDescription')}
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Vehicle selection for Covers Vehicles */}
                  {coversVehicles && vehicles.length > 0 && (
                    <div className="px-4 pb-4">
                      <div className="border-t border-blue-200 dark:border-blue-800 pt-3 mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('selectCoveredVehicles')}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (coveredVehicleIds.length === vehicles.length) {
                                setCoveredVehicleIds([])
                              } else {
                                setCoveredVehicleIds(vehicles.map(v => v.id))
                              }
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            {coveredVehicleIds.length === vehicles.length ? t('deselectAll') : t('selectAll')}
                          </button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {vehicles.map((vehicle) => (
                            <label
                              key={vehicle.id}
                              className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <input
                                type="checkbox"
                                checked={coveredVehicleIds.includes(vehicle.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setCoveredVehicleIds([...coveredVehicleIds, vehicle.id])
                                  } else {
                                    setCoveredVehicleIds(coveredVehicleIds.filter(id => id !== vehicle.id))
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="w-8 h-6 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                                {vehicle.photo ? (
                                  <img src={vehicle.photo} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <IoCarOutline className="w-3 h-3 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          {t('vehiclesCoveredCount', { count: coveredVehicleIds.length, total: vehicles.length })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Covers During Rentals */}
                <div className={`rounded-lg transition-colors ${
                  coversDuringRentals
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
                }`}>
                  <label className="flex items-center justify-between p-4 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={coversDuringRentals}
                        onChange={(e) => {
                          setCoversDuringRentals(e.target.checked)
                          if (!e.target.checked) {
                            setRentalCoveredVehicleIds([])
                          }
                        }}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('coversDuringRentals')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('coversDuringRentalsDescription')}
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Vehicle selection for Rental Coverage */}
                  {coversDuringRentals && vehicles.length > 0 && (
                    <div className="px-4 pb-4">
                      <div className="border-t border-green-200 dark:border-green-800 pt-3 mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('selectVehiclesCoveredForRentals')}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (rentalCoveredVehicleIds.length === vehicles.length) {
                                setRentalCoveredVehicleIds([])
                              } else {
                                setRentalCoveredVehicleIds(vehicles.map(v => v.id))
                              }
                            }}
                            className="text-xs text-green-600 hover:text-green-700 dark:text-green-400"
                          >
                            {rentalCoveredVehicleIds.length === vehicles.length ? t('deselectAll') : t('selectAll')}
                          </button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {vehicles.map((vehicle) => (
                            <label
                              key={vehicle.id}
                              className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <input
                                type="checkbox"
                                checked={rentalCoveredVehicleIds.includes(vehicle.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRentalCoveredVehicleIds([...rentalCoveredVehicleIds, vehicle.id])
                                  } else {
                                    setRentalCoveredVehicleIds(rentalCoveredVehicleIds.filter(id => id !== vehicle.id))
                                  }
                                }}
                                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                              />
                              <div className="w-8 h-6 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                                {vehicle.photo ? (
                                  <img src={vehicle.photo} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <IoCarOutline className="w-3 h-3 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          {t('vehiclesCoveredForRentalsCount', { count: rentalCoveredVehicleIds.length, total: vehicles.length })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No Insurance Acknowledgment - Show if no coverage exists at all */}
          {(() => {
            // Check if there's ANY form of insurance coverage
            const hasPartnerCoverage = hasInsurance && coversDuringRentals && rentalCoveredVehicleIds.length > 0
            const hasAnyVehicleCoverage = vehicles.some(v => v.hasOwnInsurance && v.useForRentals)
            const hasAnyCoverage = hasPartnerCoverage || hasAnyVehicleCoverage

            // Only show acknowledgment box if there's NO coverage anywhere
            if (hasAnyCoverage) return null

            return (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <IoAlertCircleOutline className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-400">{t('noInsuranceCoverage')}</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                      {t('noInsuranceWarning')}
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acknowledgedNoInsurance}
                    onChange={(e) => setAcknowledgedNoInsurance(e.target.checked)}
                    className="w-5 h-5 mt-0.5 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t('acknowledgeAndUnderstand')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('customersRentingMustColon')}
                    </p>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 mt-2 list-disc list-inside space-y-1">
                      <li>{t('provideOwnInsurance')}</li>
                      <li>{t('selectInsuranceDuringBooking')}</li>
                      <li>{t('verifyCustomerInsurance')}</li>
                    </ul>
                  </div>
                </label>
              </div>
            )
          })()}

          {/* Vehicles Coverage Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <IoCarOutline className="w-5 h-5" />
                  {t('vehicleCoverage')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('vehicleCoverageSubtitle')}
                </p>
              </div>
            </div>

            {/* Important Notice */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>{t('hostResponsibility')}</strong> {t('hostResponsibilityText')}
                </div>
              </div>
            </div>

            {/* Coverage Legend */}
            <div className="flex flex-wrap gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">{t('legendVehicleInsurance')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">{t('legendPartnerInsurance')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-gray-600 dark:text-gray-400">{t('legendGuestMustProvide')}</span>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <IoCarOutline className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t('noVehiclesYet')}</p>
                <Link
                  href="/partner/fleet/add"
                  className="text-orange-600 hover:text-orange-700 text-sm mt-2 inline-block"
                >
                  {t('addFirstVehicle')} &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {vehicles.map((vehicle) => {
                  // Determine coverage status
                  const hasVehicleInsurance = vehicle.hasOwnInsurance && vehicle.useForRentals
                  // Check if this specific vehicle is covered by partner insurance
                  const hasPartnerCoverage = hasInsurance && coversDuringRentals && rentalCoveredVehicleIds.includes(vehicle.id)
                  const isExpanded = expandedVehicleId === vehicle.id

                  return (
                    <div
                      key={vehicle.id}
                      className={`rounded-lg border transition-all ${
                        isExpanded
                          ? 'border-orange-300 dark:border-orange-700'
                          : hasVehicleInsurance
                          ? 'border-green-200 dark:border-green-800'
                          : hasPartnerCoverage
                          ? 'border-purple-200 dark:border-purple-800'
                          : 'border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {/* Vehicle Header - Click to expand */}
                      <button
                        onClick={() => handleExpandVehicle(vehicle)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          isExpanded
                            ? 'bg-orange-50 dark:bg-orange-900/20'
                            : hasVehicleInsurance
                            ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                            : hasPartnerCoverage
                            ? 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                            : 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                            {vehicle.photo ? (
                              <img src={vehicle.photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <IoCarOutline className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.year} {vehicle.make}</p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {vehicle.model}
                            </p>
                            <p className={`text-xs ${
                              hasVehicleInsurance
                                ? 'text-green-600 dark:text-green-400'
                                : hasPartnerCoverage
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {hasVehicleInsurance
                                ? (vehicle.insuranceProvider ? t('vehicleInsuranceProvider', { provider: vehicle.insuranceProvider }) : t('vehicleOwnInsurance'))
                                : hasPartnerCoverage
                                ? t('coveredByPartnerInsurance')
                                : t('noCoverageGuestMustProvide')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <IoSettingsOutline className="w-4 h-4 text-gray-400" />
                          {isExpanded ? (
                            <IoChevronUpOutline className="w-4 h-4 text-gray-400" />
                          ) : (
                            <IoChevronDownOutline className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Edit Form */}
                      {isExpanded && (
                        <div className="p-4 border-t border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800">
                          <div className="space-y-4">
                            {/* Has Own Insurance Toggle */}
                            <label className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                              vehicleEditForm.hasOwnInsurance
                                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                                : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
                            }`}>
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={vehicleEditForm.hasOwnInsurance}
                                  onChange={(e) => setVehicleEditForm({
                                    ...vehicleEditForm,
                                    hasOwnInsurance: e.target.checked,
                                    useForRentals: e.target.checked ? vehicleEditForm.useForRentals : false
                                  })}
                                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">{t('vehicleHasOwnInsurance')}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('vehicleInsuranceSpecific')}
                                  </p>
                                </div>
                              </div>
                            </label>

                            {/* Insurance Details - Only show if has own insurance */}
                            {vehicleEditForm.hasOwnInsurance && (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      {t('vehicleInsuranceProvider2')}
                                    </label>
                                    <input
                                      type="text"
                                      value={vehicleEditForm.insuranceProvider}
                                      onChange={(e) => setVehicleEditForm({
                                        ...vehicleEditForm,
                                        insuranceProvider: e.target.value
                                      })}
                                      placeholder={t('insuranceProviderPlaceholderShort')}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      {t('vehiclePolicyNumber')}
                                    </label>
                                    <input
                                      type="text"
                                      value={vehicleEditForm.policyNumber}
                                      onChange={(e) => setVehicleEditForm({
                                        ...vehicleEditForm,
                                        policyNumber: e.target.value
                                      })}
                                      placeholder={t('policyNumberPlaceholderShort')}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('vehiclePolicyExpiration')}
                                  </label>
                                  <input
                                    type="date"
                                    value={vehicleEditForm.policyExpires}
                                    onChange={(e) => setVehicleEditForm({
                                      ...vehicleEditForm,
                                      policyExpires: e.target.value
                                    })}
                                    className="w-full md:w-auto px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                                  />
                                </div>

                                {/* Use for Rentals Toggle */}
                                <label className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                  vehicleEditForm.useForRentals
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
                                }`}>
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={vehicleEditForm.useForRentals}
                                      onChange={(e) => setVehicleEditForm({
                                        ...vehicleEditForm,
                                        useForRentals: e.target.checked
                                      })}
                                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white text-sm">{t('useForRentals')}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('useForRentalsDescription')}
                                      </p>
                                    </div>
                                  </div>
                                </label>
                              </>
                            )}

                            {/* Coverage Info */}
                            {!vehicleEditForm.hasOwnInsurance && (
                              <div className={`p-3 rounded-lg text-sm ${
                                hasPartnerCoverage
                                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                              }`}>
                                {hasPartnerCoverage ? (
                                  <p>{t('coveredByPartnerDuringRentals')}</p>
                                ) : hasInsurance && coversDuringRentals ? (
                                  <p>{t('addToPartnerCoverage')}</p>
                                ) : (
                                  <p>{t('guestsMustProvideOwn')}</p>
                                )}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={() => setExpandedVehicleId(null)}
                                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                {t('cancel')}
                              </button>
                              <button
                                onClick={() => handleSaveVehicleInsurance(vehicle.id)}
                                disabled={savingVehicle}
                                className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors flex items-center gap-2"
                              >
                                {savingVehicle ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    {t('saving')}
                                  </>
                                ) : (
                                  <>
                                    <IoSaveOutline className="w-4 h-4" />
                                    {t('save')}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Summary */}
            {vehicles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="text-green-600 dark:text-green-400">
                    {t('withVehicleInsuranceCount', { count: vehicles.filter(v => v.hasOwnInsurance && v.useForRentals).length })}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400">
                    {t('withPartnerInsuranceCount', { count: vehicles.filter(v =>
                      !(v.hasOwnInsurance && v.useForRentals) &&
                      rentalCoveredVehicleIds.includes(v.id)
                    ).length })}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {t('guestMustProvideCount', { count: vehicles.filter(v =>
                      !(v.hasOwnInsurance && v.useForRentals) &&
                      !rentalCoveredVehicleIds.includes(v.id)
                    ).length })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  {t('saving')}
                </>
              ) : (
                <>
                  <IoSaveOutline className="w-5 h-5" />
                  {t('saveInsuranceSettings')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Info Panel */}
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('currentCoverageStatus')}</h3>

            <div className="space-y-3">
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                hasInsurance
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}>
                {hasInsurance ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                ) : (
                  <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                )}
                <span className={`text-sm ${hasInsurance ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>
                  {t('businessInsurance')}
                </span>
              </div>

              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                coversVehicles
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}>
                {coversVehicles ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-blue-600" />
                ) : (
                  <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                )}
                <span className={`text-sm ${coversVehicles ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500'}`}>
                  {t('vehicleCoverageStatus')}
                </span>
              </div>

              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                coversDuringRentals
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}>
                {coversDuringRentals ? (
                  <IoCheckmarkCircleOutline className="w-5 h-5 text-green-600" />
                ) : (
                  <IoCloseCircleOutline className="w-5 h-5 text-gray-400" />
                )}
                <span className={`text-sm ${coversDuringRentals ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>
                  {t('rentalCoverageStatus')}
                </span>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoInformationCircleOutline className="w-5 h-5 text-blue-600" />
              {t('howItWorks')}
            </h3>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong className="text-gray-900 dark:text-white">{t('withRentalCoverageLabel')}</strong> {t('withRentalCoverageText')}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">{t('withoutRentalCoverageLabel')}</strong> {t('withoutRentalCoverageText')}
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">{t('perVehicleInsuranceLabel')}</strong> {t('perVehicleInsuranceText')}
              </p>
            </div>
          </div>

          {/* Technology Integration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoCodeSlashOutline className="w-5 h-5 text-purple-600" />
              {t('technology')}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('technologyDescription')}
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <IoLinkOutline className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('apiIntegration')}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('apiIntegrationDescription')}
                </p>
              </div>

              <button
                onClick={() => window.location.href = '/partner/settings?tab=integrations'}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <IoCodeSlashOutline className="w-4 h-4" />
                {t('configureIntegration')}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {t('haveInsuranceApi')}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
