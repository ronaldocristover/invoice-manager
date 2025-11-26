<template>
  <div>
    <Breadcrumb />
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading client...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else>
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Edit Client</h1>

      <form @submit.prevent="handleSubmit" class="bg-white shadow-md rounded-lg p-6 max-w-2xl">
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                v-model="form.company"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tax ID
              </label>
              <input
                v-model="form.taxId"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              v-model="form.address"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-4">
            <router-link
              :to="`/clients/${clientId}`"
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
              Update Client
            </button>
          </div>
        </div>
      </form>

      <!-- Confirmation Modal -->
      <ConfirmationModal
        :show="showConfirmModal"
        title="Update Client"
        message="Are you sure you want to update this client? Changes will be saved immediately."
        confirm-text="Update Client"
        cancel-text="Cancel"
        :loading="submitting"
        loading-text="Updating..."
        @confirm="handleSubmit"
        @cancel="showConfirmModal = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clientApi } from '@/api/client'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import type { UpdateClientDto } from '@/api/client'

const route = useRoute()
const router = useRouter()
const clientId = route.params.id as string
const submitting = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const showConfirmModal = ref(false)

const form = ref<UpdateClientDto>({
  name: '',
  email: '',
  phone: '',
  address: '',
  company: '',
  taxId: '',
  notes: ''
})

const loadClient = async () => {
  try {
    loading.value = true
    error.value = null
    const client = await clientApi.getById(clientId)
    form.value = {
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
      company: client.company || '',
      taxId: client.taxId || '',
      notes: client.notes || ''
    }
  } catch (err) {
    error.value = 'Failed to load client'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    showConfirmModal.value = false
    await clientApi.update(clientId, form.value)
    router.push(`/clients/${clientId}`)
  } catch (err) {
    console.error('Failed to update client:', err)
    alert('Failed to update client. Please try again.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadClient()
})
</script>

