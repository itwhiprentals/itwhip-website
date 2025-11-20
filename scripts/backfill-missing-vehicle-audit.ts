// scripts/backfill-missing-vehicle-audit.ts
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

async function backfillMissingVehicleAudit() {
  const claimId = 'cmh6ohqop0005doilht4bag3z'
  const carId = 'cmfn3fdhf0001l8040ao0a3h8'
  const bookingId = 'cmgj3gidz00addoig9iy7imxi'

  try {
    console.log('🔧 BACKFILL MISSING VEHICLE AUDIT LOG...\n')

    // 1) Verify claim exists
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        type: true,
        hostId: true,
        bookingId: true,
        createdAt: true
      }
    })

    if (!claim) {
      console.log('❌ Claim not found')
      return
    }

    console.log('✅ Claim found:', claim.type)
    console.log('   Created:', claim.createdAt)
    console.log()

    // 2) Check if vehicle audit already exists
    const existingVehicleAudit = await prisma.auditLog.findFirst({
      where: {
        resource: 'RENTAL_CAR',
        resourceId: carId,
        eventType: 'VEHICLE_DEACTIVATED_CLAIM'
      }
    })

    if (existingVehicleAudit) {
      console.log('✅ Vehicle audit log already exists, no backfill needed')
      console.log('   Event:', existingVehicleAudit.eventType)
      console.log('   Created:', existingVehicleAudit.timestamp)
      return
    }

    console.log('⚠️  Vehicle audit log missing - creating now...\n')

    // 3) Get previous hash for hash chain
    const prevHashCar = await nextPrevHash('RENTAL_CAR', carId)
    console.log('📍 Previous hash:', prevHashCar ? prevHashCar.substring(0, 16) + '...' : 'none')

    // 4) Create VEHICLE_DEACTIVATED_CLAIM audit log
    const carAuditPayload = {
      category: 'COMPLIANCE',
      eventType: 'VEHICLE_DEACTIVATED_CLAIM',
      severity: 'ERROR',
      userId: null, // No FK constraint
      ipAddress: 'backfill-script',
      userAgent: 'system-backfill-phase3',
      action: 'DEACTIVATE_VEHICLE',
      resource: 'RENTAL_CAR',
      resourceId: carId,
      metadata: {
        claimId: claimId,
        claimType: claim.type,
        bookingId: claim.bookingId,
        reason: `Claim filed: ${claim.type}`,
        backfilled: true,
        backfillReason: 'Missing vehicle deactivation audit entry',
        backfilledAt: new Date().toISOString()
      } as any,
    }

    const hashCar = buildAuditHash(carAuditPayload, prevHashCar)

    await prisma.auditLog.create({
      data: { ...carAuditPayload, previousHash: prevHashCar, hash: hashCar },
    })

    console.log('✅ VEHICLE_DEACTIVATED_CLAIM audit log created')
    console.log('   Hash:', hashCar.substring(0, 16) + '...')
    console.log('   Previous hash:', prevHashCar ? prevHashCar.substring(0, 16) + '...' : 'none')
    console.log()

    console.log('🎉 BACKFILL COMPLETE!\n')
    console.log('Summary:')
    console.log('  ✅ Missing vehicle audit log added')
    console.log('  ✅ Hash chain maintained')
    console.log('  ✅ Audit trail now complete (2 entries)')
    console.log()
    console.log('Run `npx tsx scripts/check-claim-state.ts` to verify 2 audit logs.')

  } catch (error) {
    console.error('❌ Backfill failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backfillMissingVehicleAudit()