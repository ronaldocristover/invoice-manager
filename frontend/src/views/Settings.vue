<template>
  <div class="max-w-7xl mx-auto">
    <Breadcrumb />
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Invoice Settings</h1>
      <p class="text-gray-600">Configure default settings for your invoices</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading settings...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Invoice Numbering & Branding -->
          <div class="bg-white shadow-md rounded-lg p-6">
            <div class="flex items-center mb-4 pb-3 border-b border-gray-200">
              <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">Invoice Numbering & Branding</h2>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Prefix
                </label>
                <input
                  v-model="form.invoicePrefix"
                  type="text"
                  required
                  placeholder="INV"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Prefix for all new invoices (e.g., INV-001, INV-002)
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Theme
                </label>
                <select
                  v-model="form.invoiceTheme"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Default</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="red">Red</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo URL
                </label>
                <input
                  v-model="form.logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p class="mt-1 text-xs text-gray-500">
                  URL of your company logo (optional)
                </p>
                <div v-if="form.logoUrl" class="mt-3 p-3 bg-gray-50 rounded-md">
                  <p class="text-xs font-medium text-gray-700 mb-2">Preview:</p>
                  <img
                    :src="form.logoUrl"
                    alt="Logo preview"
                    class="h-16 object-contain border border-gray-300 rounded bg-white p-2"
                    @error="handleImageError"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- PDF Export Settings -->
          <div class="bg-white shadow-md rounded-lg p-6">
            <div class="flex items-center mb-4 pb-3 border-b border-gray-200">
              <div class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">PDF Export Settings</h2>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  PDF File Name Format
                </label>
                <input
                  v-model="form.pdfNameFormat"
                  type="text"
                  required
                  placeholder="invoice-{invoiceNumber}"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Use placeholders: <code class="bg-gray-100 px-1 rounded text-xs">{invoiceNumber}</code>, 
                  <code class="bg-gray-100 px-1 rounded text-xs">{date}</code>, 
                  <code class="bg-gray-100 px-1 rounded text-xs">{clientName}</code>
                </p>
                <p class="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  Example: <code class="font-mono">{{ form.pdfNameFormat || 'invoice-{invoiceNumber}' }}</code>
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Default Font
                </label>
                <select
                  v-model="form.defaultFont"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Helvetica">Helvetica</option>
                  <option value="Helvetica-Bold">Helvetica Bold</option>
                  <option value="Times-Roman">Times Roman</option>
                  <option value="Times-Bold">Times Bold</option>
                  <option value="Courier">Courier</option>
                  <option value="Courier-Bold">Courier Bold</option>
                </select>
                <p class="mt-1 text-xs text-gray-500">
                  Default font family for PDF invoices
                </p>
              </div>
            </div>
          </div>

          <!-- Default Values -->
          <div class="bg-white shadow-md rounded-lg p-6">
            <div class="flex items-center mb-4 pb-3 border-b border-gray-200">
              <div class="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">Default Values</h2>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Default Tax Rate (%)
                </label>
                <input
                  v-model.number="form.defaultTax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Default tax percentage for new invoices
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Default Notes
                </label>
                <textarea
                  v-model="form.defaultNotes"
                  rows="3"
                  placeholder="Enter default notes..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Default Terms & Conditions
                </label>
                <textarea
                  v-model="form.defaultTerms"
                  rows="3"
                  placeholder="Enter default terms..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">

          <!-- Field Visibility -->
          <div class="bg-white shadow-md rounded-lg p-6">
            <div class="flex items-center mb-4 pb-3 border-b border-gray-200">
              <div class="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">Field Visibility</h2>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <label class="text-sm font-medium text-gray-700">Tax Field</label>
                  <p class="text-xs text-gray-500 mt-0.5">Show/hide tax field on invoices</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="form.enableTax"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <label class="text-sm font-medium text-gray-700">Shipping Field</label>
                  <p class="text-xs text-gray-500 mt-0.5">Show/hide shipping field on invoices</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="form.enableShipping"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <label class="text-sm font-medium text-gray-700">Discount Field</label>
                  <p class="text-xs text-gray-500 mt-0.5">Show/hide discount field on invoices</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="form.enableDiscount"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Watermark Settings -->
          <div class="bg-white shadow-md rounded-lg p-6">
            <div class="flex items-center mb-4 pb-3 border-b border-gray-200">
              <div class="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-900">Watermark Settings</h2>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <label class="text-sm font-medium text-gray-700">Enable Watermark</label>
                  <p class="text-xs text-gray-500 mt-0.5">Add watermark to PDF invoices</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="form.enableWatermark"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div v-if="form.enableWatermark" class="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Watermark Text
                  </label>
                  <input
                    v-model="form.watermarkText"
                    type="text"
                    placeholder="DRAFT, CONFIDENTIAL, etc."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <input
                      v-model.number="form.watermarkSize"
                      type="number"
                      min="10"
                      max="200"
                      step="5"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p class="mt-1 text-xs text-gray-500">10-200</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div class="flex gap-2">
                      <input
                        v-model="form.watermarkColor"
                        type="color"
                        class="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        v-model="form.watermarkColor"
                        type="text"
                        placeholder="#CCCCCC"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Custom Fields -->
          <div class="bg-white shadow-md rounded-lg p-6">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <div class="flex items-center">
                <div class="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-900">Custom Fields</h2>
              </div>
              <button
                type="button"
                @click="addCustomField"
                class="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Field
              </button>
            </div>
            <p class="text-xs text-gray-500 mb-4">
              Add custom fields that will appear on all invoices
            </p>

            <div v-if="form.customFields && form.customFields.length === 0" class="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p class="text-sm">No custom fields added yet</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(field, index) in form.customFields"
                :key="index"
                class="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div class="md:col-span-5">
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                      Field Label
                    </label>
                    <input
                      v-model="field.label"
                      type="text"
                      placeholder="e.g., PO Number"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div class="md:col-span-3">
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      v-model="field.type"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                  <div class="md:col-span-2 flex items-center h-10">
                    <label class="flex items-center cursor-pointer">
                      <input
                        v-model="field.required"
                        type="checkbox"
                        class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span class="text-xs text-gray-700">Required</span>
                    </label>
                  </div>
                  <div class="md:col-span-2">
                    <button
                      type="button"
                      @click="removeCustomField(index)"
                      class="w-full bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <router-link
          to="/"
          class="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
        >
          Cancel
        </router-link>
        <button
          type="submit"
          :disabled="submitting"
          class="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2"
        >
          <svg v-if="!submitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ submitting ? 'Saving...' : 'Save Settings' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { settingsApi, type InvoiceSettings } from '@/api/settings'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)
const submitting = ref(false)

const form = ref<InvoiceSettings>({
  invoicePrefix: 'INV',
  invoiceTheme: 'default',
  logoUrl: null,
  enableTax: true,
  enableShipping: false,
  enableDiscount: false,
  defaultTax: 0,
  defaultNotes: null,
  defaultTerms: null,
  pdfNameFormat: 'invoice-{invoiceNumber}',
  enableWatermark: false,
  watermarkText: null,
  watermarkSize: 50,
  watermarkColor: '#CCCCCC',
  defaultFont: 'Helvetica',
  enableSignature: false,
  signatureImageUrl: null,
  signatureText: null,
  customFields: []
})

const handleImageError = () => {
  error.value = 'Failed to load logo image. Please check the URL.'
}

const addCustomField = () => {
  if (!form.value.customFields) {
    form.value.customFields = []
  }
  form.value.customFields.push({
    label: '',
    type: 'text',
    required: false
  })
}

const removeCustomField = (index: number) => {
  if (form.value.customFields) {
    form.value.customFields.splice(index, 1)
  }
}

const loadSettings = async () => {
  try {
    loading.value = true
    error.value = null
    const settings = await settingsApi.get()
    form.value = {
      ...settings,
      customFields: settings.customFields || []
    }
  } catch (err) {
    error.value = 'Failed to load settings'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    error.value = null
    
    // Clean up empty custom fields
    if (form.value.customFields) {
      form.value.customFields = form.value.customFields.filter(
        (field) => field.label.trim() !== ''
      )
    }

    await settingsApi.update(form.value)
    alert('Settings saved successfully!')
    router.push('/')
  } catch (err) {
    error.value = 'Failed to save settings'
    console.error(err)
    alert('Failed to save settings. Please try again.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

