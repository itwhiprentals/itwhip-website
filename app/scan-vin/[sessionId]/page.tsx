// app/scan-vin/[sessionId]/page.tsx
// Standalone VIN scanner page for phone scanning from desktop QR code

'use client'

import { useEffect, useRef, useState, useCallback, use } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { IoCheckmarkCircle, IoCloseCircle, IoCameraOutline, IoFlashOutline, IoCarSportOutline } from 'react-icons/io5'
import Image from 'next/image'

interface PageProps {
  params: Promise<{ sessionId: string }>
}

export default function VinScannerPage({ params }: PageProps) {
  const { sessionId } = use(params)
  const [status, setStatus] = useState<'scanning' | 'success' | 'error'>('scanning')
  const [error, setError] = useState<string | null>(null)
  const [scannedVin, setScannedVin] = useState<string | null>(null)
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

  const submitVin = useCallback(async (vin: string) => {
    try {
      const res = await fetch('/api/vin-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, vin })
      })

      const data = await res.json()

      if (data.success) {
        setScannedVin(vin)
        setStatus('success')
      } else {
        setError(data.error || 'Failed to send VIN')
        setStatus('error')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setStatus('error')
    }
  }, [sessionId])

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
          } as any,
          (decodedText) => {
            // Validate VIN format (17 alphanumeric, no I, O, Q)
            const cleanVin = decodedText.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '')
            if (cleanVin.length === 17) {
              stopScanner()
              submitVin(cleanVin)
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
        setStatus('error')
        setIsStarting(false)
      }
    }

    startScanner()

    return () => {
      stopScanner()
    }
  }, [submitVin, stopScanner])

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 flex flex-col items-center justify-center p-6 text-white">
        <IoCheckmarkCircle className="w-20 h-20 mb-4" />
        <h1 className="text-2xl font-bold mb-2">VIN Sent!</h1>
        <p className="text-green-100 text-center mb-4">
          The VIN has been sent to your computer.
        </p>
        <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-3 font-mono text-lg tracking-wider">
          {scannedVin}
        </div>
        <p className="text-green-100 text-sm mt-6 text-center">
          You can close this page now.
        </p>
      </div>
    )
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-500 to-red-600 flex flex-col items-center justify-center p-6 text-white">
        <IoCloseCircle className="w-20 h-20 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-red-100 text-center mb-6">
          {error || 'Unable to scan VIN. Please try again.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-white text-red-600 font-medium rounded-lg"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Scanning state
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 p-4 bg-black/30">
        <IoCarSportOutline className="w-6 h-6 text-orange-500" />
        <span className="text-white font-semibold">ItWhip VIN Scanner</span>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm">
          {/* Scanner Container */}
          <div
            id="vin-scanner-container"
            ref={containerRef}
            className="w-full rounded-2xl overflow-hidden bg-gray-800"
          />

          {/* Loading State */}
          {isStarting && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-2xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-orange-500 border-t-transparent mx-auto mb-4" />
                <p className="text-white/70 text-sm">Starting camera...</p>
              </div>
            </div>
          )}

          {/* Scan Frame Overlay */}
          {!isStarting && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[280px] h-[80px] border-2 border-orange-500 rounded-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500 rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-500 rounded-br" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-6 bg-black/30">
        <div className="max-w-sm mx-auto space-y-4">
          <h2 className="text-white font-semibold text-center">Scan VIN Barcode</h2>

          <div className="space-y-3 text-white/70 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">1</span>
              </div>
              <p>Find VIN barcode on driver door jamb or bottom-left of windshield</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">2</span>
              </div>
              <p>Position barcode within the frame above</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-400 text-xs font-bold">3</span>
              </div>
              <p>VIN will be sent to your computer automatically</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg">
            <IoFlashOutline className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <p className="text-white/60 text-xs">Tip: Ensure good lighting for best results</p>
          </div>
        </div>
      </div>
    </div>
  )
}
