<template>
  <div>
    <Breadcrumb />
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading invoice...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="invoice" class="bg-white shadow-md rounded-lg p-8">
      <div class="flex justify-between items-start mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Invoice {{ invoice.invoiceNumber }}
          </h1>
          <p class="text-gray-500 mt-1">
            Created: {{ formatDate(invoice.createdAt) }}
          </p>
        </div>
        <div class="text-right">
          <span
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
              getStatusClass(invoice.status)
            ]"
          >
            {{ formatStatus(invoice.status) }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-4">Bill To</h2>
          <p class="text-gray-700">{{ invoice.clientName }}</p>
          <p class="text-gray-700">{{ invoice.clientEmail }}</p>
          <p class="text-gray-700 whitespace-pre-line">{{ invoice.clientAddress }}</p>
        </div>
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-4">Invoice Details</h2>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Issue Date:</span>
              <span class="text-gray-900">{{ formatDate(invoice.issueDate) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Due Date:</span>
              <span class="text-gray-900">{{ formatDate(invoice.dueDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in invoice.items" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.quantity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${{ item.unitPrice.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${{ item.total.toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-end mb-8">
        <div class="w-64 space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Subtotal:</span>
            <span class="text-gray-900">${{ invoice.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Tax:</span>
            <span class="text-gray-900">${{ invoice.tax.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span>${{ invoice.total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div v-if="invoice.notes" class="mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-2">Notes</h2>
        <p class="text-gray-700 whitespace-pre-line">{{ invoice.notes }}</p>
      </div>

      <div class="flex justify-end space-x-4">
        <router-link
          to="/"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back to List
        </router-link>
        <router-link
          :to="`/invoice/${invoice.id}/edit`"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Edit
        </router-link>
        <button
          @click="generatePdf"
          :disabled="generatingPdf"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {{ generatingPdf ? 'Generating...' : 'Generate PDF' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { invoiceApi } from '@/api/invoice'
import Breadcrumb from '@/components/Breadcrumb.vue'
import type { Invoice } from '@/types/invoice'

const route = useRoute()
const invoice = ref<Invoice | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const generatingPdf = ref(false)

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
  return new Date(dateString).toLocaleDateString()
}

const fetchInvoice = async () => {
  try {
    loading.value = true
    error.value = null
    const id = route.params.id as string
    invoice.value = await invoiceApi.getById(id)
  } catch (err) {
    error.value = 'Failed to load invoice'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const generatePdf = async () => {
  if (!invoice.value) return

  try {
    generatingPdf.value = true
    const blob = await invoiceApi.generatePdf(invoice.value.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Get filename from Content-Disposition header if available
    // Otherwise use default format
    const contentDisposition = blob.type // This won't work, we need to get it from response
    // For now, use a simple default - the backend will set the proper filename
    link.download = `invoice-${invoice.value.invoiceNumber}.pdf`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to generate PDF:', err)
    alert('Failed to generate PDF. Please try again.')
  } finally {
    generatingPdf.value = false
  }
}

onMounted(() => {
  fetchInvoice()
})
</script>

