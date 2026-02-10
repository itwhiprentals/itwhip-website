// app/lib/booking/ai/barcode-validator.ts
// Server-side PDF417 barcode decoding and cross-validation
// Decodes the 2D barcode on the back of US driver's licenses and
// cross-references against the AI's OCR from the front.
//
// Multi-attempt decode pipeline:
//   1. Raw JPEG → zxing-wasm
//   2. Sharp-preprocessed JPEG (greyscale, contrast, sharpen) → zxing-wasm
//   3. Sharp-preprocessed raw RGBA (ImageData path) → zxing-wasm
//   4. Rotated variants (90°, 180°, 270°) → zxing-wasm

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'

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

// ─── WASM Module Singleton ──────────────────────────────────────────────────
// Cache the prepared module to avoid re-initializing on every call

let zxingReady: Promise<any> | null = null

function findWasmFile(): string {
  const candidates = [
    join(process.cwd(), 'node_modules/zxing-wasm/dist/reader/zxing_reader.wasm'),
    join(process.cwd(), '.next/server/node_modules/zxing-wasm/dist/reader/zxing_reader.wasm'),
    join(dirname(require.resolve('zxing-wasm/reader')), 'zxing_reader.wasm'),
  ]
  for (const p of candidates) {
    if (existsSync(p)) {
      console.log(`[barcode-validator] Found WASM at: ${p}`)
      return p
    }
  }
  throw new Error(`zxing_reader.wasm not found. Searched: ${candidates.join(', ')}`)
}

async function getZxingReader() {
  const { readBarcodes, prepareZXingModule } = await import('zxing-wasm/reader')

  if (!zxingReady) {
    const wasmPath = findWasmFile()
    const wasmBinary = readFileSync(wasmPath)
    console.log(`[barcode-validator] WASM binary size: ${wasmBinary.byteLength} bytes`)

    // CRITICAL: Buffer.buffer returns the entire underlying ArrayBuffer pool,
    // not just this Buffer's slice. We must copy to a clean ArrayBuffer.
    const cleanBuffer = new Uint8Array(wasmBinary).buffer

    // fireImmediately: true ensures the WASM module is fully instantiated
    // before we return. Without this, readBarcodes may race against initialization.
    zxingReady = prepareZXingModule({
      overrides: {
        wasmBinary: cleanBuffer,
      },
      fireImmediately: true,
    })
  }

  await zxingReady
  return readBarcodes
}

// ─── Decode Helpers ─────────────────────────────────────────────────────────

const READER_OPTIONS = {
  formats: ['PDF417'] as any,
  tryHarder: true,
  tryRotate: true,
  tryInvert: true,
  tryDownscale: true,
  maxNumberOfSymbols: 1,
}

async function tryDecode(
  readBarcodes: any,
  input: Uint8Array | { data: Uint8ClampedArray; width: number; height: number },
  label: string,
): Promise<string | null> {
  try {
    const results = await readBarcodes(input, READER_OPTIONS)
    if (results && results.length > 0 && results[0].text) {
      console.log(`[barcode-validator] Decoded via ${label}`)
      return results[0].text
    }
  } catch (err) {
    console.log(`[barcode-validator] ${label} failed: ${err instanceof Error ? err.message : err}`)
  }
  return null
}

// ─── Image Preprocessing with Sharp ─────────────────────────────────────────

async function preprocessImage(rawBuffer: Buffer) {
  const sharp = (await import('sharp')).default

  // Auto-rotate based on EXIF, convert to greyscale, normalize contrast, sharpen
  const base = sharp(rawBuffer).rotate().greyscale().normalize().sharpen({ sigma: 1.5 })

  // Enhanced JPEG for zxing-wasm's encoded image path (stbi_load_from_memory)
  const processedJpeg = await base.clone().jpeg({ quality: 95 }).toBuffer()

  // Raw RGBA pixel data for zxing-wasm's ImageData path (bypasses stbi)
  const { data: rgbaData, info } = await base
    .clone()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  return {
    processedJpeg,
    rgbaData,
    width: info.width,
    height: info.height,
  }
}

async function getRotatedJpeg(rawBuffer: Buffer, angle: number): Promise<Buffer> {
  const sharp = (await import('sharp')).default
  return sharp(rawBuffer)
    .rotate(angle)
    .greyscale()
    .normalize()
    .jpeg({ quality: 95 })
    .toBuffer()
}

// ─── Multi-Attempt Decode Pipeline ──────────────────────────────────────────

async function decodePDF417(rawBuffer: Buffer): Promise<string | null> {
  const readBarcodes = await getZxingReader()

  // Attempt 1: Raw JPEG bytes (no preprocessing)
  const result1 = await tryDecode(readBarcodes, new Uint8Array(rawBuffer), 'raw-jpeg')
  if (result1) return result1

  // Attempt 2: Sharp-preprocessed JPEG (greyscale + contrast + sharpen)
  const { processedJpeg, rgbaData, width, height } = await preprocessImage(rawBuffer)
  const result2 = await tryDecode(readBarcodes, new Uint8Array(processedJpeg), 'preprocessed-jpeg')
  if (result2) return result2

  // Attempt 3: Raw RGBA ImageData (bypasses stbi_load_from_memory)
  const imageData = {
    data: new Uint8ClampedArray(rgbaData.buffer, rgbaData.byteOffset, rgbaData.byteLength),
    width,
    height,
  }
  const result3 = await tryDecode(readBarcodes, imageData, 'rgba-imagedata')
  if (result3) return result3

  // Attempt 4: Rotated variants (phone photos may be at odd angles)
  for (const angle of [90, 180, 270]) {
    const rotated = await getRotatedJpeg(rawBuffer, angle)
    const result = await tryDecode(readBarcodes, new Uint8Array(rotated), `rotated-${angle}`)
    if (result) return result
  }

  return null // All attempts failed
}

// ─── Main Decode + Validate Function ────────────────────────────────────────

/**
 * Decode PDF417 barcode from back image and cross-validate against front data.
 * Returns mismatches as critical flags.
 *
 * Multi-attempt pipeline with sharp preprocessing for maximum decode success.
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
    // Fetch back image
    const imageResponse = await fetch(backImageUrl)
    if (!imageResponse.ok) {
      notes.push(`Could not fetch back image for barcode validation (HTTP ${imageResponse.status})`)
      return { decoded: false, mismatches, notes }
    }

    const rawBuffer = Buffer.from(await imageResponse.arrayBuffer())
    console.log(`[barcode-validator] Fetched back image: ${rawBuffer.length} bytes`)

    // Multi-attempt PDF417 decode
    const barcodeText = await decodePDF417(rawBuffer)

    if (!barcodeText) {
      notes.push('PDF417 barcode on back could not be decoded (may be damaged or photo quality too low)')
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
