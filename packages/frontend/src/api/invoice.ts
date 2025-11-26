import axios from 'axios'
import type { Invoice, CreateInvoiceDto, UpdateInvoiceDto } from '@/types/invoice'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

interface PaginationParams {
  page?: number
  limit?: number
  invoiceNumber?: string
  createdDate?: string
  clientId?: string
  projectId?: string
}

interface PaginatedResponse {
  data: Invoice[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export const invoiceApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse> => {
    const response = await api.get<PaginatedResponse>('/invoices', { params })
    return response.data
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await api.get<Invoice>(`/invoices/${id}`)
    return response.data
  },

  create: async (data: CreateInvoiceDto): Promise<Invoice> => {
    const response = await api.post<Invoice>('/invoices', data)
    return response.data
  },

  update: async (id: string, data: UpdateInvoiceDto): Promise<Invoice> => {
    const response = await api.put<Invoice>(`/invoices/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`)
  },

  generatePdf: async (id: string): Promise<Blob> => {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  }
}

