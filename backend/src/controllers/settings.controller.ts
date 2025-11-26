import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await prisma.invoiceSettings.findFirst()

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.invoiceSettings.create({
        data: {
          invoicePrefix: 'INV',
          invoiceTheme: 'default',
          enableTax: true,
          enableShipping: false,
          enableDiscount: false,
          defaultTax: 0
        }
      })
    }

    res.json({
      id: settings.id,
      invoicePrefix: settings.invoicePrefix,
      invoiceTheme: settings.invoiceTheme,
      logoUrl: settings.logoUrl,
      enableTax: settings.enableTax,
      enableShipping: settings.enableShipping,
      enableDiscount: settings.enableDiscount,
      defaultTax: settings.defaultTax,
      defaultNotes: settings.defaultNotes,
      defaultTerms: settings.defaultTerms,
      pdfNameFormat: settings.pdfNameFormat,
      enableWatermark: (settings as any).enableWatermark,
      watermarkText: (settings as any).watermarkText,
      watermarkSize: (settings as any).watermarkSize,
      watermarkColor: (settings as any).watermarkColor,
      defaultFont: (settings as any).defaultFont,
      enableSignature: (settings as any).enableSignature,
      signatureImageUrl: (settings as any).signatureImageUrl,
      signatureText: (settings as any).signatureText,
      customFields: settings.customFields ? (settings.customFields as any) : []
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
}

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      invoicePrefix,
      invoiceTheme,
      logoUrl,
      enableTax,
      enableShipping,
      enableDiscount,
      defaultTax,
      defaultNotes,
      defaultTerms,
      pdfNameFormat,
      enableWatermark,
      watermarkText,
      watermarkSize,
      watermarkColor,
      defaultFont,
      enableSignature,
      signatureImageUrl,
      signatureText,
      customFields
    } = req.body

    let settings = await prisma.invoiceSettings.findFirst()

    const updateData: any = {}
    if (invoicePrefix !== undefined) updateData.invoicePrefix = invoicePrefix
    if (invoiceTheme !== undefined) updateData.invoiceTheme = invoiceTheme
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl
    if (enableTax !== undefined) updateData.enableTax = enableTax
    if (enableShipping !== undefined) updateData.enableShipping = enableShipping
    if (enableDiscount !== undefined) updateData.enableDiscount = enableDiscount
    if (defaultTax !== undefined) updateData.defaultTax = defaultTax
    if (defaultNotes !== undefined) updateData.defaultNotes = defaultNotes
    if (defaultTerms !== undefined) updateData.defaultTerms = defaultTerms
    if (pdfNameFormat !== undefined) updateData.pdfNameFormat = pdfNameFormat
    if (enableWatermark !== undefined) updateData.enableWatermark = enableWatermark
    if (watermarkText !== undefined) updateData.watermarkText = watermarkText
    if (watermarkSize !== undefined) updateData.watermarkSize = watermarkSize
      if (watermarkColor !== undefined) updateData.watermarkColor = watermarkColor
      if (defaultFont !== undefined) updateData.defaultFont = defaultFont
      if (enableSignature !== undefined) updateData.enableSignature = enableSignature
      if (signatureImageUrl !== undefined) updateData.signatureImageUrl = signatureImageUrl
      if (signatureText !== undefined) updateData.signatureText = signatureText
      if (customFields !== undefined) {
        updateData.customFields = customFields
      }

    if (settings) {
      settings = await prisma.invoiceSettings.update({
        where: { id: settings.id },
        data: updateData
      })
    } else {
      settings = await prisma.invoiceSettings.create({
        data: {
          invoicePrefix: invoicePrefix || 'INV',
          invoiceTheme: invoiceTheme || 'default',
          logoUrl: logoUrl || null,
          enableTax: enableTax !== undefined ? enableTax : true,
          enableShipping: enableShipping !== undefined ? enableShipping : false,
          enableDiscount: enableDiscount !== undefined ? enableDiscount : false,
          defaultTax: defaultTax || 0,
          defaultNotes: defaultNotes || null,
          defaultTerms: defaultTerms || null,
          pdfNameFormat: pdfNameFormat || 'invoice-{invoiceNumber}',
          enableWatermark: enableWatermark !== undefined ? enableWatermark : false,
          watermarkText: watermarkText || null,
          watermarkSize: watermarkSize || 50,
          watermarkColor: watermarkColor || '#CCCCCC',
          defaultFont: defaultFont || 'Helvetica',
          enableSignature: enableSignature !== undefined ? enableSignature : false,
          signatureImageUrl: signatureImageUrl || null,
          signatureText: signatureText || null,
          customFields: customFields || null
        }
      })
    }

    res.json({
      id: settings.id,
      invoicePrefix: settings.invoicePrefix,
      invoiceTheme: settings.invoiceTheme,
      logoUrl: settings.logoUrl,
      enableTax: settings.enableTax,
      enableShipping: settings.enableShipping,
      enableDiscount: settings.enableDiscount,
      defaultTax: settings.defaultTax,
      defaultNotes: settings.defaultNotes,
      defaultTerms: settings.defaultTerms,
      pdfNameFormat: settings.pdfNameFormat,
      enableWatermark: settings.enableWatermark,
      watermarkText: settings.watermarkText,
      watermarkSize: settings.watermarkSize,
      watermarkColor: settings.watermarkColor,
      defaultFont: settings.defaultFont,
      customFields: settings.customFields ? (settings.customFields as any) : []
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    res.status(500).json({ error: 'Failed to update settings' })
  }
}

