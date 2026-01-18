// app/components/DriverLicenseScanner.tsx
// Camera-based driver's license barcode scanner using html5-qrcode
// Scans PDF417 barcodes found on the back of US driver's licenses

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { IoClose, IoCameraOutline, IoFlashOutline, IoCheckmarkCircle } from 'react-icons/io5'

// AAMVA standard field codes for PDF417 barcode parsing
// Reference: https://www.aamva.org/identity/driver-license-data-standards
const AAMVA_FIELDS: Record<string, string> = {
  'DCS': 'lastName',
  'DCT': 'firstName',
  'DAC': 'firstName',  // Alternative code
  'DAD': 'middleName',
  'DBB': 'dateOfBirth', // MMDDYYYY format
  'DBA': 'expirationDate', // MMDDYYYY format
  'DAQ': 'licenseNumber',
  'DAG': 'street',
  'DAI': 'city',
  'DAJ': 'state',
  'DAK': 'zipCode',
  'DAY': 'suffix',
  'DBD': 'issueDate',
  'DBC': 'sex', // 1=Male, 2=Female
  'DAU': 'height',
  'DAW': 'weight',
  'DAZ': 'hairColor',
  'DCD': 'endorsements',
  'DCF': 'documentNumber',
  'DCG': 'country'
}

export interface DriverLicenseData {
  firstName?: string
  lastName?: string
  middleName?: string
  dateOfBirth?: string // YYYY-MM-DD format
  licenseNumber?: string
  expirationDate?: string // YYYY-MM-DD format
  street?: string
  city?: string
  state?: string
  zipCode?: string
  sex?: string
  rawData?: string
}

interface DriverLicenseScannerProps {
  onScan: (data: DriverLicenseData) => void
  onClose: () => void
}

// Parse AAMVA PDF417 barcode data
function parseAAMVABarcode(rawData: string): DriverLicenseData {
  const result: DriverLicenseData = { rawData }

  // Remove header and split by line/record separator
  const lines = rawData.split(/[\n\r]/)

  for (const line of lines) {
    // Each field starts with a 3-character code
    for (const [code, fieldName] of Object.entries(AAMVA_FIELDS)) {
      if (line.startsWith(code)) {
        let value = line.substring(3).trim()

        // Handle date formatting (MMDDYYYY to YYYY-MM-DD)
        if (fieldName === 'dateOfBirth' || fieldName === 'expirationDate' || fieldName === 'issueDate') {
          if (value.length === 8) {
            const month = value.substring(0, 2)
            const day = value.substring(2, 4)
            const year = value.substring(4, 8)
            value = `${year}-${month}-${day}`
          }
        }

        // Handle zip code (may have extra digits)
        if (fieldName === 'zipCode' && value.length > 5) {
          value = value.substring(0, 5)
        }

        // Handle sex code
        if (fieldName === 'sex') {
          value = value === '1' ? 'Male' : value === '2' ? 'Female' : value
        }

        // @ts-ignore - dynamic field assignment
        result[fieldName] = value
        break
      }
    }
  }

  return result
}

export default function DriverLicenseScanner({ onScan, onClose }: DriverLicenseScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(true)
  const [scannedData, setScannedData] = useState<DriverLicenseData | null>(null)
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
        const scanner = new Html5Qrcode('dl-scanner-container')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.75,
            // PDF417 is format code 3, also support QR_CODE (0) for some newer licenses
            formatsToSupport: [0, 3, 2, 4] // QR_CODE, PDF_417, CODE_128, CODE_39
          },
          (decodedText) => {
            console.log('[DL Scanner] Raw scan:', decodedText.substring(0, 100) + '...')

            // Try to parse as AAMVA format
            const parsedData = parseAAMVABarcode(decodedText)

            // Only accept if we got at least a license number or name
            if (parsedData.licenseNumber || parsedData.lastName) {
              setScannedData(parsedData)
              stopScanner()
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
  }, [stopScanner])

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  const handleConfirm = () => {
    if (scannedData) {
      onScan(scannedData)
    }
  }

  const handleRetry = () => {
    setScannedData(null)
    setIsStarting(true)
    // Restart scanner
    const startScanner = async () => {
      if (!containerRef.current) return
      try {
        const scanner = new Html5Qrcode('dl-scanner-container')
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.75,
            formatsToSupport: [0, 3, 2, 4]
          },
          (decodedText) => {
            const parsedData = parseAAMVABarcode(decodedText)
            if (parsedData.licenseNumber || parsedData.lastName) {
              setScannedData(parsedData)
              stopScanner()
            }
          },
          () => {}
        )
        setIsStarting(false)
      } catch (err) {
        setError('Unable to restart camera.')
        setIsStarting(false)
      }
    }
    startScanner()
  }

  // Show scan results for confirmation
  if (scannedData) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50">
          <div className="flex items-center gap-2 text-white">
            <IoCheckmarkCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">License Scanned</span>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Scanned Data Display */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-sm mx-auto bg-gray-900 rounded-lg p-4 space-y-3">
            <h3 className="text-white font-medium mb-3">Confirm Information</h3>

            {scannedData.firstName && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">First Name</span>
                <span className="text-white text-sm">{scannedData.firstName}</span>
              </div>
            )}

            {scannedData.lastName && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Last Name</span>
                <span className="text-white text-sm">{scannedData.lastName}</span>
              </div>
            )}

            {scannedData.licenseNumber && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">License #</span>
                <span className="text-white text-sm font-mono">{scannedData.licenseNumber}</span>
              </div>
            )}

            {scannedData.state && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">State</span>
                <span className="text-white text-sm">{scannedData.state}</span>
              </div>
            )}

            {scannedData.dateOfBirth && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Date of Birth</span>
                <span className="text-white text-sm">{scannedData.dateOfBirth}</span>
              </div>
            )}

            {scannedData.expirationDate && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Expires</span>
                <span className="text-white text-sm">{scannedData.expirationDate}</span>
              </div>
            )}

            {scannedData.city && scannedData.state && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">City</span>
                <span className="text-white text-sm">{scannedData.city}, {scannedData.state}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-black/50 space-y-2">
          <div className="max-w-sm mx-auto flex gap-2">
            <button
              onClick={handleRetry}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Scan Again
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Use This Info
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <div className="flex items-center gap-2 text-white">
          <IoCameraOutline className="w-5 h-5" />
          <span className="text-sm font-medium">Scan Driver's License</span>
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
            id="dl-scanner-container"
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
              <p className="font-medium mb-1">How to scan:</p>
              <ul className="space-y-0.5 text-white/60">
                <li>• Flip your license to show the barcode on the back</li>
                <li>• Position the barcode within the frame</li>
                <li>• Hold steady in good lighting</li>
                <li>• Works with most US driver's licenses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
