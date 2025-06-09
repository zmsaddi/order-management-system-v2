import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Auth views
import Login from '@/views/auth/Login.vue'

// Dashboard
import Dashboard from '@/views/Dashboard.vue'

// Admin views
import AdminDashboard from '@/views/admin/Dashboard.vue'

// Sales Manager views  
import SalesManagerDashboard from '@/views/sales-manager/Dashboard.vue'

// Representative views
import RepresentativeDashboard from '@/views/representative/Dashboard.vue'

// Shared views
import Products from '@/views/shared/Products.vue'
import Orders from '@/views/shared/Orders.vue'

// Layouts
import AdminLayout from '@/layouts/AdminLayout.vue'
import SalesManagerLayout from '@/layouts/SalesManagerLayout.vue'
import RepresentativeLayout from '@/layouts/RepresentativeLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    // Admin routes
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresRole: 'admin' },
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: AdminDashboard
        },
        {
          path: 'orders',
          name: 'AdminOrders',
          component: Orders
        },
        {
          path: 'products',
          name: 'AdminProducts',
          component: Products
        }
      ]
    },
    // Sales Manager routes
    {
      path: '/sales-manager',
      component: SalesManagerLayout,
      meta: { requiresAuth: true, requiresRole: 'sales_manager' },
      children: [
        {
          path: 'dashboard',
          name: 'SalesManagerDashboard',
          component: SalesManagerDashboard
        },
        {
          path: 'orders',
          name: 'SalesManagerOrders',
          component: Orders
        },
        {
          path: 'products',
          name: 'SalesManagerProducts',
          component: Products
        }
      ]
    },
    // Representative routes
    {
      path: '/representative',
      component: RepresentativeLayout,
      meta: { requiresAuth: true, requiresRole: 'representative' },
      children: [
        {
          path: 'dashboard',
          name: 'RepresentativeDashboard',
          component: RepresentativeDashboard
        },
        {
          path: 'orders',
          name: 'RepresentativeOrders',
          component: Orders
        },
        {
          path: 'products',
          name: 'RepresentativeProducts',
          component: Products
        }
      ]
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already done
  if (!authStore.initialized) {
    await authStore.initialize()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  const requiresRole = to.meta.requiresRole as string | undefined

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if authentication is required
    next('/login')
  } else if (requiresRole && !authStore.canAccessRoute(to.name as string)) {
    // Enhanced role checking using the store method
    console.warn(`Access denied to route ${to.name} for role ${authStore.userRole}`)
    
    // Redirect to appropriate dashboard based on user role
    const defaultRoute = authStore.getDefaultRoute()
    if (defaultRoute !== to.path) {
      next(defaultRoute)
    } else {
      // Fallback to prevent infinite redirect
      next('/dashboard')
    }
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // Redirect to appropriate dashboard if already authenticated
    const defaultRoute = authStore.getDefaultRoute()
    next(defaultRoute)
  } else {
    next()
  }
})

// Add 404 route
router.addRoute({
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/views/NotFound.vue'),
  meta: { requiresAuth: false }
})

export default router

