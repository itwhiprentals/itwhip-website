// app/fleet/api/verifications/sync-stripe/route.ts
// 1. Check pending Stripe Identity sessions for status updates (verified/failed)
// 2. Re-fetch verified reports to backfill missing fields (DOB, ID number, expiry, address)
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/app/lib/database/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export async function POST(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { profileId } = body // optional: sync a single profile

    const results: { id: string; name: string | null; status: string; fieldsUpdated: string[]; stripeStatus?: string }[] = []

    // ── PART 1: Check pending sessions ──────────────────────────────────
    const pendingWhere: any = {
      stripeIdentitySessionId: { not: null },
      stripeIdentityStatus: { in: ['pending', 'requires_input'] },
    }
    if (profileId) pendingWhere.id = profileId

    const pendingProfiles = await prisma.reviewerProfile.findMany({
      where: pendingWhere,
      select: {
        id: true,
        name: true,
        email: true,
        stripeIdentitySessionId: true,
        stripeIdentityStatus: true,
      },
      take: 50,
    })

    for (const profile of pendingProfiles) {
      try {
        const session = await stripe.identity.verificationSessions.retrieve(
          profile.stripeIdentitySessionId!
        )

        console.log(`[Stripe Sync] Session ${session.id} for ${profile.name}: status=${session.status}`)

        if (session.status === 'verified') {
          // Session completed — extract report data and update profile
          const updates: any = {
            stripeIdentityStatus: 'verified',
            stripeIdentityVerifiedAt: new Date(),
            documentsVerified: true,
            documentVerifiedAt: new Date(),
            documentVerifiedBy: 'stripe-identity',
            fullyVerified: true,
          }
          const fieldsUpdated: string[] = ['status→verified']

          if (session.last_verification_report) {
            updates.stripeIdentityReportId = session.last_verification_report as string

            try {
              const report = await stripe.identity.verificationReports.retrieve(
                session.last_verification_report as string
              )

              if (report.document) {
                const doc = report.document as any

                if (doc.first_name) {
                  updates.stripeVerifiedFirstName = doc.first_name
                  fieldsUpdated.push('firstName')
                }
                if (doc.last_name) {
                  updates.stripeVerifiedLastName = doc.last_name
                  fieldsUpdated.push('lastName')
                }
                if (doc.first_name || doc.last_name) {
                  updates.name = [doc.first_name, doc.last_name].filter(Boolean).join(' ')
                }
                if (doc.dob?.year) {
                  updates.stripeVerifiedDob = new Date(doc.dob.year, doc.dob.month - 1, doc.dob.day)
                  updates.dateOfBirth = updates.stripeVerifiedDob
                  fieldsUpdated.push('dob')
                }
                if (doc.number) {
                  updates.stripeVerifiedIdNumber = doc.number
                  updates.driverLicenseNumber = doc.number
                  fieldsUpdated.push('idNumber')
                }
                if (doc.expiration_date?.year) {
                  updates.stripeVerifiedIdExpiry = new Date(
                    doc.expiration_date.year,
                    doc.expiration_date.month - 1,
                    doc.expiration_date.day
                  )
                  updates.driverLicenseExpiry = updates.stripeVerifiedIdExpiry
                  fieldsUpdated.push('idExpiry')
                }
                if (doc.address) {
                  const parts = [doc.address.line1, doc.address.line2, doc.address.city, doc.address.state, doc.address.postal_code].filter(Boolean)
                  if (parts.length > 0) {
                    updates.stripeVerifiedAddress = parts.join(', ')
                    fieldsUpdated.push('address')
                  }
                }

                console.log(`[Stripe Sync] ${profile.name}: extracted [${fieldsUpdated.join(', ')}]`)
              }
            } catch (err: any) {
              console.error(`[Stripe Sync] Error retrieving report for ${profile.name}:`, err.message)
            }
          }

          await prisma.reviewerProfile.update({
            where: { id: profile.id },
            data: updates,
          })
          results.push({ id: profile.id, name: profile.name, status: 'verified', fieldsUpdated, stripeStatus: 'verified' })

        } else if (session.status === 'requires_input') {
          // Still pending — update status
          if (profile.stripeIdentityStatus !== 'requires_input') {
            await prisma.reviewerProfile.update({
              where: { id: profile.id },
              data: { stripeIdentityStatus: 'requires_input' },
            })
          }
          results.push({ id: profile.id, name: profile.name, status: 'still_pending', fieldsUpdated: [], stripeStatus: 'requires_input' })

        } else if (session.status === 'canceled') {
          await prisma.reviewerProfile.update({
            where: { id: profile.id },
            data: { stripeIdentityStatus: 'canceled', stripeIdentitySessionId: null },
          })
          results.push({ id: profile.id, name: profile.name, status: 'canceled', fieldsUpdated: [], stripeStatus: 'canceled' })

        } else {
          // processing or other status
          results.push({ id: profile.id, name: profile.name, status: `stripe:${session.status}`, fieldsUpdated: [], stripeStatus: session.status })
        }
      } catch (err: any) {
        console.error(`[Stripe Sync] Error checking session for ${profile.name}:`, err.message)
        results.push({ id: profile.id, name: profile.name, status: `error: ${err.message}`, fieldsUpdated: [] })
      }
    }

    // ── PART 2: Backfill missing data for already-verified profiles ──────
    const backfillWhere: any = {
      stripeIdentityReportId: { not: null },
      stripeIdentityStatus: 'verified',
    }

    if (profileId) {
      backfillWhere.id = profileId
    } else {
      backfillWhere.OR = [
        { stripeVerifiedDob: null },
        { stripeVerifiedIdNumber: null },
        { stripeVerifiedIdExpiry: null },
        { stripeVerifiedAddress: null },
      ]
    }

    // Skip profiles we already processed in Part 1
    const alreadyProcessed = new Set(results.map(r => r.id))

    const verifiedProfiles = await prisma.reviewerProfile.findMany({
      where: backfillWhere,
      select: {
        id: true,
        name: true,
        stripeIdentityReportId: true,
        stripeVerifiedFirstName: true,
        stripeVerifiedLastName: true,
        stripeVerifiedDob: true,
        stripeVerifiedIdNumber: true,
        stripeVerifiedIdExpiry: true,
        stripeVerifiedAddress: true,
      },
      take: 50,
    })

    for (const profile of verifiedProfiles) {
      if (alreadyProcessed.has(profile.id)) continue

      try {
        const report = await stripe.identity.verificationReports.retrieve(
          profile.stripeIdentityReportId!
        )

        const updates: any = {}
        const fieldsUpdated: string[] = []

        if (report.document) {
          const doc = report.document as any

          if (!profile.stripeVerifiedFirstName && doc.first_name) {
            updates.stripeVerifiedFirstName = doc.first_name
            fieldsUpdated.push('firstName')
          }
          if (!profile.stripeVerifiedLastName && doc.last_name) {
            updates.stripeVerifiedLastName = doc.last_name
            fieldsUpdated.push('lastName')
          }
          if (!profile.stripeVerifiedDob && doc.dob?.year) {
            updates.stripeVerifiedDob = new Date(doc.dob.year, doc.dob.month - 1, doc.dob.day)
            updates.dateOfBirth = updates.stripeVerifiedDob
            fieldsUpdated.push('dob')
          }
          if (!profile.stripeVerifiedIdNumber && doc.number) {
            updates.stripeVerifiedIdNumber = doc.number
            updates.driverLicenseNumber = doc.number
            fieldsUpdated.push('idNumber')
          }
          if (!profile.stripeVerifiedIdExpiry && doc.expiration_date?.year) {
            updates.stripeVerifiedIdExpiry = new Date(doc.expiration_date.year, doc.expiration_date.month - 1, doc.expiration_date.day)
            updates.driverLicenseExpiry = updates.stripeVerifiedIdExpiry
            fieldsUpdated.push('idExpiry')
          }
          if (!profile.stripeVerifiedAddress && doc.address) {
            const parts = [doc.address.line1, doc.address.line2, doc.address.city, doc.address.state, doc.address.postal_code].filter(Boolean)
            if (parts.length > 0) {
              updates.stripeVerifiedAddress = parts.join(', ')
              fieldsUpdated.push('address')
            }
          }
        }

        if (Object.keys(updates).length > 0) {
          await prisma.reviewerProfile.update({
            where: { id: profile.id },
            data: updates,
          })
          results.push({ id: profile.id, name: profile.name, status: 'backfilled', fieldsUpdated })
        } else {
          results.push({ id: profile.id, name: profile.name, status: 'no_new_data', fieldsUpdated: [] })
        }
      } catch (err: any) {
        console.error(`[Stripe Sync] Error backfilling ${profile.name}:`, err.message)
        results.push({ id: profile.id, name: profile.name, status: `error: ${err.message}`, fieldsUpdated: [] })
      }
    }

    const synced = results.filter(r => ['verified', 'backfilled', 'updated'].includes(r.status)).length
    const pendingChecked = results.filter(r => r.stripeStatus).length

    return NextResponse.json({
      synced,
      pendingChecked,
      total: results.length,
      results,
    })
  } catch (error: any) {
    console.error('[Stripe Sync] Error:', error)
    return NextResponse.json({ error: error.message || 'Sync failed' }, { status: 500 })
  }
}
