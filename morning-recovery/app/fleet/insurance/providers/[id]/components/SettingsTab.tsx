// app/fleet/insurance/providers/[id]/components/SettingsTab.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IoSaveOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoLockClosedOutline,
  IoKeyOutline,
  IoSettingsOutline
} from 'react-icons/io5'

interface Provider {
  id: string
  name: string
  type: string
  isActive: boolean
  isPrimary: boolean
  revenueShare: number
  vehicleValueMin: number | null
  vehicleValueMax: number | null
  excludedMakes: string[]
  excludedModels: string[]
  coverageNotes: string | null
  contactEmail: string | null
  contactPhone: string | null
  apiEndpoint: string | null
  apiKey: string | null
  webhookUrl: string | null
  contractStart: string | null
  contractEnd: string | null
  contractTerms: string | null
}

interface SettingsTabProps {
  provider: Provider
  onUpdate: () => void
}

export default function SettingsTab({ provider, onUpdate }: SettingsTabProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: provider.name,
    type: provider.type,
    contactEmail: provider.contactEmail || '',
    contactPhone: provider.contactPhone || '',
    apiEndpoint: provider.apiEndpoint || '',
    apiKey: provider.apiKey || '',
    webhookUrl: provider.webhookUrl || '',
    revenueShare: (provider.revenueShare * 100).toString(),
    vehicleValueMin: provider.vehicleValueMin?.toString() || '',
    vehicleValueMax: provider.vehicleValueMax?.toString() || '',
    excludedMakes: provider.excludedMakes.join(', '),
    excludedModels: provider.excludedModels.join(', '),
    coverageNotes: provider.coverageNotes || '',
    contractStart: provider.contractStart?.split('T')[0] || '',
    contractEnd: provider.contractEnd?.split('T')[0] || '',
    contractTerms: provider.contractTerms || ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const response = await fetch(`/api/fleet/insurance/providers/${provider.id}?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          contactEmail: formData.contactEmail || null,
          contactPhone: formData.contactPhone || null,
          apiEndpoint: formData.apiEndpoint || null,
          apiKey: formData.apiKey || null,
          webhookUrl: formData.webhookUrl || null,
          revenueShare: parseFloat(formData.revenueShare) / 100,
          vehicleValueMin: formData.vehicleValueMin ? parseFloat(formData.vehicleValueMin) : null,
          vehicleValueMax: formData.vehicleValueMax ? parseFloat(formData.vehicleValueMax) : null,
          excludedMakes: formData.excludedMakes 
            ? formData.excludedMakes.split(',').map(m => m.trim()).filter(Boolean)
            : [],
          excludedModels: formData.excludedModels
            ? formData.excludedModels.split(',').map(m => m.trim()).filter(Boolean)
            : [],
          coverageNotes: formData.coverageNotes || null,
          contractStart: formData.contractStart ? new Date(formData.contractStart).toISOString() : null,
          contractEnd: formData.contractEnd ? new Date(formData.contractEnd).toISOString() : null,
          contractTerms: formData.contractTerms || null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update provider')
      }

      alert('Provider updated successfully')
      onUpdate()
    } catch (error) {
      console.error('Failed to update provider:', error)
      alert('Failed to update provider')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)

      const response = await fetch(`/api/fleet/insurance/providers/${provider.id}?key=phoenix-fleet-2847`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete provider')
      }

      alert('Provider deleted successfully')
      router.push('/fleet/insurance/providers?key=phoenix-fleet-2847')
    } catch (error) {
      console.error('Failed to delete provider:', error)
      alert('Failed to delete provider')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Warning Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">
              God Mode - Advanced Configuration
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Changes made here affect all policies and claims using this provider. Exercise caution when modifying these settings.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <IoSettingsOutline className="w-5 h-5 mr-2" />
            Basic Information
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Provider Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Liberty Mutual"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Provider Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="EMBEDDED">EMBEDDED (Platform Insurance)</option>
                <option value="TRADITIONAL">TRADITIONAL (Carrier Partnership)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Coverage Notes
            </label>
            <textarea
              value={formData.coverageNotes}
              onChange={(e) => handleChange('coverageNotes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of coverage..."
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Contact Information
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="partner@insurance.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1-800-INSURANCE"
              />
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <IoKeyOutline className="w-5 h-5 mr-2" />
            API Configuration
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Configure API credentials to enable automatic FNOL (First Notice of Loss) submissions to this provider.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Endpoint
            </label>
            <input
              type="url"
              value={formData.apiEndpoint}
              onChange={(e) => handleChange('apiEndpoint', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="https://api.insurance.com/fnol/v1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <IoLockClosedOutline className="w-4 h-4 mr-1" />
              API Key
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="sk_live_••••••••••••••••"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Keep this secure. Never share API keys publicly.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Webhook URL (Optional)
            </label>
            <input
              type="url"
              value={formData.webhookUrl}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="https://api.insurance.com/webhooks/claims"
            />
          </div>
        </div>
      </div>

      {/* Financial Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Financial Configuration
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Revenue Share (%) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.revenueShare}
              onChange={(e) => handleChange('revenueShare', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="30"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Percentage of claim amount paid to host after approved claims
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle Eligibility */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Vehicle Eligibility Rules
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Vehicle Value ($)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.vehicleValueMin}
                onChange={(e) => handleChange('vehicleValueMin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Vehicle Value ($)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.vehicleValueMax}
                onChange={(e) => handleChange('vehicleValueMax', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="No limit"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excluded Makes (comma-separated)
            </label>
            <input
              type="text"
              value={formData.excludedMakes}
              onChange={(e) => handleChange('excludedMakes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Ferrari, Lamborghini, McLaren"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excluded Models (comma-separated)
            </label>
            <input
              type="text"
              value={formData.excludedModels}
              onChange={(e) => handleChange('excludedModels', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Tesla Cybertruck, Hummer H1"
            />
          </div>
        </div>
      </div>

      {/* Contract Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Contract Information
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contract Start Date
              </label>
              <input
                type="date"
                value={formData.contractStart}
                onChange={(e) => handleChange('contractStart', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contract End Date
              </label>
              <input
                type="date"
                value={formData.contractEnd}
                onChange={(e) => handleChange('contractEnd', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contract Terms
            </label>
            <textarea
              value={formData.contractTerms}
              onChange={(e) => handleChange('contractTerms', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter contract terms and conditions..."
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <IoSaveOutline className="w-5 h-5" />
              <span>Save Changes</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2 font-medium"
        >
          <IoTrashOutline className="w-5 h-5" />
          <span>Delete Provider</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <IoWarningOutline className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delete Provider
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete <strong>{provider.name}</strong>? 
              This will affect all policies and claims associated with this provider.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Provider'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}