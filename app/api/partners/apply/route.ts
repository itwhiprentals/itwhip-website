// app/api/partners/apply/route.ts
// POST /api/partners/apply - Submit Fleet Partner Application

import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { prisma } from '@/app/lib/database/prisma'
import { hash } from 'argon2'
import { validatePartnerSlug } from '@/app/lib/validation/reserved-slugs'
import { sendEmail } from '@/app/lib/email/send-email'
import {
  getPartnerApplicationReceivedTemplate,
  getFleetTeamNotificationTemplate
} from '@/app/lib/email/templates/partner-application-received'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      // Company Info
      companyName,
      businessType,
      yearsInBusiness,
      ein,
      partnerSlug,
      website,
      // Contact
      contactName,
      contactEmail,
      contactPhone,
      contactTitle,
      // Fleet Details
      fleetSize,
      vehicleTypes,
      operatingCities,
      operatingStates,
      // Documents
      businessLicenseUrl,
      articlesOfIncorporationUrl,
      w9Url,
      // Insurance
      insuranceProvider,
      policyNumber,
      coverageAmount,
      policyExpiresAt,
      insuranceCertificateUrl,
      // Terms
      agreeToTerms,
      agreeToBackgroundCheck
    } = body

    // Validate required fields
    if (!companyName || !businessType || !contactName || !contactEmail || !contactPhone || !fleetSize) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate partner slug
    if (partnerSlug) {
      const slugValidation = validatePartnerSlug(partnerSlug)
      if (!slugValidation.valid) {
        return NextResponse.json(
          { error: slugValidation.error || 'Invalid partner URL' },
          { status: 400 }
        )
      }

      // Check if slug is already taken
      const existingSlug = await prisma.rentalHost.findFirst({
        where: { partnerSlug: slugValidation.sanitized }
      })

      if (existingSlug) {
        return NextResponse.json(
          { error: 'This partner URL is already taken' },
          { status: 400 }
        )
      }
    }

    // Check if email already exists
    const existingHost = await prisma.rentalHost.findUnique({
      where: { email: contactEmail.toLowerCase() }
    })

    if (existingHost) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Check if user with this email exists
    let user = await prisma.user.findUnique({
      where: { email: contactEmail.toLowerCase() }
    })

    // Generate a temporary password for the partner
    const tempPassword = generateTempPassword()
    const hashedPassword = await hash(tempPassword)

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: nanoid(),
          email: contactEmail.toLowerCase(),
          name: contactName,
          role: 'BUSINESS',
          passwordHash: hashedPassword,
          emailVerified: false,
          phoneVerified: false,
          isActive: true
        }
      })
    }

    // Parse fleet size to number
    const fleetSizeMap: Record<string, number> = {
      '5-9': 7,
      '10-24': 17,
      '25-49': 37,
      '50-99': 75,
      '100+': 100
    }
    const fleetSizeNum = fleetSizeMap[fleetSize] || 10

    // Create RentalHost with PENDING hostType
    const host = await prisma.rentalHost.create({
      data: {
        userId: user.id,
        email: contactEmail.toLowerCase(),
        name: contactName,
        phone: contactPhone,

        // Host status
        hostType: 'PENDING', // Will be changed to FLEET_PARTNER upon approval
        approvalStatus: 'PENDING',
        active: false,

        // Partner fields
        partnerCompanyName: companyName,
        partnerSlug: partnerSlug?.toLowerCase(),
        partnerSupportEmail: contactEmail.toLowerCase(),
        partnerSupportPhone: contactPhone,

        // Default commission rates
        tier1VehicleCount: 10,
        tier1CommissionRate: 0.20,
        tier2VehicleCount: 50,
        tier2CommissionRate: 0.15,
        tier3VehicleCount: 100,
        tier3CommissionRate: 0.10,
        currentCommissionRate: 0.25, // Start at base rate

        // Partner stats
        partnerFleetSize: fleetSizeNum,
        partnerTotalBookings: 0,
        partnerTotalRevenue: 0,
        partnerAvgRating: 0,

        // Auto-approve listings for partners
        autoApproveListings: true
      }
    })

    // Create PartnerApplication record
    await prisma.partner_applications.create({
      data: {
        hostId: host.id,
        companyName,
        businessType,
        yearsInBusiness: parseInt(yearsInBusiness) || 0,
        contactName,
        contactEmail: contactEmail.toLowerCase(),
        contactPhone,
        fleetSize: fleetSizeNum,
        vehicleTypes: vehicleTypes || [],
        operatingCities: operatingCities || [],
        currentStep: 6, // Completed all steps
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    })

    // Create PartnerDocument records for uploaded documents
    const documentsToCreate = []

    if (businessLicenseUrl) {
      documentsToCreate.push({
        hostId: host.id,
        type: 'BUSINESS_LICENSE' as const,
        url: businessLicenseUrl,
        status: 'PENDING' as const
      })
    }

    if (articlesOfIncorporationUrl) {
      documentsToCreate.push({
        hostId: host.id,
        type: 'ARTICLES_OF_INCORPORATION' as const,
        url: articlesOfIncorporationUrl,
        status: 'PENDING' as const
      })
    }

    if (w9Url) {
      documentsToCreate.push({
        hostId: host.id,
        type: 'W9_FORM' as const,
        url: w9Url,
        status: 'PENDING' as const
      })
    }

    if (insuranceCertificateUrl) {
      documentsToCreate.push({
        hostId: host.id,
        type: 'INSURANCE_CERTIFICATE' as const,
        url: insuranceCertificateUrl,
        status: 'PENDING' as const,
        expiresAt: policyExpiresAt ? new Date(policyExpiresAt) : null
      })
    }

    if (documentsToCreate.length > 0) {
      await prisma.partner_documents.createMany({
        data: documentsToCreate
      })
    }

    // Get the application ID for email
    const application = await prisma.partner_applications.findFirst({
      where: { hostId: host.id },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`[Partner Apply] New application submitted:`, {
      hostId: host.id,
      applicationId: application?.id,
      companyName,
      email: contactEmail,
      fleetSize
    })

    // Send email notifications
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'

    // 1. Send confirmation email to partner
    try {
      const partnerEmailTemplate = getPartnerApplicationReceivedTemplate({
        companyName,
        contactName,
        contactEmail,
        fleetSize,
        applicationId: application?.id || host.id,
        operatingStates: operatingStates || [],
        submittedAt: new Date(),
        estimatedReviewTime: '24-48 hours',
        supportEmail: 'info@itwhip.com'
      })

      await sendEmail({
        to: contactEmail,
        subject: partnerEmailTemplate.subject,
        html: partnerEmailTemplate.html,
        text: partnerEmailTemplate.text
      })

      console.log(`[Partner Apply] Confirmation email sent to ${contactEmail}`)
    } catch (emailError) {
      console.error('[Partner Apply] Failed to send partner confirmation email:', emailError)
    }

    // 2. Send notification to fleet team
    try {
      const fleetEmailTemplate = getFleetTeamNotificationTemplate({
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        fleetSize,
        operatingStates: operatingStates || [],
        applicationId: application?.id || host.id,
        reviewUrl: `${baseUrl}/fleet/partners/applications?key=phoenix-fleet-2847`
      })

      // Send to fleet admin email
      await sendEmail({
        to: 'info@itwhip.com',
        subject: fleetEmailTemplate.subject,
        html: fleetEmailTemplate.html,
        text: fleetEmailTemplate.text
      })

      console.log(`[Partner Apply] Fleet team notification sent to info@itwhip.com`)
    } catch (emailError) {
      console.error('[Partner Apply] Failed to send fleet team notification:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: host.id
    })

  } catch (error: any) {
    console.error('[Partner Apply] Error:', error)

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      if (field === 'email') {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      }
      if (field === 'partnerSlug') {
        return NextResponse.json(
          { error: 'This partner URL is already taken' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    )
  }
}

// Generate a temporary password
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// GET - Check if email/slug is available
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const slug = searchParams.get('slug')

    if (email) {
      const existingHost = await prisma.rentalHost.findUnique({
        where: { email: email.toLowerCase() }
      })

      return NextResponse.json({
        available: !existingHost
      })
    }

    if (slug) {
      const slugValidation = validatePartnerSlug(slug)

      if (!slugValidation.valid) {
        return NextResponse.json({
          available: false,
          error: slugValidation.error
        })
      }

      const existingSlug = await prisma.rentalHost.findFirst({
        where: { partnerSlug: slugValidation.sanitized }
      })

      return NextResponse.json({
        available: !existingSlug,
        sanitized: slugValidation.sanitized
      })
    }

    return NextResponse.json(
      { error: 'Email or slug parameter required' },
      { status: 400 }
    )

  } catch (error) {
    console.error('[Partner Apply GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}
