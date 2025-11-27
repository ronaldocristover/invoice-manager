<template>
  <div>
    <Breadcrumb />
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading project...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else>
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Edit Project</h1>

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
              :to="`/projects/${projectId}`"
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
              Update Project
            </button>
          </div>
        </div>
      </form>

      <!-- Confirmation Modal -->
      <ConfirmationModal
        :show="showConfirmModal"
        title="Update Project"
        message="Are you sure you want to update this project? Changes will be saved immediately."
        confirm-text="Update Project"
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
import { projectApi } from '@/api/project'
import { clientApi } from '@/api/client'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import type { UpdateProjectDto } from '@/api/project'
import type { Client } from '@/api/client'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const submitting = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const clients = ref<Client[]>([])
const showConfirmModal = ref(false)

const form = ref<UpdateProjectDto>({
  name: '',
  description: '',
  clientId: '',
  status: 'active'
})

const loadProject = async () => {
  try {
    loading.value = true
    error.value = null
    const project = await projectApi.getById(projectId)
    form.value = {
      name: project.name,
      description: project.description || '',
      clientId: project.clientId,
      status: project.status
    }
  } catch (err) {
    error.value = 'Failed to load project'
    console.error(err)
  } finally {
    loading.value = false
  }
}

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
    await projectApi.update(projectId, form.value)
    router.push(`/projects/${projectId}`)
  } catch (err) {
    console.error('Failed to update project:', err)
    alert('Failed to update project. Please try again.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchClients()
  loadProject()
})
</script>

