// app/lib/agreements/generator.ts
// PDF Agreement Generator using jsPDF

import { jsPDF } from 'jspdf'

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

// Standard ItWhip rental agreement terms
const STANDARD_TERMS = [
  {
    title: '1. RENTAL PERIOD',
    content: 'The Renter agrees to rent the vehicle for the period specified above. Any extension of the rental period must be approved in advance by the Owner and may be subject to additional charges.'
  },
  {
    title: '2. RENTAL CHARGES',
    content: 'The Renter agrees to pay all rental charges as specified above, including but not limited to: daily rate, security deposit, delivery fees, and applicable taxes. Payment is due upon booking confirmation.'
  },
  {
    title: '3. SECURITY DEPOSIT',
    content: 'A security deposit will be held to cover potential damages, excess mileage, fuel costs, or other charges. The deposit will be refunded within 7 business days after the vehicle is returned, less any applicable deductions.'
  },
  {
    title: '4. MILEAGE POLICY',
    content: 'Mileage allowance is as agreed with the rental provider. Any excess mileage will be charged at the agreed-upon overage rate. Mileage readings at pickup and return will be documented.'
  },
  {
    title: '5. FUEL POLICY',
    content: 'The vehicle should be returned with the same fuel level as when picked up. If the vehicle is returned with less fuel, the Renter will be charged for refueling plus a service fee.'
  },
  {
    title: '6. INSURANCE REQUIREMENTS',
    content: 'The Renter must maintain valid auto insurance coverage during the rental period. The Renter agrees to provide proof of insurance upon request and assumes responsibility for any damage not covered by insurance.'
  },
  {
    title: '7. VEHICLE USE RESTRICTIONS',
    content: 'The vehicle may only be driven by authorized drivers listed on this agreement. The vehicle shall NOT be used for: racing, towing, off-road driving, transporting hazardous materials, illegal purposes, or subletting to third parties.'
  },
  {
    title: '8. DAMAGE LIABILITY',
    content: 'The Renter is responsible for any damage to the vehicle during the rental period, regardless of fault. The Renter agrees to report any accidents, damage, or mechanical issues immediately to the Owner.'
  },
  {
    title: '9. LATE RETURN',
    content: 'If the vehicle is returned late without prior approval, the Renter will be charged a late fee as specified by the Owner, which may include additional daily charges and penalties.'
  },
  {
    title: '10. VEHICLE CONDITION',
    content: 'The Renter acknowledges receiving the vehicle in good working condition and agrees to return it in the same condition, ordinary wear and tear excepted. A vehicle inspection will be conducted at pickup and return.'
  },
  {
    title: '11. ROADSIDE ASSISTANCE',
    content: 'In the event of a breakdown or emergency, the Renter should contact the Owner immediately. Unauthorized repairs may not be reimbursed.'
  },
  {
    title: '12. GOVERNING LAW',
    content: 'This agreement shall be governed by and construed in accordance with the laws of the State of Arizona. Any disputes arising from this agreement shall be resolved in the courts of Arizona.'
  },
  {
    title: '13. DISPUTE RESOLUTION',
    content: 'In the event of a dispute, the parties agree to first attempt resolution through the ItWhip platform\'s dispute resolution process before pursuing legal action.'
  },
  {
    title: '14. ELECTRONIC SIGNATURE CONSENT',
    content: 'By signing this agreement electronically, the Renter consents to conduct this transaction by electronic means and agrees that their electronic signature is legally binding under the Uniform Electronic Transactions Act (UETA) and the Electronic Signatures in Global and National Commerce Act (ESIGN).'
  }
]

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
 * Generate the rental agreement PDF
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
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPos = margin

  // Helper to add new page if needed
  const checkNewPage = (neededHeight: number = 20) => {
    if (yPos + neededHeight > pageHeight - margin) {
      doc.addPage()
      yPos = margin
    }
  }

  // === HEADER ===
  doc.setFillColor(249, 115, 22) // Orange
  doc.rect(0, 0, pageWidth, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('VEHICLE RENTAL AGREEMENT', pageWidth / 2, 18, { align: 'center' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Agreement #: ${data.booking.bookingCode}`, pageWidth / 2, 28, { align: 'center' })

  yPos = 45

  // === PARTIES SECTION ===
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('PARTIES TO THIS AGREEMENT', margin, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Owner/Partner info
  doc.setFont('helvetica', 'bold')
  doc.text('Owner/Provider:', margin, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.partner.companyName || data.partner.name, margin + 35, yPos)
  yPos += 5

  if (data.partner.email) {
    doc.text(`Email: ${data.partner.email}`, margin + 35, yPos)
    yPos += 5
  }
  if (data.partner.phone) {
    doc.text(`Phone: ${data.partner.phone}`, margin + 35, yPos)
    yPos += 5
  }
  if (data.partner.city && data.partner.state) {
    doc.text(`Location: ${data.partner.city}, ${data.partner.state}`, margin + 35, yPos)
    yPos += 5
  }

  yPos += 5

  // Renter info
  doc.setFont('helvetica', 'bold')
  doc.text('Renter:', margin, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.customer.name, margin + 35, yPos)
  yPos += 5
  doc.text(`Email: ${data.customer.email}`, margin + 35, yPos)
  if (data.customer.phone) {
    yPos += 5
    doc.text(`Phone: ${data.customer.phone}`, margin + 35, yPos)
  }

  yPos += 12

  // === VEHICLE DETAILS ===
  checkNewPage()
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, yPos - 4, contentWidth, 28, 'F')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('VEHICLE DETAILS', margin + 5, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Vehicle: ${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}`, margin + 5, yPos)
  yPos += 5
  if (data.vehicle.color) {
    doc.text(`Color: ${data.vehicle.color}`, margin + 5, yPos)
    yPos += 5
  }
  if (data.vehicle.licensePlate) {
    doc.text(`License Plate: ${data.vehicle.licensePlate}`, margin + 5, yPos)
  }
  if (data.vehicle.vin) {
    doc.text(`VIN: ${data.vehicle.vin}`, margin + 80, yPos)
  }

  yPos += 12

  // === RENTAL PERIOD ===
  checkNewPage()
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('RENTAL PERIOD', margin, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Start: ${formatDate(data.booking.startDate)} at ${data.booking.startTime}`, margin, yPos)
  yPos += 5
  doc.text(`End: ${formatDate(data.booking.endDate)} at ${data.booking.endTime}`, margin, yPos)
  yPos += 5
  doc.text(`Duration: ${data.booking.numberOfDays} day(s)`, margin, yPos)
  yPos += 5
  doc.text(`Pickup: ${data.booking.pickupLocation} (${data.booking.pickupType})`, margin, yPos)

  yPos += 12

  // === PRICING ===
  checkNewPage()
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, yPos - 4, contentWidth, 22, 'F')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('RENTAL CHARGES', margin + 5, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Daily Rate: ${formatCurrency(data.booking.dailyRate)}`, margin + 5, yPos)
  doc.text(`Total Amount: ${formatCurrency(data.booking.totalAmount)}`, margin + 80, yPos)
  yPos += 5
  doc.text(`Security Deposit: ${formatCurrency(data.booking.securityDeposit)}`, margin + 5, yPos)

  yPos += 15

  // === TERMS AND CONDITIONS ===
  checkNewPage(30)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TERMS AND CONDITIONS', margin, yPos)
  yPos += 10

  doc.setFontSize(9)
  for (const term of STANDARD_TERMS) {
    checkNewPage(25)

    doc.setFont('helvetica', 'bold')
    doc.text(term.title, margin, yPos)
    yPos += 5

    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(term.content, contentWidth)
    doc.text(lines, margin, yPos)
    yPos += lines.length * 4 + 5
  }

  // === CUSTOM CLAUSES ===
  if (data.customClauses && data.customClauses.length > 0) {
    checkNewPage(20)
    yPos += 5

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('ADDITIONAL TERMS (Provider-Specific)', margin, yPos)
    yPos += 10

    doc.setFontSize(9)
    data.customClauses.forEach((clause, index) => {
      checkNewPage(20)

      doc.setFont('helvetica', 'bold')
      doc.text(`${15 + index}. ADDITIONAL CLAUSE`, margin, yPos)
      yPos += 5

      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(clause, contentWidth)
      doc.text(lines, margin, yPos)
      yPos += lines.length * 4 + 5
    })
  }

  // === SIGNATURE SECTION ===
  checkNewPage(50)
  yPos += 10

  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('ELECTRONIC SIGNATURE', margin, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('By signing below, the Renter acknowledges that they have read, understood, and agree', margin, yPos)
  yPos += 5
  doc.text('to be bound by all terms and conditions of this Vehicle Rental Agreement.', margin, yPos)
  yPos += 15

  if (data.signature) {
    // Add signature image
    try {
      const signatureData = data.signature.signatureImage
      // Remove data URL prefix if present
      const base64Data = signatureData.includes(',')
        ? signatureData.split(',')[1]
        : signatureData

      doc.addImage(base64Data, 'PNG', margin, yPos, 60, 25)
      yPos += 30

      // Draw signature line
      doc.line(margin, yPos, margin + 80, yPos)
      yPos += 3

      doc.setFontSize(9)
      doc.text(`Signed by: ${data.signature.signerName}`, margin, yPos)
      yPos += 4
      doc.text(`Date: ${formatDate(data.signature.signedAt)}`, margin, yPos)
      yPos += 4
      doc.text(`IP Address: ${data.signature.ipAddress}`, margin, yPos)
    } catch (error) {
      console.error('Error adding signature image:', error)
      // Add placeholder if signature image fails
      doc.setFillColor(245, 245, 245)
      doc.rect(margin, yPos, 80, 25, 'F')
      doc.text('[Signature Image Error]', margin + 5, yPos + 15)
      yPos += 30
    }
  } else {
    // Signature placeholder for unsigned agreement
    doc.setDrawColor(200, 200, 200)
    doc.setFillColor(250, 250, 250)
    doc.rect(margin, yPos, 80, 30, 'FD')

    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text('Awaiting Signature', margin + 20, yPos + 17)
    doc.setTextColor(0, 0, 0)
    yPos += 35

    doc.line(margin, yPos, margin + 80, yPos)
    yPos += 3
    doc.setFontSize(9)
    doc.text('Renter Signature', margin, yPos)
    yPos += 10
    doc.text('Date: _________________', margin, yPos)
  }

  // === FOOTER ===
  yPos = pageHeight - 15
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Powered by ItWhip - The trusted car rental marketplace', pageWidth / 2, yPos, { align: 'center' })
  yPos += 4
  doc.text(`Generated on ${formatDate(new Date())}`, pageWidth / 2, yPos, { align: 'center' })

  // Return as base64 string
  return doc.output('datauristring')
}

/**
 * Generate PDF and return as Buffer for upload
 */
export async function generateAgreementPDFBuffer(data: AgreementData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  })

  // Use same generation logic but output as arraybuffer
  // For simplicity, regenerate the document
  const base64 = await generateAgreementPDF(data)
  const base64Data = base64.split(',')[1]
  return Buffer.from(base64Data, 'base64')
}
