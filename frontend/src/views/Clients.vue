<template>
  <div>
    <Breadcrumb />
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Clients</h1>
      <router-link
        to="/clients/create"
        class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        + Add Client
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading clients...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="!clients || clients.length === 0" class="text-center py-12">
      <p class="text-gray-500 mb-4">No clients found.</p>
      <router-link
        to="/clients/create"
        class="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Create Your First Client
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="client in clients"
        :key="client.id"
        class="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
        @click="$router.push(`/clients/${client.id}`)"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ client.name }}</h3>
            <p v-if="client.company" class="text-sm text-gray-500">{{ client.company }}</p>
          </div>
        </div>
        <div class="space-y-2 text-sm text-gray-600">
          <p class="flex items-center">
            <span class="font-medium mr-2">Email:</span>
            {{ client.email }}
          </p>
          <p v-if="client.phone" class="flex items-center">
            <span class="font-medium mr-2">Phone:</span>
            {{ client.phone }}
          </p>
          <p v-if="client.address" class="flex items-center">
            <span class="font-medium mr-2">Address:</span>
            <span class="line-clamp-2">{{ client.address }}</span>
          </p>
        </div>
        <div v-if="client._count" class="mt-4 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
          <span>{{ client._count.invoices || 0 }} Invoice(s)</span>
          <span>{{ client._count.projects || 0 }} Project(s)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { clientApi } from '@/api/client'
import Breadcrumb from '@/components/Breadcrumb.vue'
import type { Client } from '@/api/client'

const clients = ref<Client[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchClients = async () => {
  try {
    loading.value = true
    error.value = null
    clients.value = await clientApi.getAll()
  } catch (err) {
    error.value = 'Failed to load clients'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchClients()
})
</script>

