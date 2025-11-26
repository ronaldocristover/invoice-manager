import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface Client {
  id: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  company?: string | null
  taxId?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    invoices: number
    projects: number
  }
}

export interface CreateClientDto {
  name: string
  email: string
  phone?: string
  address?: string
  company?: string
  taxId?: string
  notes?: string
}

export interface UpdateClientDto extends Partial<CreateClientDto> {}

export const clientApi = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get<Client[]>('/clients')
    return response.data
  },

  getById: async (id: string): Promise<Client> => {
    const response = await api.get<Client>(`/clients/${id}`)
    return response.data
  },

  create: async (data: CreateClientDto): Promise<Client> => {
    const response = await api.post<Client>('/clients', data)
    return response.data
  },

  update: async (id: string, data: UpdateClientDto): Promise<Client> => {
    const response = await api.put<Client>(`/clients/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`)
  }
}

