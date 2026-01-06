// app/fleet/hosts/[id]/permissions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoLockOpenOutline,
  IoLockClosedOutline,
  IoCashOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface Permission {
  key: string
  label: string
  description: string
  risk: 'low' | 'medium' | 'high'
}

const permissions: Permission[] = [
  {
    key: 'dashboardAccess',
    label: 'Dashboard Access',
    description: 'Allow host to access their dashboard',
    risk: 'low'
  },
  {
    key: 'canViewBookings',
    label: 'View Bookings',
    description: 'See booking details and guest information',
    risk: 'low'
  },
  {
    key: 'canEditCalendar',
    label: 'Edit Calendar',
    description: 'Block/unblock dates for availability',
    risk: 'medium'
  },
  {
    key: 'canSetPricing',
    label: 'Set Pricing',
    description: 'Modify daily rates within boundaries',
    risk: 'medium'
  },
  {
    key: 'canMessageGuests',
    label: 'Message Guests',
    description: 'Communicate directly with renters',
    risk: 'medium'
  },
  {
    key: 'canWithdrawFunds',
    label: 'Withdraw Funds',
    description: 'Access earnings and request payouts',
    risk: 'high'
  }
]

export default function HostPermissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [host, setHost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    dashboardAccess: false,
    canViewBookings: false,
    canEditCalendar: false,
    canSetPricing: false,
    canMessageGuests: false,
    canWithdrawFunds: false,
    commissionRate: 0.20,
    minDailyRate: null as number | null,
    maxDailyRate: null as number | null
  })

  useEffect(() => {
    const loadHost = async () => {
      const { id } = await params
      const response = await fetch(`/fleet/api/hosts/${id}?key=phoenix-fleet-2847`)
      if (response.ok) {
        const data = await response.json()
        const hostData = data.data
        setHost(hostData)
        
        // Initialize form with current values
        setFormData({
          dashboardAccess: hostData.dashboardAccess || false,
          canViewBookings: hostData.canViewBookings || false,
          canEditCalendar: hostData.canEditCalendar || false,
          canSetPricing: hostData.canSetPricing || false,
          canMessageGuests: hostData.canMessageGuests || false,
          canWithdrawFunds: hostData.canWithdrawFunds || false,
          commissionRate: hostData.commissionRate || 0.20,
          minDailyRate: hostData.minDailyRate || null,
          maxDailyRate: hostData.maxDailyRate || null
        })
      }
      setLoading(false)
    }
    loadHost()
  }, [params])

  const handleTogglePermission = (key: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const { id } = await params
    
    const response = await fetch(`/fleet/api/hosts/${id}?key=phoenix-fleet-2847`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (response.ok) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      // Reload host data
      const updatedData = await response.json()
      setHost(updatedData.data)
    }
    setSaving(false)
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!host) return <div className="p-6">Host not found</div>

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href={`/fleet/hosts/${host.id}?key=phoenix-fleet-2847`}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
          >
            <IoArrowBackOutline className="text-xl" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Permissions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {host.name} • {host.email}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            host.hostType === 'PLATFORM' ? 'bg-purple-100 text-purple-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {host.hostType === 'PLATFORM' ? 'Platform Fleet' : 'Partner Host'}
          </span>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
            <IoCheckmarkCircleOutline className="text-xl" />
            Permissions updated successfully
          </div>
        )}

        {/* Warning for Platform Fleet */}
        {host.hostType === 'PLATFORM' && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex gap-3">
              <IoWarningOutline className="text-yellow-600 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Platform Fleet Host</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  This is a platform-managed host. Permissions are typically kept minimal for security.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <IoLockOpenOutline className="text-purple-600" />
            Dashboard Permissions
          </h2>
          
          <div className="space-y-3">
            {permissions.map((perm) => (
              <div 
                key={perm.key}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <label className="font-medium text-gray-900 dark:text-white cursor-pointer">
                        {perm.label}
                      </label>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(perm.risk)}`}>
                        {perm.risk} risk
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {perm.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePermission(perm.key)}
                    className={`p-2 rounded-lg transition-all ${
                      formData[perm.key as keyof typeof formData]
                        ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-500'
                    }`}
                  >
                    {formData[perm.key as keyof typeof formData] ? (
                      <IoLockOpenOutline className="text-xl" />
                    ) : (
                      <IoLockClosedOutline className="text-xl" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <IoCashOutline className="text-purple-600" />
            Financial Settings
          </h2>

          <div className="space-y-4">
            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.commissionRate * 100}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  commissionRate: parseFloat(e.target.value) / 100
                }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Platform takes {(formData.commissionRate * 100).toFixed(0)}% of each booking
              </p>
            </div>

            {/* Pricing Boundaries */}
            {formData.canSetPricing && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <IoInformationCircleOutline />
                  <span className="text-sm font-medium">Pricing Boundaries (Optional)</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Daily Rate ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minDailyRate || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        minDailyRate: e.target.value ? parseFloat(e.target.value) : null
                      }))}
                      placeholder="No minimum"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Daily Rate ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxDailyRate || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        maxDailyRate: e.target.value ? parseFloat(e.target.value) : null
                      }))}
                      placeholder="No maximum"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Host can set prices between these limits without seeing the boundaries
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link
            href={`/fleet/hosts/${host.id}?key=phoenix-fleet-2847`}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  )
}