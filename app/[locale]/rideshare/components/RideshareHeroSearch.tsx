'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { IoSearchOutline, IoLocationOutline } from 'react-icons/io5'

export default function RideshareHeroSearch() {
  const [location, setLocation] = useState('')
  const router = useRouter()
  const t = useTranslations('Rideshare')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location.trim()) params.set('location', location.trim())
    router.push(`/rentals/search${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto mb-4">
      <div className="flex-1 relative">
        <IoLocationOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-3 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-1.5 shadow-lg text-sm"
      >
        <IoSearchOutline className="w-4 h-4" />
        {t('searchButton')}
      </button>
    </form>
  )
}
