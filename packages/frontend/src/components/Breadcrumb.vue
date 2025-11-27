<template>
  <nav class="flex mb-6" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <li class="inline-flex items-center">
        <router-link
          to="/"
          class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
            ></path>
          </svg>
          Home
        </router-link>
      </li>
      <li v-for="(crumb, index) in breadcrumbs" :key="index">
        <div class="flex items-center">
          <svg
            class="w-6 h-6 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <router-link
            v-if="crumb.to && index < breadcrumbs.length - 1"
            :to="crumb.to"
            class="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
          >
            {{ crumb.label }}
          </router-link>
          <span
            v-else
            class="ml-1 text-sm font-medium text-gray-500 md:ml-2"
            aria-current="page"
          >
            {{ crumb.label }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface BreadcrumbItem {
  label: string
  to?: string
}

const route = useRoute()
const router = useRouter()

// Map route names to breadcrumb labels
const routeLabels: Record<string, string> = {
  Home: 'Invoices',
  CreateInvoice: 'Create Invoice',
  InvoiceDetail: 'Invoice Details',
  EditInvoice: 'Edit Invoice',
  Settings: 'Settings',
  Clients: 'Clients',
  CreateClient: 'Create Client',
  ClientDetail: 'Client Details',
  EditClient: 'Edit Client',
  Projects: 'Projects',
  CreateProject: 'Create Project',
  ProjectDetail: 'Project Details',
  EditProject: 'Edit Project'
}

// Map route names to parent route names
const routeParents: Record<string, string> = {
  CreateInvoice: 'Home',
  InvoiceDetail: 'Home',
  EditInvoice: 'InvoiceDetail',
  Settings: 'Home',
  Clients: 'Home',
  CreateClient: 'Clients',
  ClientDetail: 'Clients',
  EditClient: 'ClientDetail',
  Projects: 'Home',
  CreateProject: 'Projects',
  ProjectDetail: 'Projects',
  EditProject: 'ProjectDetail'
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const crumbs: BreadcrumbItem[] = []
  const routeName = route.name as string
  const path = route.path

  // Handle root path
  if (path === '/') {
    return []
  }

  // Map route names to their paths (for parent routes)
  const routePaths: Record<string, string> = {
    Home: '/',
    Clients: '/clients',
    Projects: '/projects',
    Settings: '/settings',
    CreateInvoice: '/create',
    CreateClient: '/clients/create',
    CreateProject: '/projects/create'
  }

  // Build breadcrumbs based on route hierarchy
  const buildBreadcrumbs = (currentRouteName: string, visited: Set<string>): void => {
    if (visited.has(currentRouteName)) return // Prevent infinite loops
    visited.add(currentRouteName)

    const parentName = routeParents[currentRouteName]
    
    if (parentName) {
      // Add parent first (recursively)
      buildBreadcrumbs(parentName, visited)
      
      // Get parent path
      let parentPath = routePaths[parentName]
      
      // For detail routes, construct path with params
      if (!parentPath) {
        if (parentName === 'InvoiceDetail' && route.params.id) {
          parentPath = `/invoice/${route.params.id}`
        } else if (parentName === 'ClientDetail' && route.params.id) {
          parentPath = `/clients/${route.params.id}`
        } else if (parentName === 'ProjectDetail' && route.params.id) {
          parentPath = `/projects/${route.params.id}`
        } else {
          parentPath = '/'
        }
      }
      
      crumbs.push({
        label: routeLabels[parentName] || parentName,
        to: parentPath
      })
    }
  }

  // Build parent breadcrumbs
  if (routeName) {
    buildBreadcrumbs(routeName, new Set())
  }

  // Add current page (last breadcrumb, no link)
  if (routeName && routeLabels[routeName]) {
    // For detail pages, try to get dynamic label from route params or meta
    let currentLabel = routeLabels[routeName]
    
    // Try to get dynamic label from route meta or params
    if (route.meta?.breadcrumbLabel) {
      currentLabel = route.meta.breadcrumbLabel as string
    } else if (routeName === 'InvoiceDetail' && route.params.id) {
      // For invoice detail, we could fetch invoice number, but for now use generic
      currentLabel = 'Invoice Details'
    } else if (routeName === 'ClientDetail' && route.params.id) {
      currentLabel = 'Client Details'
    } else if (routeName === 'ProjectDetail' && route.params.id) {
      currentLabel = 'Project Details'
    }
    
    crumbs.push({
      label: currentLabel,
      to: undefined // Current page, no link
    })
  }

  return crumbs
})
</script>
