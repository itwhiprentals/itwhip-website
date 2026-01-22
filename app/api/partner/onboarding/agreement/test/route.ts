// app/api/partner/onboarding/agreement/test/route.ts
// Send a test e-sign email to the host so they can preview the signing experience

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { sendEmail } from '@/app/lib/email/send-email'
import {
  generateAgreementToken,
  getTokenExpiryDate,
  generateSigningUrl
} from '@/app/lib/agreements/tokens'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  // Check multiple token sources
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string; userId?: string }
    const hostId = decoded.hostId

    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        convertedFromProspect: {
          include: {
            request: true
          }
        },
        cars: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            color: true
          }
        }
      }
    })
  } catch {
    return null
  }
}

// POST /api/partner/onboarding/agreement/test - Send test e-sign email to host
export async function POST() {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if this is a recruited host (recruitedVia is source of truth)
    if (!host.recruitedVia) {
      return NextResponse.json(
        { error: 'Not a recruited host' },
        { status: 400 }
      )
    }

    const prospect = host.convertedFromProspect
    if (!prospect) {
      return NextResponse.json(
        { error: 'No linked prospect found' },
        { status: 404 }
      )
    }

    const request = prospect.request
    if (!request) {
      return NextResponse.json(
        { error: 'No linked request found' },
        { status: 404 }
      )
    }

    // Check if host has uploaded their agreement
    if (!prospect.hostAgreementUrl) {
      return NextResponse.json(
        { error: 'Please upload your rental agreement PDF first' },
        { status: 400 }
      )
    }

    // Generate agreement token for testing
    const agreementToken = generateAgreementToken()
    const expiresAt = getTokenExpiryDate(1) // 1 day for test

    // Store the test agreement token in the prospect
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        testAgreementToken: agreementToken,
        testAgreementExpiresAt: expiresAt,
        testAgreementSentAt: new Date(),
        lastActivityAt: new Date()
      }
    })

    // Generate signing URL
    const signingUrl = generateSigningUrl(agreementToken)

    // Get vehicle info
    const car = host.cars[0]
    const vehicleName = car
      ? `${car.year} ${car.make} ${car.model}`
      : request.vehicleInfo || 'Your Vehicle'

    // Send test email to host
    let emailSent = false
    try {
      await sendEmail({
        to: host.email,
        subject: `[TEST] Preview Your E-Sign Experience - ${vehicleName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🧪 Test E-Sign Preview</h1>
            </div>

            <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <div style="background: #dbeafe; border: 1px solid #93c5fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #1e40af; font-size: 14px; margin: 0;">
                  <strong>This is a TEST email.</strong> Click below to see exactly what your guests will experience when signing agreements.
                </p>
              </div>

              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                Hi ${host.name},
              </p>

              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                You requested a preview of the e-signature experience. This is what your guests will see when signing the rental agreement.
              </p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
                  ${vehicleName}
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Sample booking dates for testing
                </p>
              </div>

              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                <strong>What you'll see:</strong>
              </p>
              <ul style="color: #374151; font-size: 14px; padding-left: 20px; margin-bottom: 20px;">
                <li>Your uploaded rental agreement</li>
                <li>ItWhip Standard Agreement terms</li>
                <li>Signature capture area</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${signingUrl}"
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Preview E-Sign Experience →
                </a>
              </div>

              <p style="color: #dc2626; font-size: 12px; margin-top: 20px;">
                <strong>This test link expires in 24 hours.</strong>
              </p>

              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                This is a test preview only. Your signature here won't create a real agreement.
              </p>
            </div>

            <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Powered by <a href="https://itwhip.com" style="color: #f97316;">ItWhip</a> - The trusted car rental marketplace
              </p>
            </div>
          </div>
        `,
        text: `TEST E-Sign Preview\n\nHi ${host.name},\n\nYou requested a preview of the e-signature experience.\n\nPreview the signing experience: ${signingUrl}\n\nThis test link expires in 24 hours.\n\nPowered by ItWhip`
      })
      emailSent = true
      console.log(`[Test E-Sign] Email sent to ${host.email}`)
    } catch (emailError) {
      console.error('[Test E-Sign] Email send error:', emailError)
    }

    return NextResponse.json({
      success: true,
      emailSent,
      sentTo: host.email,
      signingUrl,
      expiresAt,
      message: emailSent
        ? `Test e-sign email sent to ${host.email}`
        : `Test link generated but email failed. Try this URL: ${signingUrl}`
    })

  } catch (error: unknown) {
    console.error('[Test E-Sign API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send test e-sign' },
      { status: 500 }
    )
  }
}
