// app/fleet/hosts/[id]/insurance/assign/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoCarOutline
} from 'react-icons/io5'

export default function AssignInsurancePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [hostId, setHostId] = useState<string>('')
  const [host, setHost] = useState<any>(null)
  const [providers, setProviders] = useState<any[]>([])
  const [selectedProviderId, setSelectedProviderId] = useState<string>('')
  const [policyNumber, setPolicyNumber] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const init = async () => {
      const { id } = await params
      setHostId(id)
      await Promise.all([
        loadHost(id),
        loadProviders()
      ])
      setLoading(false)
    }
    init()
  }, [params])

  const loadHost = async (id: string) => {
    try {
      const response = await fetch(`/fleet/api/hosts/${id}?key=phoenix-fleet-2847`)
      if (response.ok) {
        const data = await response.json()
        setHost(data.data)
      }
    } catch (error) {
      console.error('Failed to load host:', error)
      setError('Failed to load host information')
    }
  }

  const loadProviders = async () => {
    try {
      const response = await fetch('/api/fleet/insurance/providers')
      if (response.ok) {
        const data = await response.json()
        // Only show active providers
        const activeProviders = data.providers.filter((p: any) => p.isActive)
        setProviders(activeProviders)
      }
    } catch (error) {
      console.error('Failed to load providers:', error)
      setError('Failed to load insurance providers')
    }
  }

  const selectedProvider = providers.find(p => p.id === selectedProviderId)

  const getVehicleCoverage = () => {
    if (!host?.cars || !selectedProvider) return { covered: [], excluded: [] }

    const covered: any[] = []
    const excluded: any[] = []

    host.cars.forEach((car: any) => {
      const vehicleValue = car.estimatedValue || car.dailyRate * 365 * 0.15

      // Check if vehicle matches provider rules
      let isEligible = true
      let reason = ''

      // Check value range
      if (selectedProvider.vehicleValueMin && vehicleValue < selectedProvider.vehicleValueMin) {
        isEligible = false
        reason = `Value too low (${vehicleValue.toFixed(0)} < ${selectedProvider.vehicleValueMin})`
      }
      if (selectedProvider.vehicleValueMax && vehicleValue > selectedProvider.vehicleValueMax) {
        isEligible = false
        reason = `Value too high (${vehicleValue.toFixed(0)} > ${selectedProvider.vehicleValueMax})`
      }

      // Check excluded makes
      if (selectedProvider.excludedMakes?.includes(car.make)) {
        isEligible = false
        reason = `Make excluded: ${car.make}`
      }

      // Check excluded models
      const fullModel = `${car.make} ${car.model}`
      if (selectedProvider.excludedModels?.includes(fullModel)) {
        isEligible = false
        reason = `Model excluded: ${fullModel}`
      }

      if (isEligible) {
        covered.push(car)
      } else {
        excluded.push({ ...car, exclusionReason: reason })
      }
    })

    return { covered, excluded }
  }

  const handleAssign = async () => {
    if (!selectedProviderId) {
      setError('Please select an insurance provider')
      return
    }

    setAssigning(true)
    setError('')

    try {
      const response = await fetch(`/api/fleet/hosts/${hostId}/insurance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProviderId,
          policyNumber: policyNumber || null,
          assignedBy: 'admin@itwhip.com'
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Success - redirect back to host detail
        router.push(`/fleet/hosts/${hostId}?key=phoenix-fleet-2847&tab=insurance`)
      } else {
        setError(data.error || 'Failed to assign insurance')
      }
    } catch (error) {
      console.error('Assignment error:', error)
      setError('Failed to assign insurance. Please try again.')
    } finally {
      setAssigning(false)
    }
  }

  const { covered, excluded } = getVehicleCoverage()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!host) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Host not found</p>
            <Link 
              href="/fleet/hosts?key=phoenix-fleet-2847"
              className="text-purple-600 hover:text-purple-700"
            >
              Back to Hosts
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href={`/fleet/hosts/${hostId}?key=phoenix-fleet-2847&tab=insurance`}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
          >
            <IoArrowBackOutline className="text-xl" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Assign Insurance Provider
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              {host.name} • {host.cars?.length || 0} vehicle(s)
            </p>
          </div>
        </div>

        {/* Current Status Warning */}
        {host.insuranceProviderId && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <IoWarningOutline className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                  Host Already Has Insurance
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  Current provider: <strong>{host.insuranceProvider?.name}</strong>. 
                  Assigning a new provider will replace the current one.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <IoWarningOutline className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Select Insurance Provider *
            </label>
            {providers.length === 0 ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  No active insurance providers available
                </p>
                <Link
                  href="/fleet/insurance/providers?key=phoenix-fleet-2847"
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Add Insurance Provider →
                </Link>
              </div>
            ) : (
              <select
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="">Choose a provider...</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} ({provider.type})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Policy Number (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Policy Number (Optional)
            </label>
            <input
              type="text"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              placeholder="e.g., TINT-2025-ABC123"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can add this later if you don't have it yet
            </p>
          </div>

          {/* Provider Details */}
          {selectedProvider && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <IoInformationCircleOutline className="text-purple-600" />
                Provider Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name</span>
                  <span className="font-medium">{selectedProvider.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="font-medium">{selectedProvider.type}</span>
                </div>
                {selectedProvider.vehicleValueMin && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Min Vehicle Value</span>
                    <span className="font-medium">${selectedProvider.vehicleValueMin.toLocaleString()}</span>
                  </div>
                )}
                {selectedProvider.vehicleValueMax && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Max Vehicle Value</span>
                    <span className="font-medium">${selectedProvider.vehicleValueMax.toLocaleString()}</span>
                  </div>
                )}
                {selectedProvider.excludedMakes && selectedProvider.excludedMakes.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Excluded Makes</span>
                    <span className="font-medium text-right">{selectedProvider.excludedMakes.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Coverage Preview */}
          {selectedProvider && host.cars && host.cars.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <IoShieldCheckmarkOutline className="text-purple-600" />
                Coverage Preview
              </h3>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {host.cars.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {covered.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Covered</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {excluded.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Excluded</div>
                </div>
              </div>

              {/* Covered Vehicles */}
              {covered.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-1">
                    <IoCheckmarkCircleOutline />
                    Will Be Covered ({covered.length})
                  </h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {covered.map((car: any) => (
                      <div 
                        key={car.id} 
                        className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/10 rounded text-sm"
                      >
                        <IoCarOutline className="text-green-600 flex-shrink-0" />
                        <span className="flex-1 truncate">
                          {car.year} {car.make} {car.model}
                        </span>
                        <span className="text-xs text-gray-500">
                          ${(car.estimatedValue || car.dailyRate * 365 * 0.15).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Excluded Vehicles */}
              {excluded.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
                    <IoWarningOutline />
                    Will Be Excluded ({excluded.length})
                  </h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {excluded.map((car: any) => (
                      <div 
                        key={car.id} 
                        className="p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded text-sm"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <IoCarOutline className="text-red-600 flex-shrink-0" />
                          <span className="flex-1 font-medium truncate">
                            {car.year} {car.make} {car.model}
                          </span>
                        </div>
                        <p className="text-xs text-red-600 ml-6">
                          {car.exclusionReason}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <p className="text-xs text-yellow-800 dark:text-yellow-300">
                      Excluded vehicles will need manual overrides or a different provider
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning for No Vehicles */}
          {(!host.cars || host.cars.length === 0) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <IoWarningOutline className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                    No Vehicles Found
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-300">
                    This host doesn't have any vehicles yet. You can still assign insurance, and it will automatically cover vehicles they add later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleAssign}
              disabled={!selectedProviderId || assigning}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {assigning ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Assigning...
                </span>
              ) : (
                `Assign ${selectedProvider?.name || 'Provider'}`
              )}
            </button>
            <Link
              href={`/fleet/hosts/${hostId}?key=phoenix-fleet-2847&tab=insurance`}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <IoInformationCircleOutline className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">About Insurance Assignment</p>
              <ul className="space-y-1 text-xs">
                <li>• Assigning insurance covers ALL host's vehicles automatically</li>
                <li>• Vehicles that don't match provider rules will be marked as excluded</li>
                <li>• You can add manual overrides for excluded vehicles later</li>
                <li>• Host cannot change their assigned insurance (platform-managed)</li>
                <li>• Policy number can be updated anytime from host detail page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}