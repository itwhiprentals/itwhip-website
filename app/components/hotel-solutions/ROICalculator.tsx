// app/components/hotel-solutions/ROICalculator.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { 
  IoArrowUpOutline, 
  IoCalculatorOutline,
  IoInformationCircleOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoAirplaneOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
  IoShieldCheckmarkOutline,
  IoLocationOutline,
  IoTimerOutline
} from 'react-icons/io5'

interface CalculatorData {
  // Hotel Profile
  rooms: number
  occupancy: number
  adr: number
  hotelType: 'luxury' | 'upscale' | 'midscale' | 'economy'
  
  // Location Details
  airportDistance: number
  avgLocalDistance: number
  
  // Current Operations
  hasShuttle: boolean
  monthlyShuttleCost: number
  shuttleDrivers: number
  
  // Trip Volumes (at 100% occupancy)
  dailyAirportTrips: number
  dailyLocalTrips: number
  
  // Service Issues
  guestComplaints: number
  missedRides: number
  
  showResults: boolean
}

interface ROIMetrics {
  // Revenue Streams
  airportRideCommission: number
  localRideCommission: number
  bookingUplift: number
  
  // Cost Savings
  shuttleOperations: number
  insuranceCosts: number
  driverSalaries: number
  maintenanceCosts: number
  liabilityReserve: number
  
  // Totals
  monthlyRevenue: number
  monthlySavings: number
  totalMonthlyBenefit: number
  annualBenefit: number
  
  // Metrics
  roi: number
  paybackMonths: number
  revenuePerRoom: number
  
  // Guest Value
  surgeProtectionValue: number
  avgGuestSavings: number
  availabilityHours: number
}

// Realistic pricing based on distance
const calculateTripPrice = (distance: number, type: 'airport' | 'local'): number => {
  // Base fare + per mile rate
  const baseFare = type === 'airport' ? 8 : 5
  const perMile = type === 'airport' ? 2.5 : 2.0
  const minFare = type === 'airport' ? 15 : 8
  
  const calculatedFare = baseFare + (distance * perMile)
  return Math.max(calculatedFare, minFare)
}

// Commission rates by hotel type
const COMMISSION_RATES = {
  luxury: 0.32,
  upscale: 0.30,
  midscale: 0.28,
  economy: 0.25
}

// ADR defaults by hotel type
const DEFAULT_ADR = {
  luxury: 450,
  upscale: 250,
  midscale: 150,
  economy: 89
}

export default function ROICalculator() {
  const [calculatorData, setCalculatorData] = useState<CalculatorData>({
    rooms: 150,
    occupancy: 70,
    adr: 150,
    hotelType: 'midscale',
    airportDistance: 12,
    avgLocalDistance: 5,
    hasShuttle: true,
    monthlyShuttleCost: 8500,
    shuttleDrivers: 2,
    dailyAirportTrips: 15,
    dailyLocalTrips: 20,
    guestComplaints: 5,
    missedRides: 10,
    showResults: false
  })

  const [animatedMetrics, setAnimatedMetrics] = useState<ROIMetrics | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Update ADR when hotel type changes
  useEffect(() => {
    setCalculatorData(prev => ({
      ...prev,
      adr: DEFAULT_ADR[prev.hotelType]
    }))
  }, [calculatorData.hotelType])

  // Auto-calculate when inputs change (if results are showing)
  useEffect(() => {
    if (calculatorData.showResults) {
      const timer = setTimeout(() => {
        setAnimatedMetrics(calculateROI())
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [calculatorData])

  const calculateROI = (): ROIMetrics => {
    const { 
      rooms, occupancy, adr, hotelType,
      airportDistance, avgLocalDistance,
      hasShuttle, monthlyShuttleCost, shuttleDrivers,
      dailyAirportTrips, dailyLocalTrips,
      guestComplaints, missedRides
    } = calculatorData

    // Get commission rate for hotel type
    const commissionRate = COMMISSION_RATES[hotelType]
    
    // Calculate trip prices based on distance
    const airportTripPrice = calculateTripPrice(airportDistance, 'airport')
    const localTripPrice = calculateTripPrice(avgLocalDistance, 'local')
    
    // Adjust trips for occupancy
    const occupancyRate = occupancy / 100
    const actualDailyAirportTrips = dailyAirportTrips * occupancyRate
    const actualDailyLocalTrips = dailyLocalTrips * occupancyRate
    
    // Monthly trip volumes
    const monthlyAirportTrips = actualDailyAirportTrips * 30
    const monthlyLocalTrips = actualDailyLocalTrips * 30
    
    // Revenue Calculations
    const airportRideCommission = monthlyAirportTrips * airportTripPrice * commissionRate
    const localRideCommission = monthlyLocalTrips * localTripPrice * commissionRate
    
    // Booking Uplift Calculation (conservative)
    // Each resolved complaint = 0.1 review star improvement
    // Each 0.1 star = 1% booking increase
    // Each missed ride resolved = 0.5% booking increase
    const reviewImprovement = (guestComplaints * 0.1) + (missedRides * 0.005)
    const bookingIncrease = Math.min(reviewImprovement * 0.01, 0.05) // Cap at 5%
    
    // Calculate rooms sold per month
    const roomsPerNight = rooms * occupancyRate
    const additionalRoomsPerNight = roomsPerNight * bookingIncrease
    const bookingUplift = additionalRoomsPerNight * adr * 30
    
    // Cost Savings (only if has shuttle)
    const shuttleOperations = hasShuttle ? monthlyShuttleCost : 0
    const insuranceCosts = hasShuttle ? 2000 : 0
    const driverSalaries = hasShuttle ? (shuttleDrivers * 3500) : 0
    const maintenanceCosts = hasShuttle ? 1500 : 0
    const liabilityReserve = hasShuttle ? 3000 : 0
    
    // Total Calculations
    const monthlyRevenue = airportRideCommission + localRideCommission + bookingUplift
    const monthlySavings = shuttleOperations + insuranceCosts + driverSalaries + maintenanceCosts + liabilityReserve
    const totalMonthlyBenefit = monthlyRevenue + monthlySavings
    const annualBenefit = totalMonthlyBenefit * 12
    
    // Metrics
    const roi = monthlySavings > 0 ? ((totalMonthlyBenefit / monthlySavings) * 100) : ((monthlyRevenue / 10000) * 100)
    const paybackMonths = totalMonthlyBenefit > 0 ? Math.max(1, Math.ceil(5000 / totalMonthlyBenefit)) : 0
    const revenuePerRoom = monthlyRevenue / rooms
    
    // Guest Value Calculations
    // During surge times (20% of trips), prices increase 2.5x
    // We never surge, so guests save
    const surgeTripPrice = airportTripPrice * 2.5
    const surgeOccurrence = 0.20 // 20% of trips hit surge
    const monthlyAirportSurgeTrips = monthlyAirportTrips * surgeOccurrence
    const surgeProtectionValue = monthlyAirportSurgeTrips * (surgeTripPrice - airportTripPrice)
    
    const totalGuestTrips = monthlyAirportTrips + monthlyLocalTrips
    const avgGuestSavings = surgeProtectionValue / totalGuestTrips
    
    // Availability improvement (shuttle is only 16 hours, we're 24/7)
    const availabilityHours = 24 - (hasShuttle ? 16 : 0)
    
    return {
      airportRideCommission,
      localRideCommission,
      bookingUplift,
      shuttleOperations,
      insuranceCosts,
      driverSalaries,
      maintenanceCosts,
      liabilityReserve,
      monthlyRevenue,
      monthlySavings,
      totalMonthlyBenefit,
      annualBenefit,
      roi,
      paybackMonths,
      revenuePerRoom,
      surgeProtectionValue,
      avgGuestSavings,
      availabilityHours
    }
  }

  const handleCalculate = () => {
    setIsCalculating(true)
    setCalculatorData({ ...calculatorData, showResults: true })
    setTimeout(() => {
      setIsCalculating(false)
    }, 1500)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const generatePDFReport = () => {
    if (!animatedMetrics) return

    // Create a comprehensive HTML report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>ItWhip ROI Analysis - ${calculatorData.rooms} Room ${calculatorData.hotelType.charAt(0).toUpperCase() + calculatorData.hotelType.slice(1)} Hotel</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; background: #f8f9fa; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
            .header p { margin: 0; opacity: 0.9; }
            .section { background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .section h2 { color: #2d3748; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
            .metric { background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #4299e1; }
            .metric-label { font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #2d3748; margin-top: 5px; }
            .highlight-box { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
            .highlight-box h3 { margin: 0 0 10px 0; font-size: 20px; }
            .highlight-box .big-number { font-size: 36px; font-weight: bold; margin: 10px 0; }
            .explanation { background: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .explanation h3 { color: #2d3748; margin-top: 0; }
            .explanation p { line-height: 1.6; color: #4a5568; }
            ul { line-height: 1.8; color: #4a5568; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #718096; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f7fafc; padding: 12px; text-align: left; font-weight: 600; color: #2d3748; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
            .green { color: #48bb78; }
            .blue { color: #4299e1; }
            .purple { color: #9f7aea; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ItWhip Revenue Analysis Report</h1>
            <p>Prepared for: ${calculatorData.rooms}-Room ${calculatorData.hotelType.charAt(0).toUpperCase() + calculatorData.hotelType.slice(1)} Hotel</p>
            <p>Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div class="section">
            <h2>Executive Summary</h2>
            <div class="highlight-box">
              <h3>Total Annual Benefit</h3>
              <div class="big-number">${formatCurrency(animatedMetrics.annualBenefit)}</div>
              <p>${animatedMetrics.roi.toFixed(0)}% ROI • ${animatedMetrics.paybackMonths} Month Payback</p>
            </div>
            <p>Based on your specific configuration of ${calculatorData.rooms} rooms at ${calculatorData.occupancy}% occupancy, 
            with ${calculatorData.airportDistance} miles to airport and an average of ${calculatorData.dailyAirportTrips} airport trips 
            and ${calculatorData.dailyLocalTrips} local trips daily.</p>
          </div>

          <div class="section">
            <h2>Revenue Breakdown</h2>
            <div class="metric-grid">
              <div class="metric">
                <div class="metric-label">Airport Ride Commission</div>
                <div class="metric-value green">${formatCurrency(animatedMetrics.airportRideCommission)}/mo</div>
              </div>
              <div class="metric">
                <div class="metric-label">Local Ride Commission</div>
                <div class="metric-value blue">${formatCurrency(animatedMetrics.localRideCommission)}/mo</div>
              </div>
              <div class="metric">
                <div class="metric-label">Booking Uplift</div>
                <div class="metric-value purple">${formatCurrency(animatedMetrics.bookingUplift)}/mo</div>
              </div>
              <div class="metric">
                <div class="metric-label">Per Room Revenue</div>
                <div class="metric-value">${formatCurrency(animatedMetrics.revenuePerRoom)}/mo</div>
              </div>
            </div>
          </div>

          ${calculatorData.hasShuttle ? `
          <div class="section">
            <h2>Cost Elimination</h2>
            <table>
              <tr><th>Cost Category</th><th>Monthly Savings</th><th>Annual Savings</th></tr>
              <tr><td>Shuttle Operations</td><td>${formatCurrency(animatedMetrics.shuttleOperations)}</td><td>${formatCurrency(animatedMetrics.shuttleOperations * 12)}</td></tr>
              <tr><td>Driver Salaries</td><td>${formatCurrency(animatedMetrics.driverSalaries)}</td><td>${formatCurrency(animatedMetrics.driverSalaries * 12)}</td></tr>
              <tr><td>Insurance & Liability</td><td>${formatCurrency(animatedMetrics.insuranceCosts + animatedMetrics.liabilityReserve)}</td><td>${formatCurrency((animatedMetrics.insuranceCosts + animatedMetrics.liabilityReserve) * 12)}</td></tr>
              <tr><td>Maintenance</td><td>${formatCurrency(animatedMetrics.maintenanceCosts)}</td><td>${formatCurrency(animatedMetrics.maintenanceCosts * 12)}</td></tr>
              <tr style="font-weight: bold;"><td>Total Savings</td><td>${formatCurrency(animatedMetrics.monthlySavings)}</td><td>${formatCurrency(animatedMetrics.monthlySavings * 12)}</td></tr>
            </table>
          </div>
          ` : ''}

          <div class="section">
            <h2>The ItWhip Ecosystem Advantage</h2>
            <div class="explanation">
              <h3>Why This Works: Complete Guest Journey Control</h3>
              <p><strong>We don't just provide transportation – we own the entire guest experience ecosystem.</strong></p>
              
              <p>Traditional transportation services focus on a single touchpoint. ItWhip operates differently because we control:</p>
              <ul>
                <li><strong>The Booking Platform:</strong> Direct integration with your reservation system means we know when guests are coming, their preferences, and their value to your property.</li>
                <li><strong>The Transportation Network:</strong> Our drivers aren't random contractors – they're hospitality professionals trained specifically for hotel guests.</li>
                <li><strong>The Data Intelligence:</strong> We see patterns across thousands of hotels, allowing us to predict demand and position resources before they're needed.</li>
                <li><strong>The Guest Relationship:</strong> From booking to arrival to local experiences, we're part of their entire journey.</li>
              </ul>

              <h3>City & Market Dynamics</h3>
              <p>Your results will vary based on local factors, but our model adapts:</p>
              <ul>
                <li><strong>High-Demand Cities:</strong> In markets like NYC or San Francisco, trip values are higher, increasing your commission revenue.</li>
                <li><strong>Suburban Markets:</strong> Lower trip costs are offset by higher volume and reduced competition.</li>
                <li><strong>Resort Destinations:</strong> Seasonal fluctuations are managed through our dynamic driver network.</li>
                <li><strong>Airport Hotels:</strong> Maximum revenue potential with high-frequency, high-value trips.</li>
              </ul>

              <h3>The Network Effect</h3>
              <p>As more hotels join ItWhip in your city, the service improves for everyone:</p>
              <ul>
                <li>More drivers available 24/7</li>
                <li>Faster response times</li>
                <li>Better route optimization</li>
                <li>Stronger negotiating power with local authorities</li>
                <li>Shared marketing benefits</li>
              </ul>
            </div>
          </div>

          <div class="section">
            <h2>Guest Experience Metrics</h2>
            <div class="metric-grid">
              <div class="metric">
                <div class="metric-label">Surge Protection Value</div>
                <div class="metric-value">${formatCurrency(animatedMetrics.surgeProtectionValue)}/mo</div>
              </div>
              <div class="metric">
                <div class="metric-label">Average Guest Savings</div>
                <div class="metric-value">${formatCurrency(animatedMetrics.avgGuestSavings)}/trip</div>
              </div>
              <div class="metric">
                <div class="metric-label">Availability Improvement</div>
                <div class="metric-value">24/7 vs 16hr</div>
              </div>
              <div class="metric">
                <div class="metric-label">Wait Time Reduction</div>
                <div class="metric-value">90% faster</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Implementation Roadmap</h2>
            <table>
              <tr><th>Timeline</th><th>Milestone</th><th>Expected Outcome</th></tr>
              <tr><td>Day 1</td><td>API Integration Complete</td><td>System connected, testing begins</td></tr>
              <tr><td>Day 3</td><td>Staff Training Complete</td><td>Front desk ready to assist guests</td></tr>
              <tr><td>Day 7</td><td>First Week of Service</td><td>Initial revenue generation</td></tr>
              <tr><td>Day 30</td><td>First Month Review</td><td>${(animatedMetrics.monthlyRevenue).toFixed(0)} revenue achieved</td></tr>
              <tr><td>Day 90</td><td>Quarterly Assessment</td><td>Guest satisfaction improvement measurable</td></tr>
              <tr><td>Day 365</td><td>Annual Review</td><td>${(animatedMetrics.annualBenefit).toFixed(0)} total benefit realized</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>Risk Mitigation</h2>
            <ul>
              <li><strong>No Capital Investment:</strong> Zero upfront costs means zero financial risk</li>
              <li><strong>Month-to-Month Terms:</strong> Cancel anytime with 30 days notice</li>
              <li><strong>Performance Guarantee:</strong> If we don't deliver the rides, you don't pay commissions</li>
              <li><strong>Insurance Coverage:</strong> $100M policy covers all operations</li>
              <li><strong>Service Level Agreement:</strong> 99.9% uptime guaranteed</li>
            </ul>
          </div>

          <div class="section">
            <h2>Next Steps</h2>
            <ol>
              <li><strong>Schedule Technical Review:</strong> 30-minute call with our integration team</li>
              <li><strong>Sign Agreement:</strong> Simple 2-page contract, no hidden terms</li>
              <li><strong>Complete Integration:</strong> 15 minutes with your IT team</li>
              <li><strong>Launch Service:</strong> Start earning revenue immediately</li>
            </ol>
          </div>

          <div class="footer">
            <p><strong>Confidential Analysis Prepared for Your Hotel</strong></p>
            <p>ItWhip Technologies Inc. | partner@itwhip.com | 1-800-ITWHIP-1</p>
            <p>This analysis is based on conservative estimates. Most hotels exceed projections by 15-20%.</p>
          </div>
        </body>
      </html>
    `

    // Create blob and download
    const blob = new Blob([reportHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    
    // Create a temporary iframe to print/save as PDF
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    document.body.appendChild(iframe)
    
    iframe.onload = function() {
      iframe.contentWindow?.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
        window.URL.revokeObjectURL(url)
      }, 1000)
    }
    
    iframe.src = url
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-6 py-3 rounded-full mb-6 border border-blue-300 dark:border-blue-800">
            <IoCalculatorOutline className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-wider">Precision ROI Calculator</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Your Exact <span className="text-green-600">Revenue Potential</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Real calculations based on distance, volume, and your specific operations
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Calculator Input */}
            <div className="p-8 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <IoBusinessOutline className="w-6 h-6 mr-2 text-blue-600" />
                Hotel Configuration
              </h3>
              
              <div className="space-y-5">
                {/* Hotel Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Property Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['luxury', 'upscale', 'midscale', 'economy'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setCalculatorData({ ...calculatorData, hotelType: type })}
                        className={`px-3 py-2 rounded-lg font-medium transition-all ${
                          calculatorData.hotelType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room Count and Occupancy Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Rooms
                      <span className="float-right text-blue-600 font-bold">{calculatorData.rooms}</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      value={calculatorData.rooms}
                      onChange={(e) => setCalculatorData({...calculatorData, rooms: parseInt(e.target.value)})}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Occupancy
                      <span className="float-right text-green-600 font-bold">{calculatorData.occupancy}%</span>
                    </label>
                    <input
                      type="range"
                      min="40"
                      max="90"
                      value={calculatorData.occupancy}
                      onChange={(e) => setCalculatorData({...calculatorData, occupancy: parseInt(e.target.value)})}
                      className="w-full accent-green-600"
                    />
                  </div>
                </div>

                {/* Distance Configuration */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                    <IoLocationOutline className="w-4 h-4 mr-1" />
                    Distance Settings
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Miles to Airport
                        <span className="float-right text-purple-600 font-bold">{calculatorData.airportDistance} mi</span>
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="30"
                        value={calculatorData.airportDistance}
                        onChange={(e) => setCalculatorData({...calculatorData, airportDistance: parseInt(e.target.value)})}
                        className="w-full accent-purple-600"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>3 miles</span>
                        <span className="text-purple-600 font-medium">
                          Est. fare: {formatCurrency(calculateTripPrice(calculatorData.airportDistance, 'airport'))}
                        </span>
                        <span>30 miles</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Avg Local Trip
                        <span className="float-right text-amber-600 font-bold">{calculatorData.avgLocalDistance} mi</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={calculatorData.avgLocalDistance}
                        onChange={(e) => setCalculatorData({...calculatorData, avgLocalDistance: parseInt(e.target.value)})}
                        className="w-full accent-amber-600"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>1 mile</span>
                        <span className="text-amber-600 font-medium">
                          Est. fare: {formatCurrency(calculateTripPrice(calculatorData.avgLocalDistance, 'local'))}
                        </span>
                        <span>15 miles</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trip Volumes */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                    <IoCarOutline className="w-4 h-4 mr-1" />
                    Daily Trip Volume (at full occupancy)
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Airport
                        <span className="float-right text-blue-600 font-bold">{calculatorData.dailyAirportTrips}</span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={calculatorData.dailyAirportTrips}
                        onChange={(e) => setCalculatorData({...calculatorData, dailyAirportTrips: parseInt(e.target.value)})}
                        className="w-full accent-blue-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Local
                        <span className="float-right text-green-600 font-bold">{calculatorData.dailyLocalTrips}</span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={calculatorData.dailyLocalTrips}
                        onChange={(e) => setCalculatorData({...calculatorData, dailyLocalTrips: parseInt(e.target.value)})}
                        className="w-full accent-green-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Current Shuttle Status */}
                <div className="border-t pt-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calculatorData.hasShuttle}
                      onChange={(e) => setCalculatorData({...calculatorData, hasShuttle: e.target.checked})}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Currently operating shuttle service
                    </span>
                  </label>
                  
                  {calculatorData.hasShuttle && (
                    <div className="mt-3 pl-8 space-y-2">
                      <input
                        type="number"
                        value={calculatorData.monthlyShuttleCost}
                        onChange={(e) => setCalculatorData({...calculatorData, monthlyShuttleCost: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                        placeholder="Monthly shuttle cost"
                      />
                      <select
                        value={calculatorData.shuttleDrivers}
                        onChange={(e) => setCalculatorData({...calculatorData, shuttleDrivers: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                      >
                        <option value="1">1 Driver</option>
                        <option value="2">2 Drivers</option>
                        <option value="3">3 Drivers</option>
                        <option value="4">4 Drivers</option>
                      </select>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCalculate}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Calculating...</span>
                    </>
                  ) : (
                    <>
                      <IoCalculatorOutline className="w-5 h-5" />
                      <span>Calculate Revenue Impact</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <IoTrendingUpOutline className="w-6 h-6 mr-2 text-green-600" />
                Revenue Analysis
              </h3>
              
              {calculatorData.showResults && animatedMetrics ? (
                <div className="space-y-6">
                  {/* Revenue Breakdown */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                      Monthly Revenue Generation
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center">
                          <IoAirplaneOutline className="w-4 h-4 mr-2" />
                          Airport Commissions
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(animatedMetrics.airportRideCommission)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center">
                          <IoCarOutline className="w-4 h-4 mr-2" />
                          Local Commissions
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatCurrency(animatedMetrics.localRideCommission)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center">
                          <IoTrendingUpOutline className="w-4 h-4 mr-2" />
                          Booking Increase
                        </span>
                        <span className="text-xl font-bold text-purple-600">
                          {formatCurrency(animatedMetrics.bookingUplift)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cost Savings (if applicable) */}
                  {calculatorData.hasShuttle && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                        Monthly Cost Elimination
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <span className="text-sm text-slate-700 dark:text-slate-300">Shuttle Operations</span>
                          <span className="font-bold text-red-600">
                            {formatCurrency(animatedMetrics.shuttleOperations)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <span className="text-sm text-slate-700 dark:text-slate-300">Driver Salaries</span>
                          <span className="font-bold text-red-600">
                            {formatCurrency(animatedMetrics.driverSalaries)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <span className="text-sm text-slate-700 dark:text-slate-300">Insurance & Liability</span>
                          <span className="font-bold text-red-600">
                            {formatCurrency(animatedMetrics.insuranceCosts + animatedMetrics.liabilityReserve)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Per Room/Month</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(animatedMetrics.revenuePerRoom)}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Payback Period</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {animatedMetrics.paybackMonths} {animatedMetrics.paybackMonths === 1 ? 'month' : 'months'}
                      </p>
                    </div>
                  </div>

                  {/* Total Impact */}
                  <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-6">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm opacity-90">Monthly Impact</p>
                          <p className="text-2xl font-bold">{formatCurrency(animatedMetrics.totalMonthlyBenefit)}</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-90">Annual Impact</p>
                          <p className="text-2xl font-bold">{formatCurrency(animatedMetrics.annualBenefit)}</p>
                        </div>
                      </div>
                      
                      <div className="text-center border-t border-white/20 pt-4">
                        <p className="text-3xl font-black mb-2">
                          {animatedMetrics.roi.toFixed(0)}% ROI
                        </p>
                        <p className="text-sm opacity-90">
                          Based on actual distance and volume metrics
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guest Value Proposition */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                      <IoCheckmarkCircle className="w-5 h-5 mr-2" />
                      Guest Benefits
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">24/7</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Availability</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">${animatedMetrics.avgGuestSavings.toFixed(0)}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Avg Savings/Trip</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">0%</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Surge Pricing</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button 
                      onClick={generatePDFReport}
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <IoCashOutline className="w-5 h-5" />
                      <span>Download Detailed Analysis</span>
                    </button>
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                      Results based on {calculatorData.rooms} rooms at {calculatorData.occupancy}% occupancy
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Waiting State */}
                  <div className="text-center py-12">
                    <IoCalculatorOutline className="w-24 h-24 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Configure Your Hotel Details
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                      Enter your specific metrics to see accurate revenue projections based on real pricing models.
                    </p>
                  </div>
                  
                  {/* Info Cards */}
                  <div className="grid gap-3">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center">
                        <IoInformationCircleOutline className="w-5 h-5 mr-2" />
                        How We Calculate
                      </p>
                      <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        <li>• Distance-based pricing ($15-75 airport, $8-35 local)</li>
                        <li>• Commission rates: 25-32% based on hotel type</li>
                        <li>• No surge pricing ever (guests save 2.5x during peak)</li>
                        <li>• Improved reviews increase bookings 1-5%</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center">
                        <IoTimerOutline className="w-5 h-5 mr-2" />
                        Implementation Timeline
                      </p>
                      <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        <li>• Day 1: Integration complete</li>
                        <li>• Day 7: First revenue generated</li>
                        <li>• Day 30: Full ROI metrics available</li>
                        <li>• Day 90: Booking uplift measurable</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Trust Bar */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400">
            <span className="flex items-center">
              <IoShieldCheckmarkOutline className="w-5 h-5 mr-2 text-green-600" />
              Conservative Estimates
            </span>
            <span className="flex items-center">
              <IoCheckmarkCircle className="w-5 h-5 mr-2 text-blue-600" />
              No Hidden Fees
            </span>
            <span className="flex items-center">
              <IoWarningOutline className="w-5 h-5 mr-2 text-amber-600" />
              Month-to-Month Terms
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}