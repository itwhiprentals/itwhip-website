// app/lib/agreements/generator.ts
// PDF Agreement Generator using jsPDF - Matches signing page layout

import { jsPDF } from 'jspdf'
import fs from 'fs'
import path from 'path'

interface BookingDetails {
  id: string
  bookingCode: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
  numberOfDays: number
  dailyRate: number
  totalAmount: number
  securityDeposit: number
  pickupLocation: string
  pickupType: string
}

interface VehicleDetails {
  year: number
  make: string
  model: string
  vin?: string
  licensePlate?: string
  color?: string
}

interface PartnerDetails {
  companyName: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

interface CustomerDetails {
  name: string
  email: string
  phone?: string
}

interface SignatureDetails {
  signatureImage: string // Base64 PNG
  signerName: string
  signedAt: Date
  ipAddress: string
}

interface AgreementData {
  booking: BookingDetails
  vehicle: VehicleDetails
  partner: PartnerDetails
  customer: CustomerDetails
  customClauses?: string[]
  signature?: SignatureDetails
}

// Load logo as base64 for embedding in PDF
function getLogoBase64(): string | null {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-white.png')
    const logoBuffer = fs.readFileSync(logoPath)
    return logoBuffer.toString('base64')
  } catch (error) {
    console.error('Failed to load logo:', error)
    return null
  }
}

/**
 * Format a date for display in the agreement
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

/**
 * Generate the rental agreement PDF - Matches signing page layout exactly
 * Returns Base64 encoded PDF string
 */
export async function generateAgreementPDF(data: AgreementData): Promise<string> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - (margin * 2)
  let yPos = margin

  // Helper to add new page if needed
  const checkNewPage = (neededHeight: number = 20) => {
    if (yPos + neededHeight > pageHeight - margin) {
      doc.addPage()
      yPos = margin
      return true
    }
    return false
  }

  // Helper to draw a section box
  const drawSectionBox = (height: number, fillColor: [number, number, number] = [249, 250, 251]) => {
    doc.setFillColor(fillColor[0], fillColor[1], fillColor[2])
    doc.setDrawColor(229, 231, 235)
    doc.roundedRect(margin, yPos - 4, contentWidth, height, 2, 2, 'FD')
  }

  // === HEADER WITH LOGO ===
  doc.setFillColor(249, 115, 22) // Orange gradient start
  doc.rect(0, 0, pageWidth, 28, 'F')

  // Add logo if available - logo is 428x428 (square), so maintain 1:1 aspect ratio
  const logoBase64 = getLogoBase64()
  const logoSize = 16 // 16mm x 16mm square logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, 6, logoSize, logoSize)
    } catch (e) {
      // Logo failed, just show text
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('ItWhip', margin, 14)
    }
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Rental Agreement', margin + logoSize + 5, 16)

  yPos = 38

  // === AGREEMENT HEADER ===
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Vehicle Rental Agreement', margin, yPos)
  yPos += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text(`Agreement #${data.booking.bookingCode}`, margin, yPos)
  yPos += 12

  // === PARTIES SECTION ===
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Parties', margin, yPos)
  yPos += 8

  // Two column layout
  const colWidth = (contentWidth - 10) / 2

  // Owner/Provider column
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('Owner/Provider', margin, yPos)
  yPos += 4
  doc.setFontSize(10)
  doc.setTextColor(17, 24, 39)
  doc.setFont('helvetica', 'bold')
  doc.text(data.partner.companyName || data.partner.name, margin, yPos)
  doc.setFont('helvetica', 'normal')
  if (data.partner.email) {
    yPos += 4
    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99)
    doc.text(data.partner.email, margin, yPos)
  }
  if (data.partner.city && data.partner.state) {
    yPos += 4
    doc.text(`${data.partner.city}, ${data.partner.state}`, margin, yPos)
  }

  // Renter column (positioned to the right)
  let renterY = yPos - (data.partner.email ? 8 : 4) - (data.partner.city ? 4 : 0)
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('Renter', margin + colWidth + 10, renterY)
  renterY += 4
  doc.setFontSize(10)
  doc.setTextColor(17, 24, 39)
  doc.setFont('helvetica', 'bold')
  doc.text(data.customer.name, margin + colWidth + 10, renterY)
  doc.setFont('helvetica', 'normal')
  if (data.customer.email) {
    renterY += 4
    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99)
    doc.text(data.customer.email, margin + colWidth + 10, renterY)
  }

  yPos += 12

  // === VEHICLE DETAILS ===
  checkNewPage(25)
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Vehicle Details', margin, yPos)
  yPos += 7

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}`, margin, yPos)
  yPos += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(75, 85, 99)
  if (data.vehicle.color) {
    doc.text(`Color: ${data.vehicle.color}`, margin, yPos)
    yPos += 4
  }
  if (data.vehicle.licensePlate) {
    doc.text(`License: ${data.vehicle.licensePlate}`, margin, yPos)
    yPos += 4
  }
  if (data.vehicle.vin) {
    doc.text(`VIN: ${data.vehicle.vin}`, margin, yPos)
    yPos += 4
  }

  yPos += 8

  // === RENTAL PERIOD ===
  checkNewPage(30)
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Rental Period', margin, yPos)
  yPos += 8

  // Two column for dates
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('Start', margin, yPos)
  doc.text('End', margin + colWidth + 10, yPos)
  yPos += 4

  doc.setFontSize(10)
  doc.setTextColor(17, 24, 39)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDate(data.booking.startDate), margin, yPos)
  doc.text(formatDate(data.booking.endDate), margin + colWidth + 10, yPos)
  yPos += 4

  doc.setFontSize(9)
  doc.setTextColor(75, 85, 99)
  doc.text(`at ${data.booking.startTime}`, margin, yPos)
  doc.text(`at ${data.booking.endTime}`, margin + colWidth + 10, yPos)
  yPos += 8

  doc.setTextColor(75, 85, 99)
  doc.text(`Duration: ${data.booking.numberOfDays} day(s)`, margin, yPos)
  yPos += 4
  doc.text(`Pickup: ${data.booking.pickupLocation} (${data.booking.pickupType})`, margin, yPos)

  yPos += 12

  // === RENTAL CHARGES ===
  checkNewPage(30)
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Rental Charges', margin, yPos)
  yPos += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  // Daily Rate
  doc.setTextColor(75, 85, 99)
  doc.text('Daily Rate', margin, yPos)
  doc.setTextColor(17, 24, 39)
  doc.text(formatCurrency(data.booking.dailyRate), margin + contentWidth - 30, yPos, { align: 'right' })
  yPos += 5

  // Security Deposit
  doc.setTextColor(75, 85, 99)
  doc.text('Security Deposit', margin, yPos)
  doc.setTextColor(17, 24, 39)
  doc.text(formatCurrency(data.booking.securityDeposit), margin + contentWidth - 30, yPos, { align: 'right' })
  yPos += 6

  // Total line
  doc.setDrawColor(229, 231, 235)
  doc.line(margin, yPos, margin + contentWidth, yPos)
  yPos += 5

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('Total Amount', margin, yPos)
  doc.setTextColor(249, 115, 22) // Orange
  doc.text(formatCurrency(data.booking.totalAmount), margin + contentWidth - 30, yPos, { align: 'right' })

  yPos += 12

  // === ARIZONA LEGAL COMPLIANCE ===
  checkNewPage(45)
  drawSectionBox(42, [249, 250, 251])

  doc.setTextColor(17, 24, 39)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Arizona Legal Requirements', margin + 5, yPos + 2)
  yPos += 8

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  const legalText = 'This agreement complies with all applicable Arizona state laws governing vehicle rentals and peer-to-peer car sharing arrangements.'
  const legalLines = doc.splitTextToSize(legalText, contentWidth - 10)
  doc.text(legalLines, margin + 5, yPos)
  yPos += legalLines.length * 3.5 + 3

  const legalItems = [
    '• Driver eligibility verification required per A.R.S. §28-3472',
    '• Security deposits handled per A.R.S. §33-1321',
    '• Peer-to-peer rental compliance per A.R.S. §28-9601',
    '• Insurance requirements per A.R.S. §20-331',
    '• Transaction Privilege Tax collection per A.R.S. §42-5061'
  ]
  legalItems.forEach(item => {
    doc.text(item, margin + 5, yPos)
    yPos += 4
  })

  yPos += 8

  // === TRIP PROTECTION COVERAGE ===
  checkNewPage(50)
  drawSectionBox(48, [249, 250, 251])

  doc.setTextColor(17, 24, 39)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Trip Protection Coverage', margin + 5, yPos + 2)
  yPos += 8

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  const protectionText = 'This rental includes comprehensive trip protection coverage. In the event of an accident or damage, you are protected with the following coverage limits:'
  const protectionLines = doc.splitTextToSize(protectionText, contentWidth - 10)
  doc.text(protectionLines, margin + 5, yPos)
  yPos += protectionLines.length * 3.5 + 5

  // Coverage grid (2x2)
  const boxWidth = (contentWidth - 20) / 2
  const boxHeight = 12

  // Row 1
  doc.setFillColor(243, 244, 246)
  doc.roundedRect(margin + 5, yPos, boxWidth, boxHeight, 1, 1, 'F')
  doc.roundedRect(margin + 10 + boxWidth, yPos, boxWidth, boxHeight, 1, 1, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('Liability Coverage', margin + 8, yPos + 4)
  doc.text('Your Deductible', margin + 13 + boxWidth, yPos + 4)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.text('$750,000 maximum', margin + 8, yPos + 9)
  doc.text('As specified above', margin + 13 + boxWidth, yPos + 9)
  yPos += boxHeight + 3

  // Row 2
  doc.setFillColor(243, 244, 246)
  doc.roundedRect(margin + 5, yPos, boxWidth, boxHeight, 1, 1, 'F')
  doc.roundedRect(margin + 10 + boxWidth, yPos, boxWidth, boxHeight, 1, 1, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('Personal Effects', margin + 8, yPos + 4)
  doc.text('Loss of Use', margin + 13 + boxWidth, yPos + 4)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.text('$500 maximum', margin + 8, yPos + 9)
  doc.text('Covered', margin + 13 + boxWidth, yPos + 9)

  yPos += boxHeight + 12

  // === TERMS AND CONDITIONS ===
  checkNewPage(20)
  doc.setTextColor(17, 24, 39)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Terms and Conditions', margin, yPos)
  yPos += 10

  // Section 1: Driver Eligibility
  checkNewPage(25)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('1. Driver Eligibility & Requirements', margin, yPos)
  yPos += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.setFontSize(8)
  const eligibilityText = 'The renter must be at least 21 years of age and possess a valid driver\'s license that has been active for a minimum of one year. International renters must provide a valid passport and international driving permit if their license is not in English.'
  const eligibilityLines = doc.splitTextToSize(eligibilityText, contentWidth)
  doc.text(eligibilityLines, margin, yPos)
  yPos += eligibilityLines.length * 3.5 + 6

  // Section 2: Authorized Use
  checkNewPage(35)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('2. Authorized Use & Restrictions', margin, yPos)
  yPos += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.setFontSize(8)
  doc.text('The vehicle may only be operated on properly maintained roads and highways. The following uses are strictly prohibited:', margin, yPos)
  yPos += 5
  const restrictions = [
    '• Racing, speed testing, or any type of competition',
    '• Towing or pushing any vehicle or trailer',
    '• Off-road driving or driving on unpaved surfaces',
    '• Commercial use including rideshare or delivery services',
    '• Transporting hazardous materials or illegal substances',
    '• Driving outside Arizona without written permission'
  ]
  restrictions.forEach(item => {
    doc.text(item, margin + 3, yPos)
    yPos += 3.5
  })
  yPos += 4

  // Section 3: Renter Responsibilities
  checkNewPage(35)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('3. Renter Responsibilities', margin, yPos)
  yPos += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.setFontSize(8)
  const responsibilities = [
    '• Return the vehicle with the same fuel level as at pickup',
    '• Maintain the vehicle in the same condition as received',
    '• Lock the vehicle when unattended and safeguard keys',
    '• Report any mechanical issues or damage immediately',
    '• No smoking or vaping in the vehicle ($250 cleaning fee)',
    '• No pets without prior approval ($100 cleaning fee)',
    '• Pay all tolls, parking fees, and traffic violations'
  ]
  responsibilities.forEach(item => {
    doc.text(item, margin + 3, yPos)
    yPos += 3.5
  })
  yPos += 4

  // Section 4: Accident & Emergency
  checkNewPage(40)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('4. Accident & Emergency Procedures', margin, yPos)
  yPos += 5

  doc.setFillColor(249, 250, 251)
  doc.setDrawColor(229, 231, 235)
  doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(55, 65, 81)
  doc.text('In case of accident or emergency:', margin + 3, yPos + 5)
  yPos += 8
  doc.setFont('helvetica', 'normal')
  const emergencySteps = [
    '1. Ensure safety of all parties and call 911 if needed',
    '2. Contact local police and obtain report number',
    '3. Document scene with photos of all damage',
    '4. Exchange information with all parties involved',
    '5. Report to owner and ItWhip support immediately',
    '6. Do not admit fault to anyone except police'
  ]
  emergencySteps.forEach(step => {
    doc.text(step, margin + 5, yPos)
    yPos += 3.5
  })
  yPos += 8

  // Section 5: Cancellation Policy
  checkNewPage(35)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('5. Cancellation Policy', margin, yPos)
  yPos += 6

  // Cancellation grid (4 boxes)
  const cancelBoxWidth = (contentWidth - 9) / 4
  const cancelBoxHeight = 14
  const cancelData = [
    { time: '72+ hrs', refund: '100% refund' },
    { time: '24-72 hrs', refund: '75% refund' },
    { time: '12-24 hrs', refund: '50% refund' },
    { time: '<12 hrs', refund: 'No refund' }
  ]

  cancelData.forEach((item, i) => {
    const xPos = margin + (i * (cancelBoxWidth + 3))
    doc.setFillColor(249, 250, 251)
    doc.setDrawColor(229, 231, 235)
    doc.roundedRect(xPos, yPos, cancelBoxWidth, cancelBoxHeight, 1, 1, 'FD')

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text(item.time, xPos + cancelBoxWidth / 2, yPos + 5, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(75, 85, 99)
    doc.text(item.refund, xPos + cancelBoxWidth / 2, yPos + 10, { align: 'center' })
  })
  yPos += cancelBoxHeight + 3

  doc.setFontSize(7)
  doc.setTextColor(107, 114, 128)
  doc.text('Service fees are non-refundable. No-shows forfeit entire payment.', margin, yPos)
  yPos += 8

  // Section 6: Security Deposit Return
  checkNewPage(40)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('6. Security Deposit Return Process', margin, yPos)
  yPos += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.setFontSize(8)
  doc.text('Your security deposit is fully refundable when you meet these conditions:', margin, yPos)
  yPos += 5
  const depositConditions = [
    '• On-Time Return: Within 30-minute grace period',
    '• Fuel Level: Match the level at pickup',
    '• Vehicle Condition: Normal wear accepted',
    '• Interior: No smoking odor, excessive dirt, or stains',
    '• Mileage: Stay within agreed mileage allowance'
  ]
  depositConditions.forEach(item => {
    doc.text(item, margin + 3, yPos)
    yPos += 3.5
  })
  yPos += 3

  // Timeline notice box
  doc.setFillColor(254, 243, 199) // amber-50
  doc.setDrawColor(252, 211, 77) // amber-300
  doc.roundedRect(margin, yPos, contentWidth, 10, 1, 1, 'FD')
  doc.setFontSize(7)
  doc.setTextColor(146, 64, 14) // amber-800
  doc.setFont('helvetica', 'bold')
  doc.text('Timeline (Per A.R.S. §33-1321):', margin + 3, yPos + 4)
  doc.setFont('helvetica', 'normal')
  doc.text('Deposit released within 7-14 business days to original payment method.', margin + 50, yPos + 4)
  yPos += 14

  // Section 7: Platform Facilitator
  checkNewPage(30)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('7. Platform Facilitator Disclosure', margin, yPos)
  yPos += 5

  doc.setFillColor(249, 250, 251)
  doc.setDrawColor(229, 231, 235)
  doc.roundedRect(margin, yPos, contentWidth, 22, 2, 2, 'FD')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(75, 85, 99)
  const facilitatorText1 = 'Important: This rental agreement is entered into directly between the vehicle owner and the renter. ItWhip Technologies, Inc. operates solely as a marketplace facilitator under Arizona law (A.R.S. §42-5001) and is not a party to this rental contract.'
  const facilitatorLines1 = doc.splitTextToSize(facilitatorText1, contentWidth - 6)
  doc.text(facilitatorLines1, margin + 3, yPos + 4)

  const facilitatorText2 = 'The platform provides technology services including payment processing, messaging, and trip coordination. Any disputes regarding vehicle condition, availability, or rental terms are between host and guest.'
  const facilitatorLines2 = doc.splitTextToSize(facilitatorText2, contentWidth - 6)
  doc.text(facilitatorLines2, margin + 3, yPos + 14)
  yPos += 28

  // Section 8: Electronic Signature Consent
  checkNewPage(20)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('8. Electronic Signature Consent', margin, yPos)
  yPos += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.setFontSize(8)
  const esignText = 'By signing this agreement electronically, the Renter consents to conduct this transaction by electronic means and agrees that their electronic signature is legally binding under the Uniform Electronic Transactions Act (UETA) and the Electronic Signatures in Global and National Commerce Act (ESIGN).'
  const esignLines = doc.splitTextToSize(esignText, contentWidth)
  doc.text(esignLines, margin, yPos)
  yPos += esignLines.length * 3.5 + 6

  // === CUSTOM CLAUSES ===
  if (data.customClauses && data.customClauses.length > 0) {
    checkNewPage(20)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text('Additional Terms (Provider-Specific)', margin, yPos)
    yPos += 6

    data.customClauses.forEach((clause, index) => {
      checkNewPage(20)

      // Orange background for custom clauses
      const clauseLines = doc.splitTextToSize(clause, contentWidth - 10)
      const clauseHeight = clauseLines.length * 3.5 + 10

      doc.setFillColor(255, 247, 237) // orange-50
      doc.setDrawColor(253, 186, 116) // orange-300
      doc.roundedRect(margin, yPos, contentWidth, clauseHeight, 2, 2, 'FD')

      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(17, 24, 39)
      doc.text(`Additional Clause ${index + 1}`, margin + 3, yPos + 5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(75, 85, 99)
      doc.text(clauseLines, margin + 3, yPos + 10)
      yPos += clauseHeight + 4
    })
  }

  // === SIGNATURE SECTION ===
  checkNewPage(60)
  yPos += 5

  doc.setTextColor(17, 24, 39)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Electronic Signature', margin, yPos)
  yPos += 7

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.text('By signing below, you acknowledge that you have read, understood, and agree to be bound by all terms', margin, yPos)
  yPos += 4
  doc.text('and conditions of this Vehicle Rental Agreement.', margin, yPos)
  yPos += 10

  if (data.signature) {
    // Checkmark and agreement text
    doc.setFillColor(34, 197, 94) // green-500
    doc.circle(margin + 3, yPos, 2.5, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(6)
    doc.text('✓', margin + 1.8, yPos + 1)

    doc.setTextColor(75, 85, 99)
    doc.setFontSize(8)
    doc.text('I have read and agree to the terms and conditions above. I understand this is a legally binding agreement.', margin + 8, yPos + 1)
    yPos += 10

    // Signer name
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(8)
    doc.text('Full Legal Name:', margin, yPos)
    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    doc.text(data.signature.signerName, margin + 28, yPos)
    yPos += 8

    // Signature image
    doc.setTextColor(107, 114, 128)
    doc.setFont('helvetica', 'normal')
    doc.text('Signature:', margin, yPos)
    yPos += 3

    try {
      const signatureData = data.signature.signatureImage
      const base64Data = signatureData.includes(',')
        ? signatureData.split(',')[1]
        : signatureData

      // Signature box
      doc.setDrawColor(249, 115, 22) // orange border
      doc.setLineWidth(0.5)
      doc.roundedRect(margin, yPos, 70, 25, 2, 2, 'S')
      doc.addImage(base64Data, 'PNG', margin + 2, yPos + 2, 66, 21)
      yPos += 28

      // Signature details
      doc.setLineWidth(0.1)
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPos, margin + 70, yPos)
      yPos += 4

      doc.setFontSize(8)
      doc.setTextColor(17, 24, 39)
      doc.text(`Signed by: ${data.signature.signerName}`, margin, yPos)
      yPos += 4
      doc.setTextColor(75, 85, 99)
      doc.text(`Date: ${formatDate(data.signature.signedAt)}`, margin, yPos)
      yPos += 4
      doc.text(`IP Address: ${data.signature.ipAddress}`, margin, yPos)
    } catch (error) {
      console.error('Error adding signature image:', error)
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(margin, yPos, 70, 25, 2, 2, 'F')
      doc.setTextColor(150, 150, 150)
      doc.text('[Signature Image Error]', margin + 20, yPos + 14)
      yPos += 30
    }
  } else {
    // Unsigned state
    doc.setDrawColor(200, 200, 200)
    doc.setFillColor(250, 250, 250)
    doc.roundedRect(margin, yPos, 70, 25, 2, 2, 'FD')

    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text('Awaiting Signature', margin + 20, yPos + 14)
    yPos += 30

    doc.line(margin, yPos, margin + 70, yPos)
    yPos += 4
    doc.setFontSize(8)
    doc.text('Renter Signature', margin, yPos)
    yPos += 8
    doc.text('Date: _________________', margin, yPos)
  }

  // Legal note at bottom of signature section
  yPos += 8
  doc.setFontSize(7)
  doc.setTextColor(107, 114, 128)
  doc.text('By signing, you agree this electronic signature is legally binding under UETA and ESIGN Act.', margin, yPos)

  // === FOOTER ===
  const footerY = pageHeight - 12
  doc.setDrawColor(229, 231, 235)
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('Powered by', pageWidth / 2 - 15, footerY)
  doc.setTextColor(249, 115, 22)
  doc.setFont('helvetica', 'bold')
  doc.text('ItWhip', pageWidth / 2 + 2, footerY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text('- The trusted car rental marketplace', pageWidth / 2 + 13, footerY)

  // Return as base64 string
  return doc.output('datauristring')
}

/**
 * Generate PDF and return as Buffer for upload
 */
export async function generateAgreementPDFBuffer(data: AgreementData): Promise<Buffer> {
  // Generate PDF and convert to buffer
  const base64 = await generateAgreementPDF(data)
  const base64Data = base64.split(',')[1]
  return Buffer.from(base64Data, 'base64')
}
