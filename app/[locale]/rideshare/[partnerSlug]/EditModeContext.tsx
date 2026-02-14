// app/rideshare/[partnerSlug]/EditModeContext.tsx
// Context for managing edit mode state across the preview page

'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type EditableSection =
  | 'hero'
  | 'photo'
  | 'benefits'
  | 'services'
  | 'vehicles'
  | 'reviews'
  | 'policies'
  | 'faqs'
  | 'social'
  | 'addCar'
  | null

interface LandingPageData {
  // Content
  headline: string
  subheadline: string
  bio: string
  // Branding
  logo: string | null
  heroImage: string | null
  heroImageFilter: boolean
  primaryColor: string
  // Services
  enableRideshare: boolean
  enableRentals: boolean
  enableSales: boolean
  enableLeasing: boolean
  enableRentToOwn: boolean
  // Contact & Social
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
  // Policies (object structure from database)
  policies: {
    refundPolicy: string
    cancellationPolicy: string
    bookingRequirements: string
    additionalTerms: string
  }
  // FAQs
  faqs: Array<{ question: string; answer: string }>
}

interface EditModeContextType {
  isEditMode: boolean
  activeSheet: EditableSection
  data: LandingPageData | null
  isSaving: boolean
  openSheet: (section: EditableSection) => void
  closeSheet: () => void
  setData: (data: LandingPageData) => void
  updateData: (updates: Partial<LandingPageData>) => void
  saveSection: (section: EditableSection, sectionData: Partial<LandingPageData>) => Promise<boolean>
}

const EditModeContext = createContext<EditModeContextType | null>(null)

export function useEditMode() {
  const context = useContext(EditModeContext)
  if (!context) {
    // Return a stub for non-edit mode
    return {
      isEditMode: false,
      activeSheet: null,
      data: null,
      isSaving: false,
      openSheet: () => {},
      closeSheet: () => {},
      setData: () => {},
      updateData: () => {},
      saveSection: async () => false
    }
  }
  return context
}

interface EditModeProviderProps {
  children: ReactNode
  initialData: LandingPageData | null
  isEditMode: boolean
}

export function EditModeProvider({ children, initialData, isEditMode }: EditModeProviderProps) {
  const [activeSheet, setActiveSheet] = useState<EditableSection>(null)
  const [data, setData] = useState<LandingPageData | null>(initialData)
  const [isSaving, setIsSaving] = useState(false)

  const openSheet = useCallback((section: EditableSection) => {
    if (isEditMode) {
      setActiveSheet(section)
    }
  }, [isEditMode])

  const closeSheet = useCallback(() => {
    setActiveSheet(null)
  }, [])

  const updateData = useCallback((updates: Partial<LandingPageData>) => {
    setData(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const saveSection = useCallback(async (section: EditableSection, sectionData: Partial<LandingPageData>): Promise<boolean> => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/partner/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(sectionData)
      })

      const result = await res.json()

      if (result.success) {
        // Update local data with saved changes
        updateData(sectionData)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to save section:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [updateData])

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        activeSheet,
        data,
        isSaving,
        openSheet,
        closeSheet,
        setData,
        updateData,
        saveSection
      }}
    >
      {children}
    </EditModeContext.Provider>
  )
}
