// Enhanced authentication utilities with cross-browser compatibility
import { supabase } from '@/lib/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'sales_manager' | 'representative'
  status: 'active' | 'inactive'
  employee_id?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  success: boolean
  user?: AuthUser
  session?: Session
  error?: string
}

/**
 * Enhanced authentication service with cross-browser compatibility
 */
export class AuthService {
  private static instance: AuthService
  private sessionCheckInterval: number | null = null
  private readonly SESSION_CHECK_INTERVAL = 60000 // 1 minute
  private readonly SESSION_REFRESH_THRESHOLD = 300000 // 5 minutes

  constructor() {
    this.initializeSessionManagement()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  /**
   * Initialize session management with cross-browser compatibility
   */
  private initializeSessionManagement(): void {
    // Handle session changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      switch (event) {
        case 'SIGNED_IN':
          await this.handleSignIn(session)
          break
        case 'SIGNED_OUT':
          await this.handleSignOut()
          break
        case 'TOKEN_REFRESHED':
          await this.handleTokenRefresh(session)
          break
        case 'USER_UPDATED':
          await this.handleUserUpdate(session)
          break
      }
    })

    // Start session monitoring
    this.startSessionMonitoring()

    // Handle page visibility changes (for mobile browsers)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.checkSessionValidity()
        }
      })
    }

    // Handle storage events (for cross-tab synchronization)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'supabase.auth.token') {
          this.handleStorageChange()
        }
      })

      // Handle beforeunload for cleanup
      window.addEventListener('beforeunload', () => {
        this.cleanup()
      })
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { email, password, rememberMe = false } = credentials

      // Validate input
      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required'
        }
      }

      // Clear any existing session first
      await this.signOut(false)

      // Attempt sign in with enhanced error handling
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (error) {
        console.error('Sign in error:', error)
        
        // Handle failed login attempt
        await this.handleFailedLogin(email)
        
        return {
          success: false,
          error: this.getErrorMessage(error)
        }
      }

      if (!data.user || !data.session) {
        await this.handleFailedLogin(email)
        return {
          success: false,
          error: 'Invalid credentials'
        }
      }

      // Get user profile with retry mechanism
      const userProfile = await this.getUserProfileWithRetry(data.user.id)
      if (!userProfile) {
        await this.signOut(false)
        return {
          success: false,
          error: 'User profile not found or corrupted'
        }
      }

      // Check if user is active
      if (userProfile.status !== 'active') {
        await this.signOut(false)
        return {
          success: false,
          error: 'Account is inactive or suspended'
        }
      }

      // Reset login attempts on successful login
      await this.resetLoginAttempts(email)

      // Set session persistence based on rememberMe
      if (rememberMe) {
        this.setSessionPersistence('local')
      } else {
        this.setSessionPersistence('session')
      }

      // Log successful login
      await this.logAuthEvent('SIGN_IN', data.user.id, true)

      return {
        success: true,
        user: userProfile,
        session: data.session
      }

    } catch (error) {
      console.error('Sign in exception:', error)
      
      // Log the error for debugging
      await this.logAuthEvent('SIGN_IN_ERROR', undefined, false, error instanceof Error ? error.message : 'Unknown error')
      
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      }
    }
  }

  /**
   * Sign out user
   */
  async signOut(redirect: boolean = true): Promise<void> {
    try {
      // Get current user for logging
      const currentUser = await this.getCurrentUser()
      
      // Clear session monitoring
      this.stopSessionMonitoring()

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
      }

      // Clear all local storage related to auth
      this.clearAuthStorage()

      // Log sign out event
      if (currentUser) {
        await this.logAuthEvent('SIGN_OUT', currentUser.id)
      }

      // Redirect if requested
      if (redirect && typeof window !== 'undefined') {
        window.location.href = '/login'
      }

    } catch (error) {
      console.error('Sign out exception:', error)
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return null
      }

      return await this.getUserProfile(user.id)
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Get session error:', error)
        return null
      }

      return session
    } catch (error) {
      console.error('Get session exception:', error)
      return null
    }
  }

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Refresh session error:', error)
        return null
      }

      return session
    } catch (error) {
      console.error('Refresh session exception:', error)
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession()
    return !!session
  }

  /**
   * Get user profile from database
   */
  private async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        console.error('Get user profile error:', error)
        return null
      }

      return data as AuthUser
    } catch (error) {
      console.error('Get user profile exception:', error)
      return null
    }
  }

  /**
   * Handle sign in event
   */
  private async handleSignIn(session: Session | null): void {
    if (session) {
      this.startSessionMonitoring()
    }
  }

  /**
   * Handle sign out event
   */
  private async handleSignOut(): void {
    this.stopSessionMonitoring()
    this.clearAuthStorage()
  }

  /**
   * Handle token refresh event
   */
  private async handleTokenRefresh(session: Session | null): void {
    if (session) {
      console.log('Token refreshed successfully')
    }
  }

  /**
   * Handle user update event
   */
  private async handleUserUpdate(session: Session | null): void {
    if (session) {
      console.log('User updated')
    }
  }

  /**
   * Handle storage changes for cross-tab synchronization
   */
  private async handleStorageChange(): void {
    const session = await this.getCurrentSession()
    if (!session) {
      // Session was cleared in another tab
      await this.signOut(true)
    }
  }

  /**
   * Start session monitoring
   */
  private startSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
    }

    this.sessionCheckInterval = window.setInterval(() => {
      this.checkSessionValidity()
    }, this.SESSION_CHECK_INTERVAL)
  }

  /**
   * Stop session monitoring
   */
  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
    }
  }

  /**
   * Check session validity and refresh if needed
   */
  private async checkSessionValidity(): Promise<void> {
    try {
      const session = await this.getCurrentSession()
      
      if (!session) {
        await this.signOut(true)
        return
      }

      // Check if token needs refresh
      const expiresAt = session.expires_at
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = (expiresAt || 0) - now

      if (timeUntilExpiry < this.SESSION_REFRESH_THRESHOLD / 1000) {
        console.log('Refreshing session token')
        await this.refreshSession()
      }

    } catch (error) {
      console.error('Session validity check error:', error)
    }
  }

  /**
   * Set session persistence mode
   */
  private setSessionPersistence(mode: 'local' | 'session'): void {
    try {
      if (typeof window !== 'undefined') {
        const storage = mode === 'local' ? localStorage : sessionStorage
        storage.setItem('supabase.auth.persistence', mode)
      }
    } catch (error) {
      console.error('Set session persistence error:', error)
    }
  }

  /**
   * Clear authentication storage
   */
  private clearAuthStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        // Clear localStorage
        const localKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('supabase.auth')
        )
        localKeys.forEach(key => localStorage.removeItem(key))

        // Clear sessionStorage
        const sessionKeys = Object.keys(sessionStorage).filter(key => 
          key.startsWith('supabase.auth')
        )
        sessionKeys.forEach(key => sessionStorage.removeItem(key))
      }
    } catch (error) {
      console.error('Clear auth storage error:', error)
    }
  }

  /**
   * Log authentication events
   */
  private async logAuthEvent(event: string, userId?: string): Promise<void> {
    try {
      await supabase.from('audit_log').insert({
        table_name: 'auth_events',
        record_id: userId || 'unknown',
        action: event,
        new_values: { event, timestamp: new Date().toISOString() },
        user_id: userId
      })
    } catch (error) {
      console.error('Log auth event error:', error)
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password'
      case 'Email not confirmed':
        return 'Please confirm your email address'
      case 'Too many requests':
        return 'Too many login attempts. Please try again later'
      case 'User not found':
        return 'No account found with this email'
      default:
        return error.message || 'An error occurred during authentication'
    }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.stopSessionMonitoring()
  }
}

// Export singleton instance
export const authService = AuthService.getInstance()

// Helper functions for components
export const useAuth = () => {
  return {
    signIn: (credentials: LoginCredentials) => authService.signIn(credentials),
    signOut: () => authService.signOut(),
    getCurrentUser: () => authService.getCurrentUser(),
    getCurrentSession: () => authService.getCurrentSession(),
    isAuthenticated: () => authService.isAuthenticated(),
    refreshSession: () => authService.refreshSession()
  }
}

