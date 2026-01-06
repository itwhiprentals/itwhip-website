// app/fleet/hosts/create/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoPersonOutline,
  IoMailOutline,
  IoPhonePortraitOutline,
  IoLocationOutline,
  IoCameraOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

export default function CreatePlatformHostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    phone: '',
    
    // Profile
    bio: '',
    profilePhoto: '',
    
    // Location
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '',
    
    // Settings
    responseTime: 60, // minutes
    responseRate: 95, // percentage
    acceptanceRate: 90, // percentage
    rating: 5.0,
    
    // Status
    active: true,
    isVerified: true,
    verificationLevel: 'platform',
    
    // Access (Platform hosts typically have limited access)
    dashboardAccess: false,
    canViewBookings: false,
    canEditCalendar: false,
    canSetPricing: false,
    canMessageGuests: false,
    canWithdrawFunds: false,
    
    // Financial
    commissionRate: 0.20
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/fleet/api/hosts?key=phoenix-fleet-2847', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hostType: 'PLATFORM', // Always Platform for manual creation
          approvalStatus: 'APPROVED', // Auto-approved
          approvedAt: new Date().toISOString(),
          approvedBy: 'fleet-admin',
          email: formData.email.includes('@') ? formData.email : `${formData.email}@itwhip.com`
        })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/fleet/hosts?key=phoenix-fleet-2847')
        }, 2000)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create host')
      }
    } catch (error) {
      console.error('Error creating host:', error)
      alert('Failed to create host')
    } finally {
      setLoading(false)
    }
  }

  const cities = [
    'Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 
    'Gilbert', 'Glendale', 'Peoria', 'Surprise', 'Avondale'
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/fleet/hosts?key=phoenix-fleet-2847"
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
          >
            <IoArrowBackOutline className="text-xl" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Platform Host
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add a new platform-managed host to the fleet
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="flex gap-3">
            <IoInformationCircleOutline className="text-purple-600 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">Platform Fleet Host</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                This creates a platform-managed host that appears as an independent operator. 
                These hosts are automatically approved with limited dashboard access.
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
            <IoCheckmarkCircleOutline className="text-xl" />
            Host created successfully! Redirecting...
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <IoPersonOutline className="text-purple-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Host Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john.smith"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400">
                    @itwhip.com
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Will automatically add @itwhip.com if not included
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  value={formData.profilePhoto}
                  onChange={(e) => setFormData({...formData, profilePhoto: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Professional host providing quality vehicles..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <IoLocationOutline className="text-purple-600" />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  placeholder="85001"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              These values make the host appear established and reliable
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response Time (min)
                </label>
                <input
                  type="number"
                  value={formData.responseTime}
                  onChange={(e) => setFormData({...formData, responseTime: parseInt(e.target.value)})}
                  min="1"
                  max="1440"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.responseRate}
                  onChange={(e) => setFormData({...formData, responseRate: parseFloat(e.target.value)})}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Acceptance Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.acceptanceRate}
                  onChange={(e) => setFormData({...formData, acceptanceRate: parseFloat(e.target.value)})}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                  min="1"
                  max="5"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Access Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Dashboard Access</h2>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Platform hosts typically have limited or no dashboard access. 
                You can enable permissions later if needed.
              </p>
            </div>
            
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.dashboardAccess}
                  onChange={(e) => setFormData({...formData, dashboardAccess: e.target.checked})}
                  className="rounded"
                />
                <span>Allow Dashboard Access</span>
              </label>
              
              {formData.dashboardAccess && (
                <div className="ml-6 space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.canViewBookings}
                      onChange={(e) => setFormData({...formData, canViewBookings: e.target.checked})}
                      className="rounded"
                    />
                    <span>Can View Bookings</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.canEditCalendar}
                      onChange={(e) => setFormData({...formData, canEditCalendar: e.target.checked})}
                      className="rounded"
                    />
                    <span>Can Edit Calendar</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.canSetPricing}
                      onChange={(e) => setFormData({...formData, canSetPricing: e.target.checked})}
                      className="rounded"
                    />
                    <span>Can Set Pricing</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Link
              href="/fleet/hosts?key=phoenix-fleet-2847"
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Platform Host'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}