// app/components/VinScanner.tsx
// Camera-based VIN barcode scanner using html5-qrcode

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { IoClose, IoCameraOutline, IoFlashOutline } from 'react-icons/io5'

interface VinScannerProps {
  onScan: (vin: string) => void
  onClose: () => void
}

export default function VinScanner({ onScan, onClose }: VinScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(true)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (e) {
        // Ignore stop errors
      }
      scannerRef.current = null
    }
  }, [])

  useEffect(() => {
    const startScanner = async () => {
      if (!containerRef.current) return

      try {
        const scanner = new Html5Qrcode('vin-scanner-container')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 80 },
            aspectRatio: 3.5,
            formatsToSupport: [0, 2, 4] // CODE_39, CODE_128, QR_CODE
          },
          (decodedText) => {
            // Validate VIN format (17 alphanumeric, no I, O, Q)
            const cleanVin = decodedText.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '')
            if (cleanVin.length === 17) {
              stopScanner()
              onScan(cleanVin)
            }
          },
          () => {
            // Scan error - ignore (happens on each frame without valid code)
          }
        )

        setIsStarting(false)
      } catch (err) {
        console.error('Scanner start error:', err)
        setError('Unable to access camera. Please check permissions.')
        setIsStarting(false)
      }
    }

    startScanner()

    return () => {
      stopScanner()
    }
  }, [onScan, stopScanner])

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <div className="flex items-center gap-2 text-white">
          <IoCameraOutline className="w-5 h-5" />
          <span className="text-sm font-medium">Scan VIN Barcode</span>
        </div>
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <IoClose className="w-5 h-5" />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm">
          {/* Scanner Container */}
          <div
            id="vin-scanner-container"
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
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={handleClose}
                  className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-black/50">
        <div className="max-w-sm mx-auto">
          <div className="flex items-start gap-3 text-white/80 text-xs">
            <IoFlashOutline className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Tips for scanning:</p>
              <ul className="space-y-0.5 text-white/60">
                <li>• VIN barcode is usually on driver door jamb</li>
                <li>• Also check bottom of windshield (driver side)</li>
                <li>• Hold steady and ensure good lighting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
