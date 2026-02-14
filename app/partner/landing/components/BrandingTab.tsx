// app/partner/landing/components/BrandingTab.tsx
// Logo, hero image, and color settings tab

'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { IoSaveOutline, IoCloudUploadOutline } from 'react-icons/io5'
import { LandingPageData } from './types'

interface BrandingTabProps {
  data: LandingPageData
  onChange: (updates: Partial<LandingPageData>) => void
  onSave: () => void
  isSaving: boolean
}

export default function BrandingTab({ data, onChange, onSave, isSaving }: BrandingTabProps) {
  const t = useTranslations('PartnerLanding')
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingHero, setIsUploadingHero] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const heroInputRef = useRef<HTMLInputElement>(null)

  // Logo upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setUploadError(t('invalidFileTypeLogo'))
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError(t('fileTooLargeLogo'))
      return
    }

    setIsUploadingLogo(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/partner/logo', {
        method: 'POST',
        body: formData
      })

      const result = await res.json()

      if (result.success) {
        onChange({ logo: result.logo })
      } else {
        setUploadError(result.error || t('failedToUploadLogo'))
      }
    } catch {
      setUploadError(t('failedToUploadLogo'))
    } finally {
      setIsUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  // Hero image upload handler
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError(t('invalidFileTypeHero'))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t('fileTooLargeHero'))
      return
    }

    setIsUploadingHero(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/partner/hero-image', {
        method: 'POST',
        body: formData
      })

      const result = await res.json()

      if (result.success) {
        onChange({ heroImage: result.heroImage })
      } else {
        setUploadError(result.error || t('failedToUploadHero'))
      }
    } catch {
      setUploadError(t('failedToUploadHero'))
    } finally {
      setIsUploadingHero(false)
      if (heroInputRef.current) heroInputRef.current.value = ''
    }
  }

  // Delete logo handler
  const handleDeleteLogo = async () => {
    if (!data.logo) return

    try {
      const res = await fetch('/api/partner/logo', { method: 'DELETE' })
      const result = await res.json()

      if (result.success) {
        onChange({ logo: null })
      } else {
        setUploadError(result.error || t('failedToDeleteLogo'))
      }
    } catch {
      setUploadError(t('failedToDeleteLogo'))
    }
  }

  // Delete hero image handler
  const handleDeleteHero = async () => {
    if (!data.heroImage) return

    try {
      const res = await fetch('/api/partner/hero-image', { method: 'DELETE' })
      const result = await res.json()

      if (result.success) {
        onChange({ heroImage: null })
      } else {
        setUploadError(result.error || t('failedToDeleteHero'))
      }
    } catch {
      setUploadError(t('failedToDeleteHero'))
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      {/* Upload Error */}
      {uploadError && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {uploadError}
          <button
            onClick={() => setUploadError(null)}
            className="ml-2 text-red-500 hover:text-red-600"
          >
            {t('dismiss')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('companyLogo')}
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {t('logoDescription')}
          </p>
          <input
            type="file"
            ref={logoInputRef}
            onChange={handleLogoUpload}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
          />
          <div
            onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors overflow-hidden ${
              isUploadingLogo
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-6'
                : data.logo
                ? 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 p-2'
                : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 p-6'
            }`}
          >
            {isUploadingLogo ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-sm text-orange-600 dark:text-orange-400">{t('uploading')}</p>
              </div>
            ) : data.logo ? (
              <div className="space-y-2">
                <div
                  className="relative mx-auto rounded-lg overflow-hidden"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                  }}
                >
                  <img
                    src={data.logo}
                    alt="Company logo"
                    className="w-full h-32 object-contain bg-white/80 dark:bg-gray-900/80"
                  />
                </div>
                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      logoInputRef.current?.click()
                    }}
                    className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
                  >
                    {t('replace')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteLogo()
                    }}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <IoCloudUploadOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('clickToUploadLogo')}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t('logoSizeRecommended')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Hero Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('heroImage')}
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {t('heroDescription')}
          </p>
          <input
            type="file"
            ref={heroInputRef}
            onChange={handleHeroUpload}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <div
            onClick={() => !isUploadingHero && heroInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors overflow-hidden ${
              isUploadingHero
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-6'
                : data.heroImage
                ? 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 p-2'
                : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 p-6'
            }`}
          >
            {isUploadingHero ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-sm text-orange-600 dark:text-orange-400">{t('uploading')}</p>
              </div>
            ) : data.heroImage ? (
              <div className="space-y-2">
                <img
                  src={data.heroImage}
                  alt="Hero image"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      heroInputRef.current?.click()
                    }}
                    className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400"
                  >
                    {t('replace')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteHero()
                    }}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <IoCloudUploadOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('clickToUploadHero')}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t('heroSizeRecommended')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('primaryColor')}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={data.primaryColor}
            onChange={(e) => onChange({ primaryColor: e.target.value })}
            className="w-12 h-12 p-1 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={data.primaryColor}
            onChange={(e) => onChange({ primaryColor: e.target.value })}
            placeholder="#f97316"
            className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('usedForButtons')}
          </span>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <IoSaveOutline className="w-4 h-4" />
          {isSaving ? t('saving') : t('saveBranding')}
        </button>
      </div>
    </div>
  )
}
