<template>
  <div>
    <Breadcrumb />
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading invoice...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else>
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Edit Invoice</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column: Form -->
        <div class="space-y-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Invoice Information Section -->
            <div class="bg-white shadow-md rounded-lg p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Invoice Information
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number
                  </label>
                  <input
                    v-model="form.invoiceNumber"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    v-model="form.status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <input
                    v-model="form.issueDate"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    v-model="form.dueDate"
                    type="date"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

          <!-- Client & Project Selection Section -->
          <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Client & Project
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Select Client
                </label>
                <select
                  v-model="selectedClientId"
                  @change="onClientChange"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a client or enter manually --</option>
                  <option v-for="client in clients" :key="client.id" :value="client.id">
                    {{ client.name }} {{ client.company ? `(${client.company})` : '' }}
                  </option>
                </select>
              </div>
              <div v-if="selectedClientId">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Select Project (Optional)
                </label>
                <select
                  v-model="form.projectId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- No project --</option>
                  <option v-for="project in availableProjects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Client Information Section -->
          <div class="bg-white shadow-md rounded-lg p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Client Information
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Client Name
                </label>
                <input
                  v-model="form.clientName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Client Email
                </label>
                <input
                  v-model="form.clientEmail"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Client Address
                </label>
                <textarea
                  v-model="form.clientAddress"
                  rows="3"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
          </div>

            <!-- Items Section -->
            <div class="bg-white shadow-md rounded-lg p-6">
              <div class="flex justify-between items-center mb-4 border-b pb-2">
                <h2 class="text-lg font-semibold text-gray-900">Invoice Items</h2>
                <button
                  type="button"
                  @click="addItem"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  + Add Item
                </button>
              </div>
              <div class="space-y-4">
                <div
                  v-for="(item, index) in form.items"
                  :key="index"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="grid grid-cols-12 gap-3 items-end">
                    <div class="col-span-12 md:col-span-5">
                      <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <input
                        v-model="item.description"
                        type="text"
                        placeholder="Item description"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div class="col-span-4 md:col-span-2">
                      <label class="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="1"
                        placeholder="Qty"
                        required
                        @input="calculateItemTotal(index)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div class="col-span-4 md:col-span-2">
                      <label class="block text-xs font-medium text-gray-600 mb-1">Unit Price</label>
                      <input
                        v-model.number="item.unitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        required
                        @input="calculateItemTotal(index)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div class="col-span-3 md:col-span-2">
                      <label class="block text-xs font-medium text-gray-600 mb-1">Total</label>
                      <input
                        :value="(item.quantity * item.unitPrice).toFixed(2)"
                        type="text"
                        readonly
                        class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-medium"
                      />
                    </div>
                    <div class="col-span-1">
                      <button
                        type="button"
                        @click="removeItem(index)"
                        class="w-full bg-red-500 text-white px-2 py-2 rounded-md hover:bg-red-600 text-lg font-bold"
                        :disabled="form.items.length === 1"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Details Section -->
            <div class="bg-white shadow-md rounded-lg p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Financial Details
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tax (%)
                  </label>
                  <input
                    v-model.number="form.tax"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    @input="calculateTotals"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div v-if="settings?.enableShipping" class="md:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Shipping ($)
                  </label>
                  <input
                    v-model.number="form.shipping"
                    type="number"
                    min="0"
                    step="0.01"
                    @input="calculateTotals"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div v-if="settings?.enableDiscount" class="md:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Discount ($)
                  </label>
                  <input
                    v-model.number="form.discount"
                    type="number"
                    min="0"
                    step="0.01"
                    @input="calculateTotals"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="md:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Amount Paid ($)
                  </label>
                  <input
                    v-model.number="form.amountPaid"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p class="mt-1 text-xs text-gray-500">
                    Amount already paid for this invoice
                  </p>
                </div>
              </div>
              <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="font-medium text-gray-900">${{ (isNaN(subtotal) ? 0 : subtotal).toFixed(2) }}</span>
                  </div>
                  <div v-if="taxAmount > 0" class="flex justify-between text-sm">
                    <span class="text-gray-600">Tax:</span>
                    <span class="font-medium text-gray-900">${{ (isNaN(taxAmount) ? 0 : taxAmount).toFixed(2) }}</span>
                  </div>
                  <div v-if="form.shipping && form.shipping > 0" class="flex justify-between text-sm">
                    <span class="text-gray-600">Shipping:</span>
                    <span class="font-medium text-gray-900">${{ (isNaN(form.shipping) ? 0 : (form.shipping || 0)).toFixed(2) }}</span>
                  </div>
                  <div v-if="form.discount && form.discount > 0" class="flex justify-between text-sm">
                    <span class="text-gray-600">Discount:</span>
                    <span class="font-medium text-gray-900">-${{ (isNaN(form.discount) ? 0 : (form.discount || 0)).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span class="text-blue-600">${{ (isNaN(total) ? 0 : total).toFixed(2) }}</span>
                  </div>
                  <div v-if="(form.amountPaid || 0) > 0" class="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span class="text-gray-600">Amount Paid:</span>
                    <span class="text-green-600 font-medium">${{ (isNaN(form.amountPaid) ? 0 : (form.amountPaid || 0)).toFixed(2) }}</span>
                  </div>
                  <div v-if="(form.amountPaid || 0) > 0" class="flex justify-between text-sm font-semibold pt-2">
                    <span class="text-gray-700">Balance Due:</span>
                    <span :class="(total - (form.amountPaid || 0)) > 0 ? 'text-red-600' : 'text-green-600'">
                      ${{ (isNaN(total - (form.amountPaid || 0)) ? 0 : (total - (form.amountPaid || 0))).toFixed(2) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Information Section -->
            <div class="bg-white shadow-md rounded-lg p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Additional Information
              </h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    v-model="form.notes"
                    rows="3"
                    placeholder="Additional notes for the invoice..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    v-model="form.terms"
                    rows="3"
                    placeholder="Terms and conditions..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Submit Buttons -->
            <div class="flex justify-end space-x-4 pb-6">
              <router-link
                :to="`/invoice/${invoiceId}`"
                class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </router-link>
              <button
                type="button"
                @click="showConfirmModal = true"
                :disabled="submitting"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Update Invoice
              </button>
            </div>
          </form>

          <!-- Confirmation Modal -->
          <ConfirmationModal
            :show="showConfirmModal"
            title="Update Invoice"
            message="Are you sure you want to update this invoice? Changes will be saved immediately."
            confirm-text="Update Invoice"
            cancel-text="Cancel"
            :loading="submitting"
            loading-text="Updating..."
            @confirm="handleSubmit"
            @cancel="showConfirmModal = false"
          />
        </div>

        <!-- Right Column: Preview -->
        <div class="lg:sticky lg:top-6 h-fit">
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Live Preview</h3>
            <p class="text-xs text-gray-500">See how your invoice will look</p>
          </div>
          <div class="bg-white shadow-xl rounded-lg border-2 border-gray-200" style="max-height: calc(100vh - 200px);">
            <InvoicePreview :invoice="previewData" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { invoiceApi } from '@/api/invoice'
import { settingsApi } from '@/api/settings'
import { clientApi } from '@/api/client'
import { projectApi } from '@/api/project'
import InvoicePreview from '@/components/InvoicePreview.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import type { UpdateInvoiceDto } from '@/types/invoice'
import type { Client } from '@/api/client'
import type { Project } from '@/api/project'

const route = useRoute()
const router = useRouter()
const invoiceId = route.params.id as string
const submitting = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const settings = ref<any>(null)
const clients = ref<Client[]>([])
const projects = ref<Project[]>([])
const selectedClientId = ref<string>('')
const showConfirmModal = ref(false)

const form = ref<{
  invoiceNumber: string
  clientId?: string
  projectId?: string
  clientName: string
  clientEmail: string
  clientAddress: string
  issueDate: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
  }>
  tax: number
  shipping?: number
  discount?: number
  amountPaid?: number
  notes?: string
  terms?: string
}>({
  invoiceNumber: '',
  clientId: undefined,
  projectId: undefined,
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  issueDate: '',
  dueDate: '',
  status: 'draft',
  items: [
    {
      description: '',
      quantity: 1,
      unitPrice: 0
    }
  ],
  tax: 0,
  shipping: 0,
  discount: 0,
  amountPaid: 0,
  notes: '',
  terms: ''
})

const availableProjects = computed(() => {
  if (!selectedClientId.value) return []
  return projects.value.filter(p => p.clientId === selectedClientId.value)
})

const onClientChange = async () => {
  if (selectedClientId.value) {
    const client = clients.value.find(c => c.id === selectedClientId.value)
    if (client) {
      form.value.clientId = client.id
      form.value.clientName = client.name
      form.value.clientEmail = client.email
      form.value.clientAddress = client.address || ''
      // Load projects for this client
      try {
        projects.value = await projectApi.getAll(client.id)
      } catch (err) {
        console.error('Failed to load projects:', err)
      }
    }
  } else {
    form.value.clientId = undefined
    form.value.projectId = undefined
  }
}

watch(selectedClientId, () => {
  if (!selectedClientId.value) {
    form.value.projectId = undefined
  }
})

const previewData = computed(() => ({
  ...form.value,
  logoUrl: settings.value?.logoUrl,
  enableTax: settings.value?.enableTax,
  enableShipping: settings.value?.enableShipping,
  enableDiscount: settings.value?.enableDiscount,
  enableSignature: settings.value?.enableSignature,
  signatureImageUrl: settings.value?.signatureImageUrl,
  signatureText: settings.value?.signatureText,
  enableFrom: settings.value?.enableFrom,
  companyName: settings.value?.companyName,
  companyAddress: settings.value?.companyAddress,
  companyEmail: settings.value?.companyEmail,
  companyPhone: settings.value?.companyPhone
}))

const subtotal = computed(() => {
  if (!form.value.items || form.value.items.length === 0) return 0
  const result = form.value.items.reduce(
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
  const tax = Number(form.value.tax) || 0
  const result = (subtotal.value * tax) / 100
  return isNaN(result) ? 0 : result
})

const total = computed(() => {
  const shipping = Number(form.value.shipping) || 0
  const discount = Number(form.value.discount) || 0
  const shippingValue = isNaN(shipping) ? 0 : shipping
  const discountValue = isNaN(discount) ? 0 : discount
  const result = subtotal.value + taxAmount.value + shippingValue - discountValue
  return isNaN(result) ? 0 : result
})

const addItem = () => {
  form.value.items.push({
    description: '',
    quantity: 1,
    unitPrice: 0
  })
}

const removeItem = (index: number) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1)
    calculateTotals()
  }
}

const calculateItemTotal = (index: number) => {
  calculateTotals()
}

const calculateTotals = () => {
  // Totals are computed, so this is just for triggering reactivity if needed
}

const loadInvoice = async () => {
  try {
    loading.value = true
    error.value = null
    const [invoice, loadedSettings, loadedClients] = await Promise.all([
      invoiceApi.getById(invoiceId),
      settingsApi.get(),
      clientApi.getAll()
    ])
    
    settings.value = loadedSettings
    clients.value = loadedClients

    // Calculate tax percentage from tax amount and subtotal
    const taxPercentage = invoice.subtotal > 0 
      ? (invoice.tax / invoice.subtotal) * 100 
      : 0

    form.value = {
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId || undefined,
      projectId: invoice.projectId || undefined,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientAddress: invoice.clientAddress,
      issueDate: invoice.issueDate.split('T')[0],
      dueDate: invoice.dueDate.split('T')[0],
      status: invoice.status,
      items: invoice.items.map((item) => ({
        description: item.description || '',
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0
      })),
      tax: isNaN(taxPercentage) ? 0 : taxPercentage,
      shipping: Number(invoice.shipping) || 0,
      discount: Number(invoice.discount) || 0,
      amountPaid: Number(invoice.amountPaid) || 0,
      notes: invoice.notes || '',
      terms: invoice.terms || ''
    }

    // Set selected client and load projects if client exists
    if (invoice.clientId) {
      selectedClientId.value = invoice.clientId
      try {
        projects.value = await projectApi.getAll(invoice.clientId)
      } catch (err) {
        console.error('Failed to load projects:', err)
      }
    }
  } catch (err) {
    error.value = 'Failed to load invoice'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    const updateData: UpdateInvoiceDto = {
      invoiceNumber: form.value.invoiceNumber,
      clientId: form.value.clientId,
      projectId: form.value.projectId,
      clientName: form.value.clientName,
      clientEmail: form.value.clientEmail,
      clientAddress: form.value.clientAddress,
      issueDate: form.value.issueDate,
      dueDate: form.value.dueDate,
      status: form.value.status,
      items: form.value.items,
      tax: form.value.tax,
      shipping: form.value.shipping,
      discount: form.value.discount,
      amountPaid: form.value.amountPaid,
      notes: form.value.notes,
      terms: form.value.terms
    }

    await invoiceApi.update(invoiceId, updateData)
    router.push(`/invoice/${invoiceId}`)
  } catch (err) {
    console.error('Failed to update invoice:', err)
    alert('Failed to update invoice. Please try again.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadInvoice()
})
</script>
