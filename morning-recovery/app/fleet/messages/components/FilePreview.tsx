// app/fleet/messages/components/FilePreview.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatFileSize, getFileIcon } from '@/lib/cloudinary-upload'

export interface FileWithPreview {
  file: File
  preview?: string
  id: string
}

interface FilePreviewProps {
  files: FileWithPreview[]
  onRemove: (id: string) => void
  uploading?: boolean
  uploadProgress?: { [key: string]: number }
}

export default function FilePreview({ 
  files, 
  onRemove, 
  uploading = false,
  uploadProgress = {}
}: FilePreviewProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const handleImageError = (id: string) => {
    setImageErrors(prev => new Set(prev).add(id))
  }

  const getFileTypeIcon = (type: string) => {
    const iconType = getFileIcon(type)
    
    switch (iconType) {
      case 'pdf':
        return (
          <svg className="w-full h-full text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9L13,3.5V9H18.5M6,20V4H11V10H18V20H6Z" />
          </svg>
        )
      case 'doc':
        return (
          <svg className="w-full h-full text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19H8V14H10V19M14,19H12V14H14V19M10,13H8V10H10V13M14,13H12V10H14V13Z" />
          </svg>
        )
      default:
        return (
          <svg className="w-full h-full text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        )
    }
  }

  if (files.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Attachments ({files.length})
        </h4>
        {uploading && (
          <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {files.map((fileWithPreview) => {
          const { file, preview, id } = fileWithPreview
          const isImage = file.type.startsWith('image/')
          const hasError = imageErrors.has(id)
          const progress = uploadProgress[id] || 0
          const isUploading = uploading && progress < 100

          return (
            <div
              key={id}
              className="relative group bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-all"
            >
              {/* Preview Area */}
              <div className="aspect-square relative">
                {isImage && preview && !hasError ? (
                  <Image
                    src={preview}
                    alt={file.name}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(id)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    {getFileTypeIcon(file.type)}
                  </div>
                )}

                {/* Upload Progress Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-white animate-spin mx-auto mb-2"></div>
                      <div className="text-white text-xs font-medium">{progress}%</div>
                    </div>
                  </div>
                )}

                {/* Remove Button */}
                {!uploading && (
                  <button
                    onClick={() => onRemove(id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* File Info */}
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Upload Progress Summary */}
      {uploading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Uploading files...
            </span>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {Object.values(uploadProgress).filter(p => p === 100).length} / {files.length}
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-full transition-all duration-300"
              style={{
                width: `${(Object.values(uploadProgress).reduce((a, b) => a + b, 0) / (files.length * 100)) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}