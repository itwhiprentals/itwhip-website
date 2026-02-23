// app/(guest)/rentals/components/modals/modal-primitives.tsx
// Shared presentational building blocks for modal bottomsheets

import { ReactNode } from 'react'

interface IconListItemProps {
  icon: ReactNode
  children: ReactNode
}

/** A flex list-item row with an icon on the left and content on the right */
export function IconListItem({ icon, children }: IconListItemProps) {
  return (
    <li className="flex items-start">
      <span className="flex-shrink-0 mt-0.5 mr-2">{icon}</span>
      <span>{children}</span>
    </li>
  )
}

interface SectionBoxProps {
  children: ReactNode
  color?: string
  className?: string
}

const sectionColorMap: Record<string, string> = {
  green: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
  blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
  red: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800',
  amber: 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800',
  purple: 'bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800',
  orange: 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800',
  gray: 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600',
  white: 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700',
}

/** Colored rounded container for section content */
export function SectionBox({ children, color = 'gray', className = '' }: SectionBoxProps) {
  return (
    <div className={`${sectionColorMap[color] || sectionColorMap.gray} border rounded-lg p-3 sm:p-4 ${className}`}>
      {children}
    </div>
  )
}

interface NumberedStepProps {
  step: number
  children: ReactNode
}

/** Purple numbered circle badge with content — for claims process steps */
export function NumberedStep({ step, children }: NumberedStepProps) {
  return (
    <li className="flex items-start">
      <span className="bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 text-xs">
        {step}
      </span>
      <div>{children}</div>
    </li>
  )
}

interface BulletListProps {
  items: string[]
  className?: string
}

/** Simple bullet list from an array of strings */
export function BulletList({ items, className = '' }: BulletListProps) {
  return (
    <ul className={`text-xs space-y-1 ${className}`}>
      {items.map((item, i) => (
        <li key={i}>• {item}</li>
      ))}
    </ul>
  )
}
