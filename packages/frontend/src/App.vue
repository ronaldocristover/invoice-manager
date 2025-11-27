<template>
  <div id="app">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center gap-3">
              <img
                v-if="settings?.logoUrl"
                :src="settings.logoUrl"
                alt="Company Logo"
                class="h-12 w-auto max-h-12 object-contain"
                @error="handleImageError"
              />
              <div class="flex flex-col">
                <span class="text-xl font-bold text-gray-800">
                  Invoice Manager
                </span>
                <span v-if="settings?.companyName" class="text-xs text-gray-500">
                  by {{ settings.companyName }}
                </span>
              </div>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                isActive('/') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              ]"
            >
              Invoices
            </router-link>
            <router-link
              to="/clients"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                isActive('/clients') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              ]"
            >
              Clients
            </router-link>
            <router-link
              to="/projects"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                isActive('/projects') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              ]"
            >
              Projects
            </router-link>
            <router-link
              to="/settings"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                isActive('/settings') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              ]"
            >
              Settings
            </router-link>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { settingsApi } from '@/api/settings'
import type { InvoiceSettings } from '@/api/settings'

const route = useRoute()
const settings = ref<InvoiceSettings | null>(null)

const isActive = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleImageError = () => {
  // Silently handle image errors - logo will just not display
}

const fetchSettings = async () => {
  try {
    settings.value = await settingsApi.get()
  } catch (err) {
    console.warn('Failed to load settings for logo:', err)
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

