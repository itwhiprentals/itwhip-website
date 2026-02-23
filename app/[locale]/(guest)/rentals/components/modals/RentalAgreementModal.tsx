// app/(guest)/rentals/components/modals/RentalAgreementModal.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { Link } from '@/i18n/navigation'
import {
  IoCloseOutline,
  IoDownloadOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoPrintOutline,
  IoWarningOutline,
  IoInformationCircleOutline,
  IoScaleOutline,
  IoReceiptOutline,
  IoWalletOutline,
  IoTimeOutline,
  IoCheckmarkDoneOutline,
  IoCarOutline,
  IoAlertCircleOutline,
  IoChevronDownOutline
} from 'react-icons/io5'
import {
  formatHostNameForAgreement,
  formatGuestNameForAgreement,
  isCompanyName
} from '@/app/lib/utils/namePrivacy'
import { getTaxRate, getCityFromAddress } from '@/app/[locale]/(guest)/rentals/lib/arizona-taxes'

interface RentalCarWithDetails {
  id: string
  make: string
  model: string
  year: number
  carType: string
  seats: number
  dailyRate: number
  rating?: number
  totalTrips?: number
  city?: string
  address?: string
  photos?: Array<{
    url: string
    alt?: string
  }>
  host?: {
    name: string
    profilePhoto?: string
    responseTime?: number
    isCompany?: boolean
  }
}

interface SavedBookingDetails {
  carId: string
  carClass: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  deliveryType: string
  deliveryAddress: string
  insuranceType: string
  addOns: {
    refuelService: boolean
    additionalDriver: boolean
    extraMiles: boolean
    vipConcierge: boolean
  }
  pricing: {
    days: number
    dailyRate: number
    basePrice: number
    insurancePrice: number
    deliveryFee: number
    serviceFee: number
    taxes: number
    total: number
    deposit: number
    creditsApplied?: number
    bonusApplied?: number
    chargeAmount?: number | null
    breakdown: {
      refuelService: number
      additionalDriver: number
      extraMiles: number
      vipConcierge: number
    }
  }
}

interface GuestDetails {
  name: string
  email: string
  bookingCode: string
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  approvedAt?: Date | string
  approvedBy?: string
}

interface AgreementTracking {
  viewedAt?: Date | string
  agreedAt?: Date | string
  ipAddress?: string
}

interface RentalAgreementModalProps {
  isOpen: boolean
  onClose: () => void
  carDetails?: RentalCarWithDetails
  bookingDetails?: SavedBookingDetails
  guestDetails?: GuestDetails
  context?: 'preview' | 'booking' | 'dashboard'
  agreementTracking?: AgreementTracking
  onAgree?: (accepted: boolean) => void
  isDraft?: boolean // true = pre-booking preview (mask names), false = confirmed legal document (full names)
  bookingStatus?: string
}

// Helper function to determine vehicle tier and coverage
const getVehicleTierInfo = (carType?: string, dailyRate?: number) => {
  if (!carType || !dailyRate) {
    return {
      tier: 'standard',
      deposit: 500,
      deductible: 500,
      liability: '$750,000',
      commission: '15%',
      minAge: 21,
      creditScore: null
    }
  }

  // Determine tier based on car type and daily rate
  if (carType === 'exotic' || dailyRate > 500) {
    return {
      tier: 'exotic',
      deposit: 2500,
      deductible: 2500,
      liability: '$2,000,000',
      commission: '22%',
      minAge: 30,
      creditScore: 750
    }
  } else if (carType === 'luxury' || carType === 'premium' || dailyRate > 200) {
    return {
      tier: carType === 'premium' || dailyRate > 350 ? 'premium' : 'luxury',
      deposit: carType === 'premium' || dailyRate > 350 ? 1000 : 750,
      deductible: carType === 'premium' || dailyRate > 350 ? 1000 : 750,
      liability: carType === 'premium' || dailyRate > 350 ? '$1,500,000' : '$1,000,000',
      commission: carType === 'premium' || dailyRate > 350 ? '20%' : '18%',
      minAge: carType === 'premium' || dailyRate > 350 ? 30 : 25,
      creditScore: carType === 'premium' || dailyRate > 350 ? 750 : 700
    }
  } else {
    return {
      tier: 'standard',
      deposit: 500,
      deductible: 500,
      liability: '$750,000',
      commission: '15%',
      minAge: 21,
      creditScore: null
    }
  }
}

export default function RentalAgreementModal({
  isOpen,
  onClose,
  carDetails,
  bookingDetails,
  guestDetails,
  context = 'preview',
  agreementTracking,
  onAgree,
  isDraft = true, // Default to draft mode (pre-booking preview)
  bookingStatus,
}: RentalAgreementModalProps) {
  const t = useTranslations('RentalAgreement')
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [agreementAccepted, setAgreementAccepted] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const tierInfo = getVehicleTierInfo(carDetails?.carType, carDetails?.dailyRate)
  const isVerified = guestDetails?.verificationStatus === 'APPROVED'
  const isPending = guestDetails?.verificationStatus === 'PENDING'

  // Get city-specific Arizona tax rate
  // Use city first, fallback to parsing address
  const carCity = carDetails?.city || getCityFromAddress(carDetails?.address || 'Phoenix, AZ')
  const { display: taxRateDisplay } = getTaxRate(carCity)

  // Privacy-aware name formatting based on draft/confirmed state
  const hostIsCompany = carDetails?.host?.isCompany || isCompanyName(carDetails?.host?.name || '')
  const hostDisplayName = formatHostNameForAgreement(
    carDetails?.host?.name,
    hostIsCompany,
    isDraft
  )
  const guestDisplayName = formatGuestNameForAgreement(guestDetails?.name, isDraft)

  useEffect(() => {
    // Track agreement view
    if (isOpen && context === 'booking' && !agreementTracking?.viewedAt) {
      // This would typically call an API to track the view
      console.log('Agreement viewed at:', new Date().toISOString())
    }
  }, [isOpen, context, agreementTracking])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const threshold = 50
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < threshold
    if (isNearBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true)
    }
  }

  const handlePrint = () => {
    const content = contentRef.current
    if (!content) return

    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) {
      alert('Please allow pop-ups to print the agreement.')
      return
    }

    const creditsApplied = bookingDetails?.pricing?.creditsApplied ?? 0
    const bonusApplied = bookingDetails?.pricing?.bonusApplied ?? 0
    const hasCreditsOrBonus = creditsApplied > 0 || bonusApplied > 0

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ItWhip Rental Agreement${guestDetails?.bookingCode ? ` - ${guestDetails.bookingCode}` : ''}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; padding: 24px; max-width: 800px; margin: 0 auto; font-size: 12px; line-height: 1.5; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          h3 { font-size: 14px; margin-bottom: 8px; }
          h4 { font-size: 12px; margin-bottom: 6px; }
          .header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #111; }
          .header img { height: 40px; width: auto; }
          .header-text { flex: 1; }
          .meta { color: #6b7280; font-size: 11px; margin-top: 4px; }
          .section { margin-bottom: 16px; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; page-break-inside: avoid; }
          .section-title { font-weight: 600; font-size: 12px; margin-bottom: 8px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .row .label { color: #6b7280; }
          .row .value { font-weight: 500; }
          .divider { border-top: 1px solid #d1d5db; margin: 8px 0; }
          .total-row { font-size: 14px; font-weight: 700; }
          .credit { color: #16a34a; }
          .charged-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px; border-radius: 4px; margin-top: 6px; }
          .deposit-box { background: #fffbeb; border: 1px solid #fde68a; padding: 8px; border-radius: 4px; margin-top: 6px; }
          .terms-section { margin-bottom: 12px; }
          .terms-section h4 { margin-bottom: 4px; }
          .terms-section p, .terms-section li { font-size: 11px; color: #4b5563; }
          ul, ol { padding-left: 16px; }
          li { margin-bottom: 2px; }
          .footer { text-align: center; color: #9ca3af; font-size: 10px; margin-top: 24px; padding-top: 12px; border-top: 1px solid #d1d5db; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          @media print { body { padding: 12px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/logo.png" alt="ItWhip" onerror="this.style.display='none'" />
          <div class="header-text">
            <h1>Vehicle Rental Agreement</h1>
            <div class="meta">ItWhip Technologies, Inc.</div>
            ${guestDetails?.bookingCode ? `<div class="meta">Booking Reference: ${guestDetails.bookingCode}</div>` : ''}
            <div class="meta">Generated: ${format(new Date(), 'MMMM d, yyyy')}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Rental Agreement Parties</div>
          <div><strong>Vehicle Owner (Host):</strong> ${hostDisplayName}</div>
          <div><strong>Renter (Guest):</strong> ${guestDisplayName}</div>
          <div><strong>Platform Facilitator:</strong> ItWhip Technologies, Inc.</div>
          <div><strong>Governing Law:</strong> State of Arizona</div>
          <div><strong>Venue:</strong> Maricopa County Superior Court</div>
        </div>

        ${carDetails && bookingDetails ? `
        <div class="section">
          <div class="section-title">Vehicle & Rental Period</div>
          <div><strong>Vehicle:</strong> ${carDetails.year} ${carDetails.make} ${carDetails.model}</div>
          <div><strong>Category:</strong> ${carDetails.carType || 'Standard'} (${carDetails.seats} seats)</div>
          <div><strong>Pickup:</strong> ${format(new Date(bookingDetails.startDate), 'MMMM d, yyyy')} at ${bookingDetails.startTime}</div>
          <div><strong>Return:</strong> ${format(new Date(bookingDetails.endDate), 'MMMM d, yyyy')} at ${bookingDetails.endTime}</div>
          <div><strong>Location:</strong> ${bookingDetails.deliveryAddress || 'Phoenix, AZ'}</div>
          <div><strong>Total Days:</strong> ${bookingDetails.pricing.days}</div>
        </div>
        ` : ''}

        <div class="terms-section"><h4>1. Driver Eligibility</h4><p>The renter must be at least ${tierInfo.minAge} years of age and possess a valid driver's license active for a minimum of one year.</p></div>
        <div class="terms-section"><h4>2. Authorized Use & Restrictions</h4><p>Prohibited: racing, towing, off-road driving, commercial use/rideshare/delivery, hazardous materials, driving outside Arizona without permission, unauthorized operators.</p></div>
        <div class="terms-section"><h4>3. Renter Responsibilities</h4><p>Return with same fuel level. Maintain vehicle condition. Lock when unattended. Report issues immediately. No smoking/vaping ($250 fee). No unauthorized pets ($100 fee). Pay tolls/parking/violations. 200 miles/day limit ($0.45/mi excess).</p></div>
        <div class="terms-section"><h4>4. Accident & Emergency</h4><p>Ensure safety, call 911, contact police (A.R.S. §28-667), document with photos, exchange info, report to host/ItWhip, do not admit fault.</p></div>
        <div class="terms-section"><h4>5. Cancellation Policy</h4><p>72+ hrs: 100% refund | 24-72 hrs: 75% | 12-24 hrs: 50% | &lt;12 hrs: No refund. Service fees non-refundable.</p></div>
        <div class="terms-section"><h4>6. Platform Facilitator Disclosure</h4><p>This agreement is between ${hostDisplayName} and ${guestDisplayName}. ItWhip Technologies, Inc. is a marketplace facilitator (A.R.S. §42-5001), not a party to this contract.</p></div>

        ${bookingDetails ? `
        <div class="section">
          <div class="section-title">Payment Summary</div>
          <div class="row"><span class="label">Daily Rate ($${bookingDetails.pricing.dailyRate.toFixed(2)}/day × ${bookingDetails.pricing.days} days)</span><span class="value">$${bookingDetails.pricing.basePrice.toFixed(2)}</span></div>
          ${bookingDetails.pricing.insurancePrice > 0 ? `<div class="row"><span class="label">Trip Protection</span><span class="value">$${bookingDetails.pricing.insurancePrice.toFixed(2)}</span></div>` : ''}
          ${bookingDetails.pricing.deliveryFee > 0 ? `<div class="row"><span class="label">Delivery Fee</span><span class="value">$${bookingDetails.pricing.deliveryFee.toFixed(2)}</span></div>` : ''}
          <div class="row"><span class="label">Service Fee</span><span class="value">$${bookingDetails.pricing.serviceFee.toFixed(2)}</span></div>
          <div class="row"><span class="label">Arizona Tax (${taxRateDisplay})</span><span class="value">$${bookingDetails.pricing.taxes.toFixed(2)}</span></div>
          ${creditsApplied > 0 ? `<div class="row credit"><span class="label">Credits Applied</span><span class="value">-$${creditsApplied.toFixed(2)}</span></div>` : ''}
          ${bonusApplied > 0 ? `<div class="row credit"><span class="label">Bonus Applied</span><span class="value">-$${bonusApplied.toFixed(2)}</span></div>` : ''}
          <div class="divider"></div>
          <div class="row total-row"><span>Total</span><span>$${bookingDetails.pricing.total.toFixed(2)}</span></div>
          ${hasCreditsOrBonus ? `
          <div class="charged-box">
            <div class="row total-row credit"><span>Charged to Card</span><span>$${(bookingDetails.pricing.chargeAmount != null ? bookingDetails.pricing.chargeAmount : bookingDetails.pricing.total - creditsApplied - bonusApplied).toFixed(2)}</span></div>
          </div>` : ''}
          <div class="deposit-box">
            <div class="row"><span><strong>Security Deposit (Hold)</strong></span><span class="value">$${tierInfo.deposit.toFixed(2)}</span></div>
            <div style="font-size:10px;color:#6b7280;margin-top:2px;">Refundable per A.R.S. §33-1321(D)</div>
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <p>This electronic agreement has the same legal validity as a written signature under the Uniform Electronic Transactions Act.</p>
          <p>Platform services provided by ItWhip Technologies, Inc. | Arizona Marketplace Facilitator</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  const handleDownload = async () => {
    try {
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15
      const contentWidth = pageWidth - margin * 2
      let y = 20

      // Load logo
      let logoBase64: string | null = null
      try {
        const response = await fetch('/logo.png')
        const blob = await response.blob()
        logoBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch { /* logo optional */ }

      const addLine = (text: string, fontSize: number, bold = false, color: [number, number, number] = [0, 0, 0]) => {
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', bold ? 'bold' : 'normal')
        doc.setTextColor(...color)
        const lines = doc.splitTextToSize(text, contentWidth)
        if (y + lines.length * (fontSize * 0.5) > 275) {
          doc.addPage()
          y = 20
        }
        doc.text(lines, margin, y)
        y += lines.length * (fontSize * 0.45) + 2
      }

      const addGap = (gap = 4) => { y += gap }

      // Header with logo
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin, y - 4, 14, 14)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('VEHICLE RENTAL AGREEMENT', margin + 18, y + 2)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text('ItWhip Technologies, Inc.', margin + 18, y + 7)
        y += 14
      } else {
        addLine('VEHICLE RENTAL AGREEMENT', 16, true)
        addLine('ItWhip Technologies, Inc.', 10, false, [100, 100, 100])
      }
      addGap(2)
      if (guestDetails?.bookingCode) {
        addLine(`Booking Reference: ${guestDetails.bookingCode}`, 10, false, [80, 80, 80])
      }
      addLine(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 9, false, [120, 120, 120])
      addGap(6)

      // Parties
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageWidth - margin, y)
      addGap(4)
      addLine('RENTAL AGREEMENT PARTIES', 11, true)
      addLine(`Vehicle Owner (Host): ${hostDisplayName}`, 9)
      addLine(`Renter (Guest): ${guestDisplayName}`, 9)
      addLine('Platform Facilitator: ItWhip Technologies, Inc.', 9)
      addLine('Governing Law: State of Arizona', 9)
      addLine('Venue: Maricopa County Superior Court', 9)
      addGap(4)

      // Vehicle & Rental
      if (carDetails && bookingDetails) {
        doc.line(margin, y, pageWidth - margin, y)
        addGap(4)
        addLine('VEHICLE & RENTAL PERIOD', 11, true)
        addLine(`Vehicle: ${carDetails.year} ${carDetails.make} ${carDetails.model}`, 9)
        addLine(`Category: ${carDetails.carType || 'Standard'} (${carDetails.seats} seats)`, 9)
        addLine(`Pickup: ${format(new Date(bookingDetails.startDate), 'MMMM d, yyyy')} at ${bookingDetails.startTime}`, 9)
        addLine(`Return: ${format(new Date(bookingDetails.endDate), 'MMMM d, yyyy')} at ${bookingDetails.endTime}`, 9)
        addLine(`Location: ${bookingDetails.deliveryAddress || 'Phoenix, AZ'}`, 9)
        addLine(`Total Days: ${bookingDetails.pricing.days}`, 9)
        addGap(4)
      }

      // Terms sections
      const sections = [
        { title: '1. DRIVER ELIGIBILITY', text: `The renter must be at least ${tierInfo.minAge} years of age and possess a valid driver's license active for a minimum of one year. International renters must provide a valid passport and international driving permit if their license is not in English.` },
        { title: '2. AUTHORIZED USE & RESTRICTIONS', text: 'The vehicle may only be operated on properly maintained roads and highways. Prohibited uses include: racing, towing, off-road driving, commercial use including rideshare or delivery, transporting hazardous materials, driving outside Arizona without written permission, and allowing unauthorized persons to operate the vehicle.' },
        { title: '3. RENTER RESPONSIBILITIES', text: 'Return the vehicle with the same fuel level as at pickup. Maintain the vehicle in the same condition as received. Lock the vehicle when unattended. Report any mechanical issues immediately. No smoking/vaping ($250 cleaning fee). No unauthorized pets ($100 cleaning fee). Pay all tolls, parking fees, and traffic violations. Do not exceed 200 miles per day average (excess at $0.45 per mile).' },
        { title: '4. ACCIDENT & EMERGENCY', text: 'In case of accident: ensure safety, call 911 if needed, contact police and obtain report number (A.R.S. §28-667), document scene with photos, exchange information, report to host and ItWhip support immediately, do not admit fault.' },
        { title: '5. CANCELLATION POLICY', text: '72+ hours before: 100% refund. 24-72 hours: 75% refund. 12-24 hours: 50% refund. Under 12 hours: No refund. Service fees non-refundable. No-shows forfeit entire payment.' },
        { title: '6. PLATFORM FACILITATOR DISCLOSURE', text: `This rental agreement is between ${hostDisplayName} and ${guestDisplayName}. ItWhip Technologies, Inc. operates as a marketplace facilitator under Arizona law (A.R.S. §42-5001) and is not a party to this rental contract.` }
      ]

      for (const section of sections) {
        doc.line(margin, y, pageWidth - margin, y)
        addGap(4)
        addLine(section.title, 10, true)
        addLine(section.text, 9)
        addGap(2)
      }

      // Payment Summary
      if (bookingDetails) {
        doc.line(margin, y, pageWidth - margin, y)
        addGap(4)
        addLine('PAYMENT SUMMARY', 11, true)
        const p = bookingDetails.pricing
        addLine(`Daily Rate: $${p.dailyRate.toFixed(2)}/day x ${p.days} days = $${p.basePrice.toFixed(2)}`, 9)
        if (p.insurancePrice > 0) addLine(`Trip Protection: $${p.insurancePrice.toFixed(2)}`, 9)
        if (p.deliveryFee > 0) addLine(`Delivery Fee: $${p.deliveryFee.toFixed(2)}`, 9)
        addLine(`Service Fee: $${p.serviceFee.toFixed(2)}`, 9)
        addLine(`Arizona TPT Tax (${taxRateDisplay}): $${p.taxes.toFixed(2)}`, 9)
        const pCredits = p.creditsApplied ?? 0
        const pBonus = p.bonusApplied ?? 0
        if (pCredits > 0) addLine(`Credits Applied: -$${pCredits.toFixed(2)}`, 9, false, [22, 163, 74])
        if (pBonus > 0) addLine(`Bonus Applied: -$${pBonus.toFixed(2)}`, 9, false, [22, 163, 74])
        addGap(2)
        addLine(`TOTAL: $${p.total.toFixed(2)}`, 11, true)
        if (pCredits > 0 || pBonus > 0) {
          const actualCharged = p.chargeAmount != null ? p.chargeAmount : p.total - pCredits - pBonus
          addLine(`CHARGED TO CARD: $${actualCharged.toFixed(2)}`, 10, true, [22, 163, 74])
        }
        addLine(`Security Deposit (Authorization Hold): $${p.deposit.toFixed(2)}`, 9)
        addLine('Deposit refundable per A.R.S. §33-1321(D)', 8, false, [120, 120, 120])
        addGap(4)
      }

      // Footer
      doc.line(margin, y, pageWidth - margin, y)
      addGap(4)
      addLine('This electronic agreement has the same legal validity as a written signature under the Uniform Electronic Transactions Act.', 8, false, [120, 120, 120])
      addLine('Platform services provided by ItWhip Technologies, Inc. | Arizona Marketplace Facilitator', 8, false, [150, 150, 150])

      const filename = guestDetails?.bookingCode
        ? `ItWhip-Agreement-${guestDetails.bookingCode}.pdf`
        : 'ItWhip-Rental-Agreement.pdf'
      doc.save(filename)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Unable to generate PDF. Please try printing instead.')
    }
  }

  const handleAgree = () => {
    setAgreementAccepted(true)
    if (onAgree) {
      onAgree(true)
    }
    // Track agreement acceptance
    console.log('Agreement accepted at:', new Date().toISOString())
  }

  if (!isOpen) return null

  return (
    <>
      {/* Print uses a new window — hide print-only elements on screen */}
      <style jsx global>{`
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm no-print"
        onClick={onClose}
      />

      {/* Bottom Sheet on mobile, Modal on desktop */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 z-50 flex md:items-center md:justify-center pointer-events-none no-print">
        <div className="bg-white dark:bg-gray-800 w-full md:max-w-4xl md:mx-auto rounded-t-2xl md:rounded-lg border border-gray-200 dark:border-gray-700 shadow-2xl pointer-events-auto max-h-[90vh] md:max-h-[85vh] flex flex-col relative">
          {/* Watermark for Pending/Preview/Cancelled */}
          {(isPending || context === 'preview' || bookingStatus === 'CANCELLED') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-10">
              <div className="transform -rotate-45">
                <p className={`text-4xl sm:text-6xl font-bold ${
                  bookingStatus === 'CANCELLED' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                }`}>
                  {bookingStatus === 'CANCELLED' ? t('cancelledWatermark') : context === 'preview' ? t('draftWatermark') : t('pendingWatermark')}
                </p>
              </div>
            </div>
          )}

          {/* Drag Handle - Mobile only */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Header - Mobile Optimized */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between no-print">
            <div className="flex-1 mr-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
              {guestDetails && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                  {t('booking')}: {guestDetails.bookingCode}
                  {isVerified && <span className="ml-2 text-green-600 dark:text-green-400">✓ {t('verified')}</span>}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <IoCloseOutline className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Guest Details Bar - Mobile Optimized */}
          {guestDetails && (
            <div className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 no-print">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="text-xs sm:text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">{t('renter')}:</span> <span className="text-gray-900 dark:text-white">{guestDisplayName}</span>
                  {!isDraft && <span className="ml-2 sm:ml-4 text-gray-600 dark:text-gray-400 break-all">{guestDetails.email}</span>}
                </div>
                <div className="flex items-center space-x-2">
                  {isVerified ? (
                    <span className="flex items-center text-xs sm:text-sm text-green-600 dark:text-green-400">
                      <IoCheckmarkCircleOutline className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {guestDetails.approvedAt ? t('verifiedOn', { date: format(new Date(guestDetails.approvedAt), 'MMM d, yyyy') }) : t('verified')}
                    </span>
                  ) : isPending ? (
                    <span className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <IoWarningOutline className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {t('pendingVerification')}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Print Header (only shows when printing) */}
          <div className="print-only mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="ItWhip" className="h-10 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-center">{t('title')}</h1>
            {guestDetails && (
              <div className="text-center mt-2">
                <p>{t('bookingCode')}: {guestDetails.bookingCode}</p>
                <p>{t('renter')}: {guestDisplayName}</p>
                <p>{t('host')}: {hostDisplayName}</p>
                <p>{t('agreementDate')}: {isVerified && guestDetails.approvedAt ? format(new Date(guestDetails.approvedAt), 'MMMM d, yyyy') : t('pendingVerification')}</p>
              </div>
            )}
          </div>

          {/* Scrollable Content - Mobile Optimized */}
          <div 
            ref={contentRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 rental-agreement-content"
          >
            <div className="prose prose-sm max-w-none">
              
              {/* Agreement Parties Section */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('partiesHeading')}</h4>
                <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                  <div><span className="font-medium">{t('vehicleOwner')}:</span> {hostDisplayName}</div>
                  <div><span className="font-medium">{t('renterGuest')}:</span> {guestDisplayName}</div>
                  <div><span className="font-medium">{t('platformFacilitator')}:</span> ItWhip Technologies, Inc.</div>
                  <div><span className="font-medium">{t('governingLaw')}:</span> State of Arizona</div>
                  <div><span className="font-medium">{t('venue')}:</span> Maricopa County Superior Court</div>
                </div>
              </div>

              {/* Vehicle and Rental Details */}
              {carDetails && bookingDetails && (
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('vehicleRentalPeriod')}</h4>
                  <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    <div><span className="font-medium">{t('vehicle')}:</span> {carDetails.year} {carDetails.make} {carDetails.model}</div>
                    <div><span className="font-medium">{t('category')}:</span> {carDetails.carType || 'Standard'} ({carDetails.seats} seats)</div>
                    <div><span className="font-medium">{t('pickupDate')}:</span> {format(new Date(bookingDetails.startDate), 'MMMM d, yyyy')} at {bookingDetails.startTime}</div>
                    <div><span className="font-medium">{t('returnDate')}:</span> {format(new Date(bookingDetails.endDate), 'MMMM d, yyyy')} at {bookingDetails.endTime}</div>
                    <div><span className="font-medium">{t('pickupLocation')}:</span> {bookingDetails.deliveryAddress}</div>
                    <div><span className="font-medium">{t('totalDays')}:</span> {bookingDetails.pricing.days}</div>
                  </div>
                </div>
              )}

              {/* Arizona Legal Compliance */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-start">
                  <IoScaleOutline className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('arizonaLegalRequirements')}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 mb-2">
                      This agreement complies with all applicable Arizona state laws governing vehicle rentals and peer-to-peer car sharing arrangements.
                      Both parties acknowledge and agree to the following statutory requirements:
                    </p>
                    <ul className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 space-y-1">
                      <li>• Driver eligibility verification required per A.R.S. §28-3472</li>
                      <li>• Security deposits handled per A.R.S. §33-1321</li>
                      <li>• Peer-to-peer rental compliance per A.R.S. §28-9601</li>
                      <li>• Insurance requirements per A.R.S. §20-331</li>
                      <li>• Transaction Privilege Tax collection per A.R.S. §42-5061</li>
                      <li>• Marketplace facilitator obligations per A.R.S. §42-5001</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Trip Protection Coverage */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-start">
                  <IoShieldCheckmarkOutline className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('tripProtectionCoverage')}</h4>

                    {/* Selected Insurance Type */}
                    {bookingDetails?.insuranceType && (
                      <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                        <p className="text-[10px] sm:text-xs font-medium text-amber-800 dark:text-amber-200">
                          {t('selectedCoverage')}: {
                            bookingDetails.insuranceType === 'basic' ? t('basicProtection') :
                            bookingDetails.insuranceType === 'standard' ? t('standardProtection') :
                            bookingDetails.insuranceType === 'premium' ? t('premiumProtection') :
                            bookingDetails.insuranceType
                          }
                        </p>
                      </div>
                    )}

                    <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 mb-2">
                      This rental includes comprehensive trip protection coverage. In the event of an accident or damage,
                      you are protected with the following coverage limits and responsibilities:
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">{t('liabilityCoverage')}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{tierInfo.liability} maximum</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">{t('yourDeductible')}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">${tierInfo.deductible.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">{t('personalEffects')}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">$500 maximum</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-gray-900 dark:text-white">{t('lossOfUse')}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{t('covered')}</p>
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Coverage excludes intentional damage, driving under influence, unauthorized use, and commercial activities.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white">{t('termsAndConditions')}</h3>

              <section className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900 dark:text-white">{t('driverEligibility')}</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-2">
                  The renter must be at least {tierInfo.minAge} years of age and possess a valid driver's license that has been active for
                  a minimum of one year. International renters must provide a valid passport and international driving permit if their
                  license is not in English. The renter agrees to be the sole operator of the vehicle unless additional drivers have been
                  authorized and added to this agreement with applicable fees paid.
                </p>
              </section>

              <section className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900 dark:text-white">{t('authorizedUse')}</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-2">
                  The vehicle may only be operated on properly maintained roads and highways. The following uses are strictly prohibited:
                </p>
                <ul className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 space-y-0.5 sm:space-y-1 ml-4">
                  <li>• Racing, speed testing, or any type of competition</li>
                  <li>• Towing or pushing any vehicle or trailer</li>
                  <li>• Off-road driving or driving on unpaved surfaces</li>
                  <li>• Commercial use including rideshare or delivery services</li>
                  <li>• Transporting hazardous materials or illegal substances</li>
                  <li>• Driving outside Arizona without written permission</li>
                  <li>• Allowing unauthorized persons to operate the vehicle</li>
                </ul>
              </section>

              <section className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900 dark:text-white">{t('renterResponsibilities')}</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-2">
                  The renter agrees to the following responsibilities during the rental period:
                </p>
                <ul className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 space-y-0.5 sm:space-y-1 ml-4">
                  <li>• Return the vehicle with the same fuel level as at pickup</li>
                  <li>• Maintain the vehicle in the same condition as received, accounting for normal wear</li>
                  <li>• Lock the vehicle when unattended and safeguard keys at all times</li>
                  <li>• Report any mechanical issues, warning lights, or damage immediately</li>
                  <li>• Not smoke, vape, or allow smoking/vaping in the vehicle ($250 cleaning fee)</li>
                  <li>• Not transport pets without prior approval ($100 cleaning fee if unauthorized)</li>
                  <li>• Pay all tolls, parking fees, and traffic violations incurred during rental</li>
                  <li>• Not exceed 200 miles per day average (excess at $0.45 per mile)</li>
                </ul>
              </section>

              <section className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900 dark:text-white">{t('accidentEmergency')}</h4>
                <div className="border border-gray-200 dark:border-gray-600 rounded p-2 sm:p-3 bg-gray-50 dark:bg-gray-800">
                  <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 font-medium mb-2">{t('inCaseOfEmergency')}</p>
                  <ol className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 space-y-0.5 sm:space-y-1 list-decimal ml-3 sm:ml-4">
                    <li>Ensure safety of all parties and call 911 if medical attention needed</li>
                    <li>Contact local police and obtain report number (required per A.R.S. §28-667)</li>
                    <li>Document scene with photos of all vehicles, damage, and surroundings</li>
                    <li>Exchange information with all parties involved</li>
                    <li>Report to host and ItWhip support immediately via app</li>
                    <li>Do not admit fault or make statements about the accident to anyone except police</li>
                    <li>Obtain witness contact information if available</li>
                  </ol>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <span className="font-medium">24/7 Support:</span> Available through app messaging or emergency line
                  </p>
                </div>
              </section>

              <section className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900 dark:text-white">{t('cancellationPolicy')}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 text-[10px] sm:text-xs mb-2">
                  <div className="text-center p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                    <div className="font-semibold text-gray-900 dark:text-white">72+ hours</div>
                    <div className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400">100% refund</div>
                  </div>
                  <div className="text-center p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                    <div className="font-semibold text-gray-900 dark:text-white">24-72 hours</div>
                    <div className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400">75% refund</div>
                  </div>
                  <div className="text-center p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                    <div className="font-semibold text-gray-900 dark:text-white">12-24 hours</div>
                    <div className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400">50% refund</div>
                  </div>
                  <div className="text-center p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                    <div className="font-semibold text-gray-900 dark:text-white">&lt;12 hours</div>
                    <div className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400">{t('noRefund')}</div>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  Service fees are non-refundable. Taxes refunded per Arizona regulations. No-shows forfeit entire payment.
                </p>
              </section>

              <section className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-900 dark:text-white">{t('platformDisclosure')}</h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 sm:p-3 border border-gray-200 dark:border-gray-600">
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-medium">Important:</span> This rental agreement is entered into directly between the vehicle owner
                    ({hostDisplayName}) and the renter ({guestDisplayName}). ItWhip Technologies, Inc. operates solely as a
                    marketplace facilitator under Arizona law (A.R.S. §42-5001) and is not a party to this rental contract.
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                    The platform provides technology services including payment processing, messaging, and trip coordination.
                    Any disputes regarding vehicle condition, availability, or rental terms are between host and guest.
                    The platform's liability is limited to the services it directly provides.
                  </p>
                </div>
              </section>

              {/* Payment Receipt Section - Moved to end */}
              {bookingDetails && (
                <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-start mb-3">
                    <IoReceiptOutline className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3">{t('paymentSummary')}</h3>

                      {/* Charges Breakdown */}
                      <div className="space-y-1.5 mb-3 text-[10px] sm:text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('dailyRate')} (${bookingDetails.pricing.dailyRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{t('day')} × {bookingDetails.pricing.days} {t('days')})</span>
                          <span className="font-medium text-gray-900 dark:text-white">${bookingDetails.pricing.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        {bookingDetails.pricing.insurancePrice > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{t('tripProtection')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">${bookingDetails.pricing.insurancePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}

                        {bookingDetails.pricing.deliveryFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{t('deliveryPickupService')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">${bookingDetails.pricing.deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}

                        {/* Add-ons */}
                        {bookingDetails.pricing.breakdown.refuelService > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{t('prepaidRefuelService')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">${bookingDetails.pricing.breakdown.refuelService.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {bookingDetails.pricing.breakdown.additionalDriver > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{t('additionalDriverCoverage')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">${bookingDetails.pricing.breakdown.additionalDriver.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {bookingDetails.pricing.breakdown.extraMiles > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{t('unlimitedMilesPackage')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">${bookingDetails.pricing.breakdown.extraMiles.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('platformServiceFee')}</span>
                          <span className="font-medium text-gray-900 dark:text-white">${bookingDetails.pricing.serviceFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between pt-1.5 border-t border-gray-300 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
                          <span className="font-medium text-gray-900 dark:text-white">${(bookingDetails.pricing.total - bookingDetails.pricing.taxes).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('arizonaTax')} ({taxRateDisplay})</span>
                          <span className="font-medium text-gray-900 dark:text-white">${bookingDetails.pricing.taxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        {/* Credits & Bonus Applied */}
                        {(bookingDetails.pricing.creditsApplied ?? 0) > 0 && (
                          <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span>Credits Applied</span>
                            <span className="font-medium">-${(bookingDetails.pricing.creditsApplied ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {(bookingDetails.pricing.bonusApplied ?? 0) > 0 && (
                          <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span>Bonus Applied</span>
                            <span className="font-medium">-${(bookingDetails.pricing.bonusApplied ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>

                      {/* Total and Deposit */}
                      <div className="space-y-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                        <div className="flex justify-between text-sm sm:text-base">
                          <span className="font-bold text-gray-900 dark:text-white">{t('totalAmountPaid')}</span>
                          <span className="font-bold text-gray-900 dark:text-white">${bookingDetails.pricing.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        {/* Amount Actually Charged (when credits/bonus applied) */}
                        {((bookingDetails.pricing.creditsApplied ?? 0) > 0 || (bookingDetails.pricing.bonusApplied ?? 0) > 0) && (
                          <div className="flex justify-between text-sm sm:text-base bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                            <span className="font-semibold text-green-800 dark:text-green-300">Charged to Card</span>
                            <span className="font-semibold text-green-800 dark:text-green-300">
                              ${(bookingDetails.pricing.chargeAmount != null
                                ? bookingDetails.pricing.chargeAmount
                                : bookingDetails.pricing.total - (bookingDetails.pricing.creditsApplied ?? 0) - (bookingDetails.pricing.bonusApplied ?? 0)
                              ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-yellow-100">{t('securityDepositHold')}</span>
                            <p className="text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400">Refundable per A.R.S. §33-1321(D)</p>
                          </div>
                          <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">${tierInfo.deposit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-2">
                          Payment processed on {format(new Date(), 'MMMM d, yyyy')}. This receipt serves as proof of payment for tax purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Deposit Return Process */}
              <div className="p-3 sm:p-4 mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-start">
                  <IoWalletOutline className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('depositReturnProcess')}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Your ${tierInfo.deposit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} security deposit is fully refundable when you meet these conditions:
                    </p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start">
                        <IoCheckmarkDoneOutline className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{t('onTimeReturn')}:</span> Return within 30-minute grace period to avoid late fees
                          ($50 first hour, $25 each additional hour)
                        </div>
                      </div>
                      <div className="flex items-start">
                        <IoCheckmarkDoneOutline className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{t('fuelLevel')}:</span> Match the fuel level at pickup or incur refueling charge
                          ($5.00/gallon plus $25 service fee)
                        </div>
                      </div>
                      <div className="flex items-start">
                        <IoCheckmarkDoneOutline className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{t('vehicleCondition')}:</span> Normal wear accepted; damage beyond normal use charged at repair cost
                        </div>
                      </div>
                      <div className="flex items-start">
                        <IoCheckmarkDoneOutline className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{t('interiorCleanliness')}:</span> No smoking odor, excessive dirt, stains, or damage
                          ($250 deep cleaning if required)
                        </div>
                      </div>
                      <div className="flex items-start">
                        <IoCheckmarkDoneOutline className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{t('mileageAllowance')}:</span> 200 miles per day included; excess charged at $0.45/mile
                        </div>
                      </div>
                      <div className="flex items-start">
                        <IoCheckmarkDoneOutline className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{t('noViolations')}:</span> All tolls and citations must be paid; processing fee of $50 per violation
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 rounded p-2 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start">
                        <IoTimeOutline className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-[10px] sm:text-xs">
                          <p className="font-medium text-gray-900 dark:text-white mb-1">{t('depositReleaseTimeline')}</p>
                          <ul className="text-gray-700 dark:text-gray-300 space-y-0.5">
                            <li>• Post-trip inspection: Completed within 2 hours of return</li>
                            <li>• Damage assessment: Within 24 hours with photo documentation</li>
                            <li>• Charge notification: Within 24-48 hours if deductions apply</li>
                            <li>• Deposit release: 7-14 business days to original payment method</li>
                            <li>• Itemized statement provided for any deductions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Reference Links */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('additionalInformation')}</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                  <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <IoInformationCircleOutline className="w-3 h-3 mr-1" />
                    {t('termsOfService')}
                  </Link>
                  <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <IoInformationCircleOutline className="w-3 h-3 mr-1" />
                    {t('privacyPolicy')}
                  </Link>
                  <Link href="/insurance-guide" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <IoInformationCircleOutline className="w-3 h-3 mr-1" />
                    {t('insuranceGuide')}
                  </Link>
                  <Link href="/support" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <IoInformationCircleOutline className="w-3 h-3 mr-1" />
                    {t('trustAndSafety')}
                  </Link>
                  <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <IoInformationCircleOutline className="w-3 h-3 mr-1" />
                    {t('contactUs')}
                  </Link>
                  <a
                    href="https://www.azleg.gov/arstitle/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                  >
                    <IoScaleOutline className="w-3 h-3 mr-1" />
                    {t('arizonaStatutes')}
                  </a>
                </div>
              </div>

              {/* Insurance Guide Summary */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <IoShieldCheckmarkOutline className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('protectionPlansOverview')}</h4>
                    <div className="space-y-2 text-[10px] sm:text-xs">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-900 dark:text-white min-w-[80px] sm:min-w-[100px]">Basic:</span>
                        <span className="text-gray-600 dark:text-gray-400">$1,500 deductible, liability coverage, basic roadside assistance</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-900 dark:text-white min-w-[80px] sm:min-w-[100px]">Standard:</span>
                        <span className="text-gray-600 dark:text-gray-400">$750 deductible, enhanced liability, 24/7 roadside, personal effects coverage</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-900 dark:text-white min-w-[80px] sm:min-w-[100px]">Premium:</span>
                        <span className="text-gray-600 dark:text-gray-400">$0 deductible, maximum liability, concierge service, loss of use covered</span>
                      </div>
                    </div>
                    <p className="mt-2 text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">
                      For complete coverage details and exclusions, visit our{' '}
                      <Link href="/insurance" className="text-blue-600 dark:text-blue-400 hover:underline">Insurance Guide</Link>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Agreement Acceptance (for booking context) */}
              {context === 'booking' && !agreementAccepted && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={hasScrolledToBottom}
                      onChange={(e) => e.target.checked && handleAgree()}
                      disabled={!hasScrolledToBottom}
                      className="mt-0.5 sm:mt-1 mr-2 sm:mr-3"
                    />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      I have read and agree to all terms and conditions of this rental agreement between {hostDisplayName} and myself.
                      I authorize the ${tierInfo.deposit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} security deposit hold and understand it will be released according to
                      the terms outlined above and Arizona law A.R.S. §33-1321.
                      {!hasScrolledToBottom && (
                        <span className="block text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('scrollToReview')}
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              )}

              {/* Digital Signature Block (for verified bookings) */}
              {isVerified && agreementTracking && (
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-300 dark:border-gray-600">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">{t('electronicAgreementConfirmation')}</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 sm:p-3 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                      <div>
                        <span className="font-medium">{t('renter')}:</span> {guestDisplayName}
                      </div>
                      <div>
                        <span className="font-medium">{t('host')}:</span> {hostDisplayName}
                      </div>
                      <div>
                        <span className="font-medium">{t('agreementDate')}:</span> {guestDetails?.approvedAt && format(new Date(guestDetails.approvedAt), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div>
                        <span className="font-medium">{t('bookingReference')}:</span> {guestDetails?.bookingCode}
                      </div>
                    </div>
                    {guestDetails?.approvedBy && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <span className="font-medium">{t('verificationCompleted')}:</span> {guestDetails.approvedBy} on {guestDetails.approvedAt && format(new Date(guestDetails.approvedAt), 'MMMM d, yyyy')}
                      </div>
                    )}
                    <p className="mt-2 text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">
                      This electronic agreement has the same legal validity as a written signature under the Uniform Electronic Transactions Act.
                    </p>
                  </div>
                </div>
              )}

              {/* Platform Notice - Small */}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-[9px] sm:text-[10px] text-gray-400">
                  Platform services provided by ItWhip Technologies, Inc. | Arizona Marketplace Facilitator
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 no-print">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={handleDownload}
                  className="text-xs sm:text-sm flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  title="Download PDF"
                >
                  <IoDownloadOutline className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {t('downloadPdf')}
                </button>
                <button
                  onClick={handlePrint}
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center"
                >
                  <IoPrintOutline className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {t('print')}
                </button>
              </div>
              {context === 'booking' && agreementAccepted ? (
                <span className="text-xs sm:text-sm text-green-600">✓ {t('agreementAccepted')}</span>
              ) : (
                <button
                  onClick={onClose}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {t('close')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}