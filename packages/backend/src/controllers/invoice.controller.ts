import { Request, Response } from 'express'
import { generatePdf } from '../services/pdf.service.js'
import { prisma } from '../lib/prisma.js'
import logger from '../lib/logger.js'
import { CustomError } from '../middleware/errorHandler.js'
import { sendPaginated } from '../utils/response.js'

// Helper function to format invoice data
const formatInvoice = (invoice: any) => {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    clientId: invoice.clientId || null,
    projectId: invoice.projectId || null,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    clientAddress: invoice.clientAddress,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    status: invoice.status.toLowerCase() as 'draft' | 'sent' | 'paid' | 'overdue',
    items: invoice.items.map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    })),
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    shipping: invoice.shipping,
    discount: invoice.discount,
    total: invoice.total,
    amountPaid: invoice.amountPaid,
    notes: invoice.notes,
    terms: invoice.terms,
    customFields: invoice.customFields ? JSON.parse(invoice.customFields as string) : null,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString()
  }
}

// Helper function to get settings data
const getSettingsData = (settings: any) => {
  if (!settings) return undefined
  return {
    invoicePrefix: settings.invoicePrefix,
    invoiceTheme: settings.invoiceTheme,
    logoUrl: settings.logoUrl,
    enableTax: settings.enableTax,
    enableShipping: settings.enableShipping,
    enableDiscount: settings.enableDiscount,
    defaultNotes: settings.defaultNotes,
    defaultTerms: settings.defaultTerms,
    pdfNameFormat: (settings as any).pdfNameFormat,
    enableWatermark: (settings as any).enableWatermark,
    watermarkText: (settings as any).watermarkText,
    watermarkSize: (settings as any).watermarkSize,
    watermarkColor: (settings as any).watermarkColor,
    defaultFont: (settings as any).defaultFont,
    enableSignature: (settings as any).enableSignature,
    signatureImageUrl: (settings as any).signatureImageUrl,
    signatureText: (settings as any).signatureText,
    enableFrom: (settings as any).enableFrom,
    companyName: (settings as any).companyName,
    companyAddress: (settings as any).companyAddress,
    companyEmail: (settings as any).companyEmail,
    companyPhone: (settings as any).companyPhone,
    currencyFormat: (settings as any).currencyFormat,
    currencySymbol: (settings as any).currencySymbol,
  }
}

export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit
    const invoiceNumber = req.query.invoiceNumber as string | undefined
    const createdDate = req.query.createdDate as string | undefined
    const clientId = req.query.clientId as string | undefined
    const projectId = req.query.projectId as string | undefined

    // Build where clause for filtering
    const where: any = {}

    if (invoiceNumber) {
      where.invoiceNumber = {
        contains: invoiceNumber
      }
    }

    if (createdDate) {
      const date = new Date(createdDate)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      where.createdAt = {
        gte: date,
        lt: nextDay
      }
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (projectId) {
      where.projectId = projectId
    }

    // Get total count for pagination
    const total = await prisma.invoice.count({ where })

    // Get invoices with pagination
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const formattedInvoices = invoices.map(formatInvoice)

    logger.info('Invoices fetched successfully', {
      count: formattedInvoices.length,
      page,
      limit,
      total
    })

    sendPaginated(res, formattedInvoices, { page, limit, total })
  } catch (error: any) {
    logger.error('Error fetching invoices', {
      error: error.message,
      stack: error.stack
    })
    throw new CustomError('Failed to fetch invoices', 500)
  }
}

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true
      }
    })

    if (!invoice) {
      logger.warn('Invoice not found', { invoiceId: id })
      throw new CustomError('Invoice not found', 404)
    }

    // Get settings for invoice display
    const settings = await prisma.invoiceSettings.findFirst()
    const settingsData = getSettingsData(settings)

    const formattedInvoice = {
      ...formatInvoice(invoice),
      // Add settings data for display
      logoUrl: settingsData?.logoUrl,
      enableTax: settingsData?.enableTax,
      enableShipping: settingsData?.enableShipping,
      enableDiscount: settingsData?.enableDiscount,
      enableSignature: settingsData?.enableSignature,
      signatureImageUrl: settingsData?.signatureImageUrl,
      signatureText: settingsData?.signatureText,
      enableFrom: settingsData?.enableFrom,
      companyName: settingsData?.companyName,
      companyAddress: settingsData?.companyAddress,
      companyEmail: settingsData?.companyEmail,
      companyPhone: settingsData?.companyPhone,
      currencyFormat: settingsData?.currencyFormat,
      currencySymbol: settingsData?.currencySymbol,
    }

    logger.info('Invoice fetched successfully', { invoiceId: id })

    res.json(formattedInvoice)
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error
    }
    logger.error('Error fetching invoice', {
      error: error.message,
      stack: error.stack,
      invoiceId: req.params.id
    })
    throw new CustomError('Failed to fetch invoice', 500)
  }
}

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      invoiceNumber,
      clientId,
      projectId,
      clientName,
      clientEmail,
      clientAddress,
      issueDate,
      dueDate,
      items,
      tax,
      shipping,
      discount,
      amountPaid,
      notes,
      terms,
      customFields
    } = req.body

    // Validate required fields
    if (!invoiceNumber || !clientName || !clientEmail || !items || items.length === 0) {
      throw new CustomError('Missing required fields', 400)
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    )
    const taxAmount = (subtotal * (tax || 0)) / 100
    const shippingAmount = shipping || 0
    const discountAmount = discount || 0
    const total = subtotal + taxAmount + shippingAmount - discountAmount

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: clientId || null,
        projectId: projectId || null,
        clientName,
        clientEmail,
        clientAddress,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        status: req.body.status ? req.body.status.toUpperCase() : 'DRAFT',
        subtotal,
        tax: taxAmount,
        shipping: shippingAmount,
        discount: discountAmount,
        total,
        amountPaid: amountPaid || 0,
        notes,
        terms,
        customFields: customFields ? JSON.stringify(customFields) : null,
        items: {
          create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        items: true
      }
    })

    const formattedInvoice = formatInvoice(invoice)

    logger.info('Invoice created successfully', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber
    })

    res.status(201).json(formattedInvoice)
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error
    }
    logger.error('Error creating invoice', {
      error: error.message,
      stack: error.stack,
      body: req.body
    })
    throw new CustomError('Failed to create invoice', 500)
  }
}

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      invoiceNumber,
      clientId,
      projectId,
      clientName,
      clientEmail,
      clientAddress,
      issueDate,
      dueDate,
      status,
      items,
      tax,
      shipping,
      discount,
      amountPaid,
      notes,
      terms,
      customFields
    } = req.body

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!existingInvoice) {
      logger.warn('Invoice not found for update', { invoiceId: id })
      throw new CustomError('Invoice not found', 404)
    }

    // If items are provided, recalculate totals
    let subtotal: number | undefined
    let taxAmount: number | undefined
    let shippingAmount: number | undefined
    let discountAmount: number | undefined
    let total: number | undefined

    if (items) {
      subtotal = items.reduce(
        (sum: number, item: { quantity: number; unitPrice: number }) =>
          sum + item.quantity * item.unitPrice,
        0
      )
      taxAmount = (subtotal * (tax || 0)) / 100
      shippingAmount = shipping || 0
      discountAmount = discount || 0
      total = subtotal + taxAmount + shippingAmount - discountAmount
    }

    // Update invoice
    const updateData: any = {}
    if (invoiceNumber) updateData.invoiceNumber = invoiceNumber
    if (clientId !== undefined) updateData.clientId = clientId || null
    if (projectId !== undefined) updateData.projectId = projectId || null
    if (clientName) updateData.clientName = clientName
    if (clientEmail) updateData.clientEmail = clientEmail
    if (clientAddress) updateData.clientAddress = clientAddress
    if (issueDate) updateData.issueDate = new Date(issueDate)
    if (dueDate) updateData.dueDate = new Date(dueDate)
    if (status) updateData.status = status.toUpperCase()
    if (subtotal !== undefined) updateData.subtotal = subtotal
    if (taxAmount !== undefined) updateData.tax = taxAmount
    if (shippingAmount !== undefined) updateData.shipping = shippingAmount
    if (discountAmount !== undefined) updateData.discount = discountAmount
    if (total !== undefined) updateData.total = total
    if (amountPaid !== undefined) updateData.amountPaid = amountPaid
    if (notes !== undefined) updateData.notes = notes
    if (terms !== undefined) updateData.terms = terms
    if (customFields !== undefined) {
      updateData.customFields = JSON.stringify(customFields)
    }

    // If items are provided, delete old items and create new ones
    if (items) {
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id }
      })

      updateData.items = {
        create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        }))
      }
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        items: true
      }
    })

    const formattedInvoice = formatInvoice(invoice)

    logger.info('Invoice updated successfully', {
      invoiceId: id,
      invoiceNumber: invoice.invoiceNumber
    })

    res.json(formattedInvoice)
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error
    }
    logger.error('Error updating invoice', {
      error: error.message,
      stack: error.stack,
      invoiceId: req.params.id
    })
    throw new CustomError('Failed to update invoice', 500)
  }
}

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const invoice = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!invoice) {
      logger.warn('Invoice not found for deletion', { invoiceId: id })
      throw new CustomError('Invoice not found', 404)
    }

    await prisma.invoice.delete({
      where: { id }
    })

    logger.info('Invoice deleted successfully', {
      invoiceId: id,
      invoiceNumber: invoice.invoiceNumber
    })

    res.status(204).send()
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error
    }
    logger.error('Error deleting invoice', {
      error: error.message,
      stack: error.stack,
      invoiceId: req.params.id
    })
    throw new CustomError('Failed to delete invoice', 500)
  }
}

export const generateInvoicePdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true
      }
    })

    if (!invoice) {
      logger.warn('Invoice not found for PDF generation', { invoiceId: id })
      throw new CustomError('Invoice not found', 404)
    }

    // Get settings
    const settings = await prisma.invoiceSettings.findFirst()
    const settingsData = getSettingsData(settings)

    const pdfBuffer = await generatePdf(invoice, settingsData)

    logger.info('PDF generated successfully', {
      invoiceId: id,
      invoiceNumber: invoice.invoiceNumber
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    )
    res.send(pdfBuffer)
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error
    }
    logger.error('Error generating PDF', {
      error: error.message,
      stack: error.stack,
      invoiceId: req.params.id
    })
    throw new CustomError('Failed to generate PDF', 500)
  }
}

export const previewInvoicePdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true
      }
    })

    if (!invoice) {
      logger.warn('Invoice not found for PDF preview', { invoiceId: id })
      throw new CustomError('Invoice not found', 404)
    }

    // Get settings
    const settings = await prisma.invoiceSettings.findFirst()
    const settingsData = getSettingsData(settings)

    const pdfBuffer = await generatePdf(invoice, settingsData)

    // Generate filename from format for preview
    let filename = `preview-${invoice.invoiceNumber}.pdf`
    if (settingsData?.pdfNameFormat) {
      const date = new Date(invoice.issueDate)
      const dateStr = date.toISOString().split('T')[0]
      filename = settingsData.pdfNameFormat
        .replace('{invoiceNumber}', invoice.invoiceNumber)
        .replace('{date}', dateStr)
        .replace('{clientName}', invoice.clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase())
      if (!filename.endsWith('.pdf')) {
        filename += '.pdf'
      }
    }

    logger.info('PDF preview generated successfully', {
      invoiceId: id,
      invoiceNumber: invoice.invoiceNumber
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename=${filename}`)
    res.send(pdfBuffer)
  } catch (error: any) {
    if (error instanceof CustomError) {
      throw error
    }
    logger.error('Error generating PDF preview', {
      error: error.message,
      stack: error.stack,
      invoiceId: req.params.id
    })
    throw new CustomError('Failed to generate PDF preview', 500)
  }
}
