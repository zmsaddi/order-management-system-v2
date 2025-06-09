import { createClient } from '@supabase/supabase-js'
import { config } from '@/config'

// Create Supabase client
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': `${config.appName}/${config.appVersion}`
      }
    }
  }
)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone?: string
          address?: string
          role: 'admin' | 'sales_manager' | 'representative'
          employee_id?: string
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string
          address?: string
          role: 'admin' | 'sales_manager' | 'representative'
          employee_id?: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          address?: string
          role?: 'admin' | 'sales_manager' | 'representative'
          employee_id?: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      company_settings: {
        Row: {
          id: number
          company_name: string
          company_name_ar?: string
          company_name_fr?: string
          company_name_nl?: string
          logo_url?: string
          address?: string
          address_ar?: string
          address_fr?: string
          address_nl?: string
          phone?: string
          email?: string
          website?: string
          tax_number?: string
          registration_number?: string
          currency_code: string
          currency_symbol: string
          default_language: string
          timezone: string
          date_format: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          company_name: string
          company_name_ar?: string
          company_name_fr?: string
          company_name_nl?: string
          logo_url?: string
          address?: string
          address_ar?: string
          address_fr?: string
          address_nl?: string
          phone?: string
          email?: string
          website?: string
          tax_number?: string
          registration_number?: string
          currency_code?: string
          currency_symbol?: string
          default_language?: string
          timezone?: string
          date_format?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          company_name?: string
          company_name_ar?: string
          company_name_fr?: string
          company_name_nl?: string
          logo_url?: string
          address?: string
          address_ar?: string
          address_fr?: string
          address_nl?: string
          phone?: string
          email?: string
          website?: string
          tax_number?: string
          registration_number?: string
          currency_code?: string
          currency_symbol?: string
          default_language?: string
          timezone?: string
          date_format?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: number
          name: string
          description?: string
          sku?: string
          category_id?: number
          unit_price: number
          cost_price?: number
          stock_quantity?: number
          min_stock_level?: number
          unit_of_measure: string
          is_active: boolean
          image_url?: string
          notes?: string
          created_by?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string
          sku?: string
          category_id?: number
          unit_price: number
          cost_price?: number
          stock_quantity?: number
          min_stock_level?: number
          unit_of_measure?: string
          is_active?: boolean
          image_url?: string
          notes?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          sku?: string
          category_id?: number
          unit_price?: number
          cost_price?: number
          stock_quantity?: number
          min_stock_level?: number
          unit_of_measure?: string
          is_active?: boolean
          image_url?: string
          notes?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: number
          customer_name: string
          customer_phone?: string
          customer_address?: string
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          notes?: string
          status: 'new' | 'processing' | 'completed' | 'delivered' | 'cancelled'
          sales_rep_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          customer_name: string
          customer_phone?: string
          customer_address?: string
          subtotal: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string
          status?: 'new' | 'processing' | 'completed' | 'delivered' | 'cancelled'
          sales_rep_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          customer_name?: string
          customer_phone?: string
          customer_address?: string
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string
          status?: 'new' | 'processing' | 'completed' | 'delivered' | 'cancelled'
          sales_rep_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_products: {
        Row: {
          id: number
          order_id: number
          product_id?: number
          name: string
          description?: string
          notes?: string
          quantity: number
          unit_price: number
          subtotal: number
          is_custom: boolean
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          product_id?: number
          name: string
          description?: string
          notes?: string
          quantity: number
          unit_price: number
          subtotal?: number
          is_custom?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          product_id?: number
          name?: string
          description?: string
          notes?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          is_custom?: boolean
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: number
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_values?: any
          new_values?: any
          changed_fields?: string[]
          user_id?: string
          ip_address?: string
          user_agent?: string
          created_at: string
        }
        Insert: {
          id?: number
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_values?: any
          new_values?: any
          changed_fields?: string[]
          user_id?: string
          ip_address?: string
          user_agent?: string
          created_at?: string
        }
        Update: {
          id?: number
          table_name?: string
          record_id?: string
          action?: 'INSERT' | 'UPDATE' | 'DELETE'
          old_values?: any
          new_values?: any
          changed_fields?: string[]
          user_id?: string
          ip_address?: string
          user_agent?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_completely: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      disable_user: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

