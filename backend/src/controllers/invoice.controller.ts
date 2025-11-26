import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { generatePdf } from '../services/pdf.service.js'

const prisma = new PrismaClient()

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
            // MySQL doesn't support case-insensitive mode, use contains with case-sensitive search
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

        const formattedInvoices = invoices.map((invoice) => ({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            clientEmail: invoice.clientEmail,
            clientAddress: invoice.clientAddress,
            issueDate: invoice.issueDate.toISOString(),
            dueDate: invoice.dueDate.toISOString(),
            status: invoice.status.toLowerCase() as 'draft' | 'sent' | 'paid' | 'overdue',
            items: invoice.items.map((item) => ({
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
            notes: invoice.notes,
            terms: invoice.terms,
            customFields: invoice.customFields ? JSON.parse(invoice.customFields as string) : null,
            createdAt: invoice.createdAt.toISOString(),
            updatedAt: invoice.updatedAt.toISOString()
        }))

        res.json({
            data: formattedInvoices,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        })
    } catch (error) {
        console.error('Error fetching invoices:', error)
        res.status(500).json({ error: 'Failed to fetch invoices' })
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
            res.status(404).json({ error: 'Invoice not found' })
            return
        }

        const formattedInvoice = {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            clientId: (invoice as any).clientId,
            projectId: (invoice as any).projectId,
            clientName: invoice.clientName,
            clientEmail: invoice.clientEmail,
            clientAddress: invoice.clientAddress,
            issueDate: invoice.issueDate.toISOString(),
            dueDate: invoice.dueDate.toISOString(),
            status: invoice.status.toLowerCase() as 'draft' | 'sent' | 'paid' | 'overdue',
            items: invoice.items.map((item) => ({
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
            notes: invoice.notes,
            terms: invoice.terms,
            customFields: invoice.customFields ? JSON.parse(invoice.customFields as string) : null,
            createdAt: invoice.createdAt.toISOString(),
            updatedAt: invoice.updatedAt.toISOString()
        }

        res.json(formattedInvoice)
    } catch (error) {
        console.error('Error fetching invoice:', error)
        res.status(500).json({ error: 'Failed to fetch invoice' })
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
            notes,
            terms,
            customFields
        } = req.body

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

        const formattedInvoice = {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            clientEmail: invoice.clientEmail,
            clientAddress: invoice.clientAddress,
            issueDate: invoice.issueDate.toISOString(),
            dueDate: invoice.dueDate.toISOString(),
            status: invoice.status.toLowerCase() as 'draft' | 'sent' | 'paid' | 'overdue',
            items: invoice.items.map((item) => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total
            })),
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            total: invoice.total,
            notes: invoice.notes,
            createdAt: invoice.createdAt.toISOString(),
            updatedAt: invoice.updatedAt.toISOString()
        }

        res.status(201).json(formattedInvoice)
    } catch (error) {
        console.error('Error creating invoice:', error)
        res.status(500).json({ error: 'Failed to create invoice' })
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
            notes,
            terms,
            customFields
        } = req.body

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
            total = subtotal + taxAmount + (shippingAmount || 0) - (discountAmount || 0)
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

        const formattedInvoice = {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            clientEmail: invoice.clientEmail,
            clientAddress: invoice.clientAddress,
            issueDate: invoice.issueDate.toISOString(),
            dueDate: invoice.dueDate.toISOString(),
            status: invoice.status.toLowerCase() as 'draft' | 'sent' | 'paid' | 'overdue',
            items: invoice.items.map((item) => ({
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
            notes: invoice.notes,
            terms: invoice.terms,
            customFields: invoice.customFields ? JSON.parse(invoice.customFields as string) : null,
            createdAt: invoice.createdAt.toISOString(),
            updatedAt: invoice.updatedAt.toISOString()
        }

        res.json(formattedInvoice)
    } catch (error) {
        console.error('Error updating invoice:', error)
        res.status(500).json({ error: 'Failed to update invoice' })
    }
}

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params

        await prisma.invoice.delete({
            where: { id }
        })

        res.status(204).send()
    } catch (error) {
        console.error('Error deleting invoice:', error)
        res.status(500).json({ error: 'Failed to delete invoice' })
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
            res.status(404).json({ error: 'Invoice not found' })
            return
        }

        // Get settings
        const settings = await prisma.invoiceSettings.findFirst()
        const settingsData = settings ? {
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
            signatureText: (settings as any).signatureText
        } : undefined

        const pdfBuffer = await generatePdf(invoice, settingsData)

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
        )
        res.send(pdfBuffer)
    } catch (error) {
        console.error('Error generating PDF:', error)
        res.status(500).json({ error: 'Failed to generate PDF' })
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
            res.status(404).json({ error: 'Invoice not found' })
            return
        }

        // Get settings
        const settings = await prisma.invoiceSettings.findFirst()
        const settingsData = settings ? {
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
            signatureText: (settings as any).signatureText
        } : undefined

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

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename=${filename}`)
        res.send(pdfBuffer)
    } catch (error) {
        console.error('Error generating PDF preview:', error)
        res.status(500).json({ error: 'Failed to generate PDF preview' })
    }
}

