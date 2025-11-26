import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/InvoiceList.vue')
  },
  {
    path: '/create',
    name: 'CreateInvoice',
    component: () => import('../views/CreateInvoice.vue')
  },
  {
    path: '/invoice/:id',
    name: 'InvoiceDetail',
    component: () => import('../views/InvoiceDetail.vue')
  },
  {
    path: '/invoice/:id/edit',
    name: 'EditInvoice',
    component: () => import('../views/EditInvoice.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  },
  {
    path: '/clients',
    name: 'Clients',
    component: () => import('../views/Clients.vue')
  },
  {
    path: '/clients/create',
    name: 'CreateClient',
    component: () => import('../views/CreateClient.vue')
  },
  {
    path: '/clients/:id',
    name: 'ClientDetail',
    component: () => import('../views/ClientDetail.vue')
  },
  {
    path: '/clients/:id/edit',
    name: 'EditClient',
    component: () => import('../views/EditClient.vue')
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/Projects.vue')
  },
  {
    path: '/projects/create',
    name: 'CreateProject',
    component: () => import('../views/CreateProject.vue')
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('../views/ProjectDetail.vue')
  },
  {
    path: '/projects/:id/edit',
    name: 'EditProject',
    component: () => import('../views/EditProject.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

