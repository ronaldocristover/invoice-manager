<template>
  <div>
    <Breadcrumb />
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading invoice...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="invoice" class="bg-white shadow-md rounded-lg p-8" style="font-family: 'Roboto', sans-serif;">
      <!-- Header: Company Logo + Name (left) and Invoice Number (right) -->
      <div class="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
        <!-- Left: Company Logo and Name -->
        <div class="flex items-center gap-4">
          <div v-if="invoice.logoUrl" class="flex-shrink-0">
            <img 
              :src="invoice.logoUrl" 
              alt="Company Logo" 
              class="h-16 w-auto object-contain"
              @error="() => {}"
            />
          </div>
          <div v-if="invoice.companyName">
            <h2 class="text-2xl font-bold text-gray-900">{{ invoice.companyName }}</h2>
          </div>
        </div>
        
        <!-- Right: Invoice Number -->
        <div class="text-right">
          <p class="text-xs text-gray-500 mb-1">Invoice Number</p>
          <p class="text-lg font-bold text-gray-900">{{ invoice.invoiceNumber || 'INV-0001' }}</p>
        </div>
      </div>

      <!-- Invoice Details -->
      <div class="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div class="p-4 mb-4">
            <p class="text-xs text-gray-500 mb-1">Issue Date</p>
            <p>{{ formatDate(invoice.issueDate) }}</p>
            <p class="text-xs text-gray-500 mt-3 mb-1">Due Date</p>
            <p>{{ formatDate(invoice.dueDate) || 'Not set' }}</p>
          </div>
        </div>
      </div>

      <!-- From and Bill To -->
      <div class="grid grid-cols-2 gap-8 mb-8">
        <!-- From Section (Left) -->
        <div v-if="invoice.enableFrom && (invoice.companyName || invoice.companyAddress || invoice.companyEmail)">
          <h3 class="text-sm font-semibold text-gray-900 mb-2">From:</h3>
          <div class="text-sm text-gray-700">
            <p v-if="invoice.companyName" class="font-medium">{{ invoice.companyName }}</p>
            <p v-if="invoice.companyEmail" class="mt-1">{{ invoice.companyEmail }}</p>
            <p v-if="invoice.companyPhone" class="mt-1">{{ invoice.companyPhone }}</p>
            <p v-if="invoice.companyAddress" class="mt-1 whitespace-pre-line">{{ invoice.companyAddress }}</p>
          </div>
        </div>
        <div v-else></div>

        <!-- Bill To Section (Right) -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-2">Bill To:</h3>
          <div class="text-sm text-gray-700">
            <p class="font-medium">{{ invoice.clientName || 'Client Name' }}</p>
            <p class="mt-1">{{ invoice.clientEmail || 'client@example.com' }}</p>
            <p class="mt-1 whitespace-pre-line">{{ invoice.clientAddress || 'Client Address' }}</p>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="mb-8">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Items:</h3>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in invoice.items" :key="index">
              <td class="px-4 py-2 text-sm text-gray-900">{{ item.description || 'Item description' }}</td>
              <td class="px-4 py-2 text-sm text-gray-500 text-center">{{ item.quantity || 0 }}</td>
              <td class="px-4 py-2 text-sm text-gray-500 text-right">{{ formatCurrency(item.unitPrice || 0) }}</td>
              <td class="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                {{ formatCurrency((item.quantity || 0) * (item.unitPrice || 0)) }}
              </td>
            </tr>
            <tr v-if="!invoice.items || invoice.items.length === 0">
              <td colspan="4" class="px-4 py-4 text-center text-sm text-gray-500">No items added</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="flex justify-end mb-8">
        <div class="w-64 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Subtotal:</span>
            <span class="text-gray-900">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div v-if="invoice.enableTax !== false && taxAmount > 0" class="flex justify-between text-sm">
            <span class="text-gray-600">Tax:</span>
            <span class="text-gray-900">{{ formatCurrency(taxAmount) }}</span>
          </div>
          <div v-if="invoice.enableShipping && shipping > 0" class="flex justify-between text-sm">
            <span class="text-gray-600">Shipping:</span>
            <span class="text-gray-900">{{ formatCurrency(shipping) }}</span>
          </div>
          <div v-if="invoice.enableDiscount && discount > 0" class="flex justify-between text-sm">
            <span class="text-gray-600">Discount:</span>
            <span class="text-gray-900">-{{ formatCurrency(discount) }}</span>
          </div>
          <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span>{{ formatCurrency(total) }}</span>
          </div>
          <div v-if="(invoice.amountPaid || 0) > 0" class="flex justify-between text-sm pt-2 border-t border-gray-200">
            <span class="text-gray-600">Amount Paid:</span>
            <span class="text-green-600 font-medium">{{ formatCurrency(amountPaid) }}</span>
          </div>
          <div v-if="(invoice.amountPaid || 0) > 0" class="flex justify-between text-sm font-semibold pt-2">
            <span class="text-gray-700">Balance Due:</span>
            <span :class="balanceDue > 0 ? 'text-red-600' : 'text-green-600'">
              {{ formatCurrency(balanceDue) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Notes, Terms & Signature - Side by Side Layout -->
      <div class="grid grid-cols-2 gap-8 mt-8 mb-8">
        <!-- Left Column: Notes and Terms -->
        <div class="space-y-4">
          <!-- Notes -->
          <div v-if="invoice.notes">
            <h3 class="text-sm font-semibold text-gray-900 mb-2">Notes:</h3>
            <p class="text-sm text-gray-700 whitespace-pre-line">{{ invoice.notes }}</p>
          </div>

          <!-- Terms -->
          <div v-if="invoice.terms">
            <h3 class="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
            <p class="text-sm text-gray-700 whitespace-pre-line">{{ invoice.terms }}</p>
          </div>
        </div>

        <!-- Right Column: Signature -->
        <div v-if="invoice.enableSignature" class="flex flex-col items-end">
          <div class="w-full max-w-xs flex flex-col items-end">
            <!-- Signature Image (no border, leave blank if no image) -->
            <div v-if="invoice.signatureImageUrl" class="mb-3">
              <img
                :src="invoice.signatureImageUrl"
                alt="Signature"
                class="h-20 object-contain"
                @error="() => {}"
              />
            </div>
            
            <!-- Signature Text (below image) -->
            <div v-if="invoice.signatureText" class="text-sm text-gray-700 text-right w-full">
              {{ invoice.signatureText }}
            </div>
            <div v-else class="text-xs text-gray-500 text-right w-full">
              Authorized Signature
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-4">
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { invoiceApi } from '@/api/invoice'
import { formatCurrency as formatCurrencyUtil } from '@/utils/currency'
import Breadcrumb from '@/components/Breadcrumb.vue'
import type { Invoice } from '@/types/invoice'

const route = useRoute()
const invoice = ref<Invoice & {
  logoUrl?: string | null
  enableTax?: boolean
  enableShipping?: boolean
  enableDiscount?: boolean
  enableSignature?: boolean
  signatureImageUrl?: string | null
  signatureText?: string | null
  enableFrom?: boolean
  companyName?: string | null
  companyAddress?: string | null
  companyEmail?: string | null
  companyPhone?: string | null
  amountPaid?: number
  currencyFormat?: string
  currencySymbol?: string
} | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const generatingPdf = ref(false)

const subtotal = computed(() => {
  if (!invoice.value?.items || invoice.value.items.length === 0) return 0
  const result = invoice.value.items.reduce(
    (sum, item) => {
      const quantity = Number(item.quantity) || 0
      const unitPrice = Number(item.unitPrice) || 0
      const itemTotal = quantity * unitPrice
      return sum + (isNaN(itemTotal) ? 0 : itemTotal)
    },
    0
  )
  return isNaN(result) ? 0 : result
})

const taxAmount = computed(() => {
  const tax = Number(invoice.value?.tax) || 0
  const result = (subtotal.value * tax) / 100
  return isNaN(result) ? 0 : result
})

const shipping = computed(() => {
  const result = Number(invoice.value?.shipping) || 0
  return isNaN(result) ? 0 : result
})

const discount = computed(() => {
  const result = Number(invoice.value?.discount) || 0
  return isNaN(result) ? 0 : result
})

const amountPaid = computed(() => {
  const result = Number(invoice.value?.amountPaid) || 0
  return isNaN(result) ? 0 : result
})

const total = computed(() => {
  const result = subtotal.value + taxAmount.value + shipping.value - discount.value
  return isNaN(result) ? 0 : result
})

const balanceDue = computed(() => {
  const result = total.value - amountPaid.value
  return isNaN(result) ? 0 : result
})

const formatCurrency = (amount: number): string => {
  const symbol = invoice.value?.currencySymbol || '$'
  const format = invoice.value?.currencyFormat || 'USD'
  return formatCurrencyUtil(amount, { currencyFormat: format, currencySymbol: symbol })
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const day = date.getDate()
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  } catch {
    return dateString
  }
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
