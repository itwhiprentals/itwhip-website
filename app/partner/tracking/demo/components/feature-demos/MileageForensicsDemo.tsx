// app/partner/tracking/demo/components/feature-demos/MileageForensicsDemo.tsx
// Interactive demo for Mileage Forensics™ - ItWhip's exclusive cross-verification feature
// Shows OBD odometer vs GPS trip distance comparison and discrepancy detection

'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  IoSpeedometerOutline,
  IoLocationOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoDocumentTextOutline,
  IoRefreshOutline,
  IoCarSportOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'
import { useAnimatedValue } from './shared/animations'
import ProviderBadges from './shared/ProviderBadges'
import { MILEAGE_FORENSICS } from '@/app/partner/tracking/shared/providers'

// Demo data types
interface TripRecord {
  id: string
  date: string
  obdMiles: number
  gpsMiles: number
  variance: number // percentage
  status: 'match' | 'minor' | 'alert'
}

// Generate simulated trip data
function generateTripData(): TripRecord[] {
  const trips: TripRecord[] = []
  const now = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Most trips match, some have minor variance, one has alert
    const baseDistance = 15 + Math.random() * 50
    let variance = 0
    let status: TripRecord['status'] = 'match'

    if (i === 2) {
      // Simulate a discrepancy on day 3
      variance = 12.5
      status = 'alert'
    } else if (i === 5) {
      // Minor variance on day 6
      variance = 3.2
      status = 'minor'
    } else {
      variance = Math.random() * 2 - 1 // -1% to +1%
    }

    const obdMiles = Math.round(baseDistance * 10) / 10
    const gpsMiles = Math.round(baseDistance * (1 + variance / 100) * 10) / 10

    trips.push({
      id: `trip-${i}`,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      obdMiles,
      gpsMiles,
      variance: Math.round(variance * 10) / 10,
      status
    })
  }

  return trips
}

interface MileageForensicsDemoProps {
  initialCoordinates?: { lat: number; lng: number }
}

export default function MileageForensicsDemo({ initialCoordinates }: MileageForensicsDemoProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)

  // Trip data
  const trips = useMemo(() => generateTripData(), [])

  // Animated counters
  const totalObd = trips.reduce((sum, t) => sum + t.obdMiles, 0)
  const totalGps = trips.reduce((sum, t) => sum + t.gpsMiles, 0)
  const discrepancyCount = trips.filter(t => t.status === 'alert').length

  const animatedObd = useAnimatedValue(analysisComplete ? totalObd : 0, 1500)
  const animatedGps = useAnimatedValue(analysisComplete ? totalGps : 0, 1500)
  const animatedDiscrepancies = useAnimatedValue(analysisComplete ? discrepancyCount : 0, 1000)

  // Start analysis animation
  const startAnalysis = () => {
    setIsAnalyzing(true)
    setAnalysisComplete(false)
    setSelectedTrip(null)
    setShowReport(false)

    // Simulate analysis time
    setTimeout(() => {
      setIsAnalyzing(false)
      setAnalysisComplete(true)
    }, 2000)
  }

  // Auto-start on mount
  useEffect(() => {
    const timer = setTimeout(startAnalysis, 500)
    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: TripRecord['status']) => {
    switch (status) {
      case 'match':
        return 'text-green-400 bg-green-500/20'
      case 'minor':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'alert':
        return 'text-red-400 bg-red-500/20'
    }
  }

  const getStatusIcon = (status: TripRecord['status']) => {
    switch (status) {
      case 'match':
        return <IoCheckmarkCircleOutline className="w-4 h-4 text-green-400" />
      case 'minor':
        return <IoAlertCircleOutline className="w-4 h-4 text-yellow-400" />
      case 'alert':
        return <IoWarningOutline className="w-4 h-4 text-red-400" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Analysis Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <IoSpeedometerOutline className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{MILEAGE_FORENSICS.name}</h3>
            <p className="text-xs text-gray-400">{MILEAGE_FORENSICS.tagline}</p>
          </div>
        </div>
        <button
          onClick={startAnalysis}
          disabled={isAnalyzing}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
            transition-all duration-300
            ${isAnalyzing
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
            }
          `}
        >
          <IoRefreshOutline className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Re-Analyze'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* OBD Odometer */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <IoCarSportOutline className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">OBD Odometer</span>
          </div>
          <div className="text-xl font-bold text-white">
            {Math.round(animatedObd)}
            <span className="text-sm font-normal text-gray-500 ml-1">mi</span>
          </div>
          <div className="text-xs text-blue-400 mt-1">From vehicle ECU</div>
        </div>

        {/* GPS Distance */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <IoLocationOutline className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">GPS Tracked</span>
          </div>
          <div className="text-xl font-bold text-white">
            {Math.round(animatedGps)}
            <span className="text-sm font-normal text-gray-500 ml-1">mi</span>
          </div>
          <div className="text-xs text-green-400 mt-1">Independent verification</div>
        </div>

        {/* Discrepancies */}
        <div className={`rounded-lg p-3 border ${
          animatedDiscrepancies > 0 && analysisComplete
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-gray-800/50 border-gray-700'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <IoWarningOutline className={`w-4 h-4 ${
              animatedDiscrepancies > 0 && analysisComplete ? 'text-red-400' : 'text-gray-500'
            }`} />
            <span className="text-xs text-gray-400">Discrepancies</span>
          </div>
          <div className={`text-xl font-bold ${
            animatedDiscrepancies > 0 && analysisComplete ? 'text-red-400' : 'text-gray-500'
          }`}>
            {Math.round(animatedDiscrepancies)}
            <span className="text-sm font-normal text-gray-500 ml-1">found</span>
          </div>
          <div className={`text-xs mt-1 ${
            animatedDiscrepancies > 0 && analysisComplete ? 'text-red-400' : 'text-gray-500'
          }`}>
            {animatedDiscrepancies > 0 && analysisComplete ? 'Requires attention' : 'All clear'}
          </div>
        </div>
      </div>

      {/* Analysis Progress or Trip List */}
      {isAnalyzing ? (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex flex-col items-center">
            {/* Animated comparison visualization */}
            <div className="flex items-center gap-8 mb-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <IoCarSportOutline className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-xs text-gray-400 mt-2">OBD Data</div>
              </div>
              <div className="flex-1 flex items-center">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-500 via-amber-500 to-green-500 animate-pulse" />
                <IoSpeedometerOutline className="w-8 h-8 text-amber-400 mx-2 animate-bounce" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-green-500 via-amber-500 to-blue-500 animate-pulse" />
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <IoLocationOutline className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-xs text-gray-400 mt-2">GPS Data</div>
              </div>
            </div>
            <p className="text-sm text-gray-400">Cross-referencing odometer with GPS trip distances...</p>
          </div>
        </div>
      ) : analysisComplete ? (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
          {/* Trip List Header */}
          <div className="px-4 py-2 bg-gray-900/50 border-b border-gray-700">
            <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase tracking-wide">
              <div className="col-span-2">Date</div>
              <div className="col-span-3 text-right">OBD (mi)</div>
              <div className="col-span-3 text-right">GPS (mi)</div>
              <div className="col-span-2 text-right">Variance</div>
              <div className="col-span-2 text-center">Status</div>
            </div>
          </div>

          {/* Trip Rows */}
          <div className="divide-y divide-gray-700/50">
            {trips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => setSelectedTrip(selectedTrip === trip.id ? null : trip.id)}
                className={`
                  w-full px-4 py-2.5 grid grid-cols-12 gap-2 items-center
                  transition-colors hover:bg-gray-700/30
                  ${selectedTrip === trip.id ? 'bg-gray-700/50' : ''}
                  ${trip.status === 'alert' ? 'bg-red-500/5' : ''}
                `}
              >
                <div className="col-span-2 text-sm text-gray-300">{trip.date}</div>
                <div className="col-span-3 text-right text-sm font-mono text-blue-400">
                  {trip.obdMiles.toFixed(1)}
                </div>
                <div className="col-span-3 text-right text-sm font-mono text-green-400">
                  {trip.gpsMiles.toFixed(1)}
                </div>
                <div className="col-span-2 text-right">
                  <span className={`text-sm font-mono ${
                    trip.variance > 5 ? 'text-red-400' :
                    trip.variance > 2 ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>
                    {trip.variance > 0 ? '+' : ''}{trip.variance.toFixed(1)}%
                  </span>
                </div>
                <div className="col-span-2 flex justify-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(trip.status)}`}>
                    {getStatusIcon(trip.status)}
                    <span className="hidden sm:inline">
                      {trip.status === 'match' ? 'OK' : trip.status === 'minor' ? 'Minor' : 'Alert'}
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Alert Detail Panel */}
      {selectedTrip && trips.find(t => t.id === selectedTrip)?.status === 'alert' && (
        <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
          <div className="flex items-start gap-3">
            <IoWarningOutline className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-400 mb-1">Discrepancy Detected</h4>
              <p className="text-sm text-gray-300 mb-3">
                A 12.5% variance between OBD odometer and GPS tracked distance was detected.
                This could indicate:
              </p>
              <ul className="text-sm text-gray-400 space-y-1 mb-3">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  Unreported trip with device disconnected
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  Potential odometer tampering
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  GPS signal loss during trip
                </li>
              </ul>
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
              >
                <IoDocumentTextOutline className="w-4 h-4" />
                Generate Investigation Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {showReport && (
        <div className="bg-gray-800 rounded-lg p-4 border border-amber-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IoDocumentTextOutline className="w-5 h-5 text-amber-400" />
              <h4 className="font-semibold text-white">Investigation Report Preview</h4>
            </div>
            <button
              onClick={() => setShowReport(false)}
              className="text-gray-400 hover:text-white text-sm"
            >
              Close
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-gray-300 space-y-2">
            <div className="text-amber-400">═══ MILEAGE FORENSICS™ REPORT ═══</div>
            <div className="text-gray-500">Generated: {new Date().toLocaleString()}</div>
            <div className="border-t border-gray-700 my-2" />
            <div>Vehicle: 2022 Tesla Model 3</div>
            <div>VIN: 5YJ3E1EA****</div>
            <div>Analysis Period: Last 7 days</div>
            <div className="border-t border-gray-700 my-2" />
            <div className="text-red-400">⚠ DISCREPANCY FOUND</div>
            <div>Date: {trips.find(t => t.status === 'alert')?.date}</div>
            <div>OBD Reading: {trips.find(t => t.status === 'alert')?.obdMiles} miles</div>
            <div>GPS Tracked: {trips.find(t => t.status === 'alert')?.gpsMiles} miles</div>
            <div>Variance: +12.5% (exceeds 5% threshold)</div>
            <div className="border-t border-gray-700 my-2" />
            <div className="text-gray-500">Recommended Action: Review rental agreement</div>
            <div className="text-gray-500">and contact guest for clarification.</div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <IoInformationCircleOutline className="w-4 h-4" />
          How Mileage Forensics™ Works
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-3">
          {MILEAGE_FORENSICS.description}
        </p>
        <div className="text-xs text-gray-500 italic">
          {MILEAGE_FORENSICS.accuracyNote}
        </div>
      </div>

      {/* Provider Requirements */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Requires:</span>
        <ProviderBadges providers={['Bouncie', 'Smartcar']} />
      </div>
    </div>
  )
}
