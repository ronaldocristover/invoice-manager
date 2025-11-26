<template>
  <div id="app">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-bold text-gray-800">
              Invoice Manager
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Invoices
            </router-link>
            <router-link
              to="/clients"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Clients
            </router-link>
            <router-link
              to="/projects"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Projects
            </router-link>
            <router-link
              to="/settings"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
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
// App component
</script>

