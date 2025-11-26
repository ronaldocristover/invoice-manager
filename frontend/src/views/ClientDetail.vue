<template>
  <div>
    <Breadcrumb />
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Loading client...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="client" class="space-y-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ client.name }}</h1>
          <p v-if="client.company" class="text-gray-500 mt-1">{{ client.company }}</p>
        </div>
        <div class="flex space-x-4">
          <router-link
            :to="`/clients/${client.id}/edit`"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Edit
          </router-link>
          <router-link
            to="/clients"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to List
          </router-link>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Client Information -->
        <div class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
            Contact Information
          </h2>
          <div class="space-y-3">
            <div>
              <span class="text-sm font-medium text-gray-500">Email:</span>
              <p class="text-gray-900">{{ client.email }}</p>
            </div>
            <div v-if="client.phone">
              <span class="text-sm font-medium text-gray-500">Phone:</span>
              <p class="text-gray-900">{{ client.phone }}</p>
            </div>
            <div v-if="client.address">
              <span class="text-sm font-medium text-gray-500">Address:</span>
              <p class="text-gray-900 whitespace-pre-line">{{ client.address }}</p>
            </div>
            <div v-if="client.taxId">
              <span class="text-sm font-medium text-gray-500">Tax ID:</span>
              <p class="text-gray-900">{{ client.taxId }}</p>
            </div>
            <div v-if="client.notes">
              <span class="text-sm font-medium text-gray-500">Notes:</span>
              <p class="text-gray-900 whitespace-pre-line">{{ client.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
            Statistics
          </h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Total Invoices:</span>
              <span class="font-semibold text-gray-900">{{ client.invoices?.length || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Total Projects:</span>
              <span class="font-semibold text-gray-900">{{ client.projects?.length || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoices -->
      <div v-if="client.invoices && client.invoices.length > 0" class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Invoices</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Number</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="invoice in client.invoices"
                :key="invoice.id"
                class="hover:bg-gray-50 cursor-pointer"
                @click="$router.push(`/invoice/${invoice.id}`)"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ invoice.invoiceNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusClass(invoice.status.toLowerCase())
                    ]"
                  >
                    {{ formatStatus(invoice.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${{ invoice.total.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(invoice.issueDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(invoice.dueDate) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Projects -->
      <div v-if="client.projects && client.projects.length > 0" class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Projects</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="project in client.projects"
            :key="project.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            @click="$router.push(`/projects/${project.id}`)"
          >
            <h3 class="font-semibold text-gray-900">{{ project.name }}</h3>
            <span
              :class="[
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2',
                project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              ]"
            >
              {{ project.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { clientApi } from '@/api/client'
import Breadcrumb from '@/components/Breadcrumb.vue'
import type { Client } from '@/api/client'

const route = useRoute()
const client = ref<Client | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800'
  }
  return classes[status] || classes.draft
}

const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

const fetchClient = async () => {
  try {
    loading.value = true
    error.value = null
    const id = route.params.id as string
    client.value = await clientApi.getById(id)
  } catch (err) {
    error.value = 'Failed to load client'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchClient()
})
</script>

