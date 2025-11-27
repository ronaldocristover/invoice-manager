<template>
  <div>
    <Breadcrumb />
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Projects</h1>
      <router-link
        to="/projects/create"
        class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        + Add Project
      </router-link>
    </div>

    <!-- Filter by Client -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="flex items-center gap-4">
        <label class="text-sm font-medium text-gray-700">Filter by Client:</label>
        <select
          v-model="selectedClientId"
          @change="fetchProjects"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Clients</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">
            {{ client.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading projects...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="!projects || projects.length === 0" class="text-center py-12">
      <p class="text-gray-500 mb-4">No projects found.</p>
      <router-link
        to="/projects/create"
        class="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Create Your First Project
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        class="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
        @click="$router.push(`/projects/${project.id}`)"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ project.name }}</h3>
            <p v-if="project.client" class="text-sm text-gray-500">{{ project.client.name }}</p>
          </div>
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            ]"
          >
            {{ formatProjectStatus(project.status) }}
          </span>
        </div>
        <p v-if="project.description" class="text-sm text-gray-600 mb-4 line-clamp-2">
          {{ project.description }}
        </p>
        <div class="text-xs text-gray-500">
          <p v-if="project._count">
            {{ project._count.invoices || 0 }} Invoice(s)
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { projectApi } from '@/api/project'
import { clientApi } from '@/api/client'
import Breadcrumb from '@/components/Breadcrumb.vue'
import type { Project } from '@/api/project'
import type { Client } from '@/api/client'

const projects = ref<Project[]>([])
const clients = ref<Client[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const selectedClientId = ref<string>('')

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

const formatProjectStatus = (status: string): string => {
  if (status === 'active') {
    return 'Active'
  }
  return 'Not Active'
}

const fetchProjects = async () => {
  try {
    loading.value = true
    error.value = null
    projects.value = await projectApi.getAll(selectedClientId.value || undefined)
  } catch (err) {
    error.value = 'Failed to load projects'
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

onMounted(() => {
  fetchClients()
  fetchProjects()
})
</script>

