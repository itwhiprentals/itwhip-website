// app/fleet/insurance/providers/[id]/edit/page.tsx - UPDATED VERSION
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  IoAddOutline, 
  IoTrashOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoCashOutline,
  IoCarSportOutline
} from 'react-icons/io5'
import VehicleRulesEditor from '@/app/fleet/insurance/components/VehicleRulesEditor'

interface CoverageTier {
  tier: string
  deductible: number
  liabilityCoverage: number
  collisionCoverage: number
  comprehensiveCoverage: number
  personalInjury: number
  uninsuredMotorist: number
}

interface PricingRate {
  tier: string
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
  maxDays?: number
}

interface VehicleRules {
  categories: {
    [key: string]: {
      eligible: boolean
      multiplier: number
      maxValue?: number
      minValue?: number
    }
  }
  riskLevels: {
    [key: string]: {
      eligible: boolean
      multiplier: number
      requiresReview?: boolean
    }
  }
  excludedMakes: string[]
  excludedModels: string[]
  vehicleAgeLimit: number
  valueRange: {
    min: number
    max: number
  }
}

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
  coverageTiers?: CoverageTier[]
  pricingRules?: PricingRate[]
  vehicleRules?: VehicleRules | null
}

export default function EditProviderPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
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

  // Coverage Tiers State
  const [coverageTiers, setCoverageTiers] = useState<CoverageTier[]>([
    {
      tier: 'MINIMUM',
      deductible: 3000,
      liabilityCoverage: 750000,
      collisionCoverage: 0,
      comprehensiveCoverage: 0,
      personalInjury: 50000,
      uninsuredMotorist: 100000
    },
    {
      tier: 'STANDARD',
      deductible: 1000,
      liabilityCoverage: 1000000,
      collisionCoverage: 50000,
      comprehensiveCoverage: 50000,
      personalInjury: 100000,
      uninsuredMotorist: 250000
    },
    {
      tier: 'PREMIUM',
      deductible: 500,
      liabilityCoverage: 2000000,
      collisionCoverage: 100000,
      comprehensiveCoverage: 100000,
      personalInjury: 250000,
      uninsuredMotorist: 500000
    }
  ])

  // Pricing Rules State
  const [pricingRates, setPricingRates] = useState<PricingRate[]>([
    {
      tier: 'MINIMUM',
      dailyRate: 9.99,
      weeklyRate: 49.99,
      monthlyRate: 149.99
    },
    {
      tier: 'STANDARD', 
      dailyRate: 19.99,
      weeklyRate: 99.99,
      monthlyRate: 299.99
    },
    {
      tier: 'PREMIUM',
      dailyRate: 39.99,
      weeklyRate: 199.99,
      monthlyRate: 599.99
    }
  ])

  // Vehicle Rules State
  const [vehicleRules, setVehicleRules] = useState<VehicleRules | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchProvider()
    }
  }, [params.id])

  const fetchProvider = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fleet/insurance/providers/${params.id}?key=phoenix-fleet-2847`)
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

      // Load existing coverage tiers and pricing if available
      if (data.coverageTiers && data.coverageTiers.length > 0) {
        setCoverageTiers(data.coverageTiers)
      }
      if (data.pricingRules && data.pricingRules.length > 0) {
        setPricingRates(data.pricingRules)
      }
      
      // Load vehicle rules if available
      if (data.vehicleRules) {
        setVehicleRules(data.vehicleRules)
      }
    } catch (error) {
      console.error('Failed to fetch provider:', error)
      alert('Failed to load provider')
      router.push('/fleet/insurance/providers?key=phoenix-fleet-2847')
    } finally {
      setLoading(false)
    }
  }

  const handleCoverageTierChange = (index: number, field: keyof CoverageTier, value: string | number) => {
    const newTiers = [...coverageTiers]
    newTiers[index] = {
      ...newTiers[index],
      [field]: field === 'tier' ? value : Number(value)
    }
    setCoverageTiers(newTiers)
  }

  const handlePricingRateChange = (index: number, field: keyof PricingRate, value: string | number) => {
    const newRates = [...pricingRates]
    newRates[index] = {
      ...newRates[index],
      [field]: field === 'tier' ? value : Number(value)
    }
    setPricingRates(newRates)
  }

  const addCoverageTier = () => {
    setCoverageTiers([...coverageTiers, {
      tier: 'CUSTOM',
      deductible: 1000,
      liabilityCoverage: 1000000,
      collisionCoverage: 50000,
      comprehensiveCoverage: 50000,
      personalInjury: 100000,
      uninsuredMotorist: 250000
    }])
  }

  const removeCoverageTier = (index: number) => {
    setCoverageTiers(coverageTiers.filter((_, i) => i !== index))
  }

  const addPricingRate = () => {
    setPricingRates([...pricingRates, {
      tier: 'CUSTOM',
      dailyRate: 29.99,
      weeklyRate: 149.99,
      monthlyRate: 449.99
    }])
  }

  const removePricingRate = (index: number) => {
    setPricingRates(pricingRates.filter((_, i) => i !== index))
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
        contractTerms: formData.contractTerms || null,
        coverageTiers: coverageTiers,
        pricingRules: pricingRates,
        vehicleRules: vehicleRules // Add vehicle rules to payload
      }

      const response = await fetch(`/api/fleet/insurance/providers/${params.id}?key=phoenix-fleet-2847`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update provider')
      }

      router.push(`/fleet/insurance/providers/${params.id}?key=phoenix-fleet-2847`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/fleet/insurance?key=phoenix-fleet-2847" className="hover:text-gray-900 dark:hover:text-white">
            Insurance
          </Link>
          <span>/</span>
          <Link href="/fleet/insurance/providers?key=phoenix-fleet-2847" className="hover:text-gray-900 dark:hover:text-white">
            Providers
          </Link>
          <span>/</span>
          <Link href={`/fleet/insurance/providers/${params.id}?key=phoenix-fleet-2847`} className="hover:text-gray-900 dark:hover:text-white">
            {formData.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Edit</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Provider</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update provider settings, coverage tiers, and pricing
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

          {/* Coverage Tiers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IoShieldCheckmarkOutline className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Coverage Tiers</h2>
              </div>
              <button
                type="button"
                onClick={addCoverageTier}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <IoAddOutline className="w-4 h-4" />
                Add Tier
              </button>
            </div>
            <div className="p-6 space-y-4">
              {coverageTiers.map((tier, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={tier.tier}
                      onChange={(e) => handleCoverageTierChange(index, 'tier', e.target.value)}
                      className="text-lg font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none"
                      placeholder="Tier Name"
                    />
                    <button
                      type="button"
                      onClick={() => removeCoverageTier(index)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <IoTrashOutline className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Deductible</label>
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <input
                          type="number"
                          value={tier.deductible}
                          onChange={(e) => handleCoverageTierChange(index, 'deductible', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Liability Coverage</label>
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <input
                          type="number"
                          value={tier.liabilityCoverage}
                          onChange={(e) => handleCoverageTierChange(index, 'liabilityCoverage', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Collision Coverage</label>
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <input
                          type="number"
                          value={tier.collisionCoverage}
                          onChange={(e) => handleCoverageTierChange(index, 'collisionCoverage', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Comprehensive</label>
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <input
                          type="number"
                          value={tier.comprehensiveCoverage}
                          onChange={(e) => handleCoverageTierChange(index, 'comprehensiveCoverage', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Personal Injury</label>
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <input
                          type="number"
                          value={tier.personalInjury}
                          onChange={(e) => handleCoverageTierChange(index, 'personalInjury', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Uninsured Motorist</label>
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <input
                          type="number"
                          value={tier.uninsuredMotorist}
                          onChange={(e) => handleCoverageTierChange(index, 'uninsuredMotorist', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Rates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IoCashOutline className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Insurance Pricing</h2>
              </div>
              <button
                type="button"
                onClick={addPricingRate}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <IoAddOutline className="w-4 h-4" />
                Add Rate
              </button>
            </div>
            <div className="p-6 space-y-4">
              {pricingRates.map((rate, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={rate.tier}
                      onChange={(e) => handlePricingRateChange(index, 'tier', e.target.value)}
                      className="text-lg font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-green-500 outline-none"
                      placeholder="Tier Name"
                    />
                    <button
                      type="button"
                      onClick={() => removePricingRate(index)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <IoTrashOutline className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Daily Rate</label>
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={rate.dailyRate}
                          onChange={(e) => handlePricingRateChange(index, 'dailyRate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                        />
                        <span className="ml-1 text-xs">/day</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Weekly Rate</label>
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={rate.weeklyRate}
                          onChange={(e) => handlePricingRateChange(index, 'weeklyRate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                        />
                        <span className="ml-1 text-xs">/week</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Monthly Rate</label>
                      <div className="flex items-center">
                        <span className="mr-1">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={rate.monthlyRate}
                          onChange={(e) => handlePricingRateChange(index, 'monthlyRate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                        />
                        <span className="ml-1 text-xs">/month</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Classification Rules - NEW SECTION */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <IoCarSportOutline className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle Classification Rules</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure eligibility and pricing adjustments based on vehicle categories and risk levels
              </p>
            </div>
            <div className="p-6">
              <VehicleRulesEditor
                rules={vehicleRules}
                onChange={setVehicleRules}
              />
            </div>
          </div>

          {/* Coverage Rules */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Basic Coverage Rules</h2>
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excluded Makes (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.excludedMakes}
                  onChange={(e) => setFormData({...formData, excludedMakes: e.target.value})}
                  placeholder="Ferrari, Lamborghini, McLaren"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excluded Models (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.excludedModels}
                  onChange={(e) => setFormData({...formData, excludedModels: e.target.value})}
                  placeholder="Mustang GT500, Camaro ZL1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Link
              href={`/fleet/insurance/providers/${params.id}?key=phoenix-fleet-2847`}
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