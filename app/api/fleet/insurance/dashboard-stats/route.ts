// app/api/fleet/insurance/dashboard-stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

/**
 * GET /api/fleet/insurance/dashboard-stats?key=phoenix-fleet-2847
 * 
 * Returns comprehensive insurance dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    // Verify authentication key
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized: Invalid authentication key' 
        },
        { status: 401 }
      )
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 FETCHING INSURANCE DASHBOARD STATS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // STEP 1: Check if Claim table exists and has data
    let claimCount = 0
    try {
      claimCount = await prisma.claim.count()
      console.log('✅ Claim table exists')
      console.log('📊 Total claims in database:', claimCount)
    } catch (error) {
      console.error('❌ Error accessing Claim table:', error)
      throw new Error('Claim table not accessible')
    }

    // STEP 2: Fetch all claims with full details for debugging
    const allClaims = await prisma.claim.findMany({
      select: {
        id: true,
        status: true,
        type: true,
        approvedAmount: true,
        estimatedCost: true,
        submittedToInsurerAt: true,
        insurerStatus: true,
        insurerClaimId: true,
        primaryParty: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('\n📋 RAW CLAIMS DATA FROM DATABASE:')
    console.log('Total claims fetched:', allClaims.length)
    
    if (allClaims.length > 0) {
      console.log('\n🔍 DETAILED CLAIM BREAKDOWN:')
      allClaims.forEach((claim, index) => {
        console.log(`\nClaim ${index + 1}:`)
        console.log(`  ID: ${claim.id.slice(0, 8)}...`)
        console.log(`  Status: ${claim.status}`)
        console.log(`  Type: ${claim.type}`)
        console.log(`  Estimated Cost: $${claim.estimatedCost}`)
        console.log(`  Approved Amount: $${claim.approvedAmount || 0}`)
        console.log(`  Submitted to Insurer: ${claim.submittedToInsurerAt ? 'Yes' : 'No'}`)
        console.log(`  Created: ${claim.createdAt}`)
      })
    } else {
      console.log('⚠️  NO CLAIMS FOUND IN DATABASE')
      console.log('This is expected if you haven\'t created any claims yet')
    }

    // STEP 3: Calculate statistics
    const totalClaims = allClaims.length
    
    // Count by status - check all possible status values
    const statusCounts: Record<string, number> = {}
    allClaims.forEach(claim => {
      statusCounts[claim.status] = (statusCounts[claim.status] || 0) + 1
    })

    console.log('\n📊 STATUS COUNTS BY VALUE:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })

    const pendingClaims = allClaims.filter(c => c.status === 'PENDING').length
    const approvedClaims = allClaims.filter(c => c.status === 'APPROVED').length
    const rejectedClaims = allClaims.filter(c => c.status === 'DENIED').length

    console.log('\n✅ CALCULATED METRICS:')
    console.log(`  Total Claims: ${totalClaims}`)
    console.log(`  Pending: ${pendingClaims}`)
    console.log(`  Approved: ${approvedClaims}`)
    console.log(`  Rejected: ${rejectedClaims}`)

    // Calculate total payout from approved claims
    const totalPayoutAmount = allClaims
      .filter(c => c.status === 'APPROVED' && c.approvedAmount)
      .reduce((sum, c) => sum + (c.approvedAmount || 0), 0)

    console.log(`  Total Payout: $${totalPayoutAmount.toLocaleString()}`)

    // Calculate FNOL statistics
    const totalFnolSubmissions = allClaims.filter(c => c.submittedToInsurerAt).length
    const claimsPendingSubmission = allClaims.filter(
      c => c.status === 'APPROVED' && !c.submittedToInsurerAt
    ).length

    console.log(`  FNOL Submissions: ${totalFnolSubmissions}`)
    console.log(`  Pending Submission: ${claimsPendingSubmission}`)

    // Calculate success rate for FNOL submissions
    const successfulSubmissions = allClaims.filter(
      c => c.submittedToInsurerAt && (c.insurerStatus === 'SUBMITTED' || c.insurerStatus === 'SUCCESS')
    ).length
    const averageSuccessRate = totalFnolSubmissions > 0
      ? Math.round((successfulSubmissions / totalFnolSubmissions) * 100)
      : 0

    console.log(`  Success Rate: ${averageSuccessRate}%`)

    // STEP 4: Create provider with real data
    const mockProvider = {
      id: 'platform-insurance-default',
      name: 'ItWhip Platform Insurance',
      type: 'EMBEDDED',
      isActive: true,
      isPrimary: true,
      revenueShare: 0.4,
      claimsCount: totalClaims,
      activeClaimsCount: pendingClaims + approvedClaims,
      pendingClaimsCount: pendingClaims,
      approvedClaimsCount: approvedClaims,
      rejectedClaimsCount: rejectedClaims,
      totalPayoutAmount: totalPayoutAmount,
      fnolSubmissionsCount: totalFnolSubmissions,
      successRate: averageSuccessRate
    }

    // STEP 5: Compile dashboard statistics
    const dashboardStats = {
      // Provider metrics
      totalProviders: 1,
      activeProviders: 1,

      // Claim metrics (from REAL data)
      totalClaims,
      activeClaims: pendingClaims + approvedClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,

      // Financial metrics
      totalPayoutAmount,

      // FNOL metrics
      totalFnolSubmissions,
      claimsPendingSubmission,
      averageSuccessRate,

      // Provider details
      providers: [mockProvider]
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ DASHBOARD STATS COMPILED SUCCESSFULLY')
    console.log('📊 Final Stats Object:', JSON.stringify(dashboardStats, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return NextResponse.json(
      {
        success: true,
        stats: dashboardStats,
        debug: {
          claimCount: totalClaims,
          statusBreakdown: statusCounts,
          rawClaimIds: allClaims.map(c => c.id.slice(0, 8))
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ ERROR FETCHING DASHBOARD STATS')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('Error:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}