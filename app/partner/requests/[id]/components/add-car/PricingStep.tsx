// app/partner/requests/[id]/components/add-car/PricingStep.tsx
// Daily rate input with calculated weekly/monthly, eligibility confirmations, and submit

'use client'

import {
  IoCheckmarkCircle,
  IoWarningOutline,
  IoInformationCircleOutline,
} from 'react-icons/io5'

interface PricingStepProps {
  dailyRate: number
  setDailyRate: (v: number) => void
  confirmCleanTitle: boolean
  setConfirmCleanTitle: (v: boolean) => void
  confirmUnder130k: boolean
  setConfirmUnder130k: (v: boolean) => void
  confirmNoRecalls: boolean
  setConfirmNoRecalls: (v: boolean) => void
  vehicleVin: string
  canSubmit: boolean
  isSubmitting: boolean
  submitError: string
  onSubmit: () => void
  // Validation hint context
  color: string
  address: string
  photosCount: number
  t: {
    (key: string, values?: Record<string, any>): string
    rich: (key: string, values?: Record<string, any>) => any
  }
}

export default function PricingStep({
  dailyRate, setDailyRate,
  confirmCleanTitle, setConfirmCleanTitle,
  confirmUnder130k, setConfirmUnder130k,
  confirmNoRecalls, setConfirmNoRecalls,
  vehicleVin,
  canSubmit, isSubmitting, submitError, onSubmit,
  color, address, photosCount,
  t
}: PricingStepProps) {
  return (
    <>
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
              {t.rich('addConfirmCleanTitle', { bold: (chunks: any) => <strong>{chunks}</strong> })}
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
              {t.rich('addConfirmUnder130k', { bold: (chunks: any) => <strong>{chunks}</strong> })}
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
              {t.rich('addConfirmNoRecalls', { bold: (chunks: any) => <strong>{chunks}</strong> })}
              <a
                href={`https://www.nhtsa.gov/recalls?vin=${vehicleVin}`}
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
              : photosCount < 3 ? t('addErrorMinPhotos', { count: photosCount })
              : dailyRate < 25 ? t('addErrorDailyRate')
              : (!confirmCleanTitle || !confirmUnder130k || !confirmNoRecalls) ? t('addErrorConfirmEligibility')
              : ''}
          </p>
        </div>
      )}

      {/* ─── Submit Button ─── */}
      <button
        onClick={onSubmit}
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
  )
}
