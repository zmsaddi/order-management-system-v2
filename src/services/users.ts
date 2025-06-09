import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'sales_manager' | 'representative'
  status: 'active' | 'inactive' | 'suspended'
  phone?: string
  address?: string
  last_login?: string
  failed_login_attempts: number
  locked_until?: string
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  email: string
  name: string
  role: 'admin' | 'sales_manager' | 'representative'
  phone?: string
  address?: string
  password?: string
}

export interface UpdateUserData {
  name?: string
  role?: 'admin' | 'sales_manager' | 'representative'
  status?: 'active' | 'inactive' | 'suspended'
  phone?: string
  address?: string
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

class UserService {
  /**
   * Get all users (Admin only)
   */
  async getAllUsers(): Promise<{ data: User[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (err) {
      console.error('Unexpected error fetching users:', err)
      return { data: null, error: 'حدث خطأ غير متوقع أثناء جلب المستخدمين' }
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error fetching user:', err)
      return { data: null, error: 'حدث خطأ غير متوقع أثناء جلب بيانات المستخدم' }
    }
  }

  /**
   * Create new user (Admin only)
   */
  async createUser(userData: CreateUserData): Promise<{ data: User | null; error: string | null; password?: string }> {
    try {
      // Generate random password if not provided
      const password = userData.password || this.generateRandomPassword()

      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email.toLowerCase().trim(),
          name: userData.name.trim(),
          role: userData.role,
          phone: userData.phone?.trim() || null,
          address: userData.address?.trim() || null,
          status: 'active'
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        return { data: null, error: this.getErrorMessage(error) }
      }

      return { data, error: null, password }
    } catch (err) {
      console.error('Unexpected error creating user:', err)
      return { data: null, error: 'حدث خطأ غير متوقع أثناء إنشاء المستخدم' }
    }
  }

  /**
   * Update user (Admin only)
   */
  async updateUser(userId: string, userData: UpdateUserData): Promise<{ data: User | null; error: string | null }> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (userData.name) updateData.name = userData.name.trim()
      if (userData.role) updateData.role = userData.role
      if (userData.status) updateData.status = userData.status
      if (userData.phone !== undefined) updateData.phone = userData.phone?.trim() || null
      if (userData.address !== undefined) updateData.address = userData.address?.trim() || null

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        return { data: null, error: this.getErrorMessage(error) }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error updating user:', err)
      return { data: null, error: 'حدث خطأ غير متوقع أثناء تحديث المستخدم' }
    }
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) {
        console.error('Error deleting user:', error)
        return { success: false, error: this.getErrorMessage(error) }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error deleting user:', err)
      return { success: false, error: 'حدث خطأ غير متوقع أثناء حذف المستخدم' }
    }
  }

  /**
   * Reset user password (Admin only)
   */
  async resetUserPassword(userEmail: string, newPassword?: string): Promise<{ password: string | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('reset_user_password', {
        user_email: userEmail,
        new_password: newPassword || null
      })

      if (error) {
        console.error('Error resetting password:', error)
        return { password: null, error: this.getErrorMessage(error) }
      }

      return { password: data, error: null }
    } catch (err) {
      console.error('Unexpected error resetting password:', err)
      return { password: null, error: 'حدث خطأ غير متوقع أثناء إعادة تعيين كلمة المرور' }
    }
  }

  /**
   * Change own password
   */
  async changePassword(passwordData: PasswordChangeData): Promise<{ success: boolean; error: string | null }> {
    try {
      // Validate passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        return { success: false, error: 'كلمات المرور الجديدة غير متطابقة' }
      }

      // Validate password strength
      const passwordValidation = this.validatePassword(passwordData.newPassword)
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.error }
      }

      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) {
        console.error('Error changing password:', error)
        return { success: false, error: this.getErrorMessage(error) }
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('Unexpected error changing password:', err)
      return { success: false, error: 'حدث خطأ غير متوقع أثناء تغيير كلمة المرور' }
    }
  }

  /**
   * Toggle user status (Admin only)
   */
  async toggleUserStatus(userEmail: string, newStatus?: string): Promise<{ status: string | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('toggle_user_status', {
        user_email: userEmail,
        new_status: newStatus || null
      })

      if (error) {
        console.error('Error toggling user status:', error)
        return { status: null, error: this.getErrorMessage(error) }
      }

      return { status: data, error: null }
    } catch (err) {
      console.error('Unexpected error toggling user status:', err)
      return { status: null, error: 'حدث خطأ غير متوقع أثناء تغيير حالة المستخدم' }
    }
  }

  /**
   * Get user detailed info (Admin only)
   */
  async getUserDetailedInfo(userEmail: string): Promise<{ data: any | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_user_info', {
        user_email: userEmail
      })

      if (error) {
        console.error('Error getting user info:', error)
        return { data: null, error: this.getErrorMessage(error) }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Unexpected error getting user info:', err)
      return { data: null, error: 'حدث خطأ غير متوقع أثناء جلب معلومات المستخدم' }
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: string, role?: string, status?: string): Promise<{ data: User[] | null; error: string | null }> {
    try {
      let queryBuilder = supabase
        .from('users')
        .select('*')

      // Add search filter
      if (query.trim()) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      }

      // Add role filter
      if (role && role !== 'all') {
        queryBuilder = queryBuilder.eq('role', role)
      }

      // Add status filter
      if (status && status !== 'all') {
        queryBuilder = queryBuilder.eq('status', status)
      }

      queryBuilder = queryBuilder.order('created_at', { ascending: false })

      const { data, error } = await queryBuilder

      if (error) {
        console.error('Error searching users:', error)
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (err) {
      console.error('Unexpected error searching users:', err)
      return { data: null, error: 'حدث خطأ غير متوقع أثناء البحث' }
    }
  }

  /**
   * Get users statistics
   */
  async getUsersStatistics(): Promise<{ data: any | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, status')

      if (error) {
        console.error('Error getting users statistics:', error)
        return { data: null, error: error.message }
      }

      const stats = {
        total: data?.length || 0,
        byRole: {
          admin: data?.filter(u => u.role === 'admin').length || 0,
          sales_manager: data?.filter(u => u.role === 'sales_manager').length || 0,
          representative: data?.filter(u => u.role === 'representative').length || 0
        },
        byStatus: {
          active: data?.filter(u => u.status === 'active').length || 0,
          inactive: data?.filter(u => u.status === 'inactive').length || 0,
          suspended: data?.filter(u => u.status === 'suspended').length || 0
        }
      }

      return { data: stats, error: null }
    } catch (err) {
      console.error('Unexpected error getting statistics:', err)
      return { data: null, error: 'حدث خطأ غير متوقع أثناء جلب الإحصائيات' }
    }
  }

  /**
   * Generate random password
   */
  private generateRandomPassword(): string {
    const length = 12
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    password += '0123456789'[Math.floor(Math.random() * 10)]
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
    
    // Fill the rest
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): { isValid: boolean; error?: string } {
    if (password.length < 8) {
      return { isValid: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }
    }

    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل' }
    }

    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل' }
    }

    if (!/[0-9]/.test(password)) {
      return { isValid: false, error: 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل' }
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { isValid: false, error: 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل' }
    }

    return { isValid: true }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (error.code === '23505') {
      if (error.message.includes('email')) {
        return 'البريد الإلكتروني مستخدم بالفعل'
      }
    }

    if (error.message.includes('email')) {
      return 'خطأ في البريد الإلكتروني'
    }

    if (error.message.includes('password')) {
      return 'خطأ في كلمة المرور'
    }

    return error.message || 'حدث خطأ غير متوقع'
  }
}

// Export singleton instance
export const userService = new UserService()

