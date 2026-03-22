// app/(guest)/rentals/trip/end/[id]/components/ChargeCalculator.tsx
// Matches app: TripSummaryCard (photos, odometer, fuel) + charges breakdown

'use client'

import Image from 'next/image'
import { IoCamera, IoSpeedometer, IoWater, IoReceipt, IoCheckmarkCircle, IoAlertCircle, IoShieldCheckmark, IoArrowForward, IoClipboardOutline } from 'react-icons/io5'

interface ChargeCalculatorProps {
  booking: any
  data: any
  charges: any
  depositAmount?: number
  onDamageReport?: (damage: { reported: boolean; description: string; photos: string[] }) => void
}

const FUEL_LABELS: Record<string, string> = { Empty: 'Empty', '1/4': '1/4', '1/2': '1/2', '3/4': '3/4', Full: 'Full', empty: 'Empty', quarter: '1/4', half: '1/2', three_quarter: '3/4', full: 'Full' }
const FUEL_PCT: Record<string, number> = { Empty: 0, '1/4': 25, '1/2': 50, '3/4': 75, Full: 100, empty: 0, quarter: 25, half: 50, three_quarter: 75, full: 100 }

function fmt(n: number | undefined | null) {
  if (n == null || isNaN(n)) return '$0.00'
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ChargeCalculator({ booking, data, charges, depositAmount: depositAmountProp }: ChargeCalculatorProps) {
  const startMileage = booking?.startMileage ?? 0
  const endMileage = data?.odometer ?? 0
  const startFuel = booking?.fuelLevelStart ?? 'Full'
  const endFuel = data?.fuelLevel ?? startFuel
  const bookingDays = booking?.numberOfDays ?? 1
  const photos = data?.photos ?? {}
  const depositAmount = depositAmountProp ?? booking?.depositAmount ?? 500

  const milesDriven = endMileage - startMileage
  const includedMiles = bookingDays * 200
  const overageMiles = Math.max(0, milesDriven - includedMiles)
  const mileageCharge = overageMiles * 0.45

  const startFuelPct = FUEL_PCT[startFuel] ?? 100
  const endFuelPct = FUEL_PCT[endFuel] ?? 100
  const fuelLower = endFuelPct < startFuelPct
  const quartersDown = Math.ceil((startFuelPct - endFuelPct) / 25)
  const fuelCharge = fuelLower ? quartersDown * 75 : 0

  const totalCharges = mileageCharge + fuelCharge
  const hasCharges = totalCharges > 0
  const depositReturn = Math.max(0, depositAmount - totalCharges)

  const photoEntries = Object.entries(photos).filter(([, url]) => url)
  const photoCount = photoEntries.length

  const startFuelLabel = FUEL_LABELS[startFuel] || startFuel
  const endFuelLabel = FUEL_LABELS[endFuel] || endFuel

  if (!endMileage && !data?.fuelLevel) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Please complete odometer and fuel readings first</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
          <IoClipboardOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Trip Summary</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Review your trip data before completing</p>
        </div>
      </div>

      {/* Photos Card */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center gap-2">
          <IoCamera className="w-4 h-4 text-green-500" />
          <span className="text-[13px] font-semibold text-gray-900 dark:text-white flex-1">Inspection Photos</span>
          <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">{photoCount} captured</span>
        </div>
        {photoCount > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {photoEntries.slice(0, 7).map(([key, url]) => (
              <div key={key} className="w-[52px] h-[52px] rounded-md overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                <Image src={url as string} alt={key} width={52} height={52} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Odometer Card */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center gap-2">
          <IoSpeedometer className="w-4 h-4 text-amber-500" />
          <span className="text-[13px] font-semibold text-gray-900 dark:text-white">Odometer</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-center">
            <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{startMileage.toLocaleString()}</p>
          </div>
          <IoArrowForward className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <div className="text-center">
            <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">End</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{endMileage.toLocaleString()}</p>
          </div>
          <div className={`ml-auto px-2 py-1 rounded-lg ${overageMiles > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
            <span className={`text-xs font-bold ${overageMiles > 0 ? 'text-amber-800 dark:text-amber-300' : 'text-green-800 dark:text-green-300'}`}>
              {milesDriven.toLocaleString()} mi
            </span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 border-t pt-2 ${overageMiles > 0 ? 'border-amber-200 dark:border-amber-800' : 'border-gray-200 dark:border-gray-700'}`}>
          {overageMiles > 0 ? (
            <>
              <IoAlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-[11px] text-amber-800 dark:text-amber-300">{overageMiles.toLocaleString()} overage miles × $0.45/mi = {fmt(overageMiles * 0.45)}</span>
            </>
          ) : (
            <>
              <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-[11px] text-green-800 dark:text-green-300">Within {includedMiles.toLocaleString()} included miles — no overage</span>
            </>
          )}
        </div>
      </div>

      {/* Fuel Card */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center gap-2">
          <IoWater className="w-4 h-4 text-blue-500" />
          <span className="text-[13px] font-semibold text-gray-900 dark:text-white">Fuel Level</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pickup</p>
            <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{startFuelLabel}</p>
          </div>
          <IoArrowForward className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <div className="text-center">
            <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Return</p>
            <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{endFuelLabel}</p>
          </div>
          <div className={`ml-auto flex items-center gap-1 px-2 py-1 rounded-lg ${fuelLower ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
            {fuelLower
              ? <IoAlertCircle className="w-3 h-3 text-amber-800 dark:text-amber-300" />
              : <IoCheckmarkCircle className="w-3 h-3 text-green-800 dark:text-green-300" />
            }
            <span className={`text-xs font-bold ${fuelLower ? 'text-amber-800 dark:text-amber-300' : 'text-green-800 dark:text-green-300'}`}>
              {fuelLower ? `-${quartersDown}Q` : 'OK'}
            </span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 border-t pt-2 ${fuelLower ? 'border-amber-200 dark:border-amber-800' : 'border-gray-200 dark:border-gray-700'}`}>
          {fuelLower ? (
            <>
              <IoAlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-[11px] text-amber-800 dark:text-amber-300">{quartersDown} quarter{quartersDown > 1 ? 's' : ''} below pickup × $75 = {fmt(fuelCharge)}</span>
            </>
          ) : (
            <>
              <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-[11px] text-green-800 dark:text-green-300">Same or higher than pickup — no fuel charge</span>
            </>
          )}
        </div>
      </div>

      {/* Charges Breakdown */}
      <div className="flex items-center gap-2.5 mt-2">
        <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
          <IoReceipt className="w-[18px] h-[18px] text-amber-600 dark:text-amber-400" />
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Charges Breakdown</span>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {hasCharges ? (
          <>
            {overageMiles > 0 && (
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <div className="flex items-center gap-1.5">
                  <IoSpeedometer className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Mileage overage ({overageMiles} mi × $0.45)</span>
                </div>
                <span className="text-[13px] font-semibold text-red-500">{fmt(mileageCharge)}</span>
              </div>
            )}
            {fuelCharge > 0 && (
              <div className={`flex items-center justify-between px-3.5 py-2.5 ${overageMiles > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
                <div className="flex items-center gap-1.5">
                  <IoWater className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Fuel refill ({quartersDown}Q × $75)</span>
                </div>
                <span className="text-[13px] font-semibold text-red-500">{fmt(fuelCharge)}</span>
              </div>
            )}
            <div className="flex items-center justify-between px-3.5 py-3 border-t border-gray-200 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-950/20">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Total Charges</span>
              <span className="text-xl font-extrabold text-red-500">{fmt(totalCharges)}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2.5 border-t border-gray-200 dark:border-gray-700">
              <IoShieldCheckmark className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Security deposit: {fmt(depositAmount)}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Charges deducted: -{fmt(totalCharges)}</p>
                <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-0.5">Deposit return: {fmt(depositReturn)}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-5 gap-1.5">
            <IoCheckmarkCircle className="w-6 h-6 text-green-500" />
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">No Additional Charges</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center">Within mileage and fuel limits. Full deposit returned.</span>
            <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 w-full px-3.5 pt-2.5 mt-2">
              <IoShieldCheckmark className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                {fmt(depositAmount)} deposit will be returned in 3–5 days
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
