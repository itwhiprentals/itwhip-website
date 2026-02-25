// app/fleet/partners/[id]/edit/page.tsx
// Fleet admin — edit partner business profile

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoSaveOutline,
  IoCloseOutline,
  IoImageOutline,
} from 'react-icons/io5'

interface PartnerFormData {
  name: string
  partnerCompanyName: string
  partnerLogo: string
  partnerSlug: string
  partnerBio: string
  partnerSupportEmail: string
  partnerSupportPhone: string
}

export default function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    partnerCompanyName: '',
    partnerLogo: '',
    partnerSlug: '',
    partnerBio: '',
    partnerSupportEmail: '',
    partnerSupportPhone: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/fleet/partners/${resolvedParams.id}?key=${apiKey}`)
        if (res.ok) {
          const data = await res.json()
          const p = data.partner
          setCompanyName(p.partnerCompanyName || p.name || 'Partner')
          setFormData({
            name: p.name || '',
            partnerCompanyName: p.partnerCompanyName || '',
            partnerLogo: p.partnerLogo || '',
            partnerSlug: p.partnerSlug || '',
            partnerBio: p.partnerBio || '',
            partnerSupportEmail: p.partnerSupportEmail || '',
            partnerSupportPhone: p.partnerSupportPhone || '',
          })
        }
      } catch (err) {
        console.error('Failed to load partner:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [resolvedParams.id, apiKey])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/fleet/partners/${resolvedParams.id}?key=${apiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert('Partner updated successfully')
        router.push(`/fleet/partners/${resolvedParams.id}?key=${apiKey}`)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to update partner')
      }
    } catch (err) {
      console.error('Update error:', err)
      alert('Error updating partner')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/fleet/partners/${resolvedParams.id}?key=${apiKey}`}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
          >
            <IoArrowBackOutline className="text-xl" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Edit: {companyName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update partner business profile
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Used for internal communication and emails</p>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="partnerCompanyName"
                value={formData.partnerCompanyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Displayed publicly on guest-facing pages</p>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                name="partnerLogo"
                value={formData.partnerLogo}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {formData.partnerLogo && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <img
                      src={formData.partnerLogo}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">Preview</span>
                </div>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">/rideshare/</span>
                <input
                  type="text"
                  name="partnerSlug"
                  value={formData.partnerSlug}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Partner Bio
              </label>
              <textarea
                name="partnerBio"
                value={formData.partnerBio}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Support Contact */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  name="partnerSupportEmail"
                  value={formData.partnerSupportEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Support Phone
                </label>
                <input
                  type="tel"
                  name="partnerSupportPhone"
                  value={formData.partnerSupportPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              <IoSaveOutline />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/fleet/partners/${resolvedParams.id}?key=${apiKey}`}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
            >
              <IoCloseOutline />
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
