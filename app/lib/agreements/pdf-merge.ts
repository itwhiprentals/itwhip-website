// app/lib/agreements/pdf-merge.ts
// Merge ItWhip agreement PDF with host's uploaded agreement PDF
// Used for BOTH agreement type — creates consolidated document with Appendix A

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

/**
 * Merge ItWhip-generated agreement PDF with a host's uploaded agreement PDF.
 * Creates a consolidated document:
 *   - ItWhip agreement pages (with precedence clause on first page)
 *   - Appendix A divider page
 *   - Host's agreement pages
 *
 * @returns Buffer of the merged PDF
 */
export async function mergeAgreementPDFs(
  itwhipPdfBuffer: Buffer,
  hostPdfUrl: string,
  hostName: string
): Promise<Buffer> {
  // Fetch the host's PDF
  const hostPdfResponse = await fetch(hostPdfUrl)
  if (!hostPdfResponse.ok) {
    throw new Error(`Failed to fetch host agreement PDF: ${hostPdfResponse.status}`)
  }
  const hostPdfBytes = await hostPdfResponse.arrayBuffer()

  // Load both PDFs
  const itwhipDoc = await PDFDocument.load(itwhipPdfBuffer)
  const hostDoc = await PDFDocument.load(hostPdfBytes)

  // Create the merged document
  const mergedDoc = await PDFDocument.create()
  const font = await mergedDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await mergedDoc.embedFont(StandardFonts.HelveticaBold)

  // 1. Copy all ItWhip pages
  const itwhipPages = await mergedDoc.copyPages(itwhipDoc, itwhipDoc.getPageIndices())
  for (const page of itwhipPages) {
    mergedDoc.addPage(page)
  }

  // 2. Add precedence footnote to the first page
  const firstPage = mergedDoc.getPage(0)
  const { width } = firstPage.getSize()
  const footnoteText = 'This agreement includes Provider\'s Additional Terms (Appendix A). In case of conflict, these Platform Terms shall prevail.'
  const fontSize = 7
  const textWidth = font.widthOfTextAtSize(footnoteText, fontSize)
  firstPage.drawText(footnoteText, {
    x: (width - textWidth) / 2,
    y: 15,
    size: fontSize,
    font,
    color: rgb(0.5, 0.5, 0.5)
  })

  // 3. Add Appendix A divider page
  const dividerPage = mergedDoc.addPage([612, 792]) // US Letter
  const dividerTitle = 'APPENDIX A'
  const dividerSubtitle = `Provider's Additional Terms`
  const dividerProvider = hostName
  const dividerNote = 'The following pages contain the rental provider\'s additional terms and conditions.'
  const dividerPrecedence = 'In case of conflict between the Platform Terms (preceding pages) and these Provider Terms, the Platform Terms shall prevail.'

  // Center the divider content
  const titleSize = 28
  const subtitleSize = 16
  const providerSize = 14
  const noteSize = 11

  const titleWidth = boldFont.widthOfTextAtSize(dividerTitle, titleSize)
  const subtitleWidth = font.widthOfTextAtSize(dividerSubtitle, subtitleSize)
  const providerWidth = boldFont.widthOfTextAtSize(dividerProvider, providerSize)

  dividerPage.drawText(dividerTitle, {
    x: (612 - titleWidth) / 2,
    y: 500,
    size: titleSize,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2)
  })

  // Orange underline
  dividerPage.drawRectangle({
    x: (612 - 100) / 2,
    y: 490,
    width: 100,
    height: 3,
    color: rgb(0.976, 0.451, 0.086) // orange-500
  })

  dividerPage.drawText(dividerSubtitle, {
    x: (612 - subtitleWidth) / 2,
    y: 460,
    size: subtitleSize,
    font,
    color: rgb(0.4, 0.4, 0.4)
  })

  dividerPage.drawText(dividerProvider, {
    x: (612 - providerWidth) / 2,
    y: 430,
    size: providerSize,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2)
  })

  // Note text (word-wrapped)
  const maxLineWidth = 400
  drawWrappedText(dividerPage, dividerNote, {
    x: (612 - maxLineWidth) / 2,
    y: 380,
    maxWidth: maxLineWidth,
    fontSize: noteSize,
    font,
    color: rgb(0.5, 0.5, 0.5),
    lineHeight: 16
  })

  // Precedence clause
  drawWrappedText(dividerPage, dividerPrecedence, {
    x: (612 - maxLineWidth) / 2,
    y: 340,
    maxWidth: maxLineWidth,
    fontSize: noteSize,
    font: boldFont,
    color: rgb(0.6, 0.3, 0.0),
    lineHeight: 16
  })

  // 4. Copy all host PDF pages
  const hostPages = await mergedDoc.copyPages(hostDoc, hostDoc.getPageIndices())
  for (const page of hostPages) {
    mergedDoc.addPage(page)
  }

  // Save and return
  const mergedBytes = await mergedDoc.save()
  return Buffer.from(mergedBytes)
}

// Simple word-wrap text drawing helper
function drawWrappedText(
  page: ReturnType<typeof PDFDocument.prototype.addPage>,
  text: string,
  options: {
    x: number
    y: number
    maxWidth: number
    fontSize: number
    font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>
    color: ReturnType<typeof rgb>
    lineHeight: number
  }
) {
  const words = text.split(' ')
  let line = ''
  let y = options.y

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    const testWidth = options.font.widthOfTextAtSize(testLine, options.fontSize)

    if (testWidth > options.maxWidth && line) {
      page.drawText(line, {
        x: options.x,
        y,
        size: options.fontSize,
        font: options.font,
        color: options.color
      })
      line = word
      y -= options.lineHeight
    } else {
      line = testLine
    }
  }

  if (line) {
    page.drawText(line, {
      x: options.x,
      y,
      size: options.fontSize,
      font: options.font,
      color: options.color
    })
  }
}
