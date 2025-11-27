import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface InvoiceSettings {
  id?: string
  invoicePrefix: string
  invoiceTheme: string
  logoUrl?: string | null
  enableTax: boolean
  enableShipping: boolean
  enableDiscount: boolean
  defaultTax: number
  defaultNotes?: string | null
  defaultTerms?: string | null
  pdfNameFormat?: string
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
  customFields?: Array<{ label: string; type: string; required: boolean }>
}

export const settingsApi = {
  get: async (): Promise<InvoiceSettings> => {
    const response = await api.get<InvoiceSettings>('/settings')
    return response.data
  },

  update: async (data: Partial<InvoiceSettings>): Promise<InvoiceSettings> => {
    const response = await api.put<InvoiceSettings>('/settings', data)
    return response.data
  }
}

