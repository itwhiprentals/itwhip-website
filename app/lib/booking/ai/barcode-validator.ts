// app/lib/booking/ai/barcode-validator.ts
// Server-side PDF417 barcode decoding and cross-validation
// Decodes the 2D barcode on the back of US driver's licenses and
// cross-references against the AI's OCR from the front.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// ─── AAMVA Field Codes ──────────────────────────────────────────────────────
// Reference: https://www.aamva.org/identity/driver-license-data-standards
// Reused from app/components/DriverLicenseScanner.tsx

const AAMVA_FIELDS: Record<string, string> = {
  'DCS': 'lastName',
  'DCT': 'firstName',
  'DAC': 'firstName',   // Alternative code
  'DAD': 'middleName',
  'DBB': 'dateOfBirth', // MMDDYYYY format
  'DBA': 'expirationDate', // MMDDYYYY format
  'DAQ': 'licenseNumber',
  'DAG': 'street',
  'DAI': 'city',
  'DAJ': 'state',       // 2-letter state code
  'DAK': 'zipCode',
  'DBD': 'issueDate',
  'DBC': 'sex',         // 1=Male, 2=Female
  'DAU': 'height',
  'DAW': 'weight',
  'DCF': 'documentDiscriminator',
  'DCG': 'country',
}

export interface BarcodeData {
  firstName?: string
  lastName?: string
  middleName?: string
  dateOfBirth?: string   // YYYY-MM-DD
  expirationDate?: string // YYYY-MM-DD
  licenseNumber?: string
  state?: string
  street?: string
  city?: string
  zipCode?: string
  sex?: string
  documentDiscriminator?: string
  rawData?: string
}

export interface BarcodeValidationResult {
  decoded: boolean
  barcodeData?: BarcodeData
  mismatches: string[]   // Critical flags for mismatched data
  notes: string[]        // Informational notes
}

// ─── AAMVA Barcode Parser ───────────────────────────────────────────────────

function parseAAMVABarcode(rawData: string): BarcodeData {
  const result: BarcodeData = { rawData }
  const lines = rawData.split(/[\n\r]/)

  for (const line of lines) {
    for (const [code, fieldName] of Object.entries(AAMVA_FIELDS)) {
      if (line.startsWith(code)) {
        let value = line.substring(3).trim()

        // Handle MMDDYYYY → YYYY-MM-DD date formatting
        if (['dateOfBirth', 'expirationDate', 'issueDate'].includes(fieldName)) {
          if (value.length === 8 && /^\d{8}$/.test(value)) {
            const month = value.substring(0, 2)
            const day = value.substring(2, 4)
            const year = value.substring(4, 8)
            value = `${year}-${month}-${day}`
          }
        }

        // Truncate zip to 5 digits
        if (fieldName === 'zipCode' && value.length > 5) {
          value = value.substring(0, 5)
        }

        // Sex code → text
        if (fieldName === 'sex') {
          value = value === '1' ? 'Male' : value === '2' ? 'Female' : value
        }

        ;(result as any)[fieldName] = value
        break
      }
    }
  }

  return result
}

// ─── Name Comparison Helpers ────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ')
}

function namesMatch(
  frontName: string,
  barcodeFirst?: string,
  barcodeLast?: string,
  barcodeMiddle?: string
): boolean {
  if (!barcodeFirst && !barcodeLast) return true // No barcode name to compare

  const frontNorm = normalize(frontName)
  const frontParts = frontNorm.split(' ')

  // Build barcode full name
  const barcodeParts = [barcodeFirst, barcodeMiddle, barcodeLast]
    .filter(Boolean)
    .map(s => normalize(s!))

  const barcodeFullNorm = barcodeParts.join(' ')

  // Exact match
  if (frontNorm === barcodeFullNorm) return true

  // All front name parts exist in barcode parts (order-independent)
  const barcodeWords = barcodeFullNorm.split(' ')
  if (frontParts.length >= 2 && frontParts.every(p => barcodeWords.includes(p))) return true

  // All barcode parts exist in front parts
  if (barcodeWords.length >= 2 && barcodeWords.every(p => frontParts.includes(p))) return true

  // First + Last match (ignoring middle)
  const bFirst = normalize(barcodeFirst || '')
  const bLast = normalize(barcodeLast || '')
  if (frontParts.length >= 2) {
    // Front is "First [Middle] Last"
    if (frontParts[0] === bFirst && frontParts[frontParts.length - 1] === bLast) return true
    // Front might be "Last First" order
    if (frontParts[0] === bLast && frontParts[frontParts.length - 1] === bFirst) return true
  }

  return false
}

// ─── Main Decode + Validate Function ────────────────────────────────────────

/**
 * Decode PDF417 barcode from back image and cross-validate against front data.
 * Returns mismatches as critical flags.
 *
 * Graceful degradation: if decode fails, returns informational note but no critical flags.
 */
export async function decodeAndValidateBarcode(
  backImageUrl: string,
  frontData: {
    fullName: string
    dateOfBirth: string
    licenseNumber: string
    state: string
  }
): Promise<BarcodeValidationResult> {
  const mismatches: string[] = []
  const notes: string[] = []

  try {
    // Dynamically import zxing-wasm (ESM module)
    const { readBarcodes, prepareZXingModule } = await import('zxing-wasm/reader')

    // Load WASM binary from node_modules
    const wasmPath = join(process.cwd(), 'node_modules/zxing-wasm/dist/reader/zxing_reader.wasm')
    const wasmBinary = readFileSync(wasmPath)
    prepareZXingModule({
      overrides: {
        wasmBinary: wasmBinary.buffer as ArrayBuffer,
      },
    })

    // Fetch back image
    const imageResponse = await fetch(backImageUrl)
    if (!imageResponse.ok) {
      notes.push(`Could not fetch back image for barcode validation (HTTP ${imageResponse.status})`)
      return { decoded: false, mismatches, notes }
    }

    const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer())

    // Decode PDF417 barcode
    const results = await readBarcodes(imageBuffer, {
      formats: ['PDF417'],
      tryHarder: true,
      maxNumberOfSymbols: 1,
    })

    if (!results || results.length === 0) {
      notes.push('PDF417 barcode on back could not be decoded (may be damaged or photo quality too low)')
      return { decoded: false, mismatches, notes }
    }

    const barcodeText = results[0].text
    if (!barcodeText) {
      notes.push('PDF417 barcode decoded but contained no data')
      return { decoded: false, mismatches, notes }
    }

    // Parse AAMVA data
    const barcodeData = parseAAMVABarcode(barcodeText)
    console.log(`[barcode-validator] Decoded PDF417: ${barcodeData.firstName} ${barcodeData.lastName} | DL#: ${barcodeData.licenseNumber} | State: ${barcodeData.state}`)

    // ── Cross-validation checks ──────────────────────────────────────────

    // 1. Name match
    if (barcodeData.firstName || barcodeData.lastName) {
      if (!namesMatch(frontData.fullName, barcodeData.firstName, barcodeData.lastName, barcodeData.middleName)) {
        const barcodeName = [barcodeData.firstName, barcodeData.middleName, barcodeData.lastName].filter(Boolean).join(' ')
        mismatches.push(
          `BARCODE MISMATCH: Name on front ("${frontData.fullName}") does not match barcode data ("${barcodeName}"). ` +
          `Front and back may be from different cards.`
        )
      }
    }

    // 2. DOB match
    if (barcodeData.dateOfBirth && frontData.dateOfBirth) {
      const frontDob = frontData.dateOfBirth.replace(/[^0-9]/g, '')
      const barcodeDob = barcodeData.dateOfBirth.replace(/[^0-9]/g, '')
      if (frontDob && barcodeDob && frontDob !== barcodeDob) {
        mismatches.push(
          `BARCODE MISMATCH: DOB on front (${frontData.dateOfBirth}) does not match barcode (${barcodeData.dateOfBirth}). ` +
          `Front and back may be from different cards.`
        )
      }
    }

    // 3. License number match
    if (barcodeData.licenseNumber && frontData.licenseNumber) {
      const frontLN = frontData.licenseNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      const barcodeLN = barcodeData.licenseNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      if (frontLN && barcodeLN && frontLN !== barcodeLN) {
        mismatches.push(
          `BARCODE MISMATCH: License # on front (${frontData.licenseNumber}) does not match barcode (${barcodeData.licenseNumber}). ` +
          `Front and back may be from different cards.`
        )
      }
    }

    // 4. State match
    if (barcodeData.state && frontData.state) {
      const frontState = frontData.state.toUpperCase().trim()
      const barcodeState = barcodeData.state.toUpperCase().trim()
      if (frontState && barcodeState && frontState !== barcodeState) {
        mismatches.push(
          `BARCODE MISMATCH: State on front (${frontData.state}) does not match barcode (${barcodeData.state}). ` +
          `Front and back may be from different cards.`
        )
      }
    }

    if (mismatches.length === 0) {
      notes.push('PDF417 barcode cross-validation passed: front and back data match')
    }

    return { decoded: true, barcodeData, mismatches, notes }

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[barcode-validator] Decode failed:', msg)
    notes.push(`Barcode decoding not available: ${msg}`)
    return { decoded: false, mismatches, notes }
  }
}
