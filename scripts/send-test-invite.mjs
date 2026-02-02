import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Email config
const emailConfig = {
  companyName: 'ItWhip Rentals',
  companyAddress: 'Phoenix, AZ',
  websiteUrl: 'https://itwhip.com',
  helpUrl: 'https://itwhip.com/help',
  stripeIdentityUrl: 'https://itwhip.com/help/identity-verification',
  termsUrl: 'https://itwhip.com/terms',
  privacyUrl: 'https://itwhip.com/privacy',
  aboutUrl: 'https://itwhip.com/about',
  howItWorksUrl: 'https://itwhip.com/how-it-works',
  browseCarsUrl: 'https://itwhip.com/cars',
  social: {
    instagram: 'https://www.instagram.com/itwhipofficial',
    facebook: 'https://www.facebook.com/people/Itwhipcom/61573990760395/',
    twitter: 'https://x.com/itwhipofficial',
    linkedin: 'https://www.linkedin.com/company/itwhip/'
  },
  socialIcons: {
    instagram: 'https://itwhip.com/images/email/social/instagram-v2.png',
    facebook: 'https://itwhip.com/images/email/social/facebook-v2.png',
    twitter: 'https://itwhip.com/images/email/social/x-v2.png',
    linkedin: 'https://itwhip.com/images/email/social/linkedin-v2.png'
  }
}

async function main() {
  const testEmail = 'hxris007@gmail.com'
  const testName = 'Ray'  // Real name for Ray
  const creditAmount = 660.75
  const creditType = 'booking_credit' // Booking Credit (from previous booking issue)
  const creditExpirationDays = 7
  const baseUrl = 'https://itwhip.com'

  // Previous booking details for context
  const previousBooking = {
    vehicle: '2017 Lamborghini Huracan',
    referenceId: 'WM1742688059',
    pickupDate: '4/5/2025',
    returnDate: '4/6/2025',
    duration: '1 day',
    location: 'Tempe, AZ'
  }

  // Find or create test prospect
  let prospect = await prisma.guestProspect.findFirst({
    where: { email: testEmail }
  })

  if (prospect) {
    // Update credit amount to correct value
    prospect = await prisma.guestProspect.update({
      where: { id: prospect.id },
      data: {
        creditAmount: creditAmount,
        creditType: creditType,
        creditNote: 'Resolution credit from previous booking'
      }
    })
    console.log('Updated existing prospect:', prospect.id)
  } else {
    prospect = await prisma.guestProspect.create({
      data: {
        id: nanoid(),
        name: testName,
        email: testEmail,
        creditAmount: creditAmount,
        creditType: creditType,
        creditNote: 'Resolution credit from previous booking',
        status: 'INVITED',
        inviteSentAt: new Date(),
      }
    })
    console.log('Created prospect:', prospect.id)
  }

  // Generate new invite token (72 hours)
  const inviteToken = nanoid(32)
  const inviteTokenExp = new Date(Date.now() + 72 * 60 * 60 * 1000)

  // Update prospect with new token
  await prisma.guestProspect.update({
    where: { id: prospect.id },
    data: {
      inviteToken,
      inviteTokenExp,
      inviteSentAt: new Date(),
      status: 'INVITED'
    }
  })

  const inviteLink = `${baseUrl}/guest-invite?token=${inviteToken}`
  console.log('Invite URL:', inviteLink)

  // Generate email reference
  const emailReferenceId = `REF-GU-${nanoid(6).toUpperCase()}`

  // Get first name
  const firstName = prospect.name.split(' ')[0]

  // Credit type display
  const creditTypeDisplay = 'Booking Credit'
  const creditDisplay = `$${creditAmount.toFixed(2)}`

  // Build email subject - more specific for booking credit
  const subject = `${firstName}, your ${creditDisplay} ItWhip credit is ready`

  // Build HTML email (matching guest invite template)
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; text-align: center;">
    <p style="margin: 0 0 4px 0; font-size: 12px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">Your Credit Is Ready</p>
    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ea580c;">Welcome to ItWhip</h1>
  </div>

  <!-- Main content -->
  <p style="font-size: 16px; margin: 0 0 16px 0; color: #1f2937;">
    Hi ${firstName},
  </p>

  <p style="font-size: 16px; margin: 0 0 16px 0; color: #111827;">
    We've issued a <strong>${creditDisplay} credit</strong> to your account for your future rentals with ItWhip.
  </p>

  <p style="font-size: 16px; color: #111827; margin: 0;">
    Click below to activate your account and apply this credit toward your next booking.
  </p>

  <!-- Credit Display -->
  <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
    <p style="margin: 0 0 4px 0; font-size: 13px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Your ${creditTypeDisplay}</p>
    <p style="margin: 0; font-size: 36px; font-weight: 700; color: #1f2937;">${creditDisplay}</p>
    <p style="margin: 8px 0 0 0; font-size: 12px; color: #ea580c; font-weight: 500;">Available for ${creditExpirationDays} days after activation</p>
  </div>

  <!-- Previous Booking Reference -->
  <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #374151; font-weight: 600;">Reference Booking:</p>
    <table style="width: 100%; font-size: 13px; color: #4b5563;">
      <tr>
        <td style="padding: 3px 0;">Vehicle:</td>
        <td style="padding: 3px 0; text-align: right; font-weight: 500; color: #1f2937;">${previousBooking.vehicle}</td>
      </tr>
      <tr>
        <td style="padding: 3px 0;">Dates:</td>
        <td style="padding: 3px 0; text-align: right;">${previousBooking.pickupDate} - ${previousBooking.returnDate}</td>
      </tr>
      <tr>
        <td style="padding: 3px 0;">Location:</td>
        <td style="padding: 3px 0; text-align: right;">${previousBooking.location}</td>
      </tr>
      <tr>
        <td style="padding: 3px 0;">Reference ID:</td>
        <td style="padding: 3px 0; text-align: right; font-family: monospace;">${previousBooking.referenceId}</td>
      </tr>
    </table>
  </div>

  <!-- Status indicator -->
  <p style="font-size: 14px; color: #111827; margin: 20px 0;">
    <strong>Your account is reserved.</strong> Activate within 72 hours to claim your credit.
  </p>

  <!-- CTA Button -->
  <div style="text-align: center; margin: 28px 0;">
    <a href="${inviteLink}" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
      Activate Your Account
    </a>
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
    <tr><td style="height: 1px; background-color: #e5e7eb; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
  </table>

  <!-- Benefits Section -->
  <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
    What you get with ItWhip:
  </p>
  <table style="width: 100%; font-size: 13px; color: #1f2937;">
    <tr>
      <td style="padding: 5px 0; width: 50%;">✓ Verified Hosts & Vehicles</td>
      <td style="padding: 5px 0; width: 50%;">✓ Flexible Pickup Locations</td>
    </tr>
    <tr>
      <td style="padding: 5px 0;">✓ Digital Rental Agreements</td>
      <td style="padding: 5px 0;">✓ 24/7 Support</td>
    </tr>
    <tr>
      <td style="padding: 5px 0;">✓ Competitive Daily Rates</td>
      <td style="padding: 5px 0;">✓ No Hidden Fees</td>
    </tr>
    <tr>
      <td style="padding: 5px 0;">✓ Unique Vehicle Selection</td>
      <td style="padding: 5px 0;">✓ Easy Booking Process</td>
    </tr>
    <tr>
      <td style="padding: 5px 0;">✓ Secure Payments via Stripe</td>
      <td style="padding: 5px 0;">✓ ID Verification for Safety</td>
    </tr>
    <tr>
      <td style="padding: 5px 0;">✓ Direct Host Communication</td>
      <td style="padding: 5px 0;">✓ Rental History & Receipts</td>
    </tr>
  </table>

  <!-- Closing Message -->
  <div style="margin: 28px 0 24px 0;">
    <p style="font-size: 15px; color: #111827; margin: 0 0 16px 0;">
      We're excited to have you join the ItWhip community. Happy travels!
    </p>
    <p style="font-size: 14px; color: #1f2937; margin: 0;">
      Best regards,<br/>
      <strong>The ItWhip Team</strong>
    </p>
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0 12px 0;">
    <tr><td style="height: 1px; background-color: #e5e7eb; line-height: 1px; font-size: 1px;">&nbsp;</td></tr>
  </table>

  <!-- Footer Header with Logo -->
  <div style="text-align: center; margin: 0 0 16px 0;">
    <img src="https://itwhip.com/logo.png" alt="ItWhip" width="36" style="max-width: 36px; height: auto; display: block; margin: 0 auto 2px auto;" />
    <span style="font-size: 9px; font-weight: 600; color: #374151; letter-spacing: 0.3px;">ITWHIP CAR RENTALS AND RIDESHARES</span>
  </div>

  <p style="color: #374151; font-size: 13px; margin-bottom: 0; text-align: center;">
    Questions? Reply to this email or visit <a href="${emailConfig.helpUrl}" style="color: #ea580c; font-weight: 600;">itwhip.com/help</a>
  </p>

  <!-- About Us -->
  <p style="color: #4b5563; font-size: 10px; margin-top: 16px; text-align: center; line-height: 1.4;">
    ItWhip is a peer-to-peer vehicle rental marketplace connecting verified renters with trusted vehicle owners.
    Find unique cars from local hosts at competitive rates.
    <a href="${emailConfig.howItWorksUrl}" style="color: #ea580c;">How It Works</a> |
    <a href="${emailConfig.browseCarsUrl}" style="color: #ea580c;">Browse Cars</a>
  </p>

  <!-- Credit Disclaimer -->
  <p style="color: #4b5563; font-size: 9px; margin-top: 16px; text-align: center; line-height: 1.4;">
    Credits are distributed after account verification via <a href="${emailConfig.stripeIdentityUrl}" style="color: #ea580c;">Stripe Identity</a>. Terms and conditions are subject to change at any time.
  </p>

  <p style="color: #4b5563; font-size: 11px; margin-top: 12px; text-align: center;">
    ${emailConfig.companyName} | ${emailConfig.companyAddress} | <a href="${emailConfig.websiteUrl}" style="color: #ea580c;">itwhip.com</a>
    <br/>
    <a href="${emailConfig.aboutUrl}" style="color: #4b5563;">About</a> |
    <a href="${emailConfig.termsUrl}" style="color: #4b5563;">Terms</a> |
    <a href="${emailConfig.privacyUrl}" style="color: #4b5563;">Privacy</a>
  </p>

  <!-- Social Links -->
  <table cellpadding="0" cellspacing="0" style="margin: 16px auto;">
    <tr>
      <td style="padding: 0 10px;">
        <a href="${emailConfig.social.instagram}" target="_blank" style="text-decoration: none;">
          <img src="${emailConfig.socialIcons.instagram}" alt="Instagram" width="20" height="20" style="display: block; border: 0;" />
        </a>
      </td>
      <td style="padding: 0 10px;">
        <a href="${emailConfig.social.facebook}" target="_blank" style="text-decoration: none;">
          <img src="${emailConfig.socialIcons.facebook}" alt="Facebook" width="20" height="20" style="display: block; border: 0;" />
        </a>
      </td>
      <td style="padding: 0 10px;">
        <a href="${emailConfig.social.twitter}" target="_blank" style="text-decoration: none;">
          <img src="${emailConfig.socialIcons.twitter}" alt="X" width="20" height="20" style="display: block; border: 0;" />
        </a>
      </td>
      <td style="padding: 0 10px;">
        <a href="${emailConfig.social.linkedin}" target="_blank" style="text-decoration: none;">
          <img src="${emailConfig.socialIcons.linkedin}" alt="LinkedIn" width="20" height="20" style="display: block; border: 0;" />
        </a>
      </td>
    </tr>
  </table>

  <!-- Reference ID for verification -->
  <p style="color: #374151; font-size: 11px; margin-top: 16px; text-align: center;">
    <a href="${baseUrl}/verify-email?ref=${emailReferenceId}" style="color: #374151; text-decoration: none;">
      Verify this email: <strong style="color: #ea580c;">${emailReferenceId}</strong>
    </a>
  </p>

  <!-- Tracking pixel -->
  <img src="${baseUrl}/api/tracking/guest-pixel/${prospect.id}" width="1" height="1" style="display:none;width:1px;height:1px;border:0;" alt="" />
</body>
</html>
  `

  const text = `YOUR CREDIT IS READY
Welcome to ItWhip

Hi ${firstName},

We've issued a ${creditDisplay} credit to your account for your future rentals with ItWhip.

Click below to activate your account and apply this credit toward your next booking.

YOUR ${creditTypeDisplay.toUpperCase()}: ${creditDisplay}
Available for ${creditExpirationDays} days after activation

REFERENCE BOOKING:
Vehicle: ${previousBooking.vehicle}
Dates: ${previousBooking.pickupDate} - ${previousBooking.returnDate}
Location: ${previousBooking.location}
Reference ID: ${previousBooking.referenceId}

Your account is reserved. Activate within 72 hours to claim your credit.

Activate Your Account:
${inviteLink}

WHAT YOU GET WITH ITWHIP:
✓ Verified Hosts & Vehicles    ✓ Flexible Pickup Locations
✓ Digital Rental Agreements    ✓ 24/7 Support
✓ Competitive Daily Rates      ✓ No Hidden Fees
✓ Unique Vehicle Selection     ✓ Easy Booking Process
✓ Secure Payments via Stripe   ✓ ID Verification for Safety
✓ Direct Host Communication    ✓ Rental History & Receipts

We're excited to have you join the ItWhip community. Happy travels!

Best regards,
The ItWhip Team

---

Questions? Reply to this email or visit itwhip.com/help

ItWhip is a peer-to-peer vehicle rental marketplace connecting verified renters with trusted vehicle owners. Find unique cars from local hosts at competitive rates.
How It Works: ${emailConfig.howItWorksUrl} | Browse Cars: ${emailConfig.browseCarsUrl}

Credits are distributed after account verification via Stripe Identity. Terms and conditions are subject to change at any time.

${emailConfig.companyName} | ${emailConfig.companyAddress} | itwhip.com
About: ${emailConfig.aboutUrl} | Terms: ${emailConfig.termsUrl} | Privacy: ${emailConfig.privacyUrl}

Follow us: Instagram @itwhipofficial | Facebook | X @itwhipofficial | LinkedIn

Verify this email: ${baseUrl}/verify-email?ref=${emailReferenceId}`

  // Send email using SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: 'info@itwhip.com',
      pass: 'Xianns8686*',
    },
    tls: {
      rejectUnauthorized: false
    },
    requireTLS: true
  })

  console.log('Sending email to:', testEmail)

  const result = await transporter.sendMail({
    from: 'ItWhip Rentals <info@itwhip.com>',
    replyTo: 'info@itwhip.com',
    to: testEmail,
    subject: subject,
    html: html,
    text: text
  })

  console.log('Email sent successfully!')
  console.log('Message ID:', result.messageId)

  // Log email to EmailLog table for audit trail and reference verification
  const emailLog = await prisma.emailLog.create({
    data: {
      referenceId: emailReferenceId,
      recipientEmail: testEmail.toLowerCase(),
      recipientName: prospect.name,
      subject: subject,
      emailType: 'GUEST_INVITE',
      relatedType: 'guest_prospect',
      relatedId: prospect.id,
      messageId: result.messageId,
      status: 'SENT',
      sentAt: new Date(),
      metadata: {
        creditAmount: creditAmount,
        creditType: creditType,
        creditExpirationDays: creditExpirationDays,
        previousBooking: previousBooking
      }
    }
  })

  console.log('Email logged with reference:', emailLog.referenceId)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
