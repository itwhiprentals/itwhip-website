// scripts/test-esg-accuracy.js
/**
 * ESG Accuracy Test Script
 * Tests all ESG calculations for Parker Mills
 */

const fs = require('fs');
const path = require('path');

// Try to get host ID and token from cookie file
function getHostCredentials() {
  try {
    // Try to read from .next/cache or session
    const HOST_ID = 'cmfj0oxqm004udomy7qivgt18';
    
    // Check if token is passed as argument
    if (process.argv[2]) {
      return { HOST_ID, HOST_TOKEN: process.argv[2] };
    }
    
    throw new Error('Please provide token as argument');
  } catch (err) {
    console.error('\n❌ Could not get credentials');
    console.error('Usage: node scripts/test-esg-accuracy.js <TOKEN>');
    console.error('\nGet token by running: node get-host-token.js');
    process.exit(1);
  }
}

const { HOST_ID, HOST_TOKEN } = getHostCredentials();
const BASE_URL = 'http://localhost:3000';

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
    if (response.status === 401) {
      throw new Error(`Authentication failed. Token may be expired. Run: node get-host-token.js`)
    }
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

// [REST OF THE FUNCTIONS FROM PREVIOUS SCRIPT - SAME AS BEFORE]
// Copy all the test functions here...

function testBasicDataIntegrity(data) {
  section('TEST SUITE 1: BASIC DATA INTEGRITY')
  
  const { profile, cars, bookings, claims } = data
  
  if (profile) {
    pass('Profile Exists', 'Found', 'Found', 'ESG profile successfully calculated')
  } else {
    fail('Profile Exists', 'Missing', 'Found', 'ESG profile was not calculated')
    return
  }
  
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length
  if (profile.totalTrips === completedBookings) {
    pass('Total Trips Count', profile.totalTrips, completedBookings, 
      `✓ ${profile.totalTrips} completed trips recorded`)
  } else {
    fail('Total Trips Count', profile.totalTrips, completedBookings, 
      'Trip count mismatch between profile and bookings')
  }
  
  if (profile.totalClaimsFiled === claims.length) {
    pass('Total Claims Filed', profile.totalClaimsFiled, claims.length,
      `✓ ${claims.length} claims recorded`)
  } else {
    fail('Total Claims Filed', profile.totalClaimsFiled, claims.length,
      'Claims count mismatch')
  }
  
  const expectedIncidentFree = Math.max(0, profile.totalTrips - profile.totalClaimsFiled)
  if (profile.incidentFreeTrips === expectedIncidentFree) {
    pass('Incident-Free Trips', profile.incidentFreeTrips, expectedIncidentFree,
      `✓ ${profile.incidentFreeTrips} trips without incidents`)
  } else {
    fail('Incident-Free Trips', profile.incidentFreeTrips, expectedIncidentFree,
      'Incident-free calculation incorrect')
  }
  
  if (profile.calculationVersion === '2.1') {
    pass('Calculation Version', profile.calculationVersion, '2.1',
      '✓ Using latest ESG calculation version')
  } else {
    warn('Calculation Version', 
      `Using version ${profile.calculationVersion}, expected 2.1`)
  }
}

function testSafetyScore(data) {
  section('TEST SUITE 2: SAFETY SCORE')
  const { profile } = data
  
  if (profile.safetyScore >= 0 && profile.safetyScore <= 100) {
    pass('Safety Score Range', profile.safetyScore, '0-100', `Score: ${profile.safetyScore}/100`)
  } else {
    fail('Safety Score Range', profile.safetyScore, '0-100', 'Score outside valid range')
  }
  
  const claimRate = profile.totalTrips > 0 ? (profile.totalClaimsFiled / profile.totalTrips) * 100 : 0
  console.log(`   Claim Rate: ${claimRate.toFixed(1)}%`)
  
  if (profile.totalClaimsFiled > 0 && profile.safetyScore < 80) {
    pass('Safety Score Penalty', profile.safetyScore, '<80',
      `✓ Score reduced for ${claimRate.toFixed(1)}% claim rate`)
  }
}

function testEnvironmentalScore(data) {
  section('TEST SUITE 3: ENVIRONMENTAL SCORE')
  const { profile } = data
  
  if (profile.emissionsScore >= 0 && profile.emissionsScore <= 100) {
    pass('Emissions Score Range', profile.emissionsScore, '0-100', `Score: ${profile.emissionsScore}/100`)
  } else {
    fail('Emissions Score Range', profile.emissionsScore, '0-100', 'Outside valid range')
  }
  
  if (profile.avgCO2PerMile !== undefined) {
    if (profile.avgCO2PerMile >= 0 && profile.avgCO2PerMile <= 1.0) {
      pass('Average CO2 Per Mile', profile.avgCO2PerMile, '0-1.0',
        `${profile.avgCO2PerMile.toFixed(3)} kg CO2/mile`)
    } else {
      warn('Average CO2 Per Mile', `Value ${profile.avgCO2PerMile} outside typical range`)
    }
  } else {
    fail('Average CO2 Per Mile', 'undefined', 'defined', 'NEW FIELD MISSING')
  }
}

function testCompositeScore(data) {
  section('TEST SUITE 4: COMPOSITE SCORE')
  const { profile } = data
  
  if (profile.compositeScore >= 0 && profile.compositeScore <= 100) {
    pass('Composite Score Range', profile.compositeScore, '0-100', `Score: ${profile.compositeScore}/100`)
  } else {
    fail('Composite Score Range', profile.compositeScore, '0-100', 'Outside valid range')
  }
  
  const calculatedComposite = Math.round(
    (profile.safetyScore * 0.35) +
    (profile.emissionsScore * 0.25) +
    (profile.maintenanceScore * 0.25) +
    (profile.complianceScore * 0.15)
  )
  
  if (Math.abs(profile.compositeScore - calculatedComposite) <= 2) {
    pass('Composite Calculation', profile.compositeScore, calculatedComposite, '✓ Weighted average correct')
  } else {
    fail('Composite Calculation', profile.compositeScore, calculatedComposite,
      `Formula mismatch: (${profile.safetyScore}*0.35)+(${profile.emissionsScore}*0.25)+(${profile.maintenanceScore}*0.25)+(${profile.complianceScore}*0.15)`)
  }
}

function printFinalReport() {
  section('FINAL REPORT')
  
  const total = testResults.passed.length + testResults.failed.length
  const passRate = total > 0 ? (testResults.passed.length / total * 100).toFixed(1) : 0
  
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
      if (result.message) console.log(`      ${result.message}`)
    })
  }
  
  console.log('\n' + '='.repeat(80))
  if (testResults.failed.length === 0) {
    console.log('✅ ALL TESTS PASSED!')
  } else {
    console.log('❌ SOME TESTS FAILED')
  }
  console.log('='.repeat(80) + '\n')
}

async function runTests() {
  console.log('\n' + '='.repeat(80))
  console.log('  ESG ACCURACY TEST SUITE')
  console.log('  Host: Parker Mills')
  console.log('='.repeat(80))
  
  try {
    const data = await fetchHostData()
    testBasicDataIntegrity(data)
    testSafetyScore(data)
    testEnvironmentalScore(data)
    testCompositeScore(data)
    printFinalReport()
    process.exit(testResults.failed.length === 0 ? 0 : 1)
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    process.exit(1)
  }
}

runTests()
