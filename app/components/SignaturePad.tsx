'use client'

import { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'

interface SignaturePadProps {
  onSignatureChange?: (isEmpty: boolean, dataUrl: string | null) => void
  width?: number
  height?: number
  penColor?: string
  backgroundColor?: string
  className?: string
  disabled?: boolean
}

export default function SignaturePad({
  onSignatureChange,
  width,
  height = 200,
  penColor = '#000000',
  backgroundColor = '#ffffff',
  className = '',
  disabled = false
}: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [canvasWidth, setCanvasWidth] = useState(width || 400)

  // Responsive canvas sizing
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current && !width) {
        const containerWidth = containerRef.current.offsetWidth
        setCanvasWidth(Math.min(containerWidth - 2, 600)) // -2 for border, max 600
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [width])

  const handleEnd = () => {
    if (sigCanvas.current) {
      const empty = sigCanvas.current.isEmpty()
      setIsEmpty(empty)

      if (onSignatureChange) {
        const dataUrl = empty ? null : sigCanvas.current.toDataURL('image/png')
        onSignatureChange(empty, dataUrl)
      }
    }
  }

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear()
      setIsEmpty(true)
      if (onSignatureChange) {
        onSignatureChange(true, null)
      }
    }
  }

  const getSignatureData = (): string | null => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      return sigCanvas.current.toDataURL('image/png')
    }
    return null
  }

  const getTrimmedCanvas = (): string | null => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      return sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
    }
    return null
  }

  return (
    <div ref={containerRef} className={`signature-pad-container ${className}`}>
      <div
        className={`relative border-2 rounded-lg overflow-hidden transition-colors ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : isEmpty
              ? 'border-gray-300 hover:border-orange-400'
              : 'border-orange-500'
        }`}
        style={{ backgroundColor }}
      >
        <SignatureCanvas
          ref={sigCanvas}
          penColor={penColor}
          canvasProps={{
            width: canvasWidth,
            height: height,
            className: `signature-canvas ${disabled ? 'pointer-events-none opacity-50' : ''}`,
            style: {
              width: '100%',
              height: `${height}px`,
              touchAction: 'none' // Prevents scroll on touch devices
            }
          }}
          onEnd={handleEnd}
          backgroundColor={backgroundColor}
        />

        {/* Placeholder text when empty */}
        {isEmpty && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm">Sign here</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          onClick={clear}
          disabled={disabled || isEmpty}
          className={`text-sm px-3 py-1 rounded transition-colors ${
            disabled || isEmpty
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
          }`}
        >
          Clear Signature
        </button>

        {!isEmpty && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Signature captured
          </span>
        )}
      </div>
    </div>
  )
}

// Export utility functions for external use
export { SignaturePad }
export type { SignaturePadProps }
