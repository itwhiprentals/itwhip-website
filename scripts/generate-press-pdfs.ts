import { jsPDF } from 'jspdf'
import * as fs from 'fs'
import * as path from 'path'

// Brand Colors
const BRAND_COLORS = {
  amber: { r: 245, g: 158, b: 11 },      // #F59E0B - Primary
  amberDark: { r: 217, g: 119, b: 6 },   // #D97706 - Primary Dark
  gray900: { r: 17, g: 24, b: 39 },      // #111827 - Text
  gray600: { r: 75, g: 85, b: 99 },      // #4B5563 - Secondary Text
  gray400: { r: 156, g: 163, b: 175 },   // #9CA3AF - Light Text
  white: { r: 255, g: 255, b: 255 },
}

function generateBrandGuidelines(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20

  // Cover Page
  doc.setFillColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(48)
  doc.setFont('helvetica', 'bold')
  doc.text('ItWhip', pageWidth / 2, 100, { align: 'center' })

  doc.setFontSize(24)
  doc.setFont('helvetica', 'normal')
  doc.text('Brand Guidelines', pageWidth / 2, 120, { align: 'center' })

  doc.setFontSize(12)
  doc.text('Version 1.0 | December 2024', pageWidth / 2, pageHeight - 30, { align: 'center' })

  // Page 2 - Introduction
  doc.addPage()
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Header bar
  doc.setFillColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.rect(0, 0, pageWidth, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Brand Introduction', margin, 16)

  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('About ItWhip', margin, 50)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)

  const introText = `ItWhip is Arizona's premier peer-to-peer car sharing marketplace, connecting vehicle owners with renters for a seamless, trusted experience.

Our brand represents innovation, trust, and the freedom of the open road. We empower hosts to earn income from their vehicles while giving guests access to unique cars they can't find anywhere else.

Founded in Phoenix, Arizona, ItWhip serves the greater Phoenix metropolitan area including Scottsdale, Tempe, Mesa, Chandler, Gilbert, and surrounding communities.`

  const splitIntro = doc.splitTextToSize(introText, pageWidth - (margin * 2))
  doc.text(splitIntro, margin, 65)

  // Mission
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Our Mission', margin, 120)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  const missionText = `To revolutionize car sharing in Arizona by creating a trusted community where vehicle owners maximize the value of their assets and renters discover exceptional driving experiences.`
  const splitMission = doc.splitTextToSize(missionText, pageWidth - (margin * 2))
  doc.text(splitMission, margin, 132)

  // Brand Values
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Brand Values', margin, 165)

  const values = [
    'Trust - We build confidence through verification, insurance, and transparency',
    'Community - We connect neighbors and create economic opportunities',
    'Quality - We curate exceptional vehicles and experiences',
    'Innovation - We leverage technology to simplify car sharing'
  ]

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  values.forEach((value, index) => {
    doc.text(`• ${value}`, margin, 180 + (index * 10))
  })

  // Page 3 - Logo Usage
  doc.addPage()
  doc.setFillColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.rect(0, 0, pageWidth, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Logo Usage', margin, 16)

  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Primary Logo', margin, 50)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)

  const logoText = `The ItWhip logo is the primary visual representation of our brand. It should be used consistently across all marketing materials, digital platforms, and print media.

Two versions are provided:
• Light Mode - For use on light backgrounds (white, light gray)
• Dark Mode - For use on dark backgrounds (black, dark gray, images)`

  const splitLogo = doc.splitTextToSize(logoText, pageWidth - (margin * 2))
  doc.text(splitLogo, margin, 65)

  // Logo placement boxes
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, 110, 70, 50, 'F')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ItWhip', margin + 35, 140, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Light Mode Version', margin + 35, 170, { align: 'center' })

  doc.setFillColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.rect(pageWidth - margin - 70, 110, 70, 50, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ItWhip', pageWidth - margin - 35, 140, { align: 'center' })
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Dark Mode Version', pageWidth - margin - 35, 170, { align: 'center' })

  // Clear Space
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Clear Space & Minimum Size', margin, 200)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  const clearSpaceText = `Maintain clear space around the logo equal to the height of the "I" in ItWhip.

Minimum sizes:
• Digital: 80px wide
• Print: 25mm wide`
  const splitClearSpace = doc.splitTextToSize(clearSpaceText, pageWidth - (margin * 2))
  doc.text(splitClearSpace, margin, 212)

  // Page 4 - Color Palette
  doc.addPage()
  doc.setFillColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.rect(0, 0, pageWidth, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Color Palette', margin, 16)

  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Brand Colors', margin, 50)

  // Primary Colors
  doc.setFontSize(14)
  doc.text('Primary Colors', margin, 70)

  // Amber 500
  doc.setFillColor(245, 158, 11)
  doc.rect(margin, 80, 40, 40, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Amber 500', margin, 130)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('#F59E0B', margin, 136)
  doc.text('RGB: 245, 158, 11', margin, 142)

  // Amber 600
  doc.setFillColor(217, 119, 6)
  doc.rect(margin + 55, 80, 40, 40, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Amber 600', margin + 55, 130)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('#D97706', margin + 55, 136)
  doc.text('RGB: 217, 119, 6', margin + 55, 142)

  // Amber 700
  doc.setFillColor(180, 83, 9)
  doc.rect(margin + 110, 80, 40, 40, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Amber 700', margin + 110, 130)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('#B45309', margin + 110, 136)
  doc.text('RGB: 180, 83, 9', margin + 110, 142)

  // Neutral Colors
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Neutral Colors', margin, 165)

  // Gray 900
  doc.setFillColor(17, 24, 39)
  doc.rect(margin, 175, 40, 40, 'F')
  doc.setFontSize(10)
  doc.text('Gray 900', margin, 225)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('#111827', margin, 231)

  // Gray 600
  doc.setFillColor(75, 85, 99)
  doc.rect(margin + 55, 175, 40, 40, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Gray 600', margin + 55, 225)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('#4B5563', margin + 55, 231)

  // Gray 100
  doc.setFillColor(243, 244, 246)
  doc.rect(margin + 110, 175, 40, 40, 'F')
  doc.setDrawColor(200, 200, 200)
  doc.rect(margin + 110, 175, 40, 40, 'S')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Gray 100', margin + 110, 225)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('#F3F4F6', margin + 110, 231)

  // Page 5 - Typography
  doc.addPage()
  doc.setFillColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.rect(0, 0, pageWidth, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Typography', margin, 16)

  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Type System', margin, 50)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('ItWhip uses Inter as its primary typeface for all digital and print applications.', margin, 65)

  // Headings
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Headings', margin, 85)

  doc.setFontSize(36)
  doc.text('Heading 1', margin, 105)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('Inter Bold, 36-48px', margin, 112)

  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Heading 2', margin, 130)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('Inter Bold, 24-30px', margin, 137)

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Heading 3', margin, 155)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('Inter Semibold, 18-20px', margin, 162)

  // Body Text
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Body Text', margin, 185)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('Body text uses Inter Regular at 14-16px for optimal readability.', margin, 198)
  doc.text('Line height should be 1.5-1.75 for body copy.', margin, 206)

  doc.setFontSize(9)
  doc.text('Small text and captions use Inter at 12-13px.', margin, 220)

  // Page 6 - Do's and Don'ts
  doc.addPage()
  doc.setFillColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.rect(0, 0, pageWidth, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Usage Guidelines', margin, 16)

  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text("Do's and Don'ts", margin, 50)

  // Do's
  doc.setFillColor(236, 253, 245)
  doc.rect(margin, 60, (pageWidth - margin * 2 - 10) / 2, 100, 'F')
  doc.setFontSize(14)
  doc.setTextColor(16, 185, 129)
  doc.text("DO's", margin + 5, 75)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  const dos = [
    'Use official logo files',
    'Maintain clear space',
    'Use approved colors',
    'Follow minimum sizes',
    'Use on appropriate backgrounds'
  ]
  dos.forEach((item, index) => {
    doc.text(`✓ ${item}`, margin + 5, 90 + (index * 10))
  })

  // Don'ts
  doc.setFillColor(254, 242, 242)
  doc.rect(margin + (pageWidth - margin * 2 - 10) / 2 + 10, 60, (pageWidth - margin * 2 - 10) / 2, 100, 'F')
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(239, 68, 68)
  doc.text("DON'Ts", margin + (pageWidth - margin * 2 - 10) / 2 + 15, 75)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  const donts = [
    'Stretch or distort logo',
    'Change logo colors',
    'Add effects or shadows',
    'Place on busy backgrounds',
    'Recreate or modify logo'
  ]
  donts.forEach((item, index) => {
    doc.text(`✗ ${item}`, margin + (pageWidth - margin * 2 - 10) / 2 + 15, 90 + (index * 10))
  })

  // Contact
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Questions?', margin, 185)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('For brand-related questions or to request assets:', margin, 198)
  doc.setTextColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.text('info@itwhip.com', margin, 210)

  // Save
  const outputPath = path.join(process.cwd(), 'public', 'press', 'itwhip-brand-guidelines.pdf')
  fs.writeFileSync(outputPath, Buffer.from(doc.output('arraybuffer')))
  console.log('Brand Guidelines PDF created:', outputPath)
}

function generatePressKit(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20

  // Cover Page
  doc.setFillColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  doc.setFillColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.rect(0, pageHeight - 60, pageWidth, 60, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(48)
  doc.setFont('helvetica', 'bold')
  doc.text('ItWhip', pageWidth / 2, 90, { align: 'center' })

  doc.setFontSize(28)
  doc.setFont('helvetica', 'normal')
  doc.text('Press Kit', pageWidth / 2, 115, { align: 'center' })

  doc.setFontSize(14)
  doc.text('Arizona\'s Premier Car Sharing Marketplace', pageWidth / 2, 140, { align: 'center' })

  doc.setFontSize(12)
  doc.text('December 2024', pageWidth / 2, pageHeight - 25, { align: 'center' })

  // Page 2 - Company Overview
  doc.addPage()
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  doc.setFillColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.rect(0, 0, pageWidth, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Company Overview', margin, 16)

  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('About ItWhip', margin, 50)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)

  const aboutText = `ItWhip is Arizona's premier peer-to-peer car sharing marketplace, headquartered in Phoenix. We connect vehicle owners ("Hosts") with renters ("Guests") through our intuitive platform, enabling trusted transactions backed by comprehensive insurance coverage.

Unlike traditional rental car companies, ItWhip offers access to a curated selection of vehicles—from practical daily drivers to exotic supercars—owned by local community members. Our platform handles everything from booking and payments to insurance and 24/7 roadside assistance.`

  const splitAbout = doc.splitTextToSize(aboutText, pageWidth - (margin * 2))
  doc.text(splitAbout, margin, 65)

  // Key Stats
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('By the Numbers', margin, 125)

  // Stats boxes
  const stats = [
    { value: '500+', label: 'Vehicles Listed' },
    { value: '$1M+', label: 'Host Earnings' },
    { value: '10,000+', label: 'Trips Completed' },
    { value: '4.9★', label: 'Average Rating' }
  ]

  const boxWidth = (pageWidth - margin * 2 - 30) / 4
  stats.forEach((stat, index) => {
    const x = margin + (index * (boxWidth + 10))
    doc.setFillColor(245, 245, 245)
    doc.rect(x, 135, boxWidth, 40, 'F')

    doc.setTextColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(stat.value, x + boxWidth / 2, 155, { align: 'center' })

    doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(stat.label, x + boxWidth / 2, 165, { align: 'center' })
  })

  // Service Area
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Service Area', margin, 200)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('Greater Phoenix Metropolitan Area including:', margin, 212)

  const cities = 'Phoenix, Scottsdale, Tempe, Mesa, Chandler, Gilbert, Glendale, Peoria, Surprise, Goodyear, Paradise Valley, Cave Creek, Fountain Hills'
  const splitCities = doc.splitTextToSize(cities, pageWidth - (margin * 2))
  doc.text(splitCities, margin, 222)

  // Page 3 - What We Offer
  doc.addPage()
  doc.setFillColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.rect(0, 0, pageWidth, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('What We Offer', margin, 16)

  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Platform Features', margin, 50)

  // For Guests
  doc.setFontSize(16)
  doc.text('For Guests', margin, 70)

  const guestFeatures = [
    'Wide selection of vehicles from economy to exotic',
    'Flexible pickup: delivery, airport, or meet-up',
    'Comprehensive insurance coverage options',
    '24/7 roadside assistance',
    'Verified hosts with ratings and reviews',
    'Secure in-app payments'
  ]

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  guestFeatures.forEach((feature, index) => {
    doc.text(`• ${feature}`, margin, 82 + (index * 8))
  })

  // For Hosts
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('For Hosts', margin, 140)

  const hostFeatures = [
    'Earn $500-$3,000+ per month per vehicle',
    'Set your own prices and availability',
    'Insurance coverage up to $1M liability',
    'Mileage Forensics technology for protection',
    'Fast payouts within 3 business days',
    'Host University training resources'
  ]

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  hostFeatures.forEach((feature, index) => {
    doc.text(`• ${feature}`, margin, 152 + (index * 8))
  })

  // Unique Technology
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Unique Technology', margin, 210)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  const techText = `Mileage Forensics™ - Our proprietary technology captures accurate odometer readings through photo verification, protecting both hosts and guests from mileage disputes and ensuring transparent billing.`
  const splitTech = doc.splitTextToSize(techText, pageWidth - (margin * 2))
  doc.text(splitTech, margin, 222)

  // Page 4 - Contact & Resources
  doc.addPage()
  doc.setFillColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.rect(0, 0, pageWidth, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Media Contact', margin, 16)

  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Press Inquiries', margin, 50)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('For media inquiries, interviews, or additional information:', margin, 65)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Email:', margin, 85)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.text('info@itwhip.com', margin + 15, 85)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Website:', margin, 97)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.amber.r, BRAND_COLORS.amber.g, BRAND_COLORS.amber.b)
  doc.text('www.itwhip.com', margin + 20, 97)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Location:', margin, 109)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  doc.text('Phoenix, Arizona', margin + 22, 109)

  // Available Resources
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('Available Resources', margin, 140)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)

  const resources = [
    'Logo Package (PNG, SVG formats)',
    'Brand Guidelines PDF',
    'High-resolution screenshots',
    'Executive photos (upon request)',
    'B-roll footage (upon request)'
  ]

  resources.forEach((resource, index) => {
    doc.text(`• ${resource}`, margin, 155 + (index * 10))
  })

  doc.text('All resources available at: www.itwhip.com/press', margin, 210)

  // Boilerplate
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, 225, pageWidth - margin * 2, 45, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(BRAND_COLORS.gray900.r, BRAND_COLORS.gray900.g, BRAND_COLORS.gray900.b)
  doc.text('About ItWhip', margin + 5, 237)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(BRAND_COLORS.gray600.r, BRAND_COLORS.gray600.g, BRAND_COLORS.gray600.b)
  const boilerplate = `ItWhip is Arizona's premier peer-to-peer car sharing marketplace, connecting vehicle owners with renters for trusted, insured transactions. Based in Phoenix, ItWhip offers access to hundreds of vehicles from practical daily drivers to exotic supercars. Learn more at www.itwhip.com.`
  const splitBoilerplate = doc.splitTextToSize(boilerplate, pageWidth - margin * 2 - 10)
  doc.text(splitBoilerplate, margin + 5, 247)

  // Save
  const outputPath = path.join(process.cwd(), 'public', 'press', 'itwhip-press-kit.pdf')
  fs.writeFileSync(outputPath, Buffer.from(doc.output('arraybuffer')))
  console.log('Press Kit PDF created:', outputPath)
}

// Generate both PDFs
generateBrandGuidelines()
generatePressKit()

console.log('\nPDFs generated successfully!')
