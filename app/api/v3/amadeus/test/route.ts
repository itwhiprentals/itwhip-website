// app/api/v3/amadeus/test/route.ts

import { NextResponse } from 'next/server'
import { getAmadeusToken, testAmadeusConnection, amadeusRequest } from '@/app/lib/amadeus-auth'

/**
 * GET /api/v3/amadeus/test
 * Test Amadeus API connection and credentials
 */
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  }
  
  // Test 1: Check environment variables
  results.tests.environment = {
    hasApiKey: !!process.env.AMADEUS_API_KEY,
    hasApiSecret: !!process.env.AMADEUS_API_SECRET,
    baseUrl: process.env.AMADEUS_BASE_URL || 'NOT SET',
    environment: process.env.AMADEUS_ENV || 'NOT SET'
  }
  
  // Test 2: Test connection
  try {
    const isConnected = await testAmadeusConnection()
    results.tests.connection = {
      success: isConnected,
      message: isConnected ? 'Successfully connected' : 'Connection failed'
    }
  } catch (error: any) {
    results.tests.connection = {
      success: false,
      error: error.message
    }
  }
  
  // Test 3: Get token
  try {
    const token = await getAmadeusToken()
    results.tests.token = {
      success: true,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 10) + '...'
    }
  } catch (error: any) {
    results.tests.token = {
      success: false,
      error: error.message
    }
  }
  
  // Test 4: Make a simple API call
  try {
    // Try to get location data for Phoenix
    const data = await amadeusRequest('/v1/reference-data/locations?subType=CITY&keyword=PHOENIX&page[limit]=1')
    results.tests.apiCall = {
      success: true,
      message: 'API call successful',
      dataReceived: !!data?.data
    }
  } catch (error: any) {
    results.tests.apiCall = {
      success: false,
      error: error.message,
      details: error.toString()
    }
  }
  
  // Test 5: Try specific hotel search
  try {
    const hotelData = await amadeusRequest('/v1/reference-data/locations/hotels/by-hotels?hotelIds=PHXMAR')
    results.tests.hotelSearch = {
      success: true,
      found: hotelData?.data?.length > 0,
      hotelName: hotelData?.data?.[0]?.name || 'Not found'
    }
  } catch (error: any) {
    results.tests.hotelSearch = {
      success: false,
      error: error.message
    }
  }
  
  // Overall status
  const allTestsPassed = Object.values(results.tests).every((test: any) => test.success !== false)
  results.overall = {
    status: allTestsPassed ? 'WORKING' : 'ISSUES DETECTED',
    recommendation: allTestsPassed 
      ? 'Amadeus API is fully functional' 
      : 'Check the failed tests above'
  }
  
  return NextResponse.json(results, {
    status: allTestsPassed ? 200 : 500,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}