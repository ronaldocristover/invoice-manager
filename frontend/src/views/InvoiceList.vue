<template>
  <div>
    <Breadcrumb />
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Invoices</h1>
      <router-link
        to="/create"
        class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        Create Invoice
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Invoice Number
          </label>
          <input
            v-model="filters.invoiceNumber"
            type="text"
            placeholder="Search by invoice number..."
            @input="handleFilterChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Client
          </label>
          <select
            v-model="filters.clientId"
            @change="handleFilterChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Clients</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }} {{ client.company ? `(${client.company})` : '' }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Project
          </label>
          <select
            v-model="filters.projectId"
            @change="handleFilterChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Created Date
          </label>
          <input
            v-model="filters.createdDate"
            type="date"
            @change="handleFilterChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading invoices...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="!invoices || invoices.length === 0" class="text-center py-12">
      <p class="text-gray-500 mb-4">No invoices found.</p>
      <router-link
        to="/create"
        class="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Create Your First Invoice
      </router-link>
    </div>

    <div v-else>
      <div class="bg-white shadow overflow-hidden sm:rounded-md mb-6">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice Number
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="invoice in invoices"
              :key="invoice.id"
              class="hover:bg-gray-50"
            >
              <td 
                class="px-6 py-4 whitespace-nowrap cursor-pointer"
                @click="$router.push(`/invoice/${invoice.id}`)"
              >
                <div class="text-sm font-medium text-gray-900">
                  {{ invoice.invoiceNumber }}
                </div>
              </td>
              <td 
                class="px-6 py-4 whitespace-nowrap cursor-pointer"
                @click="$router.push(`/invoice/${invoice.id}`)"
              >
                <div class="text-sm text-gray-900">{{ invoice.clientName }}</div>
              </td>
              <td 
                class="px-6 py-4 whitespace-nowrap cursor-pointer"
                @click="$router.push(`/invoice/${invoice.id}`)"
              >
                <div class="text-sm text-gray-500">
                  {{ formatDate(invoice.createdAt) }}
                </div>
              </td>
              <td 
                class="px-6 py-4 whitespace-nowrap cursor-pointer"
                @click="$router.push(`/invoice/${invoice.id}`)"
              >
                <div class="text-sm text-gray-500">
                  {{ formatDate(invoice.dueDate) }}
                </div>
              </td>
              <td 
                class="px-6 py-4 whitespace-nowrap cursor-pointer"
                @click="$router.push(`/invoice/${invoice.id}`)"
              >
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getStatusClass(invoice.status)
                  ]"
                >
                  {{ formatStatus(invoice.status) }}
                </span>
              </td>
              <td 
                class="px-6 py-4 whitespace-nowrap text-right cursor-pointer"
                @click="$router.push(`/invoice/${invoice.id}`)"
              >
                <div class="text-sm font-medium text-gray-900">
                  ${{ invoice.total.toFixed(2) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <button
                  @click.stop="exportPdf(invoice.id, invoice.invoiceNumber)"
                  :disabled="exportingPdf === invoice.id"
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export as PDF"
                >
                  <svg
                    v-if="exportingPdf !== invoice.id"
                    class="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="animate-spin w-4 h-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span v-if="exportingPdf !== invoice.id">PDF</span>
                  <span v-else>Exporting...</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.totalPages > 1" class="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="goToPage(pagination.page - 1)"
            :disabled="!pagination.hasPrevPage"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="goToPage(pagination.page + 1)"
            :disabled="!pagination.hasNextPage"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
              to
              <span class="font-medium">
                {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
              </span>
              of
              <span class="font-medium">{{ pagination.total }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="goToPage(pagination.page - 1)"
                :disabled="!pagination.hasPrevPage"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <template v-for="page in visiblePages" :key="page">
                <button
                  v-if="page !== '...'"
                  @click="goToPage(page as number)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === pagination.page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
                <span
                  v-else
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              </template>
              <button
                @click="goToPage(pagination.page + 1)"
                :disabled="!pagination.hasNextPage"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { invoiceApi } from '@/api/invoice'
import { clientApi } from '@/api/client'
import { projectApi } from '@/api/project'
import Breadcrumb from '@/components/Breadcrumb.vue'
import type { Invoice } from '@/types/invoice'
import type { Client } from '@/api/client'
import type { Project } from '@/api/project'

const invoices = ref<Invoice[]>([])
const clients = ref<Client[]>([])
const projects = ref<Project[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const exportingPdf = ref<string | null>(null)
const pagination = ref<{
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
} | null>(null)

const filters = ref({
  invoiceNumber: '',
  createdDate: '',
  clientId: '',
  projectId: ''
})

const getStatusClass = (status: Invoice['status']): string => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800'
  }
  return classes[status]
}

const formatStatus = (status: Invoice['status']): string => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const visiblePages = computed(() => {
  if (!pagination.value) return []
  
  const { page, totalPages } = pagination.value
  const pages: (number | string)[] = []
  
  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (page <= 3) {
      // Near the start
      for (let i = 2; i <= 4; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    } else if (page >= totalPages - 2) {
      // Near the end
      pages.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // In the middle
      pages.push('...')
      for (let i = page - 1; i <= page + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    }
  }
  
  return pages
})

const fetchInvoices = async (page = 1) => {
  try {
    loading.value = true
    error.value = null
    
    const params: any = {
      page,
      limit: 10
    }
    
    if (filters.value.invoiceNumber) {
      params.invoiceNumber = filters.value.invoiceNumber
    }
    
    if (filters.value.createdDate) {
      params.createdDate = filters.value.createdDate
    }
    
    if (filters.value.clientId) {
      params.clientId = filters.value.clientId
    }
    
    if (filters.value.projectId) {
      params.projectId = filters.value.projectId
    }
    
    const response = await invoiceApi.getAll(params)
    invoices.value = response.data
    pagination.value = response.pagination
  } catch (err) {
    error.value = 'Failed to load invoices'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  // Reset to page 1 when filters change
  fetchInvoices(1)
}

const clearFilters = () => {
  filters.value = {
    invoiceNumber: '',
    createdDate: '',
    clientId: '',
    projectId: ''
  }
  fetchInvoices(1)
}

const fetchClients = async () => {
  try {
    clients.value = await clientApi.getAll()
  } catch (err) {
    console.error('Failed to load clients:', err)
  }
}

const fetchProjects = async () => {
  try {
    projects.value = await projectApi.getAll()
  } catch (err) {
    console.error('Failed to load projects:', err)
  }
}

const exportPdf = async (invoiceId: string, invoiceNumber: string) => {
  try {
    exportingPdf.value = invoiceId
    const blob = await invoiceApi.generatePdf(invoiceId)
    
    // Create a download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${invoiceNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to export PDF:', err)
    alert('Failed to export PDF. Please try again.')
  } finally {
    exportingPdf.value = null
  }
}

const goToPage = (page: number) => {
  if (pagination.value) {
    if (page >= 1 && page <= pagination.value.totalPages) {
      fetchInvoices(page)
    }
  }
}

onMounted(() => {
  fetchClients()
  fetchProjects()
  fetchInvoices()
})
</script>
