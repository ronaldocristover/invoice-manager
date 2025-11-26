import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface Project {
  id: string
  name: string
  description?: string | null
  clientId: string
  client?: {
    id: string
    name: string
    email: string
  }
  status: string
  createdAt: string
  updatedAt: string
  _count?: {
    invoices: number
  }
}

export interface CreateProjectDto {
  name: string
  description?: string
  clientId: string
  status?: string
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}

export const projectApi = {
  getAll: async (clientId?: string): Promise<Project[]> => {
    const params = clientId ? { clientId } : {}
    const response = await api.get<Project[]>('/projects', { params })
    return response.data
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`)
    return response.data
  },

  create: async (data: CreateProjectDto): Promise<Project> => {
    const response = await api.post<Project>('/projects', data)
    return response.data
  },

  update: async (id: string, data: UpdateProjectDto): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`)
  }
}

