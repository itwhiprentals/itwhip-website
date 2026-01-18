// app/components/DesktopVinScanModal.tsx
// Desktop modal showing QR code for phone VIN scanning

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'
import { IoClose, IoPhonePortraitOutline, IoQrCodeOutline, IoCheckmarkCircle, IoSyncOutline } from 'react-icons/io5'

interface DesktopVinScanModalProps {
  isOpen: boolean
  onClose: () => void
  onVinReceived: (vin: string) => void
}

function generateSessionId(): string {
  return `vin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export default function DesktopVinScanModal({
  isOpen,
  onClose,
  onVinReceived
}: DesktopVinScanModalProps) {
  const [sessionId] = useState(() => generateSessionId())
  const [status, setStatus] = useState<'waiting' | 'received'>('waiting')
  const [receivedVin, setReceivedVin] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Handle mounting for portal (SSR safety)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Generate the scanner URL
  const scannerUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/scan-vin/${sessionId}`
    : ''

  // Poll for VIN
  const pollForVin = useCallback(async () => {
    try {
      const res = await fetch(`/api/vin-scan?sessionId=${sessionId}`)
      const data = await res.json()

      if (data.success && data.vin) {
        setReceivedVin(data.vin)
        setStatus('received')
        // Stop polling
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
        // Auto-close after delay
        setTimeout(() => {
          onVinReceived(data.vin)
          onClose()
        }, 1500)
      }
    } catch (error) {
      // Ignore polling errors
    }
  }, [sessionId, onVinReceived, onClose])

  // Start/stop polling based on modal state
  useEffect(() => {
    if (isOpen && status === 'waiting') {
      // Poll every 2 seconds
      pollingRef.current = setInterval(pollForVin, 2000)
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [isOpen, status, pollForVin])

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xs sm:max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <IoQrCodeOutline className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Scan with Phone</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <IoClose className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {status === 'waiting' ? (
            <>
              {/* QR Code */}
              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-inner mx-auto w-fit">
                <QRCodeSVG
                  value={scannerUrl}
                  size={160}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* Instructions */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                  <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <IoPhonePortraitOutline className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <p className="text-xs sm:text-sm">Scan this QR code with your phone camera</p>
                </div>

                <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                  <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <IoSyncOutline className="w-3.5 h-3.5 text-orange-600 animate-spin" />
                  </div>
                  <p className="text-xs sm:text-sm">Waiting for VIN scan...</p>
                </div>
              </div>

              {/* Tip */}
              <div className="mt-4 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 text-center">
                  VIN barcodes are usually found on the driver door jamb or the bottom-left corner of the windshield
                </p>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <IoCheckmarkCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                VIN Received!
              </h4>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 font-mono text-xs sm:text-sm">
                {receivedVin}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
