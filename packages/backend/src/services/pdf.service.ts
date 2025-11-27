import PDFDocument from 'pdfkit'
import type { Invoice, InvoiceItem } from '@prisma/client'

interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[]
}

interface InvoiceSettings {
  invoicePrefix?: string
  invoiceTheme?: string
  logoUrl?: string | null
  enableTax?: boolean
  enableShipping?: boolean
  enableDiscount?: boolean
  defaultNotes?: string | null
  defaultTerms?: string | null
  enableWatermark?: boolean
  watermarkText?: string | null
  watermarkSize?: number
  watermarkColor?: string
  defaultFont?: string
  currencyFormat?: string
  currencySymbol?: string
  enableSignature?: boolean
  signatureImageUrl?: string | null
  signatureText?: string | null
  enableFrom?: boolean
  companyName?: string | null
  companyAddress?: string | null
  companyEmail?: string | null
  companyPhone?: string | null
}

interface CustomField {
  label: string
  value: string
}

// Helper function to format date as "23 October 2025"
const formatDateForPdf = (date: Date): string => {
  const day = date.getDate()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

// Helper function to format currency
const formatCurrency = (amount: number, settings?: InvoiceSettings): string => {
  const symbol = settings?.currencySymbol || '$'
  const format = settings?.currencyFormat || 'USD'
  const formattedAmount = Math.abs(amount).toFixed(2)
  const parts = formattedAmount.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const sign = amount < 0 ? '-' : ''

  if (format === 'EUR') {
    return `${sign}${parts.join(',')} ${symbol}`
  } else if (format === 'GBP') {
    return `${sign}${symbol}${parts.join('.')}`
  } else if (format === 'JPY') {
    return `${sign}${symbol}${Math.round(Math.abs(amount))}` // JPY typically has no decimals
  } else if (format === 'IDR') {
    return `${sign}${symbol} ${parts.join(',')}`
  }
  return `${sign}${symbol}${parts.join('.')}` // Default USD
}

export const generatePdf = async (
  invoice: InvoiceWithItems,
  settings?: InvoiceSettings
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const buffers: Buffer[] = []

      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers)
        resolve(pdfBuffer)
      })
      doc.on('error', reject)

      // Set default font
      const defaultFont = settings?.defaultFont || 'Helvetica'
      doc.font(defaultFont)

      // Theme colors
      const theme = settings?.invoiceTheme || 'default'
      const themes: Record<string, { primary: string; secondary: string }> = {
        default: { primary: '#000000', secondary: '#666666' },
        blue: { primary: '#1e40af', secondary: '#3b82f6' },
        green: { primary: '#059669', secondary: '#10b981' },
        purple: { primary: '#7c3aed', secondary: '#a78bfa' },
        red: { primary: '#dc2626', secondary: '#ef4444' }
      }
      const colors = themes[theme] || themes.default

      // Helper function to convert hex to RGB
      const hexToRgb = (hex: string): [number, number, number] => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
          ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
          ]
          : [0.8, 0.8, 0.8] // Default gray
      }

      // Header: Company Logo + Name (left) and Invoice Number (right)
      const headerY = 50
      const pageWidth = doc.page.width
      const margin = 50
      const headerHeight = 60

      // Left side: Company Logo and Name
      let leftHeaderX = margin
      let leftHeaderY = headerY

      if (settings?.logoUrl) {
        try {
          // Check if it's a URL or file path
          const isUrl = settings.logoUrl.startsWith('http://') || settings.logoUrl.startsWith('https://')

          if (!isUrl) {
            // File path - try to load image
            try {
              doc.image(settings.logoUrl, leftHeaderX, leftHeaderY, {
                width: 60,
                height: 40,
                fit: [60, 40]
              })
              leftHeaderX += 70
            } catch (imageError) {
              // If image loading fails, don't show anything (skip logo)
            }
          }
          // If URL, skip logo (don't show placeholder)
        } catch (error) {
          // If logo fails, just continue without it
        }
      }

      // Company Name next to logo
      if (settings?.companyName) {
        doc
          .fontSize(18)
          .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
          .fillColor(colors.primary)
          .text(settings.companyName, leftHeaderX, leftHeaderY + 10, {
            width: 300,
            align: 'left'
          })
          .fillColor('#000000')
      }

      // Right side: Invoice Number
      const invoiceNumberX = pageWidth - margin - 200
      doc
        .fontSize(12)
        .font(defaultFont)
        .fillColor('#666666')
        .text('Invoice Number:', invoiceNumberX, leftHeaderY, { width: 200, align: 'right' })
        .fontSize(16)
        .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
        .fillColor(colors.primary)
        .text(invoice.invoiceNumber, invoiceNumberX, leftHeaderY + 15, { width: 200, align: 'right' })
        .fillColor('#000000')

      const contentStartY = headerY + headerHeight + 20

      // Invoice details (left side) - matching preview layout (no border)
      const detailsY = contentStartY
      const boxWidth = 200
      doc
        .fontSize(9)
        .fillColor('#666666')
        .text('Issue Date', 50, detailsY)
        .text('Due Date', 50, detailsY + 20)
        .fillColor('#000000')
        .fontSize(10)
        .font(defaultFont)
        .text(formatDateForPdf(invoice.issueDate), 50, detailsY + 10, { width: boxWidth - 20 })
        .text(formatDateForPdf(invoice.dueDate), 50, detailsY + 30, { width: boxWidth - 20 })

      // From and Bill To sections - side by side
      const fromBillToY = detailsY + 50
      const leftColumnX = 50
      const rightColumnX = 300
      const columnWidth = 250

      // From section (left side) - only if enabled
      if (settings?.enableFrom && (settings?.companyName || settings?.companyAddress || settings?.companyEmail)) {
        doc
          .fontSize(12)
          .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
          .fillColor(colors.primary)
          .text('From:', leftColumnX, fromBillToY)
          .fillColor('#000000')
          .font(defaultFont)
          .fontSize(11)

        let fromY = fromBillToY + 15
        if (settings.companyName) {
          doc.text(settings.companyName, leftColumnX, fromY)
          fromY += 15
        }
        if (settings.companyEmail) {
          doc.text(settings.companyEmail, leftColumnX, fromY)
          fromY += 15
        }
        if (settings.companyPhone) {
          doc.text(settings.companyPhone, leftColumnX, fromY)
          fromY += 15
        }
        if (settings.companyAddress) {
          doc.text(settings.companyAddress, leftColumnX, fromY, { width: columnWidth })
        }
      }

      // Bill To section (right side) - matching preview layout
      doc
        .fontSize(12)
        .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
        .fillColor(colors.primary)
        .text('Bill To:', rightColumnX, fromBillToY)
        .fillColor('#000000')
        .font(defaultFont)
        .fontSize(11)
      doc.text(invoice.clientName, rightColumnX, fromBillToY + 15)
      doc.text(invoice.clientEmail, rightColumnX, fromBillToY + 30)
      doc.text(invoice.clientAddress, rightColumnX, fromBillToY + 45, { width: columnWidth })

      doc.y = fromBillToY + 80

      // Custom fields
      if (invoice.customFields) {
        try {
          const customFields = JSON.parse(invoice.customFields as string) as CustomField[]
          if (Array.isArray(customFields) && customFields.length > 0) {
            doc.fontSize(12).text('Additional Information:', { underline: true })
            customFields.forEach((field) => {
              doc.fontSize(10).text(`${field.label}: ${field.value}`)
            })
            doc.moveDown()
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // Items table - matching preview layout
      doc.fontSize(12)
        .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
        .fillColor(colors.primary)
        .text('Items:', 50, doc.y)
        .fillColor('#000000')

      const tableTop = doc.y + 15

      // Table header with background - matching preview
      doc
        .rect(50, tableTop, 500, 20)
        .fillColor('#f9fafb')
        .fill()
        .fillColor('#000000')
        .fontSize(9)
        .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
        .text('Description', 60, tableTop + 6)
        .text('Qty', 300, tableTop + 6, { align: 'center', width: 50 })
        .text('Unit Price', 360, tableTop + 6, { align: 'right', width: 80 })
        .text('Total', 450, tableTop + 6, { align: 'right', width: 80 })
        .font(defaultFont)

      // Table rows - matching preview layout
      let y = tableTop + 20
      invoice.items.forEach((item, index) => {
        const rowHeight = 20
        // Alternate row colors for better readability
        if (index % 2 === 0) {
          doc.rect(50, y, 500, rowHeight).fillColor('#ffffff').fill().fillColor('#000000')
        } else {
          doc.rect(50, y, 500, rowHeight).fillColor('#f9fafb').fill().fillColor('#000000')
        }
        doc.fontSize(10).font(defaultFont)
        doc.text(item.description, 60, y + 5, { width: 230 })
        doc.text(item.quantity.toString(), 300, y + 5, { align: 'center', width: 50 })
        doc.text(formatCurrency(item.unitPrice, settings), 360, y + 5, { align: 'right', width: 80 })
        doc.font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
        doc.text(formatCurrency(item.total, settings), 450, y + 5, { align: 'right', width: 80 })
        doc.font(defaultFont)
        y += rowHeight
      })

      doc.y = y + 10

      // Totals section - matching preview layout (right-aligned)
      const totalsY = doc.y
      const totalsX = 350
      const totalsWidth = 200

      doc.fontSize(10).font(defaultFont)
      doc.text('Subtotal:', totalsX, totalsY, { width: totalsWidth - 100, align: 'left' })
      doc.text(formatCurrency(invoice.subtotal, settings), totalsX + totalsWidth - 100, totalsY, { width: 100, align: 'right' })

      let currentY = totalsY + 15

      if (settings?.enableTax !== false && invoice.tax > 0) {
        doc.text('Tax:', totalsX, currentY, { width: totalsWidth - 100, align: 'left' })
        doc.text(formatCurrency(invoice.tax, settings), totalsX + totalsWidth - 100, currentY, { width: 100, align: 'right' })
        currentY += 15
      }

      if (settings?.enableShipping && invoice.shipping > 0) {
        doc.text('Shipping:', totalsX, currentY, { width: totalsWidth - 100, align: 'left' })
        doc.text(formatCurrency(invoice.shipping, settings), totalsX + totalsWidth - 100, currentY, { width: 100, align: 'right' })
        currentY += 15
      }

      if (settings?.enableDiscount && invoice.discount > 0) {
        doc.text('Discount:', totalsX, currentY, { width: totalsWidth - 100, align: 'left' })
        doc.text(`-${formatCurrency(invoice.discount, settings)}`, totalsX + totalsWidth - 100, currentY, { width: 100, align: 'right' })
        currentY += 15
      }

      // Total - matching preview layout
      currentY += 5
      doc
        .moveTo(totalsX, currentY)
        .lineTo(totalsX + totalsWidth, currentY)
        .stroke()

      currentY += 10
      doc
        .fontSize(12)
        .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
        .fillColor(colors.primary)
        .text('Total:', totalsX, currentY, { width: totalsWidth - 100, align: 'left' })
        .text(formatCurrency(invoice.total, settings), totalsX + totalsWidth - 100, currentY, { width: 100, align: 'right' })
        .fillColor('#000000')

      // Amount Paid and Balance Due
      const amountPaid = invoice.amountPaid || 0
      if (amountPaid > 0) {
        currentY += 20
        doc
          .fontSize(10)
          .font(defaultFont)
          .text('Amount Paid:', totalsX, currentY, { width: totalsWidth - 100, align: 'left' })
          .fillColor('#22c55e')
          .text(formatCurrency(amountPaid, settings), totalsX + totalsWidth - 100, currentY, { width: 100, align: 'right' })
          .fillColor('#000000')

        const balanceDue = invoice.total - amountPaid
        currentY += 15
        doc
          .fontSize(11)
          .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
          .text('Balance Due:', totalsX, currentY, { width: totalsWidth - 100, align: 'left' })
          .fillColor(balanceDue > 0 ? '#dc2626' : '#22c55e')
          .text(formatCurrency(balanceDue, settings), totalsX + totalsWidth - 100, currentY, { width: 100, align: 'right' })
          .fillColor('#000000')
      }

      doc.y = currentY + 20

      // Get page dimensions (used for signature, watermark and timestamp)
      // Note: pageWidth and margin already declared in header section
      const pageHeight = doc.page.height

      // Notes, Terms & Signature - side by side layout
      const notesTermsY = doc.y
      const leftColumnWidth = 280 // Width for notes and terms
      const rightColumnWidth = 270 // Width for signature
      const signatureColumnX = pageWidth - margin - rightColumnWidth

      // Left column: Notes and Terms
      let leftColumnY = notesTermsY
      let maxLeftHeight = 0

      // Notes - left side
      if (invoice.notes || settings?.defaultNotes) {
        doc.fontSize(11)
          .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
          .fillColor(colors.primary)
          .text('Notes:', margin, leftColumnY)
          .fillColor('#000000')
          .font(defaultFont)
        doc.fontSize(10)
        const notesText = invoice.notes || (settings?.defaultNotes || '')
        const notesHeight = doc.heightOfString(notesText, { width: leftColumnWidth - 10 })
        doc.text(notesText, margin, leftColumnY + 15, { width: leftColumnWidth - 10 })
        leftColumnY += notesHeight + 25
        maxLeftHeight = Math.max(maxLeftHeight, leftColumnY - notesTermsY)
      }

      // Terms & Conditions - left side
      if (invoice.terms || settings?.defaultTerms) {
        doc.fontSize(11)
          .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
          .fillColor(colors.primary)
          .text('Terms & Conditions:', margin, leftColumnY)
          .fillColor('#000000')
          .font(defaultFont)
        doc.fontSize(10)
        const termsText = invoice.terms || (settings?.defaultTerms || '')
        const termsHeight = doc.heightOfString(termsText, { width: leftColumnWidth - 10 })
        doc.text(termsText, margin, leftColumnY + 15, { width: leftColumnWidth - 10 })
        leftColumnY += termsHeight + 25
        maxLeftHeight = Math.max(maxLeftHeight, leftColumnY - notesTermsY)
      }

      // Right column: Signature section (aligned with Notes/Terms start)
      let maxRightHeight = 0
      if (settings?.enableSignature) {
        const signatureY = notesTermsY
        const signatureWidth = rightColumnWidth
        let finalSignatureY = signatureY

        // Signature image if provided
        if (settings.signatureImageUrl) {
          try {
            // Check if it's a file path or URL
            // For file paths, PDFKit can load directly
            // For URLs, you'd need to fetch first (implementation needed)
            const isUrl = settings.signatureImageUrl.startsWith('http://') ||
              settings.signatureImageUrl.startsWith('https://')

            if (isUrl) {
              // URL - show placeholder (in production, fetch and convert to buffer)
              doc.rect(signatureColumnX, finalSignatureY, signatureWidth, 50)
                .stroke()
                .fontSize(8)
                .fillColor('#999999')
                .text('Signature Image\n(URL)', signatureColumnX, finalSignatureY + 15, {
                  width: signatureWidth,
                  align: 'center'
                })
                .fillColor('#000000')
            } else {
              // File path - try to load image
              try {
                doc.image(settings.signatureImageUrl, signatureColumnX, finalSignatureY, {
                  width: signatureWidth,
                  height: 50,
                  fit: [signatureWidth, 50]
                })
              } catch (imageError) {
                // If image loading fails, show placeholder
                doc.rect(signatureColumnX, finalSignatureY, signatureWidth, 50)
                  .stroke()
                  .fontSize(8)
                  .fillColor('#999999')
                  .text('Signature Image', signatureColumnX, finalSignatureY + 20, {
                    width: signatureWidth,
                    align: 'center'
                  })
                  .fillColor('#000000')
              }
            }
            finalSignatureY += 55
          } catch (error) {
            // If image loading fails, show placeholder
            doc.rect(signatureColumnX, finalSignatureY, signatureWidth, 50)
              .stroke()
              .fontSize(8)
              .fillColor('#999999')
              .text('Signature Image', signatureColumnX, finalSignatureY + 20, {
                width: signatureWidth,
                align: 'center'
              })
              .fillColor('#000000')
            finalSignatureY += 55
          }
        } else {
          // Draw signature line if no image
          const lineY = finalSignatureY + 20
          doc.moveTo(signatureColumnX, lineY)
            .lineTo(signatureColumnX + signatureWidth, lineY)
            .stroke()
          finalSignatureY += 30
        }

        // Signature name/text below the signature line or image (right-aligned)
        if (settings.signatureText) {
          doc.fontSize(10)
            .font(defaultFont)
            .fillColor('#000000')
            .text(settings.signatureText, signatureColumnX, finalSignatureY, {
              width: signatureWidth,
              align: 'right'
            })
          finalSignatureY += 15
        } else {
          // Default text if no signature text provided
          doc.fontSize(9)
            .fillColor('#666666')
            .text('Authorized Signature', signatureColumnX, finalSignatureY, {
              width: signatureWidth,
              align: 'right'
            })
            .fillColor('#000000')
          finalSignatureY += 15
        }
        maxRightHeight = finalSignatureY - notesTermsY
      }

      // Update doc.y to the bottom of the tallest column (notes/terms or signature)
      doc.y = notesTermsY + Math.max(maxLeftHeight || 0, maxRightHeight || 0) + 10

      // Add watermark if enabled
      if (settings?.enableWatermark && settings?.watermarkText) {
        const watermarkText = settings.watermarkText
        const watermarkSize = settings.watermarkSize || 50
        const watermarkColor = settings.watermarkColor || '#CCCCCC'
        const rgb = hexToRgb(watermarkColor)

        // Save current state
        doc.save()

        // Move to center and rotate
        doc.translate(pageWidth / 2, pageHeight / 2)
        doc.rotate(-45)

        // Set watermark properties with opacity (using lighter color for 20% opacity effect)
        const watermarkR = Math.round((rgb[0] * 0.2 + 0.8) * 255)
        const watermarkG = Math.round((rgb[1] * 0.2 + 0.8) * 255)
        const watermarkB = Math.round((rgb[2] * 0.2 + 0.8) * 255)
        const watermarkHex = `#${watermarkR.toString(16).padStart(2, '0')}${watermarkG.toString(16).padStart(2, '0')}${watermarkB.toString(16).padStart(2, '0')}`
        doc
          .fontSize(watermarkSize)
          .font(defaultFont)
          .fillColor(watermarkHex)

        // Calculate text width for centering
        const textWidth = doc.widthOfString(watermarkText)
        const textHeight = watermarkSize

        // Draw watermark text centered
        doc.text(watermarkText, -textWidth / 2, -textHeight / 2, {
          align: 'center'
        })

        // Restore previous state
        doc.restore()
      }

      // Add generated timestamp at bottom right

      // Format current date and time with timezone
      const now = new Date()
      const timezoneOffset = -now.getTimezoneOffset()
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
      const offsetMinutes = Math.abs(timezoneOffset) % 60
      const offsetSign = timezoneOffset >= 0 ? '+' : '-'
      const timezoneString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`

      // Format date as "23 October 2025"
      const day = now.getDate()
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      const month = monthNames[now.getMonth()]
      const year = now.getFullYear()
      const formattedDate = `${day} ${month} ${year}`

      // Format time as HH:MM:SS
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const formattedTime = `${hours}:${minutes}:${seconds}`

      const generatedText = `Generated at: ${formattedDate} ${formattedTime} ${timezoneString}`

      // Position at bottom right
      doc
        .fontSize(6)
        .font(defaultFont)
        .fillColor('#666666')
        .text(
          generatedText,
          pageWidth - margin - doc.widthOfString(generatedText),
          pageHeight - margin - 10,
          { align: 'right' }
        )
        .fillColor('#000000')

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
