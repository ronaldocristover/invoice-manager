import PDFDocument from 'pdfkit'
import type { Invoice, InvoiceItem, InvoiceStatus } from '@prisma/client'

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
  enableSignature?: boolean
  signatureImageUrl?: string | null
  signatureText?: string | null
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

      // Header with logo if available - matching preview
      let headerY = 50
      if (settings?.logoUrl) {
        // Note: In production, you'd need to fetch and embed the image
        // For now, we'll just add space for it
        headerY += 30
      }

      // Invoice title - centered
      doc
        .fontSize(28)
        .fillColor(colors.primary)
        .text('INVOICE', 50, headerY, { align: 'center', width: 500 })
        .fillColor('#000000')
      
      const contentStartY = headerY + 40

      // Invoice details box (left side) - matching preview layout
      const detailsY = contentStartY
      const boxWidth = 200
      const boxHeight = 90
      doc
        .rect(50, detailsY, boxWidth, boxHeight)
        .stroke()
        .fontSize(9)
        .fillColor('#666666')
        .text('Invoice Number', 60, detailsY + 8)
        .text('Issue Date', 60, detailsY + 28)
        .text('Due Date', 60, detailsY + 48)
        .text('Status', 60, detailsY + 68)
        .fillColor('#000000')
        .fontSize(10)
        .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
        .text(invoice.invoiceNumber, 60, detailsY + 18, { width: boxWidth - 20 })
        .font(defaultFont)
        .fontSize(10)
        .text(formatDateForPdf(invoice.issueDate), 60, detailsY + 38, { width: boxWidth - 20 })
        .text(formatDateForPdf(invoice.dueDate), 60, detailsY + 58, { width: boxWidth - 20 })
        .text(invoice.status, 60, detailsY + 78, { width: boxWidth - 20 })

      // Bill To section (right side) - matching preview layout
      const billToX = 300
      doc
        .fontSize(12)
        .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
        .fillColor(colors.primary)
        .text('Bill To:', billToX, detailsY)
        .fillColor('#000000')
        .font(defaultFont)
        .fontSize(11)
      doc.text(invoice.clientName, billToX, detailsY + 15)
      doc.text(invoice.clientEmail, billToX, detailsY + 30)
      doc.text(invoice.clientAddress, billToX, detailsY + 45, { width: 250 })

      doc.y = detailsY + boxHeight + 20

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
        doc.text(`$${item.unitPrice.toFixed(2)}`, 360, y + 5, { align: 'right', width: 80 })
        doc.font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
        doc.text(`$${item.total.toFixed(2)}`, 450, y + 5, { align: 'right', width: 80 })
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
      doc.text(`$${invoice.subtotal.toFixed(2)}`, totalsX + totalsWidth - 100, totalsY, { width: 100, align: 'right' })

      let currentY = totalsY + 15

      if (settings?.enableTax !== false && invoice.tax > 0) {
        doc.text('Tax:', totalsX, currentY, { width: totalsWidth - 100, align: 'left' })
        doc.text(`$${invoice.tax.toFixed(2)}`, totalsX + totalsWidth - 100, currentY, { width: 100, align: 'right' })
        currentY += 15
      }

      if (settings?.enableShipping && invoice.shipping > 0) {
        doc.text('Shipping:', totalsX, currentY, { width: totalsWidth - 100, align: 'left' })
        doc.text(`$${invoice.shipping.toFixed(2)}`, totalsX + totalsWidth - 100, currentY, { width: 100, align: 'right' })
        currentY += 15
      }

      if (settings?.enableDiscount && invoice.discount > 0) {
        doc.text('Discount:', totalsX, currentY, { width: totalsWidth - 100, align: 'left' })
        doc.text(`-$${invoice.discount.toFixed(2)}`, totalsX + totalsWidth - 100, currentY, { width: 100, align: 'right' })
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
        .text(`$${invoice.total.toFixed(2)}`, totalsX + totalsWidth - 100, currentY, { width: 100, align: 'right' })
        .fillColor('#000000')
      
      doc.y = currentY + 20

      // Notes - matching preview layout
      if (invoice.notes || settings?.defaultNotes) {
        doc.fontSize(11)
          .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
          .fillColor(colors.primary)
          .text('Notes:', 50, doc.y)
          .fillColor('#000000')
          .font(defaultFont)
        doc.fontSize(10)
        doc.text(invoice.notes || settings.defaultNotes || '', 50, doc.y + 15, { width: 500 })
        doc.y += 30
      }

      // Terms & Conditions - matching preview layout
      if (invoice.terms || settings?.defaultTerms) {
        doc.fontSize(11)
          .font(defaultFont.includes('Bold') ? defaultFont : `${defaultFont}-Bold`)
          .fillColor(colors.primary)
          .text('Terms & Conditions:', 50, doc.y)
          .fillColor('#000000')
          .font(defaultFont)
        doc.fontSize(10)
        doc.text(invoice.terms || settings.defaultTerms || '', 50, doc.y + 15, { width: 500 })
        doc.y += 30
      }

      // Signature section - matching preview layout
      if (settings?.enableSignature) {
        const signatureY = doc.y + 20
        
        // Signature image if provided
        if (settings.signatureImageUrl) {
          // Note: In production, you'd need to fetch and embed the image
          // For now, we'll add space for it and show a placeholder
          doc.rect(50, signatureY, 150, 60)
            .stroke()
            .fontSize(8)
            .fillColor('#999999')
            .text('Signature Image', 50, signatureY + 25, { width: 150, align: 'center' })
            .fillColor('#000000')
        }
        
        // Signature text if provided
        if (settings.signatureText) {
          const textX = settings.signatureImageUrl ? 220 : 50
          doc.fontSize(10)
            .font(defaultFont)
            .text(settings.signatureText, textX, signatureY + 20, { width: 330 })
        }
        
        // If no image or text, show a line for signature
        if (!settings.signatureImageUrl && !settings.signatureText) {
          doc.moveTo(50, signatureY + 30)
            .lineTo(200, signatureY + 30)
            .stroke()
          doc.fontSize(9)
            .fillColor('#666666')
            .text('Signature', 50, signatureY + 35)
            .fillColor('#000000')
        }
      }

      // Get page dimensions (used for watermark and timestamp)
      const pageWidth = doc.page.width
      const pageHeight = doc.page.height
      const margin = 50

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

        // Set watermark properties with opacity
        doc
          .fontSize(watermarkSize)
          .font(defaultFont)
          .fillColor(rgb[0], rgb[1], rgb[2], 0.2) // 20% opacity for watermark

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
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
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
