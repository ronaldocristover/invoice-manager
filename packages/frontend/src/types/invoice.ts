export interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId?: string | null
  projectId?: string | null
  clientName: string
  clientEmail: string
  clientAddress: string
  issueDate: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  items: InvoiceItem[]
  subtotal: number
  tax: number
  shipping?: number
  discount?: number
  total: number
  notes?: string
  terms?: string
  customFields?: any
  createdAt: string
  updatedAt: string
}

export interface CreateInvoiceDto {
  invoiceNumber: string
  clientId?: string
  projectId?: string
  clientName: string
  clientEmail: string
  clientAddress: string
  issueDate: string
  dueDate: string
  items: Omit<InvoiceItem, 'id' | 'total'>[]
  tax: number
  shipping?: number
  discount?: number
  notes?: string
  terms?: string
  customFields?: any
}

export interface UpdateInvoiceDto extends Partial<CreateInvoiceDto> {
  status?: Invoice['status']
}

