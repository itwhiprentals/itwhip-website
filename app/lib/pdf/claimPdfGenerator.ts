// app/lib/pdf/claimPdfGenerator.ts

import jsPDF from 'jspdf'
import { PDF_STYLES, formatCurrency, formatDate, formatDateTime } from './pdfStyles'

interface ClaimData {
  id: string
  type: string
  status: string
  description: string
  estimatedCost: number
  approvedAmount: number | null
  deductible: number
  incidentDate: string
  createdAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  reviewNotes: string | null
  
  booking: {
    bookingCode: string
    startDate: string
    endDate: string
    guestName: string | null
    guestEmail: string | null
    depositHeld: number
  }
  
  policy: {
    tier: string
    deductible: number
    liabilityCoverage: number
    collisionCoverage: number
    policyNumber: string | null
    externalPolicyId: string | null
    boundViaApi: boolean
    provider: {
      name: string
    }
  }
  
  host: {
    name: string
    email: string
    phone: string
    earningsTier: string
  }
  
  insuranceHierarchy: Array<{
    level: string
    type: string
    provider: string
    policyNumber?: string
    deductible: number
    coverage: string
  }>
  
  financialBreakdown: {
    estimatedCost: number
    approvedAmount: number
    deductible: number
    depositHeld: number
    hostEarningsPercent: number
    hostPayout: number
    platformFee: number
    guestResponsibility: number
  }
  
  vehicleInfo: {
    make: string
    model: string
    year: number
    licensePlate: string
  }
  
  guestInfo: {
    name: string
    email: string
    location?: string
    accountOnHold: boolean
    hasInsurance: boolean
    insuranceProvider: string | null
  }
  
  submittedToInsurerAt: string | null
  insurerClaimId: string | null
  insurerStatus: string | null
}

export class ClaimPdfGenerator {
  private doc: jsPDF
  private yPosition: number
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private lineHeight: number

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    })
    
    this.pageWidth = 612 // Letter width in points
    this.pageHeight = 792 // Letter height in points
    this.margin = 50
    this.yPosition = this.margin
    this.lineHeight = 15
  }

  generate(claimData: ClaimData): jsPDF {
    // Header
    this.addHeader(claimData)
    
    // Claim Overview
    this.addSection('Claim Overview')
    this.addClaimOverview(claimData)
    
    // Vehicle Information
    this.addSection('Vehicle Information')
    this.addVehicleInfo(claimData)
    
    // Insurance Hierarchy
    this.addSection('Insurance Coverage Hierarchy')
    this.addInsuranceHierarchy(claimData)
    
    // Financial Breakdown
    this.addSection('Financial Breakdown')
    this.addFinancialBreakdown(claimData)
    
    // Policy & FNOL Metadata
    this.addSection('Policy & FNOL Metadata')
    this.addPolicyMetadata(claimData)
    
    // Parties Involved
    this.addSection('Parties Involved')
    this.addParties(claimData)
    
    // Footer
    this.addFooter(claimData)
    
    return this.doc
  }

  private addHeader(claimData: ClaimData) {
    // Company name
    this.doc.setFontSize(24)
    this.doc.setTextColor(37, 99, 235) // Blue-600
    this.doc.text('ItWhip', this.margin, this.yPosition)
    this.yPosition += 30
    
    // Document title
    this.doc.setFontSize(18)
    this.doc.setTextColor(17, 24, 39) // Gray-900
    this.doc.text('Insurance Claim Report', this.margin, this.yPosition)
    this.yPosition += 25
    
    // Claim ID
    this.doc.setFontSize(10)
    this.doc.setTextColor(107, 114, 128) // Gray-500
    this.doc.text(`Claim ID: ${claimData.id.slice(0, 12)}`, this.margin, this.yPosition)
    
    // Status (right-aligned)
    const statusColor = this.getStatusColor(claimData.status)
    this.doc.setTextColor(statusColor.r, statusColor.g, statusColor.b)
    this.doc.text(`Status: ${claimData.status}`, this.pageWidth - this.margin - 100, this.yPosition)
    this.yPosition += 15
    
    // Date generated
    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, this.margin, this.yPosition)
    this.yPosition += 20
    
    // Horizontal line
    this.addHorizontalLine()
    this.yPosition += 10
  }

  private addSection(title: string) {
    this.checkPageBreak(40)
    this.yPosition += 10
    
    this.doc.setFontSize(14)
    this.doc.setTextColor(37, 99, 235) // Blue-600
    this.doc.text(title, this.margin, this.yPosition)
    this.yPosition += 20
  }

  private addClaimOverview(claimData: ClaimData) {
    this.addKeyValue('Type', claimData.type)
    this.addKeyValue('Incident Date', formatDate(claimData.incidentDate))
    this.addKeyValue('Filed Date', formatDate(claimData.createdAt))
    this.addKeyValue('Estimated Cost', formatCurrency(claimData.estimatedCost))
    this.addKeyValue('Approved Amount', claimData.approvedAmount ? formatCurrency(claimData.approvedAmount) : 'Pending')
    this.addKeyValue('Reviewed By', claimData.reviewedBy || 'Not reviewed')
    
    if (claimData.reviewedAt) {
      this.addKeyValue('Reviewed At', formatDate(claimData.reviewedAt))
    }
    
    this.yPosition += 10
    
    if (claimData.description) {
      this.doc.setFontSize(9)
      this.doc.setTextColor(107, 114, 128)
      this.doc.text('Description:', this.margin, this.yPosition)
      this.yPosition += 12
      
      this.doc.setTextColor(17, 24, 39)
      const descLines = this.doc.splitTextToSize(claimData.description, this.pageWidth - (this.margin * 2))
      this.doc.text(descLines, this.margin, this.yPosition)
      this.yPosition += descLines.length * 12 + 10
    }
    
    if (claimData.reviewNotes) {
      this.checkPageBreak(50)
      this.doc.setFontSize(9)
      this.doc.setTextColor(107, 114, 128)
      this.doc.text('Review Notes:', this.margin, this.yPosition)
      this.yPosition += 12
      
      this.doc.setTextColor(17, 24, 39)
      const notesLines = this.doc.splitTextToSize(claimData.reviewNotes, this.pageWidth - (this.margin * 2))
      this.doc.text(notesLines, this.margin, this.yPosition)
      this.yPosition += notesLines.length * 12 + 10
    }
  }

  private addVehicleInfo(claimData: ClaimData) {
    this.addKeyValue('Vehicle', `${claimData.vehicleInfo.year} ${claimData.vehicleInfo.make} ${claimData.vehicleInfo.model}`)
    this.addKeyValue('License Plate', claimData.vehicleInfo.licensePlate)
    this.yPosition += 10
  }

  private addInsuranceHierarchy(claimData: ClaimData) {
    claimData.insuranceHierarchy.forEach((insurance) => {
      this.checkPageBreak(60)
      
      const color = this.getInsuranceColor(insurance.level)
      
      // Level
      this.doc.setFontSize(10)
      this.doc.setTextColor(color.r, color.g, color.b)
      this.doc.text(`${insurance.level} - ${insurance.type}`, this.margin, this.yPosition)
      this.yPosition += 15
      
      // Details
      this.doc.setFontSize(9)
      this.doc.setTextColor(17, 24, 39)
      this.doc.text(`Provider: ${insurance.provider}`, this.margin + 20, this.yPosition)
      this.yPosition += 12
      
      if (insurance.policyNumber) {
        this.doc.text(`Policy: ${insurance.policyNumber}`, this.margin + 20, this.yPosition)
        this.yPosition += 12
      }
      
      this.doc.text(`Deductible: ${formatCurrency(insurance.deductible)}`, this.margin + 20, this.yPosition)
      this.yPosition += 12
      
      this.doc.setFontSize(8)
      this.doc.setTextColor(107, 114, 128)
      const coverageLines = this.doc.splitTextToSize(insurance.coverage, this.pageWidth - this.margin - 20 - this.margin)
      this.doc.text(coverageLines, this.margin + 20, this.yPosition)
      this.yPosition += coverageLines.length * 10 + 15
    })
  }

  private addFinancialBreakdown(claimData: ClaimData) {
    const fb = claimData.financialBreakdown
    
    this.addKeyValue('Estimated Cost', formatCurrency(fb.estimatedCost))
    this.addKeyValue('Approved Amount', formatCurrency(fb.approvedAmount))
    this.addKeyValue('Host Payout', `${formatCurrency(fb.hostPayout)} (${fb.hostEarningsPercent}%)`)
    this.addKeyValue('Platform Fee', formatCurrency(fb.platformFee))
    this.addKeyValue('Deductible', formatCurrency(fb.deductible))
    this.addKeyValue('Deposit Held', formatCurrency(fb.depositHeld))
    this.addKeyValue('Guest Responsibility', formatCurrency(fb.guestResponsibility))
    this.yPosition += 10
  }

  private addPolicyMetadata(claimData: ClaimData) {
    this.addKeyValue('Policy Reference ID', claimData.policy.policyNumber || 'N/A')
    this.addKeyValue('External Policy ID', claimData.policy.externalPolicyId || 'N/A')
    this.addKeyValue('FNOL Submission ID', claimData.insurerClaimId || 'Not Submitted')
    this.addKeyValue('Submission Channel', claimData.policy.boundViaApi ? 'API' : 'Manual')
    this.addKeyValue('Carrier Acknowledgment', claimData.submittedToInsurerAt ? formatDate(claimData.submittedToInsurerAt) : 'Pending')
    this.addKeyValue('Insurer Status', claimData.insurerStatus || 'Not Submitted')
    this.addKeyValue('Policy Tier', claimData.policy.tier)
    this.addKeyValue('Liability Coverage', formatCurrency(claimData.policy.liabilityCoverage))
    this.addKeyValue('Collision Coverage', formatCurrency(claimData.policy.collisionCoverage))
    this.yPosition += 10
  }

  private addParties(claimData: ClaimData) {
    // Host
    this.doc.setFontSize(12)
    this.doc.setTextColor(17, 24, 39)
    this.doc.text('Host', this.margin, this.yPosition)
    this.yPosition += 15
    
    this.addKeyValue('Name', claimData.host.name)
    this.addKeyValue('Email', claimData.host.email)
    this.addKeyValue('Phone', claimData.host.phone)
    this.addKeyValue('Earnings Tier', claimData.host.earningsTier)
    
    this.yPosition += 15
    
    // Guest
    this.checkPageBreak(100)
    this.doc.setFontSize(12)
    this.doc.text('Guest', this.margin, this.yPosition)
    this.yPosition += 15
    
    this.addKeyValue('Name', claimData.guestInfo.name)
    this.addKeyValue('Email', claimData.guestInfo.email)
    this.addKeyValue('Location', claimData.guestInfo.location || 'N/A')
    this.addKeyValue('Account Hold', claimData.guestInfo.accountOnHold ? 'Yes' : 'No')
    this.addKeyValue('Has Insurance', claimData.guestInfo.hasInsurance ? `Yes - ${claimData.guestInfo.insuranceProvider}` : 'No')
  }

  private addKeyValue(label: string, value: string) {
    this.checkPageBreak(15)
    
    this.doc.setFontSize(9)
    this.doc.setTextColor(107, 114, 128) // Gray-500
    this.doc.text(`${label}:`, this.margin, this.yPosition)
    
    this.doc.setTextColor(17, 24, 39) // Gray-900
    this.doc.text(value, this.margin + 150, this.yPosition)
    
    this.yPosition += this.lineHeight
  }

  private addHorizontalLine() {
    this.doc.setDrawColor(229, 231, 235) // Gray-200
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition)
  }

  private addFooter(claimData: ClaimData) {
    const footerY = this.pageHeight - 30
    
    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128)
    const footerText = `ItWhip Insurance Claim Report | Claim ID: ${claimData.id.slice(0, 12)} | Generated: ${formatDate(new Date().toISOString())}`
    const textWidth = this.doc.getTextWidth(footerText)
    const centerX = (this.pageWidth - textWidth) / 2
    this.doc.text(footerText, centerX, footerY)
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.yPosition + requiredSpace > this.pageHeight - 50) {
      this.doc.addPage()
      this.yPosition = this.margin
    }
  }

  private getStatusColor(status: string): { r: number, g: number, b: number } {
    switch (status) {
      case 'APPROVED':
        return { r: 16, g: 185, b: 129 } // Green
      case 'DENIED':
        return { r: 239, g: 68, b: 68 } // Red
      case 'PENDING':
        return { r: 245, g: 158, b: 11 } // Yellow
      default:
        return { r: 107, g: 114, b: 128 } // Gray
    }
  }

  private getInsuranceColor(level: string): { r: number, g: number, b: number } {
    switch (level) {
      case 'PRIMARY':
        return { r: 16, g: 185, b: 129 } // Green
      case 'SECONDARY':
        return { r: 59, g: 130, b: 246 } // Blue
      case 'TERTIARY':
        return { r: 107, g: 114, b: 128 } // Gray
      default:
        return { r: 107, g: 114, b: 128 } // Gray
    }
  }

  getBlob(): Blob {
    return this.doc.output('blob')
  }

  getBuffer(): Buffer {
    const uint8Array = this.doc.output('arraybuffer')
    return Buffer.from(uint8Array)
  }
}