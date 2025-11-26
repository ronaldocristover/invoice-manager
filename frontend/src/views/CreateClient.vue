<template>
  <div>
    <Breadcrumb />
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Create Client</h1>

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
            to="/clients"
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
            Create Client
          </button>
        </div>
      </div>
    </form>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmModal"
      title="Create Client"
      message="Are you sure you want to create this client? You can edit the information later if needed."
      confirm-text="Create Client"
      cancel-text="Cancel"
      :loading="submitting"
      loading-text="Creating..."
      @confirm="handleSubmit"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { clientApi } from '@/api/client'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import type { CreateClientDto } from '@/api/client'

const router = useRouter()
const submitting = ref(false)
const showConfirmModal = ref(false)

const form = ref<CreateClientDto>({
  name: '',
  email: '',
  phone: '',
  address: '',
  company: '',
  taxId: '',
  notes: ''
})

const handleSubmit = async () => {
  try {
    submitting.value = true
    showConfirmModal.value = false
    const client = await clientApi.create(form.value)
    router.push(`/clients/${client.id}`)
  } catch (error) {
    console.error('Failed to create client:', error)
    alert('Failed to create client. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>

