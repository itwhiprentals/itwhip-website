// app/api/fleet/hosts/[id]/insurance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET - Fetch host's insurance information
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hostId } = await params  // ✅ Fixed: Await params

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        insuranceProvider: {
          include: {
            _count: {
              select: { InsurancePolicy: true }
            }
          }
        },
        cars: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            dailyRate: true,  // Use dailyRate instead of estimatedValue
            isActive: true
          }
        }
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Calculate which vehicles are covered and add estimatedValue
    const vehiclesWithCoverage = host.cars.map((car: any) => {
      const hasCoverage = host.insuranceProviderId ? true : false
      const estimatedValue = (car.dailyRate || 0) * 365 * 0.15  // Calculate from dailyRate
      
      return {
        ...car,
        estimatedValue,  // Add calculated value
        hasCoverage,
        coverageSource: hasCoverage ? 'HOST_ASSIGNMENT' : 'NONE'
      }
    })

    return NextResponse.json({
      host: {
        id: host.id,
        name: host.name,
        email: host.email,
        insuranceProvider: host.insuranceProvider,
        insurancePolicyNumber: host.insurancePolicyNumber,
        insuranceActive: host.insuranceActive,
        insuranceAssignedAt: host.insuranceAssignedAt,
        insuranceAssignedBy: host.insuranceAssignedBy
      },
      vehicles: vehiclesWithCoverage,
      summary: {
        totalVehicles: host.cars.length,
        coveredVehicles: vehiclesWithCoverage.filter(v => v.hasCoverage).length,
        gapVehicles: vehiclesWithCoverage.filter(v => !v.hasCoverage).length
      }
    })

  } catch (error) {
    console.error('Failed to fetch host insurance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance information' },
      { status: 500 }
    )
  }
}

// POST - Assign insurance provider to host
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hostId } = await params  // ✅ Fixed: Await params
    const body = await req.json()
    const { providerId, policyNumber, assignedBy } = body

    // Validate required fields
    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    if (!assignedBy) {
      return NextResponse.json(
        { error: 'assignedBy (admin email) is required' },
        { status: 400 }
      )
    }

    // Check if host exists
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        cars: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        }
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Check if provider exists and is active
    const provider = await prisma.insuranceProvider.findUnique({
      where: { id: providerId }
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Insurance provider not found' },
        { status: 404 }
      )
    }

    if (!provider.isActive) {
      return NextResponse.json(
        { error: 'Cannot assign inactive insurance provider' },
        { status: 400 }
      )
    }

    // Update host with insurance assignment
    const existingHistory = (host.insuranceHistory as any) || {}
    const updatedHost = await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        insuranceProviderId: providerId,
        insurancePolicyNumber: policyNumber || null,
        insuranceActive: true,
        insuranceAssignedAt: new Date(),
        insuranceAssignedBy: assignedBy,
        // Add to insurance history
        insuranceHistory: {
          ...existingHistory,
          assignments: [
            ...(existingHistory.assignments || []),
            {
              providerId,
              providerName: provider.name,
              policyNumber,
              assignedBy,
              assignedAt: new Date().toISOString(),
              action: 'ASSIGNED'
            }
          ]
        }
      },
      include: {
        insuranceProvider: true
      }
    })

    // Log the assignment
    console.log(`Insurance assigned: ${provider.name} → Host ${host.name} by ${assignedBy}`)

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${provider.name} to ${host.name}`,
      host: {
        id: updatedHost.id,
        name: updatedHost.name,
        insuranceProvider: updatedHost.insuranceProvider,
        insurancePolicyNumber: updatedHost.insurancePolicyNumber,
        insuranceActive: updatedHost.insuranceActive,
        insuranceAssignedAt: updatedHost.insuranceAssignedAt
      },
      coveredVehicles: host.cars.length
    })

  } catch (error) {
    console.error('Failed to assign insurance:', error)
    return NextResponse.json(
      { error: 'Failed to assign insurance provider' },
      { status: 500 }
    )
  }
}

// DELETE - Remove insurance assignment from host
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hostId } = await params  // ✅ Fixed: Await params
    const { searchParams } = new URL(req.url)
    const removedBy = searchParams.get('removedBy')

    if (!removedBy) {
      return NextResponse.json(
        { error: 'removedBy (admin email) is required' },
        { status: 400 }
      )
    }

    // Check if host exists
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        insuranceProvider: true,
        cars: {
          select: { id: true, make: true, model: true, year: true }
        }
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    if (!host.insuranceProviderId) {
      return NextResponse.json(
        { error: 'Host has no insurance assignment to remove' },
        { status: 400 }
      )
    }

    // Check for active policies before removing
    const activePolicies = await prisma.insurancePolicy.count({
      where: {
        booking: {
          hostId: hostId
        },
        status: 'ACTIVE' as any
      }
    })

    if (activePolicies > 0) {
      return NextResponse.json(
        { 
          error: `Cannot remove insurance. Host has ${activePolicies} active policies.`,
          activePolicies 
        },
        { status: 400 }
      )
    }

    // Store removed provider info for history
    const removedProvider = host.insuranceProvider

    // Remove insurance assignment
    const existingHistory = (host.insuranceHistory as any) || {}
    const updatedHost = await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        insuranceProviderId: null,
        insurancePolicyNumber: null,
        insuranceActive: false,
        insuranceAssignedAt: null,
        insuranceAssignedBy: null,
        // Add to insurance history
        insuranceHistory: {
          ...existingHistory,
          assignments: [
            ...(existingHistory.assignments || []),
            {
              providerId: removedProvider?.id,
              providerName: removedProvider?.name,
              policyNumber: host.insurancePolicyNumber,
              removedBy,
              removedAt: new Date().toISOString(),
              action: 'REMOVED'
            }
          ]
        }
      }
    })

    console.log(`Insurance removed: ${removedProvider?.name} from Host ${host.name} by ${removedBy}`)

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${removedProvider?.name} from ${host.name}`,
      affectedVehicles: host.cars.length,
      warning: `${host.cars.length} vehicle(s) now have no insurance coverage`
    })

  } catch (error) {
    console.error('Failed to remove insurance:', error)
    return NextResponse.json(
      { error: 'Failed to remove insurance assignment' },
      { status: 500 }
    )
  }
}

// PATCH - Update insurance details (policy number, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hostId } = await params  // ✅ Fixed: Await params
    const body = await req.json()
    const { policyNumber, updatedBy } = body

    if (!updatedBy) {
      return NextResponse.json(
        { error: 'updatedBy (admin email) is required' },
        { status: 400 }
      )
    }

    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    if (!host.insuranceProviderId) {
      return NextResponse.json(
        { error: 'Host has no insurance assignment' },
        { status: 400 }
      )
    }

    const existingHistory = (host.insuranceHistory as any) || {}
    const updatedHost = await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        insurancePolicyNumber: policyNumber || host.insurancePolicyNumber,
        // Add to insurance history
        insuranceHistory: {
          ...existingHistory,
          updates: [
            ...(existingHistory.updates || []),
            {
              field: 'policyNumber',
              oldValue: host.insurancePolicyNumber,
              newValue: policyNumber,
              updatedBy,
              updatedAt: new Date().toISOString()
            }
          ]
        }
      },
      include: {
        insuranceProvider: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Insurance details updated',
      host: {
        id: updatedHost.id,
        name: updatedHost.name,
        insuranceProvider: updatedHost.insuranceProvider,
        insurancePolicyNumber: updatedHost.insurancePolicyNumber
      }
    })

  } catch (error) {
    console.error('Failed to update insurance:', error)
    return NextResponse.json(
      { error: 'Failed to update insurance details' },
      { status: 500 }
    )
  }
}