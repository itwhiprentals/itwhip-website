// app/lib/background-check/processor.ts

/**
 * Background Check Processor
 * Processes results from background check providers
 * Determines pass/fail status and generates reports
 */

import { prisma } from '@/app/lib/database/prisma'
import { BackgroundCheckResponse } from './provider'

// Scoring thresholds
const SCORING_THRESHOLDS = {
  identity: {
    minMatchScore: 85, // Minimum identity match score (out of 100)
  },
  dmv: {
    maxViolations: 3, // Maximum violations allowed
    maxPoints: 6, // Maximum points allowed
    requireValidLicense: true,
  },
  criminal: {
    allowMinorOffenses: true, // Allow minor offenses over 7 years old
    maxOffensesCount: 0, // No recent offenses
    yearsThreshold: 7, // Offenses must be older than this
    blockSexOffenders: true,
    blockViolentCrimes: true,
  },
  credit: {
    minCreditScore: 600, // Minimum credit score for luxury vehicles
    maxDerogatory: 2, // Maximum derogatory marks
  },
  insurance: {
    requireActive: true,
    requireAdequateCoverage: true,
    minCoverageAmount: 100000, // Minimum liability coverage
  }
}

// Check result types
export interface ProcessedCheckResult {
  checkType: string
  status: 'PASSED' | 'FAILED' | 'PENDING' | 'ERROR'
  score?: number
  details: {
    passed: boolean
    reason?: string
    flags?: string[]
    data?: any
  }
  recommendations?: string[]
}

export interface OverallCheckResult {
  allPassed: boolean
  passedChecks: string[]
  failedChecks: string[]
  pendingChecks: string[]
  errorChecks: string[]
  overallScore: number
  recommendation: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW'
  summary: string
  detailedResults: ProcessedCheckResult[]
}

/**
 * Process a single background check result
 */
export async function processCheckResult(
  checkType: string,
  result: any,
  hostId: string
): Promise<ProcessedCheckResult> {
  try {
    switch (checkType.toUpperCase()) {
      case 'IDENTITY':
        return processIdentityCheck(result)
      
      case 'DMV':
        return processDMVCheck(result)
      
      case 'CRIMINAL':
        return processCriminalCheck(result)
      
      case 'CREDIT':
        return processCreditCheck(result)
      
      case 'INSURANCE':
        return processInsuranceCheck(result)
      
      default:
        throw new Error(`Unsupported check type: ${checkType}`)
    }
  } catch (error) {
    console.error(`Error processing ${checkType} check:`, error)
    return {
      checkType: checkType.toUpperCase(),
      status: 'ERROR',
      details: {
        passed: false,
        reason: error instanceof Error ? error.message : 'Processing error',
        flags: ['PROCESSING_ERROR']
      }
    }
  }
}

/**
 * Process Identity Verification Result
 */
function processIdentityCheck(result: any): ProcessedCheckResult {
  const matchScore = result.matchScore || result.score || 0
  const verified = result.verified === true || matchScore >= SCORING_THRESHOLDS.identity.minMatchScore
  
  const flags: string[] = []
  if (matchScore < 70) flags.push('LOW_MATCH_SCORE')
  if (result.addressMismatch) flags.push('ADDRESS_MISMATCH')
  if (result.nameMismatch) flags.push('NAME_MISMATCH')
  if (result.ssnMismatch) flags.push('SSN_MISMATCH')

  return {
    checkType: 'IDENTITY',
    status: verified ? 'PASSED' : 'FAILED',
    score: matchScore,
    details: {
      passed: verified,
      reason: verified 
        ? 'Identity successfully verified'
        : `Identity match score below threshold (${matchScore}/${SCORING_THRESHOLDS.identity.minMatchScore})`,
      flags,
      data: {
        matchScore,
        verified: result.verified,
        provider: result.provider
      }
    },
    recommendations: !verified ? [
      'Request additional identification documents',
      'Manual review of identity documents recommended',
      'Consider video verification call'
    ] : undefined
  }
}

/**
 * Process DMV Check Result
 */
function processDMVCheck(result: any): ProcessedCheckResult {
  const licenseValid = result.license_valid === true || result.licenseValid === true
  const violations = result.violations || result.violationCount || 0
  const points = result.points || result.pointsCount || 0
  
  const flags: string[] = []
  if (!licenseValid) flags.push('INVALID_LICENSE')
  if (violations > SCORING_THRESHOLDS.dmv.maxViolations) flags.push('TOO_MANY_VIOLATIONS')
  if (points > SCORING_THRESHOLDS.dmv.maxPoints) flags.push('TOO_MANY_POINTS')
  if (result.suspended) flags.push('SUSPENDED_LICENSE')
  if (result.expired) flags.push('EXPIRED_LICENSE')
  if (result.dui) flags.push('DUI_RECORD')

  const passed = licenseValid && 
                 violations <= SCORING_THRESHOLDS.dmv.maxViolations && 
                 points <= SCORING_THRESHOLDS.dmv.maxPoints &&
                 !result.suspended &&
                 !result.expired

  // Calculate score (100 max, deductions for issues)
  let score = 100
  score -= violations * 10
  score -= points * 5
  if (!licenseValid) score -= 50
  if (result.suspended) score -= 30
  if (result.dui) score -= 25
  score = Math.max(0, score)

  return {
    checkType: 'DMV',
    status: passed ? 'PASSED' : 'FAILED',
    score,
    details: {
      passed,
      reason: passed
        ? 'DMV record check passed'
        : `DMV issues found: ${flags.join(', ')}`,
      flags,
      data: {
        licenseValid,
        violations,
        points,
        suspended: result.suspended || false,
        expired: result.expired || false,
        dui: result.dui || false,
        provider: result.provider
      }
    },
    recommendations: !passed ? [
      violations > SCORING_THRESHOLDS.dmv.maxViolations ? 'Driving record shows excessive violations' : '',
      points > SCORING_THRESHOLDS.dmv.maxPoints ? 'Too many points on driving record' : '',
      result.suspended ? 'License is currently suspended - cannot approve' : '',
      result.dui ? 'DUI on record - requires manual review' : '',
      'Consider probationary approval with monitoring'
    ].filter(Boolean) : undefined
  }
}

/**
 * Process Criminal Background Check Result
 */
function processCriminalCheck(result: any): ProcessedCheckResult {
  const criminalRecord = result.criminal_record === true || result.hasCriminalRecord === true
  const sexOffender = result.sex_offender === true || result.sexOffender === true
  const offenses = result.offenses || []
  
  const flags: string[] = []
  if (sexOffender) flags.push('SEX_OFFENDER_REGISTRY')
  if (criminalRecord) flags.push('CRIMINAL_RECORD_FOUND')

  // Analyze offenses
  let recentOffenses = 0
  let violentCrimes = 0
  let minorOffenses = 0

  offenses.forEach((offense: any) => {
    const yearsAgo = offense.yearsAgo || 
                     (new Date().getFullYear() - new Date(offense.date).getFullYear())
    
    if (yearsAgo < SCORING_THRESHOLDS.criminal.yearsThreshold) {
      recentOffenses++
    }
    
    if (offense.type === 'violent' || offense.violent === true) {
      violentCrimes++
      flags.push('VIOLENT_CRIME')
    }
    
    if (offense.severity === 'minor') {
      minorOffenses++
    }
  })

  // Determine pass/fail
  let passed = true
  if (sexOffender && SCORING_THRESHOLDS.criminal.blockSexOffenders) {
    passed = false
  }
  if (violentCrimes > 0 && SCORING_THRESHOLDS.criminal.blockViolentCrimes) {
    passed = false
  }
  if (recentOffenses > SCORING_THRESHOLDS.criminal.maxOffensesCount) {
    passed = false
  }

  // Allow minor old offenses if configured
  if (SCORING_THRESHOLDS.criminal.allowMinorOffenses && 
      offenses.length === minorOffenses && 
      recentOffenses === 0) {
    passed = true
  }

  // Calculate score
  let score = 100
  score -= recentOffenses * 30
  score -= violentCrimes * 50
  score -= minorOffenses * 10
  if (sexOffender) score = 0
  score = Math.max(0, score)

  return {
    checkType: 'CRIMINAL',
    status: passed ? 'PASSED' : 'FAILED',
    score,
    details: {
      passed,
      reason: passed
        ? 'No disqualifying criminal record found'
        : `Criminal background check failed: ${flags.join(', ')}`,
      flags,
      data: {
        criminalRecord,
        sexOffender,
        offensesCount: offenses.length,
        recentOffenses,
        violentCrimes,
        minorOffenses,
        provider: result.provider
      }
    },
    recommendations: !passed ? [
      sexOffender ? 'Sex offender registry match - CANNOT APPROVE' : '',
      violentCrimes > 0 ? 'Violent crimes on record - CANNOT APPROVE' : '',
      recentOffenses > 0 ? `${recentOffenses} recent offense(s) found` : '',
      'Manual review required for final decision'
    ].filter(Boolean) : undefined
  }
}

/**
 * Process Credit Check Result
 */
function processCreditCheck(result: any): ProcessedCheckResult {
  const creditScore = result.credit_score || result.creditScore || 0
  const creditRating = result.credit_rating || result.rating || 'UNKNOWN'
  const derogatoryMarks = result.derogatory_marks || result.derogatoryMarks || 0
  
  const flags: string[] = []
  if (creditScore < SCORING_THRESHOLDS.credit.minCreditScore) flags.push('LOW_CREDIT_SCORE')
  if (derogatoryMarks > SCORING_THRESHOLDS.credit.maxDerogatory) flags.push('EXCESSIVE_DEROGATORY_MARKS')
  if (result.bankruptcy) flags.push('BANKRUPTCY')
  if (result.collections) flags.push('COLLECTIONS')

  const passed = creditScore >= SCORING_THRESHOLDS.credit.minCreditScore &&
                 derogatoryMarks <= SCORING_THRESHOLDS.credit.maxDerogatory &&
                 !result.bankruptcy

  // Score is essentially the credit score normalized to 0-100
  const score = Math.min(100, Math.round((creditScore / 850) * 100))

  return {
    checkType: 'CREDIT',
    status: passed ? 'PASSED' : 'FAILED',
    score,
    details: {
      passed,
      reason: passed
        ? 'Credit check passed'
        : `Credit issues found: ${flags.join(', ')}`,
      flags,
      data: {
        creditScore,
        creditRating,
        derogatoryMarks,
        bankruptcy: result.bankruptcy || false,
        collections: result.collections || false,
        provider: result.provider
      }
    },
    recommendations: !passed ? [
      creditScore < SCORING_THRESHOLDS.credit.minCreditScore ? 
        'Credit score below minimum threshold for luxury vehicles' : '',
      derogatoryMarks > SCORING_THRESHOLDS.credit.maxDerogatory ? 
        'Too many derogatory marks on credit report' : '',
      result.bankruptcy ? 'Recent bankruptcy on record' : '',
      'Consider requiring larger security deposit',
      'Restrict to lower-value vehicles initially'
    ].filter(Boolean) : undefined
  }
}

/**
 * Process Insurance Verification Result
 */
function processInsuranceCheck(result: any): ProcessedCheckResult {
  const insuranceValid = result.insurance_valid === true || result.insuranceValid === true
  const coverageAdequate = result.coverage_adequate === true || result.adequateCoverage === true
  const coverageAmount = result.coverageAmount || result.coverage_amount || 0
  
  const flags: string[] = []
  if (!insuranceValid) flags.push('NO_ACTIVE_INSURANCE')
  if (!coverageAdequate) flags.push('INADEQUATE_COVERAGE')
  if (coverageAmount < SCORING_THRESHOLDS.insurance.minCoverageAmount) flags.push('LOW_COVERAGE_AMOUNT')
  if (result.lapsed) flags.push('LAPSED_COVERAGE')
  if (result.suspended) flags.push('SUSPENDED_INSURANCE')

  const passed = insuranceValid &&
                 coverageAdequate &&
                 coverageAmount >= SCORING_THRESHOLDS.insurance.minCoverageAmount &&
                 !result.lapsed &&
                 !result.suspended

  // Calculate score
  let score = 100
  if (!insuranceValid) score -= 50
  if (!coverageAdequate) score -= 30
  if (coverageAmount < SCORING_THRESHOLDS.insurance.minCoverageAmount) score -= 20
  if (result.lapsed) score -= 15
  score = Math.max(0, score)

  return {
    checkType: 'INSURANCE',
    status: passed ? 'PASSED' : 'FAILED',
    score,
    details: {
      passed,
      reason: passed
        ? 'Insurance verification passed'
        : `Insurance issues found: ${flags.join(', ')}`,
      flags,
      data: {
        insuranceValid,
        coverageAdequate,
        coverageAmount,
        lapsed: result.lapsed || false,
        suspended: result.suspended || false,
        provider: result.provider
      }
    },
    recommendations: !passed ? [
      !insuranceValid ? 'No active insurance found - CANNOT APPROVE' : '',
      !coverageAdequate ? 'Insurance coverage below minimum requirements' : '',
      result.lapsed ? 'Insurance has lapsed' : '',
      'Request updated insurance certificate',
      'Require proof of continuous coverage'
    ].filter(Boolean) : undefined
  }
}

/**
 * Process all background check results and determine overall status
 */
export async function processOverallResults(
  checkResults: Record<string, any>,
  requiredChecks: string[]
): Promise<OverallCheckResult> {
  const processedResults: ProcessedCheckResult[] = []
  
  // Process each check
  for (const checkType of requiredChecks) {
    const result = checkResults[checkType.toLowerCase()]
    if (!result) {
      processedResults.push({
        checkType: checkType.toUpperCase(),
        status: 'PENDING',
        details: {
          passed: false,
          reason: 'Check not yet completed'
        }
      })
      continue
    }

    const processed = await processCheckResult(checkType, result, '')
    processedResults.push(processed)
  }

  // Categorize results
  const passedChecks = processedResults
    .filter(r => r.status === 'PASSED')
    .map(r => r.checkType)
  
  const failedChecks = processedResults
    .filter(r => r.status === 'FAILED')
    .map(r => r.checkType)
  
  const pendingChecks = processedResults
    .filter(r => r.status === 'PENDING')
    .map(r => r.checkType)
  
  const errorChecks = processedResults
    .filter(r => r.status === 'ERROR')
    .map(r => r.checkType)

  // Calculate overall score (average of all scores)
  const scores = processedResults
    .filter(r => r.score !== undefined)
    .map(r => r.score!)
  const overallScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  // Determine recommendation
  let recommendation: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW'
  let allPassed = false

  if (pendingChecks.length > 0 || errorChecks.length > 0) {
    recommendation = 'MANUAL_REVIEW'
  } else if (failedChecks.length === 0) {
    recommendation = 'APPROVE'
    allPassed = true
  } else {
    // Check if failures are critical
    const criticalFailures = failedChecks.filter(check => 
      ['IDENTITY', 'DMV', 'CRIMINAL'].includes(check)
    )
    
    if (criticalFailures.length > 0) {
      recommendation = 'REJECT'
    } else {
      recommendation = 'MANUAL_REVIEW'
    }
  }

  // Generate summary
  let summary = ''
  if (allPassed) {
    summary = `All ${requiredChecks.length} background checks passed. Host is approved for listing.`
  } else if (failedChecks.length > 0) {
    summary = `${failedChecks.length} check(s) failed: ${failedChecks.join(', ')}. ${
      recommendation === 'REJECT' ? 'Application rejected.' : 'Manual review required.'
    }`
  } else if (pendingChecks.length > 0) {
    summary = `${pendingChecks.length} check(s) still pending: ${pendingChecks.join(', ')}.`
  } else {
    summary = `Background check completed with errors. Manual review required.`
  }

  return {
    allPassed,
    passedChecks,
    failedChecks,
    pendingChecks,
    errorChecks,
    overallScore,
    recommendation,
    summary,
    detailedResults: processedResults
  }
}

/**
 * Generate a detailed report for admin review
 */
export function generateAdminReport(overallResult: OverallCheckResult): string {
  let report = `BACKGROUND CHECK REPORT\n`
  report += `${'='.repeat(50)}\n\n`
  
  report += `OVERALL STATUS: ${overallResult.recommendation}\n`
  report += `OVERALL SCORE: ${overallResult.overallScore}/100\n`
  report += `SUMMARY: ${overallResult.summary}\n\n`
  
  report += `${'='.repeat(50)}\n`
  report += `DETAILED RESULTS:\n\n`
  
  overallResult.detailedResults.forEach(result => {
    report += `${result.checkType} CHECK:\n`
    report += `  Status: ${result.status}\n`
    report += `  Score: ${result.score || 'N/A'}\n`
    report += `  Result: ${result.details.reason}\n`
    
    if (result.details.flags && result.details.flags.length > 0) {
      report += `  Flags: ${result.details.flags.join(', ')}\n`
    }
    
    if (result.recommendations && result.recommendations.length > 0) {
      report += `  Recommendations:\n`
      result.recommendations.forEach(rec => {
        report += `    - ${rec}\n`
      })
    }
    
    report += `\n`
  })
  
  report += `${'='.repeat(50)}\n`
  report += `END OF REPORT\n`
  
  return report
}

/**
 * Export results for audit/compliance
 */
export function exportResultsForAudit(
  hostId: string,
  overallResult: OverallCheckResult
): any {
  return {
    hostId,
    timestamp: new Date().toISOString(),
    overallStatus: overallResult.recommendation,
    overallScore: overallResult.overallScore,
    summary: overallResult.summary,
    checks: overallResult.detailedResults.map(result => ({
      type: result.checkType,
      status: result.status,
      score: result.score,
      passed: result.details.passed,
      reason: result.details.reason,
      flags: result.details.flags,
      data: result.details.data
    })),
    passedChecks: overallResult.passedChecks,
    failedChecks: overallResult.failedChecks,
    pendingChecks: overallResult.pendingChecks,
    errorChecks: overallResult.errorChecks
  }
}