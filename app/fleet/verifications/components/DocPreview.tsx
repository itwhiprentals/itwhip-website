// app/fleet/verifications/components/DocPreview.tsx
'use client'

import { IoDocumentOutline, IoEyeOutline } from 'react-icons/io5'

interface DocPreviewProps {
  label: string
  url: string | null
  onView: (url: string) => void
}

export default function DocPreview({ label, url, onView }: DocPreviewProps) {
  if (!url) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center">
        <IoDocumentOutline className="w-6 h-6 mx-auto text-gray-400 mb-1" />
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xs text-gray-300 dark:text-gray-500">Not uploaded</p>
      </div>
    )
  }

  return (
    <div
      className="relative group bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer"
      onClick={() => onView(url)}
    >
      <img src={url} alt={label} className="w-full h-20 object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <IoEyeOutline className="text-white opacity-0 group-hover:opacity-100 text-xl transition-opacity" />
      </div>
      <p className="text-xs text-center py-1 text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  )
}
