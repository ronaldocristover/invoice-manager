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
import { useRoute } from 'vue-router'

interface BreadcrumbItem {
  label: string
  to?: string
}

const route = useRoute()

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const crumbs: BreadcrumbItem[] = []
  const path = route.path
  const name = route.name as string
  const params = route.params

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

  // Handle root path
  if (path === '/') {
    return []
  }

  // Split path and build breadcrumbs
  const segments = path.split('/').filter(Boolean)

  // Build breadcrumbs based on path segments
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // Skip numeric IDs and use dynamic labels
    if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // This is a UUID, get the label from route meta or params
      const parentSegment = segments[index - 1]
      
      if (parentSegment === 'invoice') {
        // Try to get invoice number from params or use generic label
        const label = params.invoiceNumber as string || 'Invoice Details'
        crumbs.push({ label, to: currentPath })
      } else if (parentSegment === 'clients') {
        // Try to get client name from params or use generic label
        const label = params.clientName as string || 'Client Details'
        crumbs.push({ label, to: currentPath })
      } else if (parentSegment === 'projects') {
        // Try to get project name from params or use generic label
        const label = params.projectName as string || 'Project Details'
        crumbs.push({ label, to: currentPath })
      } else {
        crumbs.push({ label: 'Details', to: currentPath })
      }
    } else {
      // Regular segment
      const routeName = getRouteNameFromPath(currentPath, segments, index)
      const label = routeLabels[routeName] || formatLabel(segment)
      
      // Don't add link for the last segment (current page)
      const isLast = index === segments.length - 1
      crumbs.push({
        label,
        to: isLast ? undefined : currentPath
      })
    }
  })

  return crumbs
})

function getRouteNameFromPath(path: string, segments: string[], index: number): string {
  // Try to match route name based on path structure
  if (path === '/create') return 'CreateInvoice'
  if (path === '/settings') return 'Settings'
  if (path === '/clients') return 'Clients'
  if (path === '/clients/create') return 'CreateClient'
  if (path === '/projects') return 'Projects'
  if (path === '/projects/create') return 'CreateProject'
  
  // Handle dynamic routes
  if (segments[0] === 'invoice') {
    if (segments[1] && segments[2] === 'edit') return 'EditInvoice'
    if (segments[1]) return 'InvoiceDetail'
    return 'CreateInvoice'
  }
  
  if (segments[0] === 'clients') {
    if (segments[1] && segments[2] === 'edit') return 'EditClient'
    if (segments[1]) return 'ClientDetail'
    return 'CreateClient'
  }
  
  if (segments[0] === 'projects') {
    if (segments[1] && segments[2] === 'edit') return 'EditProject'
    if (segments[1]) return 'ProjectDetail'
    return 'CreateProject'
  }
  
  return ''
}

function formatLabel(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

