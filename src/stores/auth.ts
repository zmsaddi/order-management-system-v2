import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type AuthUser, type LoginCredentials } from '@/services/auth'
import type { Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')

  // Role-based permissions
  const isAdmin = computed(() => userRole.value === 'admin')
  const isSalesManager = computed(() => 
    userRole.value === 'admin' || userRole.value === 'sales_manager'
  )
  const isRepresentative = computed(() => 
    userRole.value === 'admin' || 
    userRole.value === 'sales_manager' || 
    userRole.value === 'representative'
  )

  // Actions
  const initialize = async (): Promise<void> => {
    if (initialized.value) return

    loading.value = true
    error.value = null

    try {
      // Check for existing session
      const currentSession = await authService.getCurrentSession()
      
      if (currentSession) {
        session.value = currentSession
        
        // Get user profile
        const currentUser = await authService.getCurrentUser()
        if (currentUser && currentUser.status === 'active') {
          user.value = currentUser
        } else {
          // User not found or inactive, sign out
          await signOut()
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
      error.value = 'Failed to initialize authentication'
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  const signIn = async (credentials: LoginCredentials): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.signIn(credentials)
      
      if (response.success && response.user && response.session) {
        user.value = response.user
        session.value = response.session
        return true
      } else {
        error.value = response.error || 'Sign in failed'
        return false
      }
    } catch (err) {
      console.error('Sign in error:', err)
      error.value = 'An unexpected error occurred'
      return false
    } finally {
      loading.value = false
    }
  }

  const signOut = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await authService.signOut(false)
      user.value = null
      session.value = null
    } catch (err) {
      console.error('Sign out error:', err)
      error.value = 'Failed to sign out'
    } finally {
      loading.value = false
    }
  }

  const refreshSession = async (): Promise<boolean> => {
    try {
      const newSession = await authService.refreshSession()
      
      if (newSession) {
        session.value = newSession
        
        // Refresh user data
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          user.value = currentUser
          return true
        }
      }
      
      // If refresh failed, sign out
      await signOut()
      return false
    } catch (err) {
      console.error('Refresh session error:', err)
      await signOut()
      return false
    }
  }

  const updateUser = async (): Promise<void> => {
    if (!user.value) return

    try {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        user.value = currentUser
      }
    } catch (err) {
      console.error('Update user error:', err)
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false

    const rolePermissions: Record<string, string[]> = {
      admin: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'orders.create',
        'orders.read',
        'orders.update',
        'orders.delete',
        'products.create',
        'products.read',
        'products.update',
        'products.delete',
        'reports.read',
        'settings.read',
        'settings.update',
        'company.read',
        'company.update'
      ],
      sales_manager: [
        'users.read',
        'orders.create',
        'orders.read',
        'orders.update',
        'products.read',
        'reports.read'
      ],
      representative: [
        'orders.create',
        'orders.read',
        'orders.update',
        'products.read'
      ]
    }

    const userPermissions = rolePermissions[user.value.role] || []
    return userPermissions.includes(permission)
  }

  const canAccessRoute = (routeName: string): boolean => {
    if (!user.value) return false

    const routePermissions: Record<string, string[]> = {
      'admin-dashboard': ['admin'],
      'admin-users': ['admin'],
      'admin-settings': ['admin'],
      'manager-dashboard': ['admin', 'sales_manager'],
      'manager-team': ['admin', 'sales_manager'],
      'manager-reports': ['admin', 'sales_manager'],
      'rep-dashboard': ['admin', 'sales_manager', 'representative'],
      'rep-orders': ['admin', 'sales_manager', 'representative'],
      'orders': ['admin', 'sales_manager', 'representative'],
      'products': ['admin', 'sales_manager', 'representative'],
      'reports': ['admin', 'sales_manager']
    }

    const allowedRoles = routePermissions[routeName] || []
    return allowedRoles.includes(user.value.role)
  }

  const getDefaultRoute = (): string => {
    if (!user.value) return '/login'

    switch (user.value.role) {
      case 'admin':
        return '/admin/dashboard'
      case 'sales_manager':
        return '/manager/dashboard'
      case 'representative':
        return '/representative/dashboard'
      default:
        return '/login'
    }
  }

  // Return store interface
  return {
    // State
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    error: readonly(error),
    initialized: readonly(initialized),

    // Getters
    isAuthenticated,
    userRole,
    userName,
    userEmail,
    isAdmin,
    isSalesManager,
    isRepresentative,

    // Actions
    initialize,
    signIn,
    signOut,
    refreshSession,
    updateUser,
    clearError,
    hasPermission,
    canAccessRoute,
    getDefaultRoute
  }
})

