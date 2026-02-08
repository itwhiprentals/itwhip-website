// app/rideshare/[partnerSlug]/EditModeWrapper.tsx
// Client-side wrapper that provides edit mode context and section editors

'use client'

import { useEffect, useState } from 'react'
import { EditModeProvider } from './EditModeContext'
import SectionEditors from './SectionEditors'

interface LandingPageData {
  headline: string
  subheadline: string
  bio: string
  logo: string | null
  heroImage: string | null
  heroImageFilter: boolean
  primaryColor: string
  enableRideshare: boolean
  enableRentals: boolean
  enableSales: boolean
  enableLeasing: boolean
  enableRentToOwn: boolean
  supportEmail: string
  supportPhone: string
  website: string
  instagram: string
  facebook: string
  twitter: string
  linkedin: string
  tiktok: string
  youtube: string
  showEmail: boolean
  showPhone: boolean
  showWebsite: boolean
  policies: Array<{ title: string; content: string }>
  faqs: Array<{ question: string; answer: string }>
}

interface EditModeWrapperProps {
  children: React.ReactNode
  isEditMode: boolean
  hostId: string
}

export default function EditModeWrapper({
  children,
  isEditMode,
  hostId
}: EditModeWrapperProps) {
  const [data, setData] = useState<LandingPageData | null>(null)
  const [isLoading, setIsLoading] = useState(isEditMode)

  // Fetch landing page data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchLandingData()
    }
  }, [isEditMode])

  const fetchLandingData = async () => {
    try {
      const res = await fetch('/api/partner/landing', {
        credentials: 'include'
      })
      const result = await res.json()
      if (result.success && result.data) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch landing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while fetching data in edit mode
  if (isEditMode && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <EditModeProvider
      initialData={data as any}
      isEditMode={isEditMode}
    >
      {children}
      {isEditMode && <SectionEditors />}
    </EditModeProvider>
  )
}
