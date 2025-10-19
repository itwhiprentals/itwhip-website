// app/fleet/insurance/providers/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

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
  apiEndpointPlaceholder: string | null
  webhookUrl: string | null
  contractStart: string | null
  contractEnd: string | null
  contractTerms: string | null
}

export default function EditProviderPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'EMBEDDED',
    isActive: true,
    revenueShare: 0.30,
    vehicleValueMin: '',
    vehicleValueMax: '',
    excludedMakes: '',
    excludedModels: '',
    coverageNotes: '',
    contactEmail: '',
    contactPhone: '',
    apiEndpoint: '',
    apiEndpointPlaceholder: '',
    webhookUrl: '',
    contractStart: '',
    contractEnd: '',
    contractTerms: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchProvider()
    }
  }, [params.id])

  const fetchProvider = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fleet/insurance/providers/${params.id}`)
      if (!response.ok) throw new Error('Provider not found')
      const data = await response.json()
      
      setFormData({
        name: data.name || '',
        type: data.type || 'EMBEDDED',
        isActive: data.isActive,
        revenueShare: data.revenueShare || 0.30,
        vehicleValueMin: data.vehicleValueMin?.toString() || '',
        vehicleValueMax: data.vehicleValueMax?.toString() || '',
        excludedMakes: data.excludedMakes?.join(', ') || '',
        excludedModels: data.excludedModels?.join(', ') || '',
        coverageNotes: data.coverageNotes || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        apiEndpoint: data.apiEndpoint || '',
        apiEndpointPlaceholder: data.apiEndpointPlaceholder || '',
        webhookUrl: data.webhookUrl || '',
        contractStart: data.contractStart ? data.contractStart.split('T')[0] : '',
        contractEnd: data.contractEnd ? data.contractEnd.split('T')[0] : '',
        contractTerms: data.contractTerms || ''
      })
    } catch (error) {
      console.error('Failed to fetch provider:', error)
      alert('Failed to load provider')
      router.push('/fleet/insurance/providers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        isActive: formData.isActive,
        revenueShare: parseFloat(formData.revenueShare.toString()),
        vehicleValueMin: formData.vehicleValueMin ? parseFloat(formData.vehicleValueMin) : null,
        vehicleValueMax: formData.vehicleValueMax ? parseFloat(formData.vehicleValueMax) : null,
        excludedMakes: formData.excludedMakes 
          ? formData.excludedMakes.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        excludedModels: formData.excludedModels 
          ? formData.excludedModels.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        coverageNotes: formData.coverageNotes || null,
        contactEmail: formData.contactEmail || null,
        contactPhone: formData.contactPhone || null,
        apiEndpoint: formData.apiEndpoint || null,
        apiEndpointPlaceholder: formData.apiEndpointPlaceholder || null,
        webhookUrl: formData.webhookUrl || null,
        contractStart: formData.contractStart || null,
        contractEnd: formData.contractEnd || null,
        contractTerms: formData.contractTerms || null
      }

      const response = await fetch(`/api/fleet/insurance/providers/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update provider')
      }

      router.push(`/fleet/insurance/providers/${params.id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/fleet/insurance" className="hover:text-gray-900 dark:hover:text-white">
            Insurance
          </Link>
          <span>/</span>
          <Link href="/fleet/insurance/providers" className="hover:text-gray-900 dark:hover:text-white">
            Providers
          </Link>
          <span>/</span>
          <Link href={`/fleet/insurance/providers/${params.id}`} className="hover:text-gray-900 dark:hover:text-white">
            {formData.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Edit</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Provider</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update provider settings and coverage rules
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
            </div>
            <div className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provider Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provider Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EMBEDDED">Embedded</option>
                    <option value="TRADITIONAL">Traditional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Revenue Share (Platform's Cut)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.revenueShare}
                    onChange={(e) => setFormData({...formData, revenueShare: parseFloat(e.target.value)})}
                    className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    = {(formData.revenueShare * 100).toFixed(0)}% of insurance premium
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Coverage Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.coverageNotes}
                  onChange={(e) => setFormData({...formData, coverageNotes: e.target.value})}
                  placeholder="E.g., Covers vehicles under $100k, excludes exotic cars"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Provider is active
                </label>
              </div>

            </div>
          </div>

          {/* Coverage Rules */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Coverage Rules</h2>
            </div>
            <div className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Vehicle Value
                  </label>
                  <input
                    type="number"
                    value={formData.vehicleValueMin}
                    onChange={(e) => setFormData({...formData, vehicleValueMin: e.target.value})}
                    placeholder="No minimum"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Vehicle Value
                  </label>
                  <input
                    type="number"
                    value={formData.vehicleValueMax}
                    onChange={(e) => setFormData({...formData, vehicleValueMax: e.target.value})}
                    placeholder="No maximum"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setFormData({...formData, excludedMakes: e.target.value})}
                  placeholder="Ferrari, Lamborghini, McLaren"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excluded Models (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.excludedModels}
                  onChange={(e) => setFormData({...formData, excludedModels: e.target.value})}
                  placeholder="Model S Plaid, 911 GT3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Information</h2>
            </div>
            <div className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    placeholder="support@provider.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* API Integration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Integration</h2>
            </div>
            <div className="p-6 space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Endpoint
                </label>
                <input
                  type="url"
                  value={formData.apiEndpoint}
                  onChange={(e) => setFormData({...formData, apiEndpoint: e.target.value})}
                  placeholder="https://api.provider.com/v1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Endpoint Placeholder (for documentation)
                </label>
                <input
                  type="text"
                  value={formData.apiEndpointPlaceholder}
                  onChange={(e) => setFormData({...formData, apiEndpointPlaceholder: e.target.value})}
                  placeholder="Contact provider for API access"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
                  placeholder="https://yourdomain.com/webhooks/insurance"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contract Details</h2>
            </div>
            <div className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contract Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.contractStart}
                    onChange={(e) => setFormData({...formData, contractStart: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contract End Date
                  </label>
                  <input
                    type="date"
                    value={formData.contractEnd}
                    onChange={(e) => setFormData({...formData, contractEnd: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contract Terms
                </label>
                <textarea
                  rows={4}
                  value={formData.contractTerms}
                  onChange={(e) => setFormData({...formData, contractTerms: e.target.value})}
                  placeholder="Enter contract terms and conditions..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Link
              href={`/fleet/insurance/providers/${params.id}`}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}