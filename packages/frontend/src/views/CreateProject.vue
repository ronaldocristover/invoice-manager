<template>
  <div>
    <Breadcrumb />
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Create Project</h1>

    <form @submit.prevent="handleSubmit" class="bg-white shadow-md rounded-lg p-6 max-w-2xl">
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Project Name <span class="text-red-500">*</span>
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
            Client <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.clientId"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a client</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }} {{ client.company ? `(${client.company})` : '' }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            v-model="form.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="not-active">Not Active</option>
          </select>
        </div>

        <div class="flex justify-end space-x-4">
          <router-link
            to="/projects"
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
            Create Project
          </button>
        </div>
      </div>
    </form>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmModal"
      title="Create Project"
      message="Are you sure you want to create this project? You can edit the information later if needed."
      confirm-text="Create Project"
      cancel-text="Cancel"
      :loading="submitting"
      loading-text="Creating..."
      @confirm="handleSubmit"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { projectApi } from '@/api/project'
import { clientApi } from '@/api/client'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import type { CreateProjectDto } from '@/api/project'
import type { Client } from '@/api/client'

const router = useRouter()
const submitting = ref(false)
const clients = ref<Client[]>([])
const showConfirmModal = ref(false)

const form = ref<CreateProjectDto>({
  name: '',
  description: '',
  clientId: '',
  status: 'active'
})

const fetchClients = async () => {
  try {
    clients.value = await clientApi.getAll()
  } catch (err) {
    console.error('Failed to load clients:', err)
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    showConfirmModal.value = false
    const project = await projectApi.create(form.value)
    router.push(`/projects/${project.id}`)
  } catch (error) {
    console.error('Failed to create project:', error)
    alert('Failed to create project. Please try again.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchClients()
})
</script>

