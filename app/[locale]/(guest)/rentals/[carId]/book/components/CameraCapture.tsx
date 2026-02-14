// app/(guest)/rentals/[carId]/book/components/CameraCapture.tsx
// Full-screen camera for DL photo capture — modeled after DriverLicenseScanner.
// Uses html5-qrcode to manage camera access (proven to work on mobile).
// DL-sized positioning frame + manual capture button.

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { IoClose, IoCameraOutline, IoFlashOutline } from 'react-icons/io5'

interface CameraCaptureProps {
  isOpen: boolean
  onCapture: (file: File) => void
  onClose: () => void
  onCameraError?: () => void
  label: string
  facingMode?: 'environment' | 'user'
  guideShape?: 'rectangle' | 'circle'
}

export function CameraCapture({
  isOpen,
  onCapture,
  onClose,
  onCameraError,
  label,
  facingMode = 'environment',
  guideShape = 'rectangle',
}: CameraCaptureProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isStarting, setIsStarting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)

  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch {
        // Ignore stop errors
      }
      scannerRef.current = null
    }
  }, [])

  // Start camera when modal opens
  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    document.body.style.overflow = 'hidden'
    setIsStarting(true)
    setError(null)

    const startCamera = async () => {
      if (!containerRef.current) return

      try {
        const scanner = new Html5Qrcode('dl-capture-container')
        scannerRef.current = scanner

        // Use square qrbox for circle (selfie) mode, rectangular for DL
        const qrbox = guideShape === 'circle'
          ? { width: 250, height: 250 }
          : { width: 300, height: 190 }

        await scanner.start(
          { facingMode },
          {
            fps: 1, // Low FPS — we're capturing photos, not scanning
            qrbox,
            aspectRatio: guideShape === 'circle' ? 1.0 : 1.75,
          } as any,
          () => {
            // Barcode decoded — we don't need this, but callback is required
          },
          () => {
            // Scan error per frame — ignore
          }
        )

        // For circle mode, inject a circular face guide overlay
        if (guideShape === 'circle' && !cancelled) {
          requestAnimationFrame(() => {
            const container = document.getElementById('dl-capture-container')
            if (!container) return

            // Hide the default rectangular qrbox border
            const qrRegion = container.querySelector('#qr-shaded-region')
            if (qrRegion) (qrRegion as HTMLElement).style.display = 'none'

            // Add circular overlay
            const existing = container.querySelector('.face-guide-overlay')
            if (!existing) {
              const overlay = document.createElement('div')
              overlay.className = 'face-guide-overlay'
              overlay.style.cssText = `
                position: absolute;
                inset: 0;
                pointer-events: none;
                z-index: 10;
              `
              overlay.innerHTML = `
                <div style="
                  position: absolute;
                  inset: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <div style="
                    width: 200px;
                    height: 200px;
                    border-radius: 50%;
                    border: 3px dashed rgba(255, 255, 255, 0.8);
                    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
                  "></div>
                </div>
                <div style="
                  position: absolute;
                  bottom: 12px;
                  left: 0;
                  right: 0;
                  text-align: center;
                ">
                  <p style="color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 600; margin: 0;">
                    Position your face here
                  </p>
                  <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin-top: 2px;">
                    Hold your license next to your face
                  </p>
                </div>
              `
              container.style.position = 'relative'
              container.appendChild(overlay)
            }
          })
        }

        if (!cancelled) setIsStarting(false)
      } catch (err) {
        console.error('[CameraCapture] Camera start error:', err)
        if (!cancelled) {
          setError('Unable to access camera. Please check permissions.')
          setIsStarting(false)
          // Don't auto-trigger fallback — let user choose via "Use Phone Camera" button
        }
      }
    }

    startCamera()

    return () => {
      cancelled = true
      document.body.style.overflow = ''
      stopCamera()
    }
  }, [isOpen, facingMode, guideShape, stopCamera])

  // Capture a photo from the video stream
  const handleCapture = useCallback(async () => {
    if (capturing) return
    setCapturing(true)

    try {
      // html5-qrcode renders a <video> element inside the container
      const container = document.getElementById('dl-capture-container')
      const video = container?.querySelector('video')

      if (!video) {
        setCapturing(false)
        return
      }

      // Draw video frame to a temporary canvas
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setCapturing(false)
        return
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to blob → File
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.92)
      )
      if (!blob) {
        setCapturing(false)
        return
      }

      const file = new File([blob], `dl-${Date.now()}.jpg`, { type: 'image/jpeg' })

      // Stop camera before passing file back
      await stopCamera()
      onCapture(file)
    } catch (err) {
      console.error('[CameraCapture] Capture error:', err)
    } finally {
      setCapturing(false)
    }
  }, [capturing, onCapture, stopCamera])

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col">
      {/* Header — same style as DriverLicenseScanner */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <div className="flex items-center gap-2 text-white">
          <IoCameraOutline className="w-5 h-5" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <IoClose className="w-5 h-5" />
        </button>
      </div>

      {/* Camera Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm">
          {/* html5-qrcode renders camera + scanning frame here */}
          <div
            id="dl-capture-container"
            ref={containerRef}
            className="w-full rounded-lg overflow-hidden bg-gray-900"
          />

          {/* Loading State */}
          {isStarting && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-3" />
                <p className="text-white/70 text-sm">Starting camera...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg p-4">
              <div className="text-center">
                <IoCameraOutline className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-red-400 text-sm mb-1">{error}</p>
                <p className="text-white/50 text-xs mb-4">
                  Camera requires a secure (HTTPS) connection.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => { onCameraError?.(); handleClose() }}
                    className="px-4 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Use Phone Camera
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Capture Button + Instructions */}
      <div className="p-4 bg-black/50">
        <div className="max-w-sm mx-auto">
          {/* Capture button */}
          {!isStarting && !error && (
            <button
              onClick={handleCapture}
              disabled={capturing}
              className="w-full mb-4 py-3.5 bg-white hover:bg-gray-100 text-black text-sm font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {capturing ? (
                <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full border-[3px] border-gray-900" />
                  <span>Capture Photo</span>
                </>
              )}
            </button>
          )}

          {/* Instructions */}
          <div className="flex items-start gap-3 text-white/80 text-xs">
            <IoFlashOutline className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">
                {guideShape === 'circle' ? 'Tips for a good selfie:' : 'Tips for a good capture:'}
              </p>
              <ul className="space-y-0.5 text-white/60">
                {guideShape === 'circle' ? (
                  <>
                    <li>• Position your face within the circle</li>
                    <li>• Hold your license next to your face</li>
                    <li>• Make sure both are clearly visible</li>
                    <li>• Good lighting, no shadows</li>
                  </>
                ) : (
                  <>
                    <li>• Position your license within the frame</li>
                    <li>• Place on a flat, dark surface</li>
                    <li>• Ensure good lighting, no glare</li>
                    <li>• All 4 corners must be visible</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CameraCapture
