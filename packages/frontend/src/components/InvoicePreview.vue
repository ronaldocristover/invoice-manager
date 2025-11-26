<template>
  <div class="bg-white shadow-lg rounded-lg p-8 h-full overflow-y-auto" style="font-family: 'Roboto', sans-serif;">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 text-center mb-2">INVOICE</h1>
      <div v-if="invoice.logoUrl" class="text-center mb-4">
        <img :src="invoice.logoUrl" alt="Logo" class="h-16 mx-auto object-contain" />
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="grid grid-cols-2 gap-8 mb-8">
      <div>
        <div class="border border-gray-200 rounded p-4 mb-4">
          <p class="text-xs text-gray-500 mb-1">Invoice Number</p>
          <p class="font-semibold">{{ invoice.invoiceNumber || 'INV-0001' }}</p>
          <p class="text-xs text-gray-500 mt-3 mb-1">Issue Date</p>
          <p>{{ formatDate(invoice.issueDate) || formatDate(new Date().toISOString()) }}</p>
          <p class="text-xs text-gray-500 mt-3 mb-1">Due Date</p>
          <p>{{ formatDate(invoice.dueDate) || 'Not set' }}</p>
          <p class="text-xs text-gray-500 mt-3 mb-1">Status</p>
          <span
            :class="[
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              getStatusClass(invoice.status)
            ]"
          >
            {{ invoice.status || 'draft' }}
          </span>
        </div>
      </div>
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
            <td class="px-4 py-2 text-sm text-gray-500 text-right">${{ (item.unitPrice || 0).toFixed(2) }}</td>
            <td class="px-4 py-2 text-sm font-medium text-gray-900 text-right">
              ${{ ((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2) }}
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
          <span class="text-gray-900">${{ subtotal.toFixed(2) }}</span>
        </div>
        <div v-if="invoice.enableTax !== false && taxAmount > 0" class="flex justify-between text-sm">
          <span class="text-gray-600">Tax:</span>
          <span class="text-gray-900">${{ taxAmount.toFixed(2) }}</span>
        </div>
        <div v-if="invoice.enableShipping && shipping > 0" class="flex justify-between text-sm">
          <span class="text-gray-600">Shipping:</span>
          <span class="text-gray-900">${{ shipping.toFixed(2) }}</span>
        </div>
        <div v-if="invoice.enableDiscount && discount > 0" class="flex justify-between text-sm">
          <span class="text-gray-600">Discount:</span>
          <span class="text-gray-900">-${{ discount.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
          <span>Total:</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="invoice.notes" class="mb-4">
      <h3 class="text-sm font-semibold text-gray-900 mb-2">Notes:</h3>
      <p class="text-sm text-gray-700 whitespace-pre-line">{{ invoice.notes }}</p>
    </div>

    <!-- Terms -->
    <div v-if="invoice.terms" class="mb-4">
      <h3 class="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
      <p class="text-sm text-gray-700 whitespace-pre-line">{{ invoice.terms }}</p>
    </div>

    <!-- Signature -->
    <div v-if="invoice.enableSignature" class="mt-8 pt-6 border-t border-gray-200">
      <div class="flex items-end gap-6">
        <div v-if="invoice.signatureImageUrl" class="flex-shrink-0">
          <img
            :src="invoice.signatureImageUrl"
            alt="Signature"
            class="h-20 object-contain border border-gray-300 rounded bg-white p-2"
            @error="() => {}"
          />
        </div>
        <div v-else class="flex-shrink-0 w-48 h-16 border-b-2 border-gray-400"></div>
        <div v-if="invoice.signatureText" class="text-sm text-gray-700">
          {{ invoice.signatureText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface InvoicePreview {
  invoiceNumber?: string
  clientName?: string
  clientEmail?: string
  clientAddress?: string
  issueDate?: string
  dueDate?: string
  status?: string
  items?: Array<{ description: string; quantity: number; unitPrice: number }>
  tax?: number
  shipping?: number
  discount?: number
  notes?: string
  terms?: string
  logoUrl?: string | null
  enableTax?: boolean
  enableShipping?: boolean
  enableDiscount?: boolean
  enableSignature?: boolean
  signatureImageUrl?: string | null
  signatureText?: string | null
}

const props = defineProps<{
  invoice: InvoicePreview
}>()

const subtotal = computed(() => {
  if (!props.invoice.items || props.invoice.items.length === 0) return 0
  return props.invoice.items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  )
})

const taxAmount = computed(() => {
  return (subtotal.value * (props.invoice.tax || 0)) / 100
})

const shipping = computed(() => props.invoice.shipping || 0)
const discount = computed(() => props.invoice.discount || 0)

const total = computed(() => {
  return subtotal.value + taxAmount.value + shipping.value - discount.value
})

const formatDate = (dateString?: string): string => {
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

const getStatusClass = (status?: string): string => {
  const classes: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800'
  }
  return classes[status || 'draft'] || classes.draft
}
</script>

