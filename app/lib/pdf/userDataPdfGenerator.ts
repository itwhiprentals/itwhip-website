// app/lib/pdf/userDataPdfGenerator.ts

import jsPDF from 'jspdf'
import { formatCurrency, formatDate, formatDateTime } from './pdfStyles'

interface UserExportData {
  exportDate: string
  account: {
    id: string
    email: string
    name: string | null
    phone: string
    avatarUrl: string | null
    role: string
    status: string
    emailVerified: boolean
    phoneVerified: boolean
    memberSince: Date
    lastUpdated: Date
    lastActive: Date | null
  }
  bookings: Array<{
    id: string
    status: string
    startDate: Date
    endDate: Date
    totalAmount: number | null
    vehicle: string | null
    createdAt: Date
  }>
  reviews: Array<{
    id: string
    rating: number
    title: string | null
    comment: string | null
    vehicle: string | null
    createdAt: Date
  }>
  paymentMethods: Array<{
    id: string
    type: string
    brand: string | null
    lastFourDigits: string
    expiry: string | null
    isDefault: boolean
    addedOn: Date
  }>
  securityLog: {
    recentLoginAttempts: Array<{
      ipAddress: string
      device: string
      successful: boolean
      timestamp: Date
    }>
    activeSessions: Array<{
      id: string
      ipAddress: string
      device: string
      createdAt: Date
      lastActivity: Date
    }>
  }
}

export class UserDataPdfGenerator {
  private doc: jsPDF
  private yPosition: number
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private lineHeight: number
  private contentWidth: number

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    })

    this.pageWidth = 612
    this.pageHeight = 792
    this.margin = 50
    this.yPosition = this.margin
    this.lineHeight = 15
    this.contentWidth = this.pageWidth - (this.margin * 2)
  }

  generate(data: UserExportData): jsPDF {
    // Cover Header
    this.addHeader(data)

    // Executive Summary
    this.addExecutiveSummary(data)

    // Account Information with Status
    this.addSection('Account Information')
    this.addAccountInfo(data.account)

    // Activity Summary
    this.addSection('Activity Summary')
    this.addActivitySummary(data)

    // Trips
    if (data.bookings.length > 0) {
      this.addSection('Trip History')
      this.addTrips(data.bookings)
    }

    // Reviews
    if (data.reviews.length > 0) {
      this.addSection('Your Reviews')
      this.addReviews(data.reviews)
    }

    // Payment Methods
    if (data.paymentMethods.length > 0) {
      this.addSection('Payment Methods')
      this.addPaymentMethods(data.paymentMethods)
    }

    // ESG Impact Section (for tax purposes)
    this.addSection('Environmental & Social Impact (ESG)')
    this.addESGSection(data)

    // Security Log
    this.addSection('Security & Access Log')
    this.addSecurityLog(data.securityLog)

    // Data Rights & Legal
    this.addDataRightsSection()

    // Page Footer
    this.addFooter(data)

    return this.doc
  }

  private addHeader(data: UserExportData) {
    // Green header bar
    this.doc.setFillColor(16, 185, 129)
    this.doc.rect(0, 0, this.pageWidth, 80, 'F')

    // Company name
    this.doc.setFontSize(32)
    this.doc.setTextColor(255, 255, 255)
    this.doc.text('ItWhip', this.margin, 45)

    // Tagline
    this.doc.setFontSize(10)
    this.doc.setTextColor(255, 255, 255)
    this.doc.text('Your Personal Data & Activity Report', this.margin, 62)

    // Document ID on the right
    this.doc.setFontSize(8)
    this.doc.text(`Document ID: ${data.account.id.slice(0, 8).toUpperCase()}`, this.pageWidth - this.margin - 120, 45)
    this.doc.text(`Generated: ${formatDateTime(data.exportDate)}`, this.pageWidth - this.margin - 120, 58)

    this.yPosition = 100
  }

  private addExecutiveSummary(data: UserExportData) {
    // Summary box
    this.doc.setFillColor(249, 250, 251)
    this.doc.roundedRect(this.margin, this.yPosition, this.contentWidth, 80, 6, 6, 'F')

    // Title
    this.doc.setFontSize(12)
    this.doc.setTextColor(17, 24, 39)
    this.doc.text('Summary', this.margin + 15, this.yPosition + 20)

    // Stats in columns
    const colWidth = this.contentWidth / 4
    const statsY = this.yPosition + 45

    // Total Trips
    this.doc.setFontSize(24)
    this.doc.setTextColor(16, 185, 129)
    this.doc.text(data.bookings.length.toString(), this.margin + 15, statsY)
    this.doc.setFontSize(9)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text('Total Trips', this.margin + 15, statsY + 15)

    // Total Spent
    const totalSpent = data.bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    this.doc.setFontSize(24)
    this.doc.setTextColor(16, 185, 129)
    this.doc.text(formatCurrency(totalSpent), this.margin + colWidth + 15, statsY)
    this.doc.setFontSize(9)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text('Total Spent', this.margin + colWidth + 15, statsY + 15)

    // Reviews Written
    this.doc.setFontSize(24)
    this.doc.setTextColor(16, 185, 129)
    this.doc.text(data.reviews.length.toString(), this.margin + colWidth * 2 + 15, statsY)
    this.doc.setFontSize(9)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text('Reviews', this.margin + colWidth * 2 + 15, statsY + 15)

    // Member Duration
    const memberDays = Math.floor((new Date().getTime() - new Date(data.account.memberSince).getTime()) / (1000 * 60 * 60 * 24))
    const memberYears = Math.floor(memberDays / 365)
    const memberMonths = Math.floor((memberDays % 365) / 30)
    const memberText = memberYears > 0 ? `${memberYears}y ${memberMonths}m` : `${memberMonths}m`
    this.doc.setFontSize(24)
    this.doc.setTextColor(16, 185, 129)
    this.doc.text(memberText, this.margin + colWidth * 3 + 15, statsY)
    this.doc.setFontSize(9)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text('Member', this.margin + colWidth * 3 + 15, statsY + 15)

    this.yPosition += 95
  }

  private addSection(title: string) {
    this.checkPageBreak(50)
    this.yPosition += 15

    // Section header with green accent bar
    this.doc.setFillColor(16, 185, 129)
    this.doc.rect(this.margin, this.yPosition - 10, 4, 20, 'F')

    this.doc.setFontSize(14)
    this.doc.setTextColor(17, 24, 39)
    this.doc.text(title, this.margin + 12, this.yPosition + 2)
    this.yPosition += 25
  }

  private addAccountInfo(account: UserExportData['account']) {
    // Account status badge
    this.checkPageBreak(100)

    // Status card
    const statusColor = this.getAccountStatusColor(account.status)
    this.doc.setFillColor(statusColor.bg.r, statusColor.bg.g, statusColor.bg.b)
    this.doc.roundedRect(this.margin, this.yPosition, 150, 30, 4, 4, 'F')
    this.doc.setFontSize(10)
    this.doc.setTextColor(statusColor.text.r, statusColor.text.g, statusColor.text.b)
    this.doc.text(`Account Status: ${account.status}`, this.margin + 10, this.yPosition + 18)

    // Verification badges
    const verifiedColor = { r: 16, g: 185, b: 129 }
    const unverifiedColor = { r: 239, g: 68, b: 68 }

    // Email verification badge
    const emailColor = account.emailVerified ? verifiedColor : unverifiedColor
    this.doc.setFillColor(emailColor.r, emailColor.g, emailColor.b)
    this.doc.circle(this.margin + 180, this.yPosition + 15, 6, 'F')
    this.doc.setFontSize(8)
    this.doc.setTextColor(17, 24, 39)
    this.doc.text(account.emailVerified ? 'Email Verified' : 'Email Unverified', this.margin + 190, this.yPosition + 18)

    // Phone verification badge
    const phoneColor = account.phoneVerified ? verifiedColor : unverifiedColor
    this.doc.setFillColor(phoneColor.r, phoneColor.g, phoneColor.b)
    this.doc.circle(this.margin + 290, this.yPosition + 15, 6, 'F')
    this.doc.text(account.phoneVerified ? 'Phone Verified' : 'Phone Unverified', this.margin + 300, this.yPosition + 18)

    this.yPosition += 45

    // Account details in two columns
    const col1X = this.margin
    const col2X = this.margin + this.contentWidth / 2

    this.addFieldTwoColumn('Full Name', account.name || 'Not provided', col1X)
    this.addFieldTwoColumn('Account Type', this.formatRole(account.role), col2X)
    this.yPosition += 18

    this.addFieldTwoColumn('Email Address', account.email, col1X)
    this.addFieldTwoColumn('Phone Number', account.phone || 'Not provided', col2X)
    this.yPosition += 18

    this.addFieldTwoColumn('Member Since', formatDate(account.memberSince.toISOString()), col1X)
    this.addFieldTwoColumn('Last Activity', account.lastActive ? formatDateTime(account.lastActive.toISOString()) : 'N/A', col2X)
    this.yPosition += 18

    this.addFieldTwoColumn('Account ID', account.id, col1X)
    this.addFieldTwoColumn('Last Updated', formatDateTime(account.lastUpdated.toISOString()), col2X)
    this.yPosition += 10
  }

  private addActivitySummary(data: UserExportData) {
    // Calculate activity stats
    const completedTrips = data.bookings.filter(b => b.status.toUpperCase() === 'COMPLETED').length
    const cancelledTrips = data.bookings.filter(b => b.status.toUpperCase() === 'CANCELLED').length
    const pendingTrips = data.bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status.toUpperCase())).length
    const avgRating = data.reviews.length > 0
      ? (data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length).toFixed(1)
      : 'N/A'

    // Activity grid
    this.doc.setFillColor(249, 250, 251)
    this.doc.roundedRect(this.margin, this.yPosition, this.contentWidth, 60, 6, 6, 'F')

    const colWidth = this.contentWidth / 5
    const statsY = this.yPosition + 25

    // Completed
    this.addStatBox('Completed', completedTrips.toString(), this.margin + 10, statsY, { r: 16, g: 185, b: 129 })

    // Cancelled
    this.addStatBox('Cancelled', cancelledTrips.toString(), this.margin + colWidth + 10, statsY, { r: 239, g: 68, b: 68 })

    // Pending
    this.addStatBox('Pending', pendingTrips.toString(), this.margin + colWidth * 2 + 10, statsY, { r: 245, g: 158, b: 11 })

    // Avg Rating
    this.addStatBox('Avg Rating', avgRating, this.margin + colWidth * 3 + 10, statsY, { r: 59, g: 130, b: 246 })

    // Payment Methods
    this.addStatBox('Payment Methods', data.paymentMethods.length.toString(), this.margin + colWidth * 4 + 10, statsY, { r: 107, g: 114, b: 128 })

    this.yPosition += 75
  }

  private addStatBox(label: string, value: string, x: number, y: number, color: { r: number, g: number, b: number }) {
    this.doc.setFontSize(18)
    this.doc.setTextColor(color.r, color.g, color.b)
    this.doc.text(value, x, y)
    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text(label, x, y + 12)
  }

  private addTrips(bookings: UserExportData['bookings']) {
    // Trip table header
    this.doc.setFillColor(243, 244, 246)
    this.doc.rect(this.margin, this.yPosition, this.contentWidth, 20, 'F')

    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text('VEHICLE', this.margin + 10, this.yPosition + 13)
    this.doc.text('DATES', this.margin + 180, this.yPosition + 13)
    this.doc.text('AMOUNT', this.margin + 330, this.yPosition + 13)
    this.doc.text('STATUS', this.margin + 420, this.yPosition + 13)

    this.yPosition += 25

    bookings.slice(0, 15).forEach((booking, index) => {
      this.checkPageBreak(25)

      // Alternating row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(249, 250, 251)
        this.doc.rect(this.margin, this.yPosition - 5, this.contentWidth, 22, 'F')
      }

      // Vehicle
      this.doc.setFontSize(9)
      this.doc.setTextColor(17, 24, 39)
      const vehicle = booking.vehicle || 'N/A'
      this.doc.text(vehicle.length > 25 ? vehicle.substring(0, 22) + '...' : vehicle, this.margin + 10, this.yPosition + 8)

      // Dates
      this.doc.setTextColor(107, 114, 128)
      const dates = `${formatDate(booking.startDate.toISOString()).split(',')[0]} - ${formatDate(booking.endDate.toISOString()).split(',')[0]}`
      this.doc.text(dates, this.margin + 180, this.yPosition + 8)

      // Amount
      this.doc.setTextColor(17, 24, 39)
      this.doc.text(booking.totalAmount ? formatCurrency(booking.totalAmount) : '-', this.margin + 330, this.yPosition + 8)

      // Status
      const statusColor = this.getStatusColor(booking.status)
      this.doc.setTextColor(statusColor.r, statusColor.g, statusColor.b)
      this.doc.text(booking.status, this.margin + 420, this.yPosition + 8)

      this.yPosition += 22
    })

    if (bookings.length > 15) {
      this.doc.setFontSize(9)
      this.doc.setTextColor(107, 114, 128)
      this.doc.text(`... and ${bookings.length - 15} more trips (see full history in your account)`, this.margin, this.yPosition + 10)
      this.yPosition += 20
    }
  }

  private addReviews(reviews: UserExportData['reviews']) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    this.doc.setFontSize(10)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text(`You have written ${reviews.length} review${reviews.length !== 1 ? 's' : ''} with an average rating of ${avgRating.toFixed(1)} stars`, this.margin, this.yPosition)
    this.yPosition += 20

    reviews.slice(0, 5).forEach((review) => {
      this.checkPageBreak(55)

      this.doc.setFillColor(249, 250, 251)
      this.doc.roundedRect(this.margin, this.yPosition - 5, this.contentWidth, 45, 4, 4, 'F')

      // Stars
      this.doc.setFontSize(11)
      this.doc.setTextColor(245, 158, 11)
      const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)
      this.doc.text(stars, this.margin + 10, this.yPosition + 12)

      // Vehicle
      this.doc.setFontSize(10)
      this.doc.setTextColor(17, 24, 39)
      this.doc.text(review.vehicle || 'Vehicle', this.margin + 80, this.yPosition + 12)

      // Date
      this.doc.setFontSize(8)
      this.doc.setTextColor(107, 114, 128)
      this.doc.text(formatDate(review.createdAt.toISOString()), this.pageWidth - this.margin - 80, this.yPosition + 12)

      // Comment
      if (review.comment) {
        this.doc.setFontSize(9)
        const commentLines = this.doc.splitTextToSize(review.comment, this.contentWidth - 30)
        this.doc.text(commentLines.slice(0, 2).join(' ').substring(0, 100) + (review.comment.length > 100 ? '...' : ''), this.margin + 10, this.yPosition + 30)
      }

      this.yPosition += 55
    })

    if (reviews.length > 5) {
      this.doc.setFontSize(9)
      this.doc.setTextColor(107, 114, 128)
      this.doc.text(`... and ${reviews.length - 5} more reviews`, this.margin, this.yPosition)
      this.yPosition += 15
    }
  }

  private addPaymentMethods(methods: UserExportData['paymentMethods']) {
    this.doc.setFontSize(9)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text('For your security, only partial card information is displayed.', this.margin, this.yPosition)
    this.yPosition += 18

    methods.forEach((method, index) => {
      this.checkPageBreak(30)

      // Card row
      this.doc.setFillColor(249, 250, 251)
      this.doc.roundedRect(this.margin, this.yPosition - 3, this.contentWidth, 25, 4, 4, 'F')

      // Card icon placeholder
      this.doc.setFillColor(59, 130, 246)
      this.doc.roundedRect(this.margin + 10, this.yPosition, 30, 18, 3, 3, 'F')
      this.doc.setFontSize(7)
      this.doc.setTextColor(255, 255, 255)
      this.doc.text(method.brand?.toUpperCase().substring(0, 4) || 'CARD', this.margin + 14, this.yPosition + 11)

      // Card info
      this.doc.setFontSize(10)
      this.doc.setTextColor(17, 24, 39)
      this.doc.text(`•••• •••• •••• ${method.lastFourDigits}`, this.margin + 50, this.yPosition + 12)

      // Expiry
      this.doc.setFontSize(9)
      this.doc.setTextColor(107, 114, 128)
      this.doc.text(method.expiry ? `Exp: ${method.expiry}` : '', this.margin + 200, this.yPosition + 12)

      // Default badge
      if (method.isDefault) {
        this.doc.setFillColor(16, 185, 129)
        this.doc.roundedRect(this.margin + 280, this.yPosition + 2, 45, 14, 3, 3, 'F')
        this.doc.setFontSize(7)
        this.doc.setTextColor(255, 255, 255)
        this.doc.text('DEFAULT', this.margin + 286, this.yPosition + 11)
      }

      // Added date
      this.doc.setFontSize(8)
      this.doc.setTextColor(107, 114, 128)
      this.doc.text(`Added: ${formatDate(method.addedOn.toISOString())}`, this.margin + 380, this.yPosition + 12)

      this.yPosition += 32
    })
  }

  private addESGSection(data: UserExportData) {
    this.checkPageBreak(180)

    // ESG Introduction
    this.doc.setFillColor(236, 253, 245)
    this.doc.roundedRect(this.margin, this.yPosition, this.contentWidth, 140, 6, 6, 'F')

    this.doc.setFontSize(11)
    this.doc.setTextColor(6, 95, 70)
    this.doc.text('Your Contribution to Sustainable Transportation', this.margin + 15, this.yPosition + 20)

    this.doc.setFontSize(9)
    this.doc.setTextColor(21, 128, 61)
    const esgIntro = 'By using ItWhip\'s car sharing platform, you are contributing to a more sustainable future. Car sharing reduces the total number of vehicles on the road, lowering emissions and environmental impact.'
    const introLines = this.doc.splitTextToSize(esgIntro, this.contentWidth - 30)
    this.doc.text(introLines, this.margin + 15, this.yPosition + 38)

    // ESG Stats
    const completedTrips = data.bookings.filter(b => b.status.toUpperCase() === 'COMPLETED').length
    const estimatedMilesSaved = completedTrips * 45 // Avg 45 miles not driven by owning
    const estimatedCO2Saved = (estimatedMilesSaved * 0.404).toFixed(0) // 404g CO2 per mile avg
    const treesEquivalent = (parseInt(estimatedCO2Saved) / 21000).toFixed(1) // 21kg CO2 per tree/year

    const statsY = this.yPosition + 75
    const colWidth = this.contentWidth / 3

    // CO2 Avoided
    this.doc.setFontSize(22)
    this.doc.setTextColor(16, 185, 129)
    this.doc.text(`${estimatedCO2Saved} kg`, this.margin + 15, statsY)
    this.doc.setFontSize(9)
    this.doc.setTextColor(21, 128, 61)
    this.doc.text('Est. CO₂ Emissions Avoided', this.margin + 15, statsY + 15)

    // Miles Saved
    this.doc.setFontSize(22)
    this.doc.setTextColor(16, 185, 129)
    this.doc.text(`${estimatedMilesSaved.toLocaleString()}`, this.margin + colWidth + 15, statsY)
    this.doc.setFontSize(9)
    this.doc.setTextColor(21, 128, 61)
    this.doc.text('Ownership Miles Avoided', this.margin + colWidth + 15, statsY + 15)

    // Tree Equivalent
    this.doc.setFontSize(22)
    this.doc.setTextColor(16, 185, 129)
    this.doc.text(`${treesEquivalent}`, this.margin + colWidth * 2 + 15, statsY)
    this.doc.setFontSize(9)
    this.doc.setTextColor(21, 128, 61)
    this.doc.text('Tree-Years Equivalent', this.margin + colWidth * 2 + 15, statsY + 15)

    // Tax disclaimer
    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128)
    const taxNote = 'Note: These estimates are for informational purposes. Consult a tax professional regarding any deductions. Some jurisdictions offer incentives for sustainable transportation choices.'
    const taxLines = this.doc.splitTextToSize(taxNote, this.contentWidth - 30)
    this.doc.text(taxLines, this.margin + 15, this.yPosition + 120)

    this.yPosition += 155

    // ESG Certificate Statement
    this.doc.setFillColor(254, 252, 232)
    this.doc.roundedRect(this.margin, this.yPosition, this.contentWidth, 35, 4, 4, 'F')
    this.doc.setFontSize(9)
    this.doc.setTextColor(133, 77, 14)
    this.doc.text('ESG Documentation Reference', this.margin + 15, this.yPosition + 15)
    this.doc.setFontSize(8)
    this.doc.text(`This document serves as a record of your participation in sustainable car sharing for tax year ${new Date().getFullYear()}.`, this.margin + 15, this.yPosition + 27)

    this.yPosition += 50
  }

  private addSecurityLog(security: UserExportData['securityLog']) {
    // Recent logins table
    this.doc.setFontSize(10)
    this.doc.setTextColor(17, 24, 39)
    this.doc.text('Recent Login Activity', this.margin, this.yPosition)
    this.yPosition += 15

    // Table header
    this.doc.setFillColor(243, 244, 246)
    this.doc.rect(this.margin, this.yPosition, this.contentWidth, 18, 'F')
    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text('STATUS', this.margin + 10, this.yPosition + 12)
    this.doc.text('DATE & TIME', this.margin + 80, this.yPosition + 12)
    this.doc.text('IP ADDRESS', this.margin + 230, this.yPosition + 12)
    this.doc.text('DEVICE', this.margin + 340, this.yPosition + 12)
    this.yPosition += 22

    const recentLogins = security.recentLoginAttempts.slice(0, 10)

    if (recentLogins.length === 0) {
      this.doc.setFontSize(9)
      this.doc.setTextColor(107, 114, 128)
      this.doc.text('No recent login activity recorded', this.margin + 10, this.yPosition + 5)
      this.yPosition += 20
    } else {
      recentLogins.forEach((login, index) => {
        this.checkPageBreak(20)

        if (index % 2 === 0) {
          this.doc.setFillColor(249, 250, 251)
          this.doc.rect(this.margin, this.yPosition - 3, this.contentWidth, 18, 'F')
        }

        // Status icon
        this.doc.setFontSize(9)
        this.doc.setTextColor(login.successful ? 16 : 239, login.successful ? 185 : 68, login.successful ? 129 : 68)
        this.doc.text(login.successful ? '✓ Success' : '✗ Failed', this.margin + 10, this.yPosition + 8)

        // Datetime
        this.doc.setTextColor(17, 24, 39)
        this.doc.text(formatDateTime(login.timestamp.toISOString()), this.margin + 80, this.yPosition + 8)

        // IP
        this.doc.setTextColor(107, 114, 128)
        this.doc.text(login.ipAddress, this.margin + 230, this.yPosition + 8)

        // Device (truncated)
        const device = login.device.length > 30 ? login.device.substring(0, 27) + '...' : login.device
        this.doc.text(device, this.margin + 340, this.yPosition + 8)

        this.yPosition += 18
      })
    }

    this.yPosition += 15

    // Active sessions
    this.checkPageBreak(60)
    this.doc.setFontSize(10)
    this.doc.setTextColor(17, 24, 39)
    this.doc.text(`Active Sessions (${security.activeSessions.length})`, this.margin, this.yPosition)
    this.yPosition += 15

    if (security.activeSessions.length === 0) {
      this.doc.setFontSize(9)
      this.doc.setTextColor(107, 114, 128)
      this.doc.text('No active sessions', this.margin, this.yPosition)
      this.yPosition += 15
    } else {
      security.activeSessions.slice(0, 5).forEach((session) => {
        this.checkPageBreak(30)

        this.doc.setFillColor(249, 250, 251)
        this.doc.roundedRect(this.margin, this.yPosition - 3, this.contentWidth, 25, 3, 3, 'F')

        this.doc.setFontSize(9)
        this.doc.setTextColor(17, 24, 39)
        const device = session.device.length > 60 ? session.device.substring(0, 57) + '...' : session.device
        this.doc.text(device, this.margin + 10, this.yPosition + 8)

        this.doc.setFontSize(8)
        this.doc.setTextColor(107, 114, 128)
        this.doc.text(`Last active: ${formatDateTime(session.lastActivity.toISOString())} | IP: ${session.ipAddress}`, this.margin + 10, this.yPosition + 19)

        this.yPosition += 30
      })
    }
  }

  private addDataRightsSection() {
    this.checkPageBreak(120)
    this.yPosition += 20

    this.addHorizontalLine()
    this.yPosition += 20

    // Legal section header
    this.doc.setFontSize(12)
    this.doc.setTextColor(17, 24, 39)
    this.doc.text('Data Privacy & Your Rights', this.margin, this.yPosition)
    this.yPosition += 18

    this.doc.setFontSize(9)
    this.doc.setTextColor(107, 114, 128)

    const rights = [
      'Right to Access: You may request a copy of all personal data we hold about you.',
      'Right to Rectification: You can update or correct your personal information at any time through your account settings.',
      'Right to Erasure: You may request deletion of your account and personal data. Data is permanently removed after a 30-day grace period.',
      'Right to Portability: This document provides your data in a portable format.',
      'Data Retention: We retain your data for the duration of your account plus 7 years for legal and tax compliance.',
      'Contact: For privacy inquiries, email privacy@itwhip.com or visit itwhip.com/privacy'
    ]

    rights.forEach((right) => {
      this.checkPageBreak(30)
      const lines = this.doc.splitTextToSize(`• ${right}`, this.contentWidth - 10)
      this.doc.text(lines, this.margin, this.yPosition)
      this.yPosition += lines.length * 11 + 5
    })

    this.yPosition += 10

    // Legal disclaimer
    this.doc.setFillColor(249, 250, 251)
    this.doc.roundedRect(this.margin, this.yPosition, this.contentWidth, 45, 4, 4, 'F')
    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128)
    const disclaimer = 'This document is provided for informational purposes only. The information contained herein is accurate as of the generation date. ItWhip Technologies, Inc. complies with applicable data protection regulations including GDPR and CCPA. For complete terms, visit itwhip.com/terms.'
    const discLines = this.doc.splitTextToSize(disclaimer, this.contentWidth - 20)
    this.doc.text(discLines, this.margin + 10, this.yPosition + 15)

    this.yPosition += 55
  }

  private addFieldTwoColumn(label: string, value: string, x: number) {
    this.doc.setFontSize(8)
    this.doc.setTextColor(107, 114, 128)
    this.doc.text(label, x, this.yPosition)

    this.doc.setFontSize(10)
    this.doc.setTextColor(17, 24, 39)
    this.doc.text(value.length > 35 ? value.substring(0, 32) + '...' : value, x, this.yPosition + 12)
  }

  private addHorizontalLine() {
    this.doc.setDrawColor(229, 231, 235)
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition)
  }

  private addFooter(data: UserExportData) {
    const pageCount = this.doc.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i)

      // Footer line
      this.doc.setDrawColor(229, 231, 235)
      this.doc.setLineWidth(0.5)
      this.doc.line(this.margin, this.pageHeight - 40, this.pageWidth - this.margin, this.pageHeight - 40)

      const footerY = this.pageHeight - 25

      this.doc.setFontSize(8)
      this.doc.setTextColor(107, 114, 128)

      // Left - company
      this.doc.text('ItWhip Technologies, Inc. | itwhip.com', this.margin, footerY)

      // Center - page
      const pageText = `Page ${i} of ${pageCount}`
      const pageTextWidth = this.doc.getTextWidth(pageText)
      this.doc.text(pageText, (this.pageWidth - pageTextWidth) / 2, footerY)

      // Right - confidential
      this.doc.setTextColor(239, 68, 68)
      this.doc.text('CONFIDENTIAL', this.pageWidth - this.margin - 60, footerY)
    }
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.yPosition + requiredSpace > this.pageHeight - 60) {
      this.doc.addPage()
      this.yPosition = this.margin
    }
  }

  private getStatusColor(status: string): { r: number, g: number, b: number } {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return { r: 16, g: 185, b: 129 }
      case 'CONFIRMED':
        return { r: 59, g: 130, b: 246 }
      case 'CANCELLED':
        return { r: 239, g: 68, b: 68 }
      case 'PENDING':
        return { r: 245, g: 158, b: 11 }
      default:
        return { r: 107, g: 114, b: 128 }
    }
  }

  private getAccountStatusColor(status: string): { bg: { r: number, g: number, b: number }, text: { r: number, g: number, b: number } } {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return { bg: { r: 220, g: 252, b: 231 }, text: { r: 21, g: 128, b: 61 } }
      case 'PENDING_DELETION':
        return { bg: { r: 254, g: 243, b: 199 }, text: { r: 180, g: 83, b: 9 } }
      case 'SUSPENDED':
        return { bg: { r: 254, g: 226, b: 226 }, text: { r: 185, g: 28, b: 28 } }
      default:
        return { bg: { r: 243, g: 244, b: 246 }, text: { r: 75, g: 85, b: 99 } }
    }
  }

  private formatRole(role: string): string {
    const roles: Record<string, string> = {
      'CLAIMED': 'Verified Guest',
      'UNCLAIMED': 'Guest',
      'ADMIN': 'Administrator',
      'SUPER_ADMIN': 'Super Administrator',
      'HOST': 'Vehicle Host',
      'STAFF': 'Staff Member'
    }
    return roles[role] || role
  }

  getBuffer(): Buffer {
    const arrayBuffer = this.doc.output('arraybuffer')
    return Buffer.from(arrayBuffer)
  }
}
