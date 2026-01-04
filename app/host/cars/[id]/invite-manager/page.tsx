// app/host/cars/[id]/invite-manager/page.tsx
// Form for vehicle owners to invite a fleet manager
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import {
  IoPersonAddOutline,
  IoMailOutline,
  IoCashOutline,
  IoShieldCheckmarkOutline,
  IoArrowBackOutline,
  IoCheckmarkCircle,
  IoInformationCircleOutline,
  IoSendOutline,
  IoCarOutline,
  IoAddCircleOutline,
  IoCloseCircleOutline
} from 'react-icons/io5'

interface Car {
  id: string
  make: string
  model: string
  year: number
  photos: { url: string }[]
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function InviteManagerPage({ params }: PageProps) {
  const { id: carId } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [cars, setCars] = useState<Car[]>([])
  const [selectedCarIds, setSelectedCarIds] = useState<string[]>([carId])
  const [carsLoading, setCarsLoading] = useState(true)

  // Form state
  const [email, setEmail] = useState('')
  const [ownerPercent, setOwnerPercent] = useState(70)
  const [managerPercent, setManagerPercent] = useState(30)
  const [message, setMessage] = useState('')
  const [permissions, setPermissions] = useState({
    canEditListing: true,
    canAdjustPricing: true,
    canCommunicateGuests: true,
    canApproveBookings: true,
    canHandleIssues: true
  })

  // Load user's cars
  useEffect(() => {
    async function loadCars() {
      try {
        const response = await fetch('/api/host/cars')
        const data = await response.json()
        if (data.cars) {
          // Filter out cars that already have managers
          const availableCars = data.cars.filter((car: any) => !car.vehicleManagement)
          setCars(availableCars)
        }
      } catch (err) {
        console.error('Failed to load cars:', err)
      } finally {
        setCarsLoading(false)
      }
    }
    loadCars()
  }, [])

  function handleSliderChange(value: number) {
    setOwnerPercent(value)
    setManagerPercent(100 - value)
  }

  function togglePermission(key: keyof typeof permissions) {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleCarSelection(id: string) {
    setSelectedCarIds(prev =>
      prev.includes(id)
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (selectedCarIds.length === 0) {
      setError('Please select at least one vehicle')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'OWNER_INVITES_MANAGER',
          recipientEmail: email,
          vehicleIds: selectedCarIds,
          proposedOwnerPercent: ownerPercent,
          proposedManagerPercent: managerPercent,
          permissions,
          message: message || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send invitation')
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Failed to send invitation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoCheckmarkCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Sent!</h1>
            <p className="text-gray-600 mb-6">
              We've sent an invitation to <strong>{email}</strong>. They'll receive an email with instructions to manage your vehicle{selectedCarIds.length > 1 ? 's' : ''}.
            </p>
            <div className="space-y-3">
              <Link
                href="/host/cars"
                className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition text-center"
              >
                Back to My Cars
              </Link>
              <Link
                href="/host/dashboard"
                className="block w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition text-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-xl mx-auto px-4 py-8 sm:py-12">
        {/* Back Link */}
        <Link
          href={`/host/cars/${carId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <IoArrowBackOutline className="w-5 h-5" />
          Back to Vehicle
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <IoPersonAddOutline className="w-7 h-7 text-indigo-600" />
            Invite Fleet Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Invite a fleet manager to handle your vehicle. They'll manage bookings, guest communications, and day-to-day operations while you earn passive income.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IoCarOutline className="w-5 h-5" />
              Select Vehicles
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose which vehicles you want this manager to handle:
            </p>

            {carsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-16 bg-gray-100 rounded-lg"></div>
                <div className="h-16 bg-gray-100 rounded-lg"></div>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <IoCarOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No vehicles available for management</p>
                <p className="text-sm text-gray-500">All your vehicles may already have managers assigned.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cars.map(car => (
                  <label
                    key={car.id}
                    className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition ${
                      selectedCarIds.includes(car.id)
                        ? 'bg-indigo-50 border-2 border-indigo-500'
                        : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCarIds.includes(car.id)}
                      onChange={() => toggleCarSelection(car.id)}
                      className="sr-only"
                    />
                    {car.photos[0] && (
                      <Image
                        src={car.photos[0].url}
                        alt={`${car.make} ${car.model}`}
                        width={80}
                        height={60}
                        className="rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {car.year} {car.make} {car.model}
                      </p>
                    </div>
                    {selectedCarIds.includes(car.id) ? (
                      <IoCheckmarkCircle className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <IoAddCircleOutline className="w-6 h-6 text-gray-400" />
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Manager Email */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IoMailOutline className="w-5 h-5" />
              Manager's Email
            </h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@example.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              We'll send them an invitation email with your proposed terms.
            </p>
          </div>

          {/* Commission Split */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IoCashOutline className="w-5 h-5" />
              Proposed Commission Split
            </h2>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2 mb-3">
                <IoInformationCircleOutline className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Platform always takes 10% first. The remaining 90% is split between you and the manager.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">You (Owner): {ownerPercent}%</span>
                <span className="text-sm font-medium text-gray-700">Manager: {managerPercent}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={90}
                value={ownerPercent}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Your min: 50%</span>
                <span>Your max: 90%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600">You get</p>
                <p className="text-xl font-bold text-indigo-600">{(ownerPercent * 0.9).toFixed(0)}%</p>
                <p className="text-xs text-gray-500">of total revenue</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Manager gets</p>
                <p className="text-xl font-bold text-purple-600">{(managerPercent * 0.9).toFixed(0)}%</p>
                <p className="text-xs text-gray-500">of total revenue</p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <IoShieldCheckmarkOutline className="w-5 h-5" />
              Manager Permissions
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select what the manager will be able to do with your vehicle:
            </p>
            <div className="space-y-3">
              {[
                { key: 'canEditListing', label: 'Edit vehicle listings', desc: 'Update photos, description, features' },
                { key: 'canAdjustPricing', label: 'Adjust pricing', desc: 'Change daily, weekly, monthly rates' },
                { key: 'canCommunicateGuests', label: 'Communicate with guests', desc: 'Handle messages and inquiries' },
                { key: 'canApproveBookings', label: 'Approve/decline bookings', desc: 'Manage booking requests' },
                { key: 'canHandleIssues', label: 'Handle issues and claims', desc: 'Manage problems and damage claims' }
              ].map(perm => (
                <label
                  key={perm.key}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                    permissions[perm.key as keyof typeof permissions]
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={permissions[perm.key as keyof typeof permissions]}
                    onChange={() => togglePermission(perm.key as keyof typeof permissions)}
                    className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{perm.label}</p>
                    <p className="text-sm text-gray-500">{perm.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Message (Optional)
            </h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to include in the invitation..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || selectedCarIds.length === 0}
            className="w-full bg-indigo-600 text-white py-4 px-4 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <IoSendOutline className="w-5 h-5" />
            {loading ? 'Sending Invitation...' : `Send Invitation for ${selectedCarIds.length} Vehicle${selectedCarIds.length > 1 ? 's' : ''}`}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  )
}
