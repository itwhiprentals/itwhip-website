// app/components/DocumentViewer.tsx
'use client'

import { useState } from 'react'
import {
  IoCloseOutline,
  IoDownloadOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoRefreshOutline,
  IoExpandOutline
} from 'react-icons/io5'

interface DocumentViewerProps {
  documentUrl: string
  documentType: 'image' | 'pdf'
  title?: string
  onClose?: () => void
  className?: string
}

export default function DocumentViewer({
  documentUrl,
  documentType,
  title = 'Document',
  onClose,
  className = ''
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleZoomIn = () => {
    if (zoom < 200) setZoom(zoom + 25)
  }

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 25)
  }

  const handleRotate = () => {
    setRotation((rotation + 90) % 360)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = documentUrl
    link.download = title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImageLoad = () => {
    setLoading(false)
    setError(false)
  }

  const handleImageError = () => {
    setLoading(false)
    setError(true)
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <IoRemoveOutline className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <IoAddOutline className="w-5 h-5" />
          </button>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            title="Rotate"
          >
            <IoRefreshOutline className="w-5 h-5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            title="Fullscreen"
          >
            <IoExpandOutline className="w-5 h-5" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            title="Download"
          >
            <IoDownloadOutline className="w-5 h-5" />
          </button>

          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              title="Close"
            >
              <IoCloseOutline className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Document Display */}
      <div className={`overflow-auto bg-gray-100 dark:bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-96'}`}>
        <div className="flex items-center justify-center min-h-full p-4">
          {loading && !error && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading document...</p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-2">Failed to load document</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Please try refreshing or contact support</p>
            </div>
          )}

          {documentType === 'image' && !error && (
            <img
              src={documentUrl}
              alt={title}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              className="object-contain"
            />
          )}

          {documentType === 'pdf' && !error && (
            <iframe
              src={documentUrl}
              title={title}
              className="w-full h-full min-h-[600px]"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
      </div>
    </div>
  )
}