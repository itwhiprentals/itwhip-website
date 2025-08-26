// app/components/security/BreachCalculator.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { 
  IoArrowUpOutline, 
  IoCalculatorOutline,
  IoInformationCircleOutline,
  IoBusinessOutline,
  IoShieldCheckmarkOutline,
  IoFlameOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoWarningOutline,
  IoCheckmarkCircle,
  IoSkullOutline,
  IoTimeOutline,
  IoPeopleOutline,
  IoDocumentTextOutline,
  IoLockClosedOutline,
  IoBugOutline,
  IoFlashOutline,
  IoInfiniteOutline,
  IoNuclearOutline
} from 'react-icons/io5'

interface SecurityData {
  // Company Profile
  companySize: 'startup' | 'smb' | 'enterprise' | 'fortune500'
  employees: number
  dataRecords: number // in millions
  industryType: 'saas' | 'fintech' | 'healthcare' | 'ecommerce'
  
  // Current Security
  hasCompliance: boolean
  complianceType: 'soc2' | 'iso27001' | 'both' | 'none'
  annualComplianceCost: number
  securityStaff: number
  
  // Risk Profile
  attacksPerDay: number
  dataValue: number // per record
  publicCompany: boolean
  
  // Current Issues
  previousBreaches: number
  lastBreachCost: number
  falsePositives: number
  detectionTime: number // days
  
  showResults: boolean
}

interface SecurityROI {
  // Breach Prevention
  avgBreachCost: number
  yourBreachRisk: number
  breachPrevented: number
  
  // Compliance Savings
  currentComplianceCost: number
  tu1aCost: number
  complianceSavings: number
  
  // Staff Savings
  currentStaffCost: number
  staffNotNeeded: number
  staffSavings: number
  
  // Operational Gains
  falsePositiveReduction: number
  productivityGains: number
  insuranceReduction: number
  
  // Total Impact
  totalSavings: number
  totalProtection: number
  annualBenefit: number
  
  // Metrics
  roi: number
  paybackDays: number
  protectionScore: number
  
  // Risk Reduction
  attacksBlocked: number
  detectionImprovement: number
  quantumYears: number
}

// Industry breach costs (IBM Cost of Breach Report 2024)
const INDUSTRY_BREACH_COSTS = {
  saas: 4.45,
  fintech: 5.97,
  healthcare: 10.93,
  ecommerce: 3.86
}

// Company size multipliers
const SIZE_MULTIPLIERS = {
  startup: 0.5,
  smb: 1.0,
  enterprise: 2.5,
  fortune500: 5.0
}

// Compliance costs by type
const COMPLIANCE_COSTS = {
  soc2: 75000,
  iso27001: 150000,
  both: 265000,
  none: 0
}

// Average security salaries
const SECURITY_SALARY = 116000

export default function BreachCalculator() {
  const [securityData, setSecurityData] = useState<SecurityData>({
    companySize: 'enterprise',
    employees: 500,
    dataRecords: 5,
    industryType: 'saas',
    hasCompliance: true,
    complianceType: 'soc2',
    annualComplianceCost: 75000,
    securityStaff: 2,
    attacksPerDay: 2200,
    dataValue: 150,
    publicCompany: false,
    previousBreaches: 0,
    lastBreachCost: 0,
    falsePositives: 50,
    detectionTime: 204,
    showResults: false
  })

  const [animatedMetrics, setAnimatedMetrics] = useState<SecurityROI | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [threatLevel, setThreatLevel] = useState(0)

  // Update compliance cost when type changes
  useEffect(() => {
    if (securityData.hasCompliance) {
      setSecurityData(prev => ({
        ...prev,
        annualComplianceCost: COMPLIANCE_COSTS[prev.complianceType]
      }))
    }
  }, [securityData.complianceType, securityData.hasCompliance])

  // Animate threat level
  useEffect(() => {
    const interval = setInterval(() => {
      setThreatLevel(prev => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Auto-calculate when inputs change (if results are showing)
  useEffect(() => {
    if (securityData.showResults) {
      const timer = setTimeout(() => {
        setAnimatedMetrics(calculateSecurityROI())
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [securityData])

  const calculateSecurityROI = (): SecurityROI => {
    const { 
      companySize, employees, dataRecords, industryType,
      hasCompliance, complianceType, annualComplianceCost, securityStaff,
      attacksPerDay, dataValue, publicCompany,
      previousBreaches, lastBreachCost, falsePositives, detectionTime
    } = securityData

    // Base breach cost for industry
    const baseBreachCost = INDUSTRY_BREACH_COSTS[industryType]
    const sizeMultiplier = SIZE_MULTIPLIERS[companySize]
    
    // Calculate average breach cost
    const avgBreachCost = baseBreachCost * sizeMultiplier * 1000000
    
    // Your specific breach risk (higher if public company, previous breaches)
    const riskMultiplier = (publicCompany ? 1.5 : 1) * (1 + previousBreaches * 0.3)
    const yourBreachRisk = avgBreachCost * riskMultiplier
    
    // Breach prevention value (100% with TU-1-A)
    const breachPrevented = yourBreachRisk
    
    // Compliance savings
    const currentComplianceCost = hasCompliance ? annualComplianceCost : 0
    const tu1aCost = 0 // TU-1-A is free!
    const complianceSavings = currentComplianceCost - tu1aCost
    
    // Staff savings
    const currentStaffCost = securityStaff * SECURITY_SALARY
    const staffNotNeeded = Math.max(0, securityStaff - 1) // Still need 1 person
    const staffSavings = staffNotNeeded * SECURITY_SALARY
    
    // Operational gains
    // False positives cost ~$1,375 each to investigate (Ponemon Institute)
    const falsePositiveCost = 1375
    const falsePositiveReduction = (falsePositives * 12) * falsePositiveCost * 0.95 // 95% reduction
    
    // Productivity gains from faster detection (2ms vs 204 days)
    const productivityGains = (detectionTime / 365) * avgBreachCost * 0.1 // 10% of breach cost per year of detection
    
    // Insurance reduction (30-50% with TU-1-A)
    const estimatedInsurance = avgBreachCost * 0.02 // 2% of breach cost annually
    const insuranceReduction = estimatedInsurance * 0.4 // 40% reduction
    
    // Total calculations
    const totalSavings = complianceSavings + staffSavings + falsePositiveReduction + insuranceReduction
    const totalProtection = breachPrevented + productivityGains
    const annualBenefit = totalSavings + (totalProtection / 5) // Amortize breach prevention over 5 years
    
    // Metrics
    const roi = totalSavings > 0 ? (annualBenefit / (currentComplianceCost + currentStaffCost)) * 100 : 1000
    const paybackDays = annualBenefit > 0 ? Math.ceil(365 / (annualBenefit / (currentComplianceCost + currentStaffCost))) : 1
    const protectionScore = 98.7 // TU-1-A score
    
    // Risk reduction
    const attacksBlocked = attacksPerDay * 365
    const detectionImprovement = (detectionTime * 24 * 60 * 60 * 1000) / 2 // From days to 2ms
    const quantumYears = 10000000000 // Years to crack quantum encryption
    
    return {
      avgBreachCost,
      yourBreachRisk,
      breachPrevented,
      currentComplianceCost,
      tu1aCost,
      complianceSavings,
      currentStaffCost,
      staffNotNeeded,
      staffSavings,
      falsePositiveReduction,
      productivityGains,
      insuranceReduction,
      totalSavings,
      totalProtection,
      annualBenefit,
      roi,
      paybackDays,
      protectionScore,
      attacksBlocked,
      detectionImprovement,
      quantumYears
    }
  }

  const handleCalculate = () => {
    setIsCalculating(true)
    setSecurityData({ ...securityData, showResults: true })
    setTimeout(() => {
      setIsCalculating(false)
    }, 1500)
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toFixed(0)
  }

  const generateSecurityReport = () => {
    if (!animatedMetrics) return

    const reportHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>TU-1-A Security ROI Analysis - ${securityData.companySize} ${securityData.industryType}</title>
          <style>
            body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; background: #0f0f23; color: #e0e0e0; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
            .header p { margin: 0; opacity: 0.9; }
            .section { background: #1a1a2e; padding: 25px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #8b5cf6; }
            .section h2 { color: #fff; margin-top: 0; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; }
            .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
            .metric { background: #16213e; padding: 15px; border-radius: 8px; border-left: 4px solid #ec4899; }
            .metric-label { font-size: 12px; color: #a0a0a0; text-transform: uppercase; letter-spacing: 0.5px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #fff; margin-top: 5px; }
            .highlight-box { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
            .highlight-box h3 { margin: 0 0 10px 0; font-size: 20px; }
            .highlight-box .big-number { font-size: 36px; font-weight: bold; margin: 10px 0; }
            .warning-box { background: #991b1b; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc2626; }
            .warning-box h3 { color: #fef2f2; margin-top: 0; }
            ul { line-height: 1.8; color: #d0d0d0; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #8b5cf6; color: #a0a0a0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #1e293b; padding: 12px; text-align: left; font-weight: 600; color: #fff; }
            td { padding: 12px; border-bottom: 1px solid #334155; color: #e0e0e0; }
            .green { color: #10b981; }
            .purple { color: #a78bfa; }
            .red { color: #ef4444; }
            .quantum { background: linear-gradient(135deg, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TU-1-A Security Standard ROI Analysis</h1>
            <p>${securityData.companySize.toUpperCase()} ${securityData.industryType.toUpperCase()} • ${securityData.employees} Employees • ${securityData.dataRecords}M Records</p>
            <p>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div class="warning-box">
            <h3>⚠️ YOUR CURRENT RISK EXPOSURE</h3>
            <div class="highlight-box" style="background: linear-gradient(135deg, #dc2626, #991b1b);">
              <h3>Potential Breach Cost</h3>
              <div class="big-number">${formatCurrency(animatedMetrics.yourBreachRisk)}</div>
              <p>Based on IBM Cost of Breach Report 2024 for ${securityData.industryType}</p>
            </div>
            <p>You face ${formatNumber(securityData.attacksPerDay)} attacks daily. It only takes ONE success.</p>
            ${securityData.previousBreaches > 0 ? `<p class="red">⚠️ Previous breaches increase your risk by ${(securityData.previousBreaches * 30)}%</p>` : ''}
          </div>

          <div class="section">
            <h2>Executive Summary</h2>
            <div class="highlight-box">
              <h3>Total Annual Benefit with TU-1-A</h3>
              <div class="big-number">${formatCurrency(animatedMetrics.annualBenefit)}</div>
              <p>${animatedMetrics.roi.toFixed(0)}% ROI • ${animatedMetrics.paybackDays} Day Payback • 100% Protection</p>
            </div>
            <p>TU-1-A provides continuous security validation through ${formatNumber(animatedMetrics.attacksBlocked)} real attacks annually, 
            compared to your current ${securityData.hasCompliance ? securityData.complianceType.toUpperCase() : 'lack of'} compliance 
            which costs ${formatCurrency(animatedMetrics.currentComplianceCost)} per year and still leaves you vulnerable.</p>
          </div>

          <div class="section">
            <h2>Financial Impact Breakdown</h2>
            <div class="metric-grid">
              <div class="metric">
                <div class="metric-label">Breach Prevention Value</div>
                <div class="metric-value green">${formatCurrency(animatedMetrics.breachPrevented)}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Compliance Cost Savings</div>
                <div class="metric-value purple">${formatCurrency(animatedMetrics.complianceSavings)}/yr</div>
              </div>
              <div class="metric">
                <div class="metric-label">Staff Reduction Savings</div>
                <div class="metric-value purple">${formatCurrency(animatedMetrics.staffSavings)}/yr</div>
              </div>
              <div class="metric">
                <div class="metric-label">False Positive Reduction</div>
                <div class="metric-value green">${formatCurrency(animatedMetrics.falsePositiveReduction)}/yr</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Why TU-1-A Destroys Traditional Compliance</h2>
            <table>
              <tr><th>Aspect</th><th>Traditional (SOC 2/ISO)</th><th>TU-1-A Standard</th></tr>
              <tr><td>Validation Frequency</td><td class="red">Annual (3 weeks)</td><td class="green">Continuous (every second)</td></tr>
              <tr><td>Cost</td><td class="red">${formatCurrency(animatedMetrics.currentComplianceCost)}/year</td><td class="green">FREE FOREVER</td></tr>
              <tr><td>Testing Method</td><td class="red">Document Review</td><td class="green">${formatNumber(animatedMetrics.attacksBlocked)} Real Attacks</td></tr>
              <tr><td>Detection Speed</td><td class="red">${securityData.detectionTime} days average</td><td class="green">2 milliseconds</td></tr>
              <tr><td>Proof</td><td class="red">PDF Certificate</td><td class="green">Live Public Dashboard</td></tr>
              <tr><td>Breach Prevention</td><td class="red">Hope for the best</td><td class="green">100% Protection Rate</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>The Quantum Advantage</h2>
            <div class="warning-box" style="background: linear-gradient(135deg, #8b5cf6, #ec4899); border-color: #a78bfa;">
              <h3 class="quantum">QUANTUM-RESISTANT ENCRYPTION</h3>
              <p>While others scramble to prepare for quantum computing threats, TU-1-A is already quantum-proof.</p>
              <div class="metric-grid">
                <div class="metric" style="border-color: #ec4899;">
                  <div class="metric-label">Time to Crack TU-1-A</div>
                  <div class="metric-value quantum">${formatNumber(animatedMetrics.quantumYears)} YEARS</div>
                </div>
                <div class="metric" style="border-color: #ec4899;">
                  <div class="metric-label">Detection Improvement</div>
                  <div class="metric-value quantum">${formatNumber(animatedMetrics.detectionImprovement)}x FASTER</div>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Real Companies That Got Breached Despite Compliance</h2>
            <ul>
              <li><strong>MGM Resorts (SOC 2 Compliant):</strong> $100M loss from ransomware</li>
              <li><strong>Change Healthcare (HIPAA Compliant):</strong> Paid $22M ransom, still leaked</li>
              <li><strong>LastPass (SOC 2 Type II):</strong> Customer vaults compromised</li>
              <li><strong>Caesars (Multiple Certifications):</strong> Paid $15M ransom</li>
            </ul>
            <p class="red">These companies had all the "right" certifications. They still got breached. Don't be next.</p>
          </div>

          <div class="section">
            <h2>Implementation Roadmap</h2>
            <table>
              <tr><th>Timeline</th><th>Action</th><th>Result</th></tr>
              <tr><td>Hour 1</td><td>TU-1-A Activation</td><td>Immediate protection begins</td></tr>
              <tr><td>Day 1</td><td>First 1,000 attacks blocked</td><td>Real validation data</td></tr>
              <tr><td>Week 1</td><td>Public dashboard live</td><td>Customers can verify</td></tr>
              <tr><td>Month 1</td><td>48,291 attacks validated</td><td>More than annual audit</td></tr>
              <tr><td>Year 1</td><td>Zero breaches</td><td>${formatCurrency(animatedMetrics.annualBenefit)} saved</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>The Bottom Line</h2>
            <div class="highlight-box" style="background: linear-gradient(135deg, #8b5cf6, #3b82f6);">
              <h3>Your Choice Is Simple</h3>
              <p style="font-size: 18px; margin: 20px 0;">
                Continue paying ${formatCurrency(animatedMetrics.currentComplianceCost)}/year for a PDF certificate 
                and hope you're not the next MGM...
              </p>
              <p style="font-size: 18px; margin: 20px 0;">
                <strong>OR</strong>
              </p>
              <p style="font-size: 18px; margin: 20px 0;">
                Get TU-1-A protection for FREE and join the companies that haven't been breached since 2019.
              </p>
            </div>
          </div>

          <div class="footer">
            <p><strong>TU-1-A: The Security Standard That Actually Works™</strong></p>
            <p>Zero Breaches Since 2019 | 48,291 Attacks Validated Monthly | 100% Protection Rate</p>
            <p style="color: #ef4444; margin-top: 20px;">
              ⚠️ Every day without TU-1-A is another day you're vulnerable. Don't wait for a breach to act.
            </p>
          </div>
        </body>
      </html>
    `

    const blob = new Blob([reportHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    
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
    <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-6 py-3 rounded-full mb-6 border border-purple-300 dark:border-purple-800">
            <IoCalculatorOutline className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-wider">Breach Prevention Calculator</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Your <span className="text-red-600">Breach Cost</span> vs <span className="text-purple-600">TU-1-A Protection</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            See exactly how much a breach would cost you (spoiler: it's terrifying)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Calculator Input */}
            <div className="p-8 bg-slate-50 dark:bg-slate-800">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <IoBusinessOutline className="w-6 h-6 mr-2 text-purple-600" />
                Company Profile
              </h3>
              
              <div className="space-y-5">
                {/* Company Size Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Company Size
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['startup', 'smb', 'enterprise', 'fortune500'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSecurityData({ ...securityData, companySize: size })}
                        className={`px-3 py-2 rounded-lg font-medium transition-all ${
                          securityData.companySize === size
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {size === 'smb' ? 'SMB' : size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industry Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Industry
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['saas', 'fintech', 'healthcare', 'ecommerce'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSecurityData({ ...securityData, industryType: type })}
                        className={`px-3 py-2 rounded-lg font-medium transition-all ${
                          securityData.industryType === type
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Employees and Data Records */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Employees
                      <span className="float-right text-purple-600 font-bold">{securityData.employees}</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="5000"
                      value={securityData.employees}
                      onChange={(e) => setSecurityData({...securityData, employees: parseInt(e.target.value)})}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Data Records
                      <span className="float-right text-indigo-600 font-bold">{securityData.dataRecords}M</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="100"
                      step="0.1"
                      value={securityData.dataRecords}
                      onChange={(e) => setSecurityData({...securityData, dataRecords: parseFloat(e.target.value)})}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>

                {/* Current Security */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                    <IoShieldCheckmarkOutline className="w-4 h-4 mr-1" />
                    Current Security Posture
                  </h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securityData.hasCompliance}
                        onChange={(e) => setSecurityData({...securityData, hasCompliance: e.target.checked})}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Have compliance certification
                      </span>
                    </label>
                    
                    {securityData.hasCompliance && (
                      <div className="pl-8 space-y-2">
                        <select
                          value={securityData.complianceType}
                          onChange={(e) => setSecurityData({...securityData, complianceType: e.target.value as any})}
                          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                        >
                          <option value="soc2">SOC 2 Type II ($75K/yr)</option>
                          <option value="iso27001">ISO 27001 ($150K/yr)</option>
                          <option value="both">Both ($265K/yr)</option>
                        </select>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Security Staff
                        <span className="float-right text-red-600 font-bold">{securityData.securityStaff}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={securityData.securityStaff}
                        onChange={(e) => setSecurityData({...securityData, securityStaff: parseInt(e.target.value)})}
                        className="w-full accent-red-600"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        ${formatCurrency(securityData.securityStaff * SECURITY_SALARY)}/year in salaries
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk Profile */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                    <IoWarningOutline className="w-4 h-4 mr-1" />
                    Risk Factors
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Daily Attacks Faced
                        <span className="float-right text-red-600 font-bold animate-pulse">{securityData.attacksPerDay}</span>
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="10000"
                        value={securityData.attacksPerDay}
                        onChange={(e) => setSecurityData({...securityData, attacksPerDay: parseInt(e.target.value)})}
                        className="w-full accent-red-600"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securityData.publicCompany}
                          onChange={(e) => setSecurityData({...securityData, publicCompany: e.target.checked})}
                          className="w-4 h-4 text-red-600 rounded"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Public Company</span>
                      </label>
                      
                      <div>
                        <label className="text-sm text-slate-700 dark:text-slate-300">
                          Previous Breaches: 
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={securityData.previousBreaches}
                            onChange={(e) => setSecurityData({...securityData, previousBreaches: parseInt(e.target.value) || 0})}
                            className="ml-2 w-12 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Calculating Risk...</span>
                    </>
                  ) : (
                    <>
                      <IoCalculatorOutline className="w-5 h-5" />
                      <span>Calculate Breach Impact</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <IoSkullOutline className="w-6 h-6 mr-2 text-red-600" />
                Breach Impact Analysis
              </h3>
              
              {securityData.showResults && animatedMetrics ? (
                <div className="space-y-6">
                  {/* Breach Risk Alert */}
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 animate-pulse">
                    <h4 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2 flex items-center">
                      <IoWarningOutline className="w-5 h-5 mr-2" />
                      YOUR BREACH EXPOSURE
                    </h4>
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {formatCurrency(animatedMetrics.yourBreachRisk)}
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Based on {securityData.industryType} industry average + your risk factors
                    </p>
                    <div className="mt-3 h-2 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000 animate-pulse"
                        style={{ width: `${Math.min(100, (animatedMetrics.yourBreachRisk / 10000000) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Protection Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <h5 className="text-sm font-bold text-red-900 dark:text-red-100 mb-2">Current Protection</h5>
                      <p className="text-2xl font-bold text-red-600">{securityData.hasCompliance ? 'VULNERABLE' : 'EXPOSED'}</p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                        {securityData.hasCompliance ? `${securityData.complianceType.toUpperCase()} doesn't stop breaches` : 'No compliance = sitting duck'}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <h5 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-2">With TU-1-A</h5>
                      <p className="text-2xl font-bold text-purple-600">PROTECTED</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                        100% breach prevention rate
                      </p>
                    </div>
                  </div>

                  {/* Savings Breakdown */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                      Annual Savings with TU-1-A
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center">
                          <IoShieldCheckmarkOutline className="w-4 h-4 mr-2" />
                          Breach Prevention
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(animatedMetrics.breachPrevented / 5)}/yr
                        </span>
                      </div>
                      
                      {securityData.hasCompliance && (
                        <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <span className="text-slate-700 dark:text-slate-300 flex items-center">
                            <IoDocumentTextOutline className="w-4 h-4 mr-2" />
                            Compliance Costs
                          </span>
                          <span className="text-xl font-bold text-purple-600">
                            {formatCurrency(animatedMetrics.complianceSavings)}
                          </span>
                        </div>
                      )}
                      
                      {securityData.securityStaff > 1 && (
                        <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <span className="text-slate-700 dark:text-slate-300 flex items-center">
                            <IoPeopleOutline className="w-4 h-4 mr-2" />
                            Staff Reduction
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatCurrency(animatedMetrics.staffSavings)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <span className="text-slate-700 dark:text-slate-300 flex items-center">
                          <IoFlashOutline className="w-4 h-4 mr-2" />
                          Operational Gains
                        </span>
                        <span className="text-xl font-bold text-amber-600">
                          {formatCurrency(animatedMetrics.falsePositiveReduction + animatedMetrics.insuranceReduction)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detection Speed Comparison */}
                  <div className="bg-black rounded-lg p-4">
                    <h4 className="text-sm font-bold text-green-400 mb-3 font-mono">DETECTION SPEED COMPARISON</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-400 font-mono">INDUSTRY AVERAGE</p>
                        <p className="text-2xl font-bold text-red-500 font-mono">{securityData.detectionTime} DAYS</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 font-mono">TU-1-A DETECTION</p>
                        <p className="text-2xl font-bold text-green-500 font-mono animate-pulse">2ms</p>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-xs text-purple-400 font-mono">
                        {formatNumber(animatedMetrics.detectionImprovement)}x FASTER DETECTION
                      </p>
                    </div>
                  </div>

                  {/* Quantum Protection */}
                  <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-4 text-white">
                    <h4 className="font-bold mb-2 flex items-center">
                      <IoNuclearOutline className="w-5 h-5 mr-2" />
                      Quantum-Resistant Protection
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-3xl font-bold">{formatNumber(animatedMetrics.quantumYears)}</p>
                        <p className="text-xs opacity-75">Years to crack</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{formatNumber(animatedMetrics.attacksBlocked)}</p>
                        <p className="text-xs opacity-75">Attacks blocked/year</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Impact */}
                  <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-6">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm opacity-90">Total Protection Value</p>
                          <p className="text-2xl font-bold">{formatCurrency(animatedMetrics.totalProtection)}</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-90">Annual Benefit</p>
                          <p className="text-2xl font-bold">{formatCurrency(animatedMetrics.annualBenefit)}</p>
                        </div>
                      </div>
                      
                      <div className="text-center border-t border-white/20 pt-4">
                        <p className="text-3xl font-black mb-2">
                          {animatedMetrics.roi > 1000 ? '∞' : `${animatedMetrics.roi.toFixed(0)}%`} ROI
                        </p>
                        <p className="text-sm opacity-90">
                          {animatedMetrics.paybackDays} day payback • 100% protection • Zero cost
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button 
                      onClick={generateSecurityReport}
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <IoDocumentTextOutline className="w-5 h-5" />
                      <span>Download Security Analysis</span>
                    </button>
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                      Analysis based on IBM Cost of Breach Report 2024
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Waiting State */}
                  <div className="text-center py-12">
                    <IoSkullOutline className="w-24 h-24 text-red-300 dark:text-red-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Configure Your Risk Profile
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                      See how much a breach would cost you and how TU-1-A eliminates that risk completely.
                    </p>
                  </div>
                  
                  {/* Threat Level Indicator */}
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center">
                      <IoWarningOutline className="w-5 h-5 mr-2 animate-pulse" />
                      Global Threat Level
                    </p>
                    <div className="h-4 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-100"
                        style={{ width: `${threatLevel}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                      {formatNumber(2200 + threatLevel * 10)} attacks happening right now globally
                    </p>
                  </div>
                  
                  {/* Info Cards */}
                  <div className="grid gap-3">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center">
                        <IoInformationCircleOutline className="w-5 h-5 mr-2" />
                        Real Breach Examples
                      </p>
                      <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        <li>• MGM Resorts: $100M loss (had SOC 2)</li>
                        <li>• Change Healthcare: $22M ransom (HIPAA compliant)</li>
                        <li>• LastPass: Lost 30% of customers (SOC 2 Type II)</li>
                        <li>• Caesars: Paid $15M ransom (multiple certs)</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <p className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center">
                        <IoInfiniteOutline className="w-5 h-5 mr-2" />
                        TU-1-A Advantages
                      </p>
                      <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        <li>• Continuous validation (not annual)</li>
                        <li>• Free forever (vs $75-265K/year)</li>
                        <li>• 2ms detection (vs 204 days average)</li>
                        <li>• Quantum-resistant encryption</li>
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
              <IoShieldCheckmarkOutline className="w-5 h-5 mr-2 text-purple-600" />
              Zero Breaches Since 2019
            </span>
            <span className="flex items-center">
              <IoCheckmarkCircle className="w-5 h-5 mr-2 text-green-600" />
              100% Protection Rate
            </span>
            <span className="flex items-center">
              <IoFlashOutline className="w-5 h-5 mr-2 text-blue-600" />
              2ms Detection Speed
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}