// app/partner/requests/[id]/components/add-car/VinStep.tsx
// VIN input, decode, scanner, vehicle info display, and eligibility checks

'use client'

import {
  IoCheckmarkCircle,
  IoWarningOutline,
  IoCloseCircle,
  IoCameraOutline,
  IoCarSportOutline
} from 'react-icons/io5'
import VinScanner from '@/app/components/VinScanner'
import type { VehicleInfo } from '@/app/hooks/useSimpleVinDecoder'

interface VinStepProps {
  vin: string
  handleVinChange: (value: string) => void
  triggerDecode: () => void
  vinDecoding: boolean
  vinError: string
  vinDecoded: boolean
  decodedFields: string[]
  vehicle: VehicleInfo
  showVinScanner: boolean
  setShowVinScanner: (v: boolean) => void
  eligible: boolean | null
  eligibilityBlockers: string[]
  eligibilityWarnings: string[]
  t: (key: string, values?: Record<string, any>) => string
}

export default function VinStep({
  vin, handleVinChange, triggerDecode,
  vinDecoding, vinError, vinDecoded,
  decodedFields, vehicle,
  showVinScanner, setShowVinScanner,
  eligible, eligibilityBlockers, eligibilityWarnings,
  t
}: VinStepProps) {
  return (
    <>
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
            onChange={(e) => handleVinChange(e.target.value)}
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
              onClick={triggerDecode}
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
              handleVinChange(scannedVin)
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

          <div className="p-4 bg-gray-200/70 dark:bg-gray-700 rounded-lg">
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
              {vehicle.model}{vehicle.trim ? ` ${vehicle.trim}` : ''}
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
    </>
  )
}
