// scripts/test-esg-accuracy.js
/**
 * ESG Accuracy Test Script
 * Tests all ESG calculations for Parker Mills (cmfj0oxqm004udomy7qivgt18)
 * 
 * Expected Profile:
 * - 3 completed trips
 * - 1 claim filed
 * - Mileage integrity issues
 */

const HOST_ID = 'cmfj0oxqm004udomy7qivgt18'
const HOST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWczajNwcGkwMDAyZG80OGYyMjUzZHc3IiwiaG9zdElkIjoiY21majBveHFtMDA0dWRvbXk3cWl2Z3QxOCIsImVtYWlsIjoiaHhyaXMwMDdAZ21haWwuY29tIiwibmFtZSI6IlBhcmtlciBNaWxscyIsInJvbGUiOiJCVVNJTkVTUyIsImlzUmVudGFsSG9zdCI6dHJ1ZSwiYXBwcm92YWxTdGF0dXMiOiJBUFBST1ZFRCIsImlhdCI6MTc2MjU2ODE1NiwiZXhwIjoxNzYyNTY5MDU2fQ.uY_n8869ly7z32nIo4mu_reyP4mhySm9jRtagpP_o7w'
const BASE_URL = 'http://localhost:3000'

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  warnings: []
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function pass(test, actual, expected, message) {
  testResults.passed.push({ test, actual, expected, message })
  console.log(`✅ PASS: ${test}`)
  if (message) console.log(`   ${message}`)
}

function fail(test, actual, expected, message) {
  testResults.failed.push({ test, actual, expected, message })
  console.log(`❌ FAIL: ${test}`)
  console.log(`   Expected: ${expected}`)
  console.log(`   Actual: ${actual}`)
  if (message) console.log(`   ${message}`)
}

function warn(test, message) {
  testResults.warnings.push({ test, message })
  console.log(`⚠️  WARN: ${test}`)
  console.log(`   ${message}`)
}

function section(title) {
  console.log('\n' + '='.repeat(80))
  console.log(`  ${title}`)
  console.log('='.repeat(80))
}

async function fetchAPI(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Cookie': `hostAccessToken=${HOST_TOKEN}`
    }
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${endpoint}`)
  }
  
  return response.json()
}

// ============================================================================
// DATA FETCHING
// ============================================================================

async function fetchHostData() {
  section('FETCHING HOST DATA')
  
  console.log('Fetching ESG profile...')
  const esgData = await fetchAPI('/api/host/esg/profile')
  const profile = esgData.data.profile
  
  console.log('Fetching vehicles...')
  const carsData = await fetchAPI('/api/host/cars')
  const cars = carsData.cars
  
  console.log('Fetching bookings...')
  const bookingsData = await fetchAPI('/api/host/bookings')
  const bookings = bookingsData.bookings
  
  console.log('Fetching claims...')
  const claimsData = await fetchAPI('/api/host/claims')
  const claims = claimsData.claims
  
  console.log(`\n✅ Data fetched successfully!`)
  console.log(`   ESG Profile: ${profile ? 'Found' : 'Missing'}`)
  console.log(`   Vehicles: ${cars.length}`)
  console.log(`   Bookings: ${bookings.length}`)
  console.log(`   Claims: ${claims.length}`)
  
  return { profile, cars, bookings, claims }
}

// ============================================================================
// TEST SUITE 1: BASIC DATA INTEGRITY
// ============================================================================

function testBasicDataIntegrity(data) {
  section('TEST SUITE 1: BASIC DATA INTEGRITY')
  
  const { profile, cars, bookings, claims } = data
  
  // Test 1.1: Profile exists
  if (profile) {
    pass('Profile Exists', 'Found', 'Found', 'ESG profile successfully calculated')
  } else {
    fail('Profile Exists', 'Missing', 'Found', 'ESG profile was not calculated')
    return // Can't continue without profile
  }
  
  // Test 1.2: Total trips matches bookings
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length
  if (profile.totalTrips === completedBookings) {
    pass('Total Trips Count', profile.totalTrips, completedBookings, 
      `✓ ${profile.totalTrips} completed trips recorded`)
  } else {
    fail('Total Trips Count', profile.totalTrips, completedBookings, 
      'Trip count mismatch between profile and bookings')
  }
  
  // Test 1.3: Claims count matches
  if (profile.totalClaimsFiled === claims.length) {
    pass('Total Claims Filed', profile.totalClaimsFiled, claims.length,
      `✓ ${claims.length} claims recorded`)
  } else {
    fail('Total Claims Filed', profile.totalClaimsFiled, claims.length,
      'Claims count mismatch')
  }
  
  // Test 1.4: Incident-free trips calculation
  const expectedIncidentFree = Math.max(0, profile.totalTrips - profile.totalClaimsFiled)
  if (profile.incidentFreeTrips === expectedIncidentFree) {
    pass('Incident-Free Trips', profile.incidentFreeTrips, expectedIncidentFree,
      `✓ ${profile.incidentFreeTrips} trips without incidents`)
  } else {
    fail('Incident-Free Trips', profile.incidentFreeTrips, expectedIncidentFree,
      'Incident-free calculation incorrect')
  }
  
  // Test 1.5: Calculation version
  if (profile.calculationVersion === '2.1') {
    pass('Calculation Version', profile.calculationVersion, '2.1',
      '✓ Using latest ESG calculation version')
  } else {
    warn('Calculation Version', 
      `Using version ${profile.calculationVersion}, expected 2.1`)
  }
}

// ============================================================================
// TEST SUITE 2: SAFETY SCORE ACCURACY
// ============================================================================

function testSafetyScore(data) {
  section('TEST SUITE 2: SAFETY SCORE ACCURACY')
  
  const { profile } = data
  
  // Test 2.1: Safety score is within valid range
  if (profile.safetyScore >= 0 && profile.safetyScore <= 100) {
    pass('Safety Score Range', profile.safetyScore, '0-100',
      `Score: ${profile.safetyScore}/100`)
  } else {
    fail('Safety Score Range', profile.safetyScore, '0-100',
      'Score outside valid range')
  }
  
  // Test 2.2: Safety score reflects claim rate
  const claimRate = profile.totalTrips > 0 
    ? (profile.totalClaimsFiled / profile.totalTrips) * 100 
    : 0
  
  console.log(`   Claim Rate: ${claimRate.toFixed(1)}%`)
  
  if (profile.totalClaimsFiled > 0) {
    // With 1 claim out of 3 trips (33% claim rate), safety score should be reduced
    if (profile.safetyScore < 80) {
      pass('Safety Score Penalty', profile.safetyScore, '<80',
        `✓ Score appropriately reduced for ${claimRate.toFixed(1)}% claim rate`)
    } else {
      warn('Safety Score Penalty',
        `Score ${profile.safetyScore} seems high for ${claimRate.toFixed(1)}% claim rate`)
    }
  }
  
  // Test 2.3: Current incident streak
  const expectedStreak = profile.incidentFreeTrips
  if (profile.currentIncidentStreak <= expectedStreak) {
    pass('Incident Streak', profile.currentIncidentStreak, `≤${expectedStreak}`,
      `Current streak: ${profile.currentIncidentStreak} trips`)
  } else {
    fail('Incident Streak', profile.currentIncidentStreak, `≤${expectedStreak}`,
      'Streak cannot exceed incident-free trips')
  }
}

// ============================================================================
// TEST SUITE 3: ENVIRONMENTAL SCORE ACCURACY
// ============================================================================

function testEnvironmentalScore(data) {
  section('TEST SUITE 3: ENVIRONMENTAL SCORE ACCURACY')
  
  const { profile, cars } = data
  
  // Test 3.1: Emissions score range
  if (profile.emissionsScore >= 0 && profile.emissionsScore <= 100) {
    pass('Emissions Score Range', profile.emissionsScore, '0-100',
      `Score: ${profile.emissionsScore}/100`)
  } else {
    fail('Emissions Score Range', profile.emissionsScore, '0-100',
      'Score outside valid range')
  }
  
  // Test 3.2: EV trip percentage
  if (profile.evTripPercentage >= 0 && profile.evTripPercentage <= 100) {
    pass('EV Trip Percentage', profile.evTripPercentage, '0-100',
      `${profile.evTripPercentage}% of trips in EVs`)
  } else {
    fail('EV Trip Percentage', profile.evTripPercentage, '0-100',
      'Percentage outside valid range')
  }
  
  // Test 3.3: CO2 saved should be non-negative
  if (profile.estimatedCO2Saved >= 0) {
    pass('CO2 Savings', profile.estimatedCO2Saved, '≥0',
      `${profile.estimatedCO2Saved.toFixed(2)} kg CO2 saved`)
  } else {
    fail('CO2 Savings', profile.estimatedCO2Saved, '≥0',
      'CO2 savings cannot be negative')
  }
  
  // Test 3.4: Check if avgCO2PerMile exists (NEW FIELD)
  if (profile.avgCO2PerMile !== undefined) {
    if (profile.avgCO2PerMile >= 0 && profile.avgCO2PerMile <= 1.0) {
      pass('Average CO2 Per Mile', profile.avgCO2PerMile, '0-1.0',
        `${profile.avgCO2PerMile.toFixed(3)} kg CO2/mile`)
    } else {
      warn('Average CO2 Per Mile',
        `Value ${profile.avgCO2PerMile} seems outside typical range (0-1.0 kg/mile)`)
    }
  } else {
    fail('Average CO2 Per Mile', 'undefined', 'defined',
      'NEW FIELD MISSING - Check calculate-host-esg.ts line 434')
  }
  
  // Test 3.5: Fuel efficiency rating
  const validRatings = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'UNKNOWN']
  if (validRatings.includes(profile.fuelEfficiencyRating)) {
    pass('Fuel Efficiency Rating', profile.fuelEfficiencyRating, validRatings.join('|'),
      `Rating: ${profile.fuelEfficiencyRating}`)
  } else {
    fail('Fuel Efficiency Rating', profile.fuelEfficiencyRating, validRatings.join('|'),
      'Invalid rating value')
  }
}

// ============================================================================
// TEST SUITE 4: COMPLIANCE & MAINTENANCE
// ============================================================================

function testComplianceScore(data) {
  section('TEST SUITE 4: COMPLIANCE & MAINTENANCE')
  
  const { profile } = data
  
  // Test 4.1: Compliance score range
  if (profile.complianceScore >= 0 && profile.complianceScore <= 100) {
    pass('Compliance Score Range', profile.complianceScore, '0-100',
      `Score: ${profile.complianceScore}/100`)
  } else {
    fail('Compliance Score Range', profile.complianceScore, '0-100',
      'Score outside valid range')
  }
  
  // Test 4.2: Maintenance score range
  if (profile.maintenanceScore >= 0 && profile.maintenanceScore <= 100) {
    pass('Maintenance Score Range', profile.maintenanceScore, '0-100',
      `Score: ${profile.maintenanceScore}/100`)
  } else {
    fail('Maintenance Score Range', profile.maintenanceScore, '0-100',
      'Score outside valid range')
  }
  
  // Test 4.3: Claim response rate (should be fnolCompletionRate internally)
  if (profile.claimResponseRate >= 0 && profile.claimResponseRate <= 1) {
    pass('Claim Response Rate', `${(profile.claimResponseRate * 100).toFixed(0)}%`, '0-100%',
      `${(profile.claimResponseRate * 100).toFixed(0)}% response rate`)
  } else {
    fail('Claim Response Rate', profile.claimResponseRate, '0-1',
      'Rate outside valid range')
  }
  
  // Test 4.4: Response time should be reasonable
  if (profile.avgResponseTimeHours >= 0 && profile.avgResponseTimeHours < 720) {
    pass('Average Response Time', `${profile.avgResponseTimeHours.toFixed(1)}h`, '0-720h',
      `${profile.avgResponseTimeHours.toFixed(1)} hours average`)
  } else {
    warn('Average Response Time',
      `${profile.avgResponseTimeHours} hours seems unusually high`)
  }
  
  // Test 4.5: Maintenance status
  console.log(`   Maintenance On Time: ${profile.maintenanceOnTime ? 'Yes ✓' : 'No ✗'}`)
  if (profile.maintenanceOnTime) {
    pass('Maintenance Status', 'On Time', 'On Time',
      '✓ All maintenance is current')
  } else {
    warn('Maintenance Status',
      `Maintenance is overdue - affects compliance score`)
  }
}

// ============================================================================
// TEST SUITE 5: MILEAGE INTEGRITY
// ============================================================================

function testMileageIntegrity(data) {
  section('TEST SUITE 5: MILEAGE INTEGRITY')
  
  const { profile } = data
  
  // Test 5.1: Unauthorized mileage should be tracked
  console.log(`   Unauthorized Mileage: ${profile.unauthorizedMileage} miles`)
  
  if (profile.unauthorizedMileage > 0) {
    warn('Unauthorized Mileage Detected',
      `${profile.unauthorizedMileage} unauthorized miles detected - affects integrity score`)
  } else {
    pass('Unauthorized Mileage', profile.unauthorizedMileage, '0',
      '✓ No unauthorized mileage detected')
  }
  
  // Test 5.2: Total miles driven
  if (profile.totalMilesDriven >= 0) {
    pass('Total Miles Driven', profile.totalMilesDriven, '≥0',
      `${profile.totalMilesDriven.toLocaleString()} total miles`)
  } else {
    fail('Total Miles Driven', profile.totalMilesDriven, '≥0',
      'Miles cannot be negative')
  }
  
  // Test 5.3: Average miles per trip
  if (profile.totalTrips > 0) {
    const expectedAvg = profile.totalMilesDriven / profile.totalTrips
    const tolerance = 1 // 1 mile tolerance
    
    if (Math.abs(profile.avgMilesPerTrip - expectedAvg) <= tolerance) {
      pass('Average Miles Per Trip', profile.avgMilesPerTrip, expectedAvg.toFixed(0),
        `${profile.avgMilesPerTrip} miles per trip`)
    } else {
      fail('Average Miles Per Trip', profile.avgMilesPerTrip, expectedAvg.toFixed(0),
        'Average calculation mismatch')
    }
  }
}

// ============================================================================
// TEST SUITE 6: COMPOSITE SCORE
// ============================================================================

function testCompositeScore(data) {
  section('TEST SUITE 6: COMPOSITE SCORE CALCULATION')
  
  const { profile } = data
  
  // Test 6.1: Composite score range
  if (profile.compositeScore >= 0 && profile.compositeScore <= 100) {
    pass('Composite Score Range', profile.compositeScore, '0-100',
      `Overall Score: ${profile.compositeScore}/100`)
  } else {
    fail('Composite Score Range', profile.compositeScore, '0-100',
      'Score outside valid range')
  }
  
  // Test 6.2: Verify weighted average calculation
  // Formula: safety(35%) + emissions(25%) + maintenance(25%) + compliance(15%)
  const calculatedComposite = Math.round(
    (profile.safetyScore * 0.35) +
    (profile.emissionsScore * 0.25) +
    (profile.maintenanceScore * 0.25) +
    (profile.complianceScore * 0.15)
  )
  
  const tolerance = 2 // Allow 2 points tolerance for rounding
  if (Math.abs(profile.compositeScore - calculatedComposite) <= tolerance) {
    pass('Composite Score Calculation', profile.compositeScore, calculatedComposite,
      '✓ Weighted average correctly calculated')
  } else {
    fail('Composite Score Calculation', profile.compositeScore, calculatedComposite,
      `Formula: (${profile.safetyScore}*0.35) + (${profile.emissionsScore}*0.25) + (${profile.maintenanceScore}*0.25) + (${profile.complianceScore}*0.15)`)
  }
  
  // Test 6.3: Driving impact score
  if (profile.drivingImpactScore >= 0 && profile.drivingImpactScore <= 100) {
    pass('Driving Impact Score', profile.drivingImpactScore, '0-100',
      `Score: ${profile.drivingImpactScore}/100`)
  } else {
    fail('Driving Impact Score', profile.drivingImpactScore, '0-100',
      'Score outside valid range')
  }
}

// ============================================================================
// TEST SUITE 7: DATA CONFIDENCE
// ============================================================================

function testDataConfidence(data) {
  section('TEST SUITE 7: DATA CONFIDENCE')
  
  const { profile } = data
  
  // Test 7.1: Data confidence level
  const validLevels = ['HIGH', 'MEDIUM', 'LOW']
  if (validLevels.includes(profile.dataConfidence)) {
    pass('Data Confidence Level', profile.dataConfidence, validLevels.join('|'),
      `Confidence: ${profile.dataConfidence}`)
  } else {
    fail('Data Confidence Level', profile.dataConfidence, validLevels.join('|'),
      'Invalid confidence level')
  }
  
  // Test 7.2: Confidence should match trip count
  if (profile.totalTrips >= 20 && profile.dataConfidence !== 'HIGH') {
    warn('Data Confidence',
      `With ${profile.totalTrips} trips, confidence should potentially be HIGH`)
  } else if (profile.totalTrips < 5 && profile.dataConfidence === 'HIGH') {
    warn('Data Confidence',
      `With only ${profile.totalTrips} trips, HIGH confidence may be premature`)
  }
  
  // Test 7.3: Last calculated timestamp
  const lastCalc = new Date(profile.lastCalculatedAt)
  const now = new Date()
  const ageMinutes = (now - lastCalc) / (1000 * 60)
  
  console.log(`   Last Calculated: ${lastCalc.toLocaleString()}`)
  console.log(`   Age: ${ageMinutes.toFixed(1)} minutes`)
  
  if (ageMinutes < 60) {
    pass('Calculation Freshness', `${ageMinutes.toFixed(1)}min`, '<60min',
      '✓ Recently calculated')
  } else {
    warn('Calculation Freshness',
      `Data is ${ageMinutes.toFixed(0)} minutes old - may need refresh`)
  }
}

// ============================================================================
// FINAL REPORT
// ============================================================================

function printFinalReport() {
  section('FINAL TEST REPORT')
  
  const total = testResults.passed.length + testResults.failed.length
  const passRate = (testResults.passed.length / total * 100).toFixed(1)
  
  console.log(`\n📊 SUMMARY:`)
  console.log(`   Total Tests: ${total}`)
  console.log(`   ✅ Passed: ${testResults.passed.length}`)
  console.log(`   ❌ Failed: ${testResults.failed.length}`)
  console.log(`   ⚠️  Warnings: ${testResults.warnings.length}`)
  console.log(`   Pass Rate: ${passRate}%`)
  
  if (testResults.failed.length > 0) {
    console.log(`\n❌ FAILED TESTS:`)
    testResults.failed.forEach((result, i) => {
      console.log(`\n   ${i + 1}. ${result.test}`)
      console.log(`      Expected: ${result.expected}`)
      console.log(`      Actual: ${result.actual}`)
      if (result.message) console.log(`      Note: ${result.message}`)
    })
  }
  
  if (testResults.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS:`)
    testResults.warnings.forEach((result, i) => {
      console.log(`\n   ${i + 1}. ${result.test}`)
      console.log(`      ${result.message}`)
    })
  }
  
  console.log(`\n${'='.repeat(80)}`)
  
  if (testResults.failed.length === 0) {
    console.log(`✅ ALL TESTS PASSED! ESG calculation system is working correctly.`)
  } else {
    console.log(`❌ SOME TESTS FAILED. Review the failed tests above.`)
  }
  
  console.log('='.repeat(80) + '\n')
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function runTests() {
  console.log('\n' + '='.repeat(80))
  console.log('  ESG ACCURACY TEST SUITE')
  console.log('  Host: Parker Mills (cmfj0oxqm004udomy7qivgt18)')
  console.log('='.repeat(80))
  
  try {
    // Fetch all data
    const data = await fetchHostData()
    
    // Run all test suites
    testBasicDataIntegrity(data)
    testSafetyScore(data)
    testEnvironmentalScore(data)
    testComplianceScore(data)
    testMileageIntegrity(data)
    testCompositeScore(data)
    testDataConfidence(data)
    
    // Print final report
    printFinalReport()
    
    // Exit with appropriate code
    process.exit(testResults.failed.length === 0 ? 0 : 1)
    
  } catch (error) {
    console.error('\n❌ TEST EXECUTION ERROR:')
    console.error(error)
    process.exit(1)
  }
}

// Run tests
runTests()