// app/partner/requests/[id]/components/AddCarSimple.tsx
// Simplified single-page vertical Add Car flow for recruited hosts
// VIN → auto-decode → car info + settings → Review & Submit

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSimpleVinDecoder } from '@/app/hooks/useSimpleVinDecoder'
import { usePhotoUpload } from '@/app/hooks/usePhotoUpload'
import { AddressResult } from '@/app/components/shared/AddressAutocomplete'
import VinStep from './add-car/VinStep'
import PhotosStep from './add-car/PhotosStep'
import LocationStep from './add-car/LocationStep'
import PricingStep from './add-car/PricingStep'

interface AddCarSimpleProps {
  prefillDailyRate?: number
  onComplete: (carId: string) => void
}

export default function AddCarSimple({ prefillDailyRate, onComplete }: AddCarSimpleProps) {
  const t = useTranslations('PartnerFleet')

  // VIN + vehicle decode hook
  const vinDecoder = useSimpleVinDecoder({ t })

  // Photo upload hook
  const photoUpload = usePhotoUpload()

  // Manual fields
  const [color, setColor] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [currentMileage, setCurrentMileage] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [latitude, setLatitude] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [dailyRate, setDailyRate] = useState(prefillDailyRate || 0)

  // Eligibility confirmations
  const [confirmCleanTitle, setConfirmCleanTitle] = useState(false)
  const [confirmUnder130k, setConfirmUnder130k] = useState(false)
  const [confirmNoRecalls, setConfirmNoRecalls] = useState(false)

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleAddressSelect = (addr: AddressResult) => {
    setAddress(addr.streetAddress)
    setCity(addr.city)
    setState(addr.state)
    setZipCode(addr.zipCode)
    setLatitude(addr.latitude)
    setLongitude(addr.longitude)
  }

  // Validation
  const canSubmit = vinDecoder.vinDecoded && vinDecoder.eligible &&
    confirmCleanTitle && confirmUnder130k && confirmNoRecalls &&
    color && address && city && state &&
    photoUpload.photos.length >= 3 &&
    dailyRate >= 25

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setSubmitError('')

    const { vehicle } = vinDecoder

    try {
      // Upload photos
      const uploadedPhotos: { url: string; isHero: boolean }[] = []
      for (const photo of photoUpload.photos) {
        if (photo.file) {
          const formData = new FormData()
          formData.append('file', photo.file)
          formData.append('type', 'vehicle-photo')
          formData.append('vehicleName', `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`)
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
          licensePlate: licensePlate || null,
          currentMileage: currentMileage || null,
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
      <VinStep
        vin={vinDecoder.vin}
        handleVinChange={vinDecoder.handleVinChange}
        triggerDecode={vinDecoder.triggerDecode}
        vinDecoding={vinDecoder.vinDecoding}
        vinError={vinDecoder.vinError}
        vinDecoded={vinDecoder.vinDecoded}
        decodedFields={vinDecoder.decodedFields}
        vehicle={vinDecoder.vehicle}
        showVinScanner={vinDecoder.showVinScanner}
        setShowVinScanner={vinDecoder.setShowVinScanner}
        eligible={vinDecoder.eligible}
        eligibilityBlockers={vinDecoder.eligibilityBlockers}
        eligibilityWarnings={vinDecoder.eligibilityWarnings}
        t={t}
      />

      {/* Remaining fields only appear after successful decode */}
      {vinDecoder.vinDecoded && vinDecoder.eligible && (
        <>
          <LocationStep
            color={color}
            setColor={setColor}
            licensePlate={licensePlate}
            setLicensePlate={setLicensePlate}
            currentMileage={currentMileage}
            setCurrentMileage={setCurrentMileage}
            address={address}
            city={city}
            state={state}
            zipCode={zipCode}
            onAddressSelect={handleAddressSelect}
            t={t}
          />

          <PhotosStep
            photos={photoUpload.photos}
            handlePhotoUpload={photoUpload.handlePhotoUpload}
            setHeroPhoto={photoUpload.setHeroPhoto}
            deletePhoto={photoUpload.deletePhoto}
            t={t}
          />

          <PricingStep
            dailyRate={dailyRate}
            setDailyRate={setDailyRate}
            confirmCleanTitle={confirmCleanTitle}
            setConfirmCleanTitle={setConfirmCleanTitle}
            confirmUnder130k={confirmUnder130k}
            setConfirmUnder130k={setConfirmUnder130k}
            confirmNoRecalls={confirmNoRecalls}
            setConfirmNoRecalls={setConfirmNoRecalls}
            vehicleVin={vinDecoder.vehicle.vin}
            canSubmit={!!canSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onSubmit={handleSubmit}
            color={color}
            address={address}
            photosCount={photoUpload.photos.length}
            t={t}
          />
        </>
      )}
    </div>
  )
}
