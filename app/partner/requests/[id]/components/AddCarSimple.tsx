// app/partner/requests/[id]/components/AddCarSimple.tsx
// Simplified single-page vertical Add Car flow for recruited hosts
// VIN → auto-decode → car info + settings → Review & Submit

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import {
  IoCheckmarkCircle,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoImageOutline,
  IoAddOutline,
  IoTrashOutline,
  IoStar,
  IoStarOutline,
  IoCloseCircle,
  IoLocationOutline,
  IoCameraOutline,
  IoCarSportOutline
} from 'react-icons/io5'
import VinScanner from '@/app/components/VinScanner'
import { decodeVIN, isValidVIN } from '@/app/lib/utils/vin-decoder'
import { mapBodyClassToCarType } from '@/app/lib/data/vehicle-features'
import { AddressAutocomplete, AddressResult } from '@/app/components/shared/AddressAutocomplete'
import { CAR_COLORS } from '@/app/host/cars/[id]/edit/types'

interface AddCarSimpleProps {
  prefillDailyRate?: number
  onComplete: (carId: string) => void
}

interface PhotoItem {
  id: string
  url: string
  file?: File
  isHero: boolean
}

interface VehicleInfo {
  vin: string
  make: string
  model: string
  year: number
  trim: string
  doors: number
  transmission: string
  fuelType: string
  driveType: string
  carType: string
  bodyClass: string
  engineCylinders: string
  engineHP: string
  vehicleType: string
}

export default function AddCarSimple({ prefillDailyRate, onComplete }: AddCarSimpleProps) {
  const t = useTranslations('PartnerFleet')

  // VIN state
  const [vin, setVin] = useState('')
  const [vinDecoding, setVinDecoding] = useState(false)
  const [vinError, setVinError] = useState('')
  const [vinDecoded, setVinDecoded] = useState(false)
  const [decodedFields, setDecodedFields] = useState<string[]>([])
  const [showVinScanner, setShowVinScanner] = useState(false)
  const decodeTriggered = useRef(false)

  // Vehicle info (from VIN decode)
  const [vehicle, setVehicle] = useState<VehicleInfo>({
    vin: '', make: '', model: '', year: new Date().getFullYear(),
    trim: '', doors: 4, transmission: 'automatic', fuelType: 'gas',
    driveType: '', carType: 'midsize', bodyClass: '',
    engineCylinders: '', engineHP: '', vehicleType: ''
  })

  // Eligibility
  const [eligible, setEligible] = useState<boolean | null>(null)
  const [eligibilityBlockers, setEligibilityBlockers] = useState<string[]>([])
  const [eligibilityWarnings, setEligibilityWarnings] = useState<string[]>([])

  // Manual fields
  const [color, setColor] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [latitude, setLatitude] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [dailyRate, setDailyRate] = useState(prefillDailyRate || 0)
  const [photos, setPhotos] = useState<PhotoItem[]>([])

  // Eligibility confirmations
  const [confirmCleanTitle, setConfirmCleanTitle] = useState(false)
  const [confirmUnder130k, setConfirmUnder130k] = useState(false)
  const [confirmNoRecalls, setConfirmNoRecalls] = useState(false)

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Auto-decode when VIN reaches 17 valid chars
  useEffect(() => {
    if (vin.length === 17 && isValidVIN(vin) && !vinDecoded && !vinDecoding && !decodeTriggered.current) {
      decodeTriggered.current = true
      handleVinDecode(vin)
    }
    if (vin.length < 17) {
      decodeTriggered.current = false
    }
  }, [vin, vinDecoded, vinDecoding])

  const handleVinDecode = useCallback(async (vinValue: string) => {
    setVinDecoding(true)
    setVinError('')
    setVinDecoded(false)
    setDecodedFields([])
    setEligible(null)

    try {
      const result = await decodeVIN(vinValue)

      if (result && result.make) {
        const fields: string[] = ['make', 'model', 'year']
        const info: Partial<VehicleInfo> = {
          vin: vinValue,
          make: result.make,
          model: result.model || '',
          year: parseInt(result.year) || new Date().getFullYear()
        }

        if (result.trim) { info.trim = result.trim; fields.push('trim') }
        if (result.doors) {
          let d = parseInt(result.doors) || 4
          if (d === 5) d = 4
          if (d === 3) d = 2
          info.doors = d; fields.push('doors')
        }
        if (result.transmission) {
          info.transmission = result.transmission.toLowerCase().includes('automatic') ? 'automatic' : 'manual'
          fields.push('transmission')
        }
        if (result.fuelType) {
          const fl = result.fuelType.toLowerCase()
          if (fl.includes('electric')) info.fuelType = 'electric'
          else if (fl.includes('hybrid')) info.fuelType = 'hybrid'
          else if (fl.includes('diesel')) info.fuelType = 'diesel'
          else info.fuelType = 'gas'
          fields.push('fuelType')
        }
        if (result.bodyClass) {
          info.bodyClass = result.bodyClass
          const mapped = mapBodyClassToCarType(result.bodyClass, result.make, result.model)
          if (mapped) { info.carType = mapped.toLowerCase(); fields.push('carType') }
          fields.push('bodyClass')
        }
        if (result.driveType) {
          const dl = result.driveType.toLowerCase()
          if (dl.includes('all') || dl.includes('awd')) info.driveType = 'AWD'
          else if (dl.includes('front') || dl.includes('fwd')) info.driveType = 'FWD'
          else if (dl.includes('rear') || dl.includes('rwd')) info.driveType = 'RWD'
          else if (dl.includes('4x4') || dl.includes('4wd')) info.driveType = '4WD'
          else info.driveType = result.driveType.toUpperCase()
          fields.push('driveType')
        }
        if (result.engineCylinders) {
          info.engineCylinders = result.engineCylinders
          fields.push('engineCylinders')
        }
        if (result.engineHP) {
          info.engineHP = result.engineHP
          fields.push('engineHP')
        }
        if (result.vehicleType) {
          info.vehicleType = result.vehicleType
          fields.push('vehicleType')
        }

        setVehicle(prev => ({ ...prev, ...info }))
        setDecodedFields(fields)
        setVinDecoded(true)

        // Check eligibility
        const yr = parseInt(result.year) || new Date().getFullYear()
        const age = new Date().getFullYear() - yr
        const blockers: string[] = []
        const warnings: string[] = []
        if (age > 12) blockers.push(t('addVehicleAgeTooOld', { age }))
        if (age > 8 && age <= 12) warnings.push(t('addOlderVehicleWarning'))
        setEligible(blockers.length === 0)
        setEligibilityBlockers(blockers)
        setEligibilityWarnings(warnings)
      } else {
        setVinError(t('addVinCouldNotDecode'))
      }
    } catch {
      setVinError(t('addVinFailedDecode'))
    } finally {
      setVinDecoding(false)
    }
  }, [t])

  const handleAddressSelect = (addr: AddressResult) => {
    setAddress(addr.streetAddress)
    setCity(addr.city)
    setState(addr.state)
    setZipCode(addr.zipCode)
    setLatitude(addr.latitude)
    setLongitude(addr.longitude)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const newPhotos: PhotoItem[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      newPhotos.push({
        id: `temp-${Date.now()}-${i}`,
        url: URL.createObjectURL(file),
        file,
        isHero: photos.length === 0 && i === 0
      })
    }
    setPhotos(prev => [...prev, ...newPhotos])
    e.target.value = ''
  }

  const setHeroPhoto = (photoId: string) => {
    setPhotos(prev => prev.map(p => ({ ...p, isHero: p.id === photoId })))
  }

  const deletePhoto = (photoId: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== photoId)
      if (filtered.length > 0 && !filtered.some(p => p.isHero)) filtered[0].isHero = true
      return filtered
    })
  }

  // Validation
  const canSubmit = vinDecoded && eligible &&
    confirmCleanTitle && confirmUnder130k && confirmNoRecalls &&
    color && address && city && state &&
    photos.length >= 3 &&
    dailyRate >= 25

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Upload photos
      const uploadedPhotos: { url: string; isHero: boolean }[] = []
      for (const photo of photos) {
        if (photo.file) {
          const formData = new FormData()
          formData.append('file', photo.file)
          formData.append('type', 'vehicle-photo')
          formData.append('vehicleName', `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}`)
          const res = await fetch('/api/partner/upload', { method: 'POST', body: formData })
          if (res.ok) {
            const data = await res.json()
            uploadedPhotos.push({ url: data.url, isHero: photo.isHero })
          }
        } else {
          uploadedPhotos.push({ url: photo.url, isHero: photo.isHero })
        }
      }

      const weeklyRate = Math.round(dailyRate * 6.5)
      const monthlyRate = Math.round(dailyRate * 25)

      const response = await fetch('/api/partner/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: vehicle.vin,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          trim: vehicle.trim,
          color,
          doors: vehicle.doors,
          transmission: vehicle.transmission,
          fuelType: vehicle.fuelType,
          driveType: vehicle.driveType,
          carType: vehicle.carType,
          vehicleType: 'RENTAL',
          address, city, state, zipCode,
          latitude, longitude,
          dailyRate,
          weeklyRate,
          monthlyRate,
          airportPickup: false,
          hotelDelivery: true,
          homeDelivery: false,
          deliveryFee: 35,
          titleStatus: 'Clean',
          photos: uploadedPhotos,
          vinVerificationMethod: 'API',
          hasOwnInsurance: false,
          isPublicListing: false
        })
      })

      const result = await response.json()
      if (result.success) {
        onComplete(result.carId || result.id)
      } else {
        setSubmitError(result.error || t('addFailedToAdd'))
      }
    } catch {
      setSubmitError(t('addFailedToAddRetry'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">

      {/* ─── VIN Input ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <IoCarSportOutline className="w-5 h-5 text-orange-600" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('addEnterYourVin')}</h3>
        </div>

        <div className="flex items-center gap-2 p-2 border rounded-lg focus-within:ring-2 focus-within:ring-orange-500 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
          <input
            type="text"
            value={vin}
            onChange={(e) => {
              const v = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17)
              setVin(v)
              setVinError('')
              if (vinDecoded) {
                setVinDecoded(false)
                setDecodedFields([])
                setEligible(null)
                decodeTriggered.current = false
              }
            }}
            placeholder={t('addVinPlaceholder')}
            maxLength={17}
            className="flex-1 px-2 py-2 text-lg font-mono uppercase bg-transparent border-none focus:outline-none focus:ring-0 dark:text-white"
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowVinScanner(true)}
              className="h-10 w-10 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-900/30 dark:hover:text-orange-400 rounded-md transition-colors flex items-center justify-center"
              title={t('addScanVinCamera')}
            >
              <IoCameraOutline className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => { if (vin.length === 17 && isValidVIN(vin)) { decodeTriggered.current = true; handleVinDecode(vin) } }}
              disabled={vin.length !== 17 || vinDecoding}
              className="h-10 px-3 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
            >
              {vinDecoding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                  {t('addDecoding')}
                </>
              ) : (
                t('addDecode')
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{t('addVinCharCount', { count: vin.length })}</span>
          {vinError && <span className="text-xs text-red-500">{vinError}</span>}
        </div>

        {/* Decoding spinner */}
        {vinDecoding && (
          <div className="flex items-center gap-2 mt-3 text-orange-600">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">{t('addDecoding')}</span>
          </div>
        )}

        {showVinScanner && (
          <VinScanner
            onScan={(scannedVin) => {
              setVin(scannedVin)
              setShowVinScanner(false)
            }}
            onClose={() => setShowVinScanner(false)}
          />
        )}
      </div>

      {/* ─── Vehicle Info Card (appears after decode) ─── */}
      {vinDecoded && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('addVehicleDetected')}</h3>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {/* Year Make — bold, with engine badge inline */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {vehicle.year} {vehicle.make}
              </h3>
              {(decodedFields.includes('engineCylinders') || decodedFields.includes('engineHP')) && (
                <span className="inline-flex items-center px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full text-xs font-semibold text-orange-700 dark:text-orange-300">
                  {decodedFields.includes('engineCylinders') && vehicle.engineCylinders && (
                    <>V{vehicle.engineCylinders}</>
                  )}
                  {decodedFields.includes('engineCylinders') && decodedFields.includes('engineHP') && vehicle.engineCylinders && vehicle.engineHP && (
                    <span className="text-orange-400 dark:text-orange-500 mx-1">·</span>
                  )}
                  {decodedFields.includes('engineHP') && vehicle.engineHP && (
                    <>{vehicle.engineHP} HP</>
                  )}
                </span>
              )}
            </div>
            {/* Model + Trim — lighter weight */}
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-0.5">
              {vehicle.model}
              {vehicle.trim && (
                <span className="ml-2">{vehicle.trim}</span>
              )}
            </p>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              {decodedFields.includes('bodyClass') && vehicle.bodyClass && (
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Body</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.bodyClass}</p>
                </div>
              )}
              {decodedFields.includes('transmission') && (
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('addTransmission')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{vehicle.transmission}</p>
                </div>
              )}
              {decodedFields.includes('fuelType') && (
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('addFuelType')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{vehicle.fuelType}</p>
                </div>
              )}
              {decodedFields.includes('driveType') && vehicle.driveType && (
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('addDriveType')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.driveType}</p>
                </div>
              )}
              {decodedFields.includes('doors') && (
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">{t('addDoors')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.doors}</p>
                </div>
              )}
              {decodedFields.includes('vehicleType') && vehicle.vehicleType && (
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Type</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.vehicleType}</p>
                </div>
              )}
            </div>

            {/* VIN reference */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">VIN</p>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">{vehicle.vin}</p>
            </div>
          </div>

          {/* Eligibility */}
          {eligible === false && eligibilityBlockers.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {eligibilityBlockers.map((b, i) => (
                <p key={i} className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                  <IoCloseCircle className="w-4 h-4 flex-shrink-0" /> {b}
                </p>
              ))}
            </div>
          )}
          {eligibilityWarnings.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              {eligibilityWarnings.map((w, i) => (
                <p key={i} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                  <IoWarningOutline className="w-4 h-4 flex-shrink-0" /> {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Remaining fields only appear after successful decode ─── */}
      {vinDecoded && eligible && (
        <>
          {/* ─── Color ─── */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('addColor')}
            </label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('addSelectColor')}</option>
              {CAR_COLORS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* ─── Location ─── */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <IoLocationOutline className="w-5 h-5 text-orange-600" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('addVehicleLocation')}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('addLocationDesc')}</p>

            <AddressAutocomplete
              value={address}
              city={city}
              state={state}
              zipCode={zipCode}
              onAddressSelect={handleAddressSelect}
              placeholder={t('addLocationPlaceholder')}
            />

            {city && state && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                  <IoCheckmarkCircle className="w-4 h-4 flex-shrink-0" />
                  {address}, {city}, {state} {zipCode}
                </p>
              </div>
            )}
          </div>

          {/* ─── Photos ─── */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <IoImageOutline className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('addVehiclePhotos')}</h3>
              </div>
              {photos.length > 0 && (
                <label className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 cursor-pointer flex items-center gap-1">
                  <IoAddOutline className="w-4 h-4" />
                  {t('addAddPhotos')}
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Count indicator */}
            <div className={`flex items-center justify-between mb-3 p-2.5 rounded-lg ${
              photos.length >= 3
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                {photos.length >= 3 ? (
                  <IoCheckmarkCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <IoWarningOutline className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
                <span className={`text-sm font-medium ${
                  photos.length >= 3 ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'
                }`}>
                  {t('addPhotoCount', { count: photos.length })}
                </span>
              </div>
              {photos.length < 3 && (
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  {t('addMoreRequired', { count: 3 - photos.length })}
                </span>
              )}
            </div>

            {photos.length === 0 ? (
              <label className="block text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                <IoImageOutline className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('addClickOrDrag')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('addPhotoFormat')}</p>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
              </label>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group aspect-[4/3]">
                    <Image src={photo.url} alt="Vehicle" fill className="object-cover rounded-lg" />
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setHeroPhoto(photo.id)}
                        className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-md"
                      >
                        {photo.isHero ? (
                          <IoStar className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <IoStarOutline className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        )}
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-md"
                      >
                        <IoTrashOutline className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    {photo.isHero && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-orange-600 text-white text-[10px] rounded">
                        {t('addMainPhoto')}
                      </div>
                    )}
                  </div>
                ))}
                <label className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                  <IoAddOutline className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">{t('addAddMore')}</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          {/* ─── Daily Rate ─── */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">{t('addDailyRate')}</h3>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 text-lg">$</span>
              <input
                type="number"
                value={dailyRate || ''}
                onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                min="25"
                step="5"
                placeholder="75"
                className="w-full pl-8 pr-3 py-2.5 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('addMinPerDay')}</p>

            {dailyRate >= 25 && (
              <div className="mt-3 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{t('addWeeklyRate')}: <strong className="text-gray-900 dark:text-white">${Math.round(dailyRate * 6.5).toLocaleString()}</strong></span>
                <span>{t('addMonthlyRate')}: <strong className="text-gray-900 dark:text-white">${Math.round(dailyRate * 25).toLocaleString()}</strong></span>
              </div>
            )}
          </div>

          {/* ─── Eligibility Confirmations ─── */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('addConfirmRequirements')}</p>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmCleanTitle}
                  onChange={(e) => setConfirmCleanTitle(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t.rich('addConfirmCleanTitle', { bold: (chunks) => <strong>{chunks}</strong> })}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmUnder130k}
                  onChange={(e) => setConfirmUnder130k(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t.rich('addConfirmUnder130k', { bold: (chunks) => <strong>{chunks}</strong> })}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmNoRecalls}
                  onChange={(e) => setConfirmNoRecalls(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t.rich('addConfirmNoRecalls', { bold: (chunks) => <strong>{chunks}</strong> })}
                  <a
                    href={`https://www.nhtsa.gov/recalls?vin=${vehicle.vin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-orange-600 hover:text-orange-700 underline"
                  >
                    {t('addCheckRecalls')}
                  </a>
                </span>
              </label>
            </div>
          </div>

          {/* ─── Submit Error ─── */}
          {submitError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <IoWarningOutline className="w-4 h-4" /> {submitError}
              </p>
            </div>
          )}

          {/* ─── Validation hints ─── */}
          {!canSubmit && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <IoInformationCircleOutline className="w-4 h-4 flex-shrink-0" />
                {!color ? t('addErrorSelectColor')
                  : !address ? t('addErrorEnterLocation')
                  : photos.length < 3 ? t('addErrorMinPhotos', { count: photos.length })
                  : dailyRate < 25 ? t('addErrorDailyRate')
                  : (!confirmCleanTitle || !confirmUnder130k || !confirmNoRecalls) ? t('addErrorConfirmEligibility')
                  : ''}
              </p>
            </div>
          )}

          {/* ─── Submit Button ─── */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full py-3.5 bg-green-600 text-white rounded-lg font-semibold text-base hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('addSubmitting')}
              </>
            ) : (
              <>
                <IoCheckmarkCircle className="w-5 h-5" />
                {t('addAddVehicleToFleet')}
              </>
            )}
          </button>
        </>
      )}
    </div>
  )
}
