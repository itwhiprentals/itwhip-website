// app/fleet/messages/components/AttachmentDisplay.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatFileSize, getFileIcon } from '@/lib/cloudinary-upload'

export interface Attachment {
  url: string
  name: string
  type: string
  size: number
}

interface AttachmentDisplayProps {
  attachments: Attachment[]
  compact?: boolean
}

export default function AttachmentDisplay({ 
  attachments, 
  compact = false 
}: AttachmentDisplayProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  if (!attachments || attachments.length === 0) return null

  const handleImageError = (url: string) => {
    setImageErrors(prev => new Set(prev).add(url))
  }

  const getFileTypeIcon = (type: string) => {
    const iconType = getFileIcon(type)
    
    switch (iconType) {
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9L13,3.5V9H18.5M6,20V4H11V10H18V20H6Z" />
          </svg>
        )
      case 'doc':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19H8V14H10V19M14,19H12V14H14V19M10,13H8V10H10V13M14,13H12V10H14V13Z" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
    }
  }

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a')
    link.href = attachment.url
    link.download = attachment.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <div className={`mt-2 ${compact ? 'space-y-1' : 'space-y-2'}`}>
        <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {attachments.map((attachment, index) => {
            const isImage = attachment.type.startsWith('image/')
            const hasError = imageErrors.has(attachment.url)

            if (isImage && !hasError) {
              // Image Attachment
              return (
                <div
                  key={index}
                  className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                  onClick={() => setLightboxImage(attachment.url)}
                >
                  <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={attachment.url}
                      alt={attachment.name}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(attachment.url)}
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <svg 
                        className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                  {!compact && (
                    <div className="p-2 bg-white dark:bg-gray-800">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  )}
                </div>
              )
            } else {
              // Document Attachment
              return (
                <button
                  key={index}
                  onClick={() => handleDownload(attachment)}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors text-left group"
                >
                  <div className="flex-shrink-0">
                    {getFileTypeIcon(attachment.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg 
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </button>
              )
            }
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <div 
            className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage}
              alt="Full size image"
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Download Button */}
          <button
            onClick={() => {
              const attachment = attachments.find(a => a.url === lightboxImage)
              if (attachment) handleDownload(attachment)
            }}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </button>

          {/* Image Counter (if multiple images) */}
          {attachments.filter(a => a.type.startsWith('image/')).length > 1 && (
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/10 rounded-full text-white text-sm">
              {attachments.findIndex(a => a.url === lightboxImage) + 1} / {attachments.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}