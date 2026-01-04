// app/host/settings/fleet-manager/page.tsx
// Fleet Manager Settings - Configure fleet manager profile and public page
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoArrowBackOutline,
  IoPeopleOutline,
  IoGlobeOutline,
  IoImageOutline,
  IoCheckmarkCircleOutline,
  IoSaveOutline,
  IoEyeOutline,
  IoLinkOutline,
  IoInformationCircleOutline,
  IoCarOutline,
  IoToggle,
  IoToggleOutline,
  IoCloudUploadOutline
} from 'react-icons/io5'

interface FleetManagerSettings {
  isHostManager: boolean
  managesOwnCars: boolean
  managesOthersCars: boolean
  hostManagerSlug: string | null
  hostManagerName: string | null
  hostManagerBio: string | null
  hostManagerLogo: string | null
  managedVehicleCount: number
  ownedVehicleCount: number
}

export default function FleetManagerSettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)

  const [settings, setSettings] = useState<FleetManagerSettings>({
    isHostManager: false,
    managesOwnCars: true,
    managesOthersCars: false,
    hostManagerSlug: null,
    hostManagerName: null,
    hostManagerBio: null,
    hostManagerLogo: null,
    managedVehicleCount: 0,
    ownedVehicleCount: 0
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    // Debounced slug availability check
    if (!settings.hostManagerSlug || settings.hostManagerSlug.length < 3) {
      setSlugAvailable(null)
      return
    }

    const timer = setTimeout(() => {
      checkSlugAvailability(settings.hostManagerSlug!)
    }, 500)

    return () => clearTimeout(timer)
  }, [settings.hostManagerSlug])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/host/fleet-manager-settings', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const checkSlugAvailability = async (slug: string) => {
    try {
      setCheckingSlug(true)
      const response = await fetch(`/api/host/check-slug?slug=${encodeURIComponent(slug)}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setSlugAvailable(data.available)
      }
    } catch (err) {
      console.error('Error checking slug:', err)
    } finally {
      setCheckingSlug(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Validate slug if fleet manager is enabled
      if (settings.isHostManager && !settings.hostManagerSlug) {
        setError('Please set a URL slug for your fleet page')
        return
      }

      if (settings.isHostManager && settings.hostManagerSlug && settings.hostManagerSlug.length < 3) {
        setError('URL slug must be at least 3 characters')
        return
      }

      const response = await fetch('/api/host/fleet-manager-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isHostManager: settings.isHostManager,
          managesOwnCars: settings.managesOwnCars,
          managesOthersCars: settings.managesOthersCars,
          hostManagerSlug: settings.hostManagerSlug,
          hostManagerName: settings.hostManagerName,
          hostManagerBio: settings.hostManagerBio,
          hostManagerLogo: settings.hostManagerLogo
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }

      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    try {
      setUploadingLogo(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'fleet-logo')

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setSettings(prev => ({ ...prev, hostManagerLogo: data.url }))
    } catch (err) {
      console.error('Error uploading logo:', err)
      setError('Failed to upload image')
    } finally {
      setUploadingLogo(false)
    }
  }

  const formatSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const fleetPageUrl = settings.hostManagerSlug ? `/fleet/${settings.hostManagerSlug}` : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8 pt-24">
        {/* Back Button */}
        <button
          onClick={() => router.push('/host/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6"
        >
          <IoArrowBackOutline className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <IoPeopleOutline className="w-7 h-7 text-purple-600" />
            Fleet Manager Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure your fleet manager profile and public page settings.
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 flex items-center gap-2">
            <IoCheckmarkCircleOutline className="w-5 h-5" />
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Enable Fleet Manager Mode */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <IoPeopleOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Fleet Manager Mode
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enable to manage vehicles for other owners
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, isHostManager: !prev.isHostManager }))}
                className={`p-2 rounded-lg transition-colors ${
                  settings.isHostManager
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}
              >
                {settings.isHostManager ? (
                  <IoToggle className="w-10 h-10" />
                ) : (
                  <IoToggleOutline className="w-10 h-10" />
                )}
              </button>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Your Vehicles</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{settings.ownedVehicleCount}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Managing for Others</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{settings.managedVehicleCount}</p>
              </div>
            </div>
          </div>

          {/* Fleet Manager Profile Settings - Only show when enabled */}
          {settings.isHostManager && (
            <>
              {/* URL Slug */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoLinkOutline className="w-5 h-5" />
                  Fleet Page URL
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                    itwhip.com/fleet/
                  </span>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={settings.hostManagerSlug || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, hostManagerSlug: formatSlug(e.target.value) }))}
                      placeholder="your-fleet-name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                    {settings.hostManagerSlug && settings.hostManagerSlug.length >= 3 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {checkingSlug ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        ) : slugAvailable ? (
                          <IoCheckmarkCircleOutline className="w-5 h-5 text-green-500" />
                        ) : slugAvailable === false ? (
                          <span className="text-xs text-red-500">Taken</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
                {fleetPageUrl && slugAvailable && (
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={fleetPageUrl}
                      target="_blank"
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <IoEyeOutline className="w-4 h-4" />
                      Preview your fleet page
                    </Link>
                  </div>
                )}
              </div>

              {/* Fleet Name & Bio */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoGlobeOutline className="w-5 h-5" />
                  Fleet Profile
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fleet Name
                    </label>
                    <input
                      type="text"
                      value={settings.hostManagerName || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, hostManagerName: e.target.value }))}
                      placeholder="e.g., Premium Miami Rentals"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fleet Bio
                    </label>
                    <textarea
                      value={settings.hostManagerBio || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, hostManagerBio: e.target.value }))}
                      placeholder="Tell potential renters and vehicle owners about your fleet management services..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Fleet Logo */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoImageOutline className="w-5 h-5" />
                  Fleet Logo
                </h3>

                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {settings.hostManagerLogo ? (
                      <Image
                        src={settings.hostManagerLogo}
                        alt="Fleet Logo"
                        width={120}
                        height={120}
                        className="rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-[120px] h-[120px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                        <IoImageOutline className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      {uploadingLogo ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <IoCloudUploadOutline className="w-5 h-5" />
                          Upload Logo
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Recommended: 400x400px, max 5MB
                    </p>
                    {settings.hostManagerLogo && (
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, hostManagerLogo: null }))}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline mt-2"
                      >
                        Remove logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle Management Options */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <IoCarOutline className="w-5 h-5" />
                  Vehicle Management
                </h3>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Manage my own vehicles</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Include your own vehicles in your fleet</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.managesOwnCars}
                      onChange={(e) => setSettings(prev => ({ ...prev, managesOwnCars: e.target.checked }))}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Manage vehicles for others</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Accept vehicles from other owners</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.managesOthersCars}
                      onChange={(e) => setSettings(prev => ({ ...prev, managesOthersCars: e.target.checked }))}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>
                </div>
              </div>

              {/* Invite Owner CTA */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                    <IoPeopleOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Ready to grow your fleet?
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Invite vehicle owners to add their cars to your managed fleet.
                    </p>
                    <Link
                      href="/host/fleet/invite-owner"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <IoPeopleOutline className="w-4 h-4" />
                      Invite Vehicle Owner
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">How Fleet Management Works</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                  <li>Platform takes 10% of all managed vehicle bookings</li>
                  <li>You negotiate commission split (10-50%) with each vehicle owner</li>
                  <li>Your public fleet page shows all vehicles you manage</li>
                  <li>Vehicle owners can find and invite you to manage their cars</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.push('/host/dashboard')}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <IoSaveOutline className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
