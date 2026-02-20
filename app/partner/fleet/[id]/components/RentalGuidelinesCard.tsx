// app/partner/fleet/[id]/components/RentalGuidelinesCard.tsx

'use client'

import Link from 'next/link'
import {
  IoCreateOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline
} from 'react-icons/io5'

interface RentalGuidelinesCardProps {
  vehicleId: string
  rules: string | null  // JSON string array or plain text
}

function parseRules(rules: string | null): string[] {
  if (!rules || rules.trim() === '') return []

  // Try JSON.parse first (JSON array of strings)
  try {
    const parsed = JSON.parse(rules)
    if (Array.isArray(parsed)) {
      return parsed.filter((r: unknown) => typeof r === 'string' && r.trim() !== '')
    }
  } catch {
    // Not valid JSON, fallback to splitting
  }

  // Fallback: split by semicolons, periods, or newlines
  const splitRules = rules
    .split(/[;\n]|(?<=\.)\s/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0)

  return splitRules
}

export default function RentalGuidelinesCard({
  vehicleId,
  rules
}: RentalGuidelinesCardProps) {
  const parsedRules = parseRules(rules)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoDocumentTextOutline className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          Rental Guidelines
        </h2>
        <Link
          href={`/partner/fleet/${vehicleId}/edit?tab=guidelines`}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm flex items-center gap-1 transition-colors"
        >
          <IoCreateOutline className="w-4 h-4" />
          Edit
        </Link>
      </div>

      {/* Rules List */}
      {parsedRules.length > 0 ? (
        <ul className="space-y-2 sm:space-y-3">
          {parsedRules.map((rule, index) => (
            <li key={index} className="flex items-start gap-2">
              <IoCheckmarkCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {rule}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-3 sm:py-6">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
            No rental guidelines set yet.
          </p>
          <Link
            href={`/partner/fleet/${vehicleId}/edit?tab=guidelines`}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-xs sm:text-sm font-medium transition-colors"
          >
            Add rules in Full Edit
          </Link>
        </div>
      )}

      {/* Footer Helper Text */}
      <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
        These rules are shown to guests before booking.
      </p>
    </div>
  )
}
