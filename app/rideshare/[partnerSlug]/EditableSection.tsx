// app/rideshare/[partnerSlug]/EditableSection.tsx
// Wrapper component that makes sections clickable in edit mode

'use client'

import { useEditMode, EditableSection as SectionType } from './EditModeContext'
import { IoPencilOutline } from 'react-icons/io5'

interface EditableSectionProps {
  section: SectionType
  children: React.ReactNode
  label: string
  className?: string
}

export default function EditableSection({
  section,
  children,
  label,
  className = ''
}: EditableSectionProps) {
  const { isEditMode, openSheet } = useEditMode()

  if (!isEditMode) {
    return <>{children}</>
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Edit overlay button - appears on hover */}
      <button
        onClick={() => openSheet(section)}
        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2
          bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium
          rounded-lg shadow-lg opacity-0 group-hover:opacity-100
          transition-all duration-200 transform scale-95 group-hover:scale-100"
        title={`Edit ${label}`}
      >
        <IoPencilOutline className="w-4 h-4" />
        Edit {label}
      </button>

      {/* Highlight border on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-500/50 rounded-lg pointer-events-none z-10 transition-colors" />

      {/* Original content */}
      {children}
    </div>
  )
}
