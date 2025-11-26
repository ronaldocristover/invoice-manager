<template>
  <div>
    <Breadcrumb />
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Create Invoice</h1>

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
            </div>
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="font-medium text-gray-900">${{ subtotal.toFixed(2) }}</span>
                </div>
                <div v-if="taxAmount > 0" class="flex justify-between text-sm">
                  <span class="text-gray-600">Tax:</span>
                  <span class="font-medium text-gray-900">${{ taxAmount.toFixed(2) }}</span>
                </div>
                <div v-if="form.shipping && form.shipping > 0" class="flex justify-between text-sm">
                  <span class="text-gray-600">Shipping:</span>
                  <span class="font-medium text-gray-900">${{ (form.shipping || 0).toFixed(2) }}</span>
                </div>
                <div v-if="form.discount && form.discount > 0" class="flex justify-between text-sm">
                  <span class="text-gray-600">Discount:</span>
                  <span class="font-medium text-gray-900">-${{ (form.discount || 0).toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total:</span>
                  <span class="text-blue-600">${{ total.toFixed(2) }}</span>
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
              to="/"
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
              Create Invoice
            </button>
          </div>
        </form>

        <!-- Confirmation Modal -->
        <ConfirmationModal
          :show="showConfirmModal"
          title="Create Invoice"
          message="Are you sure you want to create this invoice? You can edit it later if needed."
          confirm-text="Create Invoice"
          cancel-text="Cancel"
          :loading="submitting"
          loading-text="Creating..."
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { invoiceApi } from '@/api/invoice'
import { settingsApi } from '@/api/settings'
import { clientApi } from '@/api/client'
import { projectApi } from '@/api/project'
import InvoicePreview from '@/components/InvoicePreview.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import type { CreateInvoiceDto } from '@/types/invoice'
import type { Client } from '@/api/client'
import type { Project } from '@/api/project'

const router = useRouter()
const submitting = ref(false)
const loading = ref(true)
const settings = ref<any>(null)
const clients = ref<Client[]>([])
const projects = ref<Project[]>([])
const selectedClientId = ref<string>('')
const showConfirmModal = ref(false)

const form = ref<CreateInvoiceDto & { status: 'draft' | 'sent' | 'paid' | 'overdue'; shipping?: number; discount?: number; terms?: string }>({
  invoiceNumber: '',
  clientId: undefined,
  projectId: undefined,
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  issueDate: new Date().toISOString().split('T')[0],
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
  signatureText: settings.value?.signatureText
}))

const subtotal = computed(() => {
  return form.value.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
})

const taxAmount = computed(() => {
  return (subtotal.value * form.value.tax) / 100
})

const total = computed(() => {
  const shipping = form.value.shipping || 0
  const discount = form.value.discount || 0
  return subtotal.value + taxAmount.value + shipping - discount
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

const loadSettings = async () => {
  try {
    loading.value = true
    const [loadedSettings, loadedClients] = await Promise.all([
      settingsApi.get(),
      clientApi.getAll()
    ])
    
    settings.value = loadedSettings
    clients.value = loadedClients
    
    // Auto-populate form with default settings
    form.value.tax = loadedSettings.defaultTax || 0
    form.value.notes = loadedSettings.defaultNotes || ''
    form.value.terms = loadedSettings.defaultTerms || ''
    
    // Generate invoice number with prefix
    if (loadedSettings.invoicePrefix) {
      const timestamp = Date.now().toString().slice(-6)
      form.value.invoiceNumber = `${loadedSettings.invoicePrefix}-${timestamp}`
    }
  } catch (err) {
    console.error('Failed to load settings:', err)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    const invoice = await invoiceApi.create(form.value)
    router.push(`/invoice/${invoice.id}`)
  } catch (error) {
    console.error('Failed to create invoice:', error)
    alert('Failed to create invoice. Please try again.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>
