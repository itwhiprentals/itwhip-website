// scripts/backfill-claim-audit.ts
import { prisma } from '@/app/lib/database/prisma'
import { Prisma } from '@prisma/client'
import crypto from 'crypto'

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function buildAuditHash(payload: Record<string, any>, previousHash?: string | null) {
  const base = {
    category: payload.category,
    eventType: payload.eventType,
    severity: payload.severity,
    userId: payload.userId ?? null,
    action: payload.action,
    resource: payload.resource,
    resourceId: payload.resourceId ?? null,
    amount: payload.amount ?? null,
    currency: payload.currency ?? 'USD',
    metadata: payload.metadata ?? {},
    previousHash: previousHash ?? null,
  }
  return sha256(JSON.stringify(base))
}

async function nextPrevHash(resource: string, resourceId?: string | null) {
  const last = await prisma.auditLog.findFirst({
    where: { resource, resourceId: resourceId ?? undefined },
    orderBy: { timestamp: 'desc' },
    select: { hash: true },
  })
  return last?.hash ?? null
}

async function backfillClaimAudit() {
  const claimId = 'cmh6ohqop0005doilht4bag3z'
  const carId = 'cmfn3fdhf0001l8040ao0a3h8'
  const bookingId = 'cmgj3gidz00addoig9iy7imxi'

  try {
    console.log('🔧 BACKFILL STARTING...\n')

    // 1) Load claim with host + car
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        booking: {
          include: {
            host: true,
            car: { select: { id: true, year: true, make: true, model: true, rules: true } },
          },
        },
      },
    })
    if (!claim) { 
      console.log('❌ Claim not found')
      return 
    }

    console.log('✅ Claim found:', claim.type, '-', claim.estimatedCost)
    console.log('   Host ID:', claim.hostId || 'NONE')
    console.log()

    // ✅ FIX: Set userId to null (no foreign key constraint)
    const validUserId = null
    console.log('⚠️  Using null for userId (no FK constraint)')
    console.log()

    // 2) Add suspension message to vehicle rules
    console.log('📝 Step 1: Adding suspension message...')
    const car = claim.booking?.car
    if (car) {
      const rulesObj = car.rules ? JSON.parse(car.rules as string) : {}
      rulesObj.suspensionMessage = `Insurance claim filed: ${claim.type} - Vehicle offline pending review`
      rulesObj.deactivationReason = rulesObj.deactivationReason ?? `Claim filed: ${claim.type}`
      rulesObj.claimId = rulesObj.claimId ?? claim.id

      await prisma.rentalCar.update({
        where: { id: carId },
        data: { rules: JSON.stringify(rulesObj) },
      })
      console.log('✅ Suspension message added')
      console.log('   Message:', rulesObj.suspensionMessage, '\n')
    } else {
      console.log('⚠️  No car linked, skipping suspension message\n')
    }

    // 3) Create AuditLog entries with hash chain
    console.log('📝 Step 2: Creating AuditLog entries...')

    const existingAudit = await prisma.auditLog.findFirst({
      where: { resource: 'CLAIM', resourceId: claimId, eventType: 'CLAIM_FILED' },
    })

    if (!existingAudit) {
      // 3a) CLAIM_FILED - ✅ FIXED: Use CRITICAL instead of HIGH
      const prevHashClaim = await nextPrevHash('CLAIM', claimId)
      const claimAuditPayload = {
        category: 'COMPLIANCE',
        eventType: 'CLAIM_FILED',
        severity: 'CRITICAL', // ✅ FIXED: Was 'HIGH', now 'CRITICAL'
        userId: validUserId,
        ipAddress: 'backfill-script',
        userAgent: 'system-backfill',
        action: 'CREATE_INSURANCE_CLAIM',
        resource: 'CLAIM',
        resourceId: claimId,
        amount: claim.estimatedCost != null ? new Prisma.Decimal(claim.estimatedCost) : null,
        currency: 'USD',
        metadata: {
          claimType: claim.type,
          bookingId: claim.bookingId,
          hostId: claim.hostId,
          backfilled: true,
        } as any,
      }
      const hashClaim = buildAuditHash(claimAuditPayload, prevHashClaim)

      await prisma.auditLog.create({
        data: { ...claimAuditPayload, previousHash: prevHashClaim, hash: hashClaim },
      })
      console.log('✅ CLAIM_FILED audit log created')

      // 3b) VEHICLE_DEACTIVATED_CLAIM - ✅ FIXED: Use ERROR instead of HIGH
      const prevHashCar = await nextPrevHash('RENTAL_CAR', carId)
      const carAuditPayload = {
        category: 'COMPLIANCE',
        eventType: 'VEHICLE_DEACTIVATED_CLAIM',
        severity: 'ERROR', // ✅ FIXED: Was 'HIGH', now 'ERROR'
        userId: validUserId,
        ipAddress: 'backfill-script',
        userAgent: 'system-backfill',
        action: 'DEACTIVATE_VEHICLE',
        resource: 'RENTAL_CAR',
        resourceId: carId,
        metadata: {
          claimId: claimId,
          claimType: claim.type,
          bookingId: claim.bookingId,
          reason: `Claim filed: ${claim.type}`,
          backfilled: true,
        } as any,
      }
      const hashCar = buildAuditHash(carAuditPayload, prevHashCar)

      await prisma.auditLog.create({
        data: { ...carAuditPayload, previousHash: prevHashCar, hash: hashCar },
      })
      console.log('✅ VEHICLE_DEACTIVATED_CLAIM audit log created\n')
    } else {
      console.log('⚠️  Audit logs already exist, skipping\n')
    }

    // 4) Create ESG event (skip if no valid user)
    console.log('📝 Step 3: Creating ESG event...')

    const existingESG = await prisma.eSGEvent.findFirst({
      where: { relatedClaimId: claimId },
    })

    if (!existingESG && claim.hostId) {
      await prisma.eSGEvent.create({
        data: {
          hostId: claim.hostId,
          eventType: 'CLAIM_FILED',
          eventCategory: 'GOVERNANCE',
          description: `Insurance claim filed: ${claim.type}`,
          metadata: {
            claimType: claim.type,
            estimatedCost: claim.estimatedCost,
            vehicleId: carId,
            vehicle: car ? `${car.year} ${car.make} ${car.model}` : undefined,
            bookingId,
            backfilled: true,
          } as any,
          relatedClaimId: claimId,
          relatedBookingId: bookingId,
        },
      })
      console.log('✅ ESG event created\n')
    } else if (!claim.hostId) {
      console.log('⚠️  Skipping ESG event (no hostId)\n')
    } else {
      console.log('⚠️  ESG event already exists, skipping\n')
    }

    console.log('🎉 BACKFILL COMPLETE!\n')
    console.log('Summary:')
    console.log('  ✅ Suspension message added')
    console.log('  ✅ AuditLog entries created/verified (hash chained)')
    console.log('  ✅ ESG event', claim.hostId ? 'created/verified' : 'skipped (no hostId)')
    console.log('\nRun `npx tsx scripts/check-claim-state.ts` to verify.')

  } catch (error) {
    console.error('❌ Backfill failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backfillClaimAudit()