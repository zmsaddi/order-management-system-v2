import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useI18n } from 'vue-i18n'

export interface CompanySettings {
  id: number
  name: string
  name_ar?: string
  name_fr?: string
  name_nl?: string
  logo_url?: string
  address: string
  address_ar?: string
  address_fr?: string
  address_nl?: string
  phone: string
  email: string
  website?: string
  tax_number?: string
  registration_number?: string
  default_language: string
  default_currency: string
  timezone: string
  date_format: string
  tax_rate: number
  created_at: string
  updated_at: string
}

export interface UpdateCompanyData extends Partial<Omit<CompanySettings, 'id' | 'created_at' | 'updated_at'>> {}

export const useCompanyStore = defineStore('company', () => {
  const { t } = useI18n()
  
  // State
  const settings = ref<CompanySettings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const uploadingLogo = ref(false)

  // Default company settings
  const defaultSettings: Partial<CompanySettings> = {
    name: 'Order Management System',
    name_ar: 'نظام إدارة الطلبات',
    name_fr: 'Système de Gestion des Commandes',
    name_nl: 'Bestellingsbeheer Systeem',
    address: '123 Business Street, City, Country',
    address_ar: '123 شارع الأعمال، المدينة، البلد',
    address_fr: '123 Rue des Affaires, Ville, Pays',
    address_nl: '123 Zakelijke Straat, Stad, Land',
    phone: '+1 234 567 8900',
    email: 'info@company.com',
    website: 'www.company.com',
    default_language: 'en',
    default_currency: 'EUR',
    timezone: 'Europe/Amsterdam',
    date_format: 'DD/MM/YYYY',
    tax_rate: 21.0
  }

  // Getters
  const companyName = computed(() => {
    if (!settings.value) return defaultSettings.name
    const { locale } = useI18n()
    const localizedField = `name_${locale.value}` as keyof CompanySettings
    return settings.value[localizedField] || settings.value.name || defaultSettings.name
  })

  const companyAddress = computed(() => {
    if (!settings.value) return defaultSettings.address
    const { locale } = useI18n()
    const localizedField = `address_${locale.value}` as keyof CompanySettings
    return settings.value[localizedField] || settings.value.address || defaultSettings.address
  })

  const hasLogo = computed(() => {
    return settings.value?.logo_url && settings.value.logo_url.length > 0
  })

  const isConfigured = computed(() => {
    return settings.value !== null
  })

  // Actions
  const fetchSettings = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      settings.value = data || null
    } catch (err) {
      console.error('Error fetching company settings:', err)
      error.value = t('company.fetch_error')
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (updateData: UpdateCompanyData): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      if (settings.value) {
        // Update existing settings
        const { data, error: updateError } = await supabase
          .from('company_settings')
          .update(updateData)
          .eq('id', settings.value.id)
          .select()
          .single()

        if (updateError) throw updateError

        settings.value = data
      } else {
        // Create new settings
        const { data, error: createError } = await supabase
          .from('company_settings')
          .insert([{ ...defaultSettings, ...updateData }])
          .select()
          .single()

        if (createError) throw createError

        settings.value = data
      }

      return true
    } catch (err) {
      console.error('Error updating company settings:', err)
      error.value = t('company.update_error')
      return false
    } finally {
      loading.value = false
    }
  }

  const uploadLogo = async (file: File): Promise<string | null> => {
    uploadingLogo.value = true
    error.value = null

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `company-logo-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName)

      const logoUrl = urlData.publicUrl

      // Update company settings with new logo URL
      await updateSettings({ logo_url: logoUrl })

      return logoUrl
    } catch (err) {
      console.error('Error uploading logo:', err)
      error.value = t('company.upload_error')
      return null
    } finally {
      uploadingLogo.value = false
    }
  }

  const removeLogo = async (): Promise<boolean> => {
    if (!settings.value?.logo_url) return true

    try {
      // Extract filename from URL
      const url = new URL(settings.value.logo_url)
      const fileName = url.pathname.split('/').pop()

      if (fileName) {
        // Delete from storage
        await supabase.storage
          .from('company-assets')
          .remove([fileName])
      }

      // Update settings to remove logo URL
      await updateSettings({ logo_url: null })

      return true
    } catch (err) {
      console.error('Error removing logo:', err)
      error.value = t('company.remove_logo_error')
      return false
    }
  }

  const resetToDefaults = async (): Promise<boolean> => {
    return await updateSettings(defaultSettings)
  }

  const getLocalizedSetting = (field: string, language?: string): string => {
    if (!settings.value) return ''
    
    const { locale } = useI18n()
    const lang = language || locale.value
    const localizedField = `${field}_${lang}`
    
    return (settings.value as any)[localizedField] || (settings.value as any)[field] || ''
  }

  const clearError = (): void => {
    error.value = null
  }

  // Initialize
  const initialize = async (): Promise<void> => {
    await fetchSettings()
  }

  return {
    // State
    settings,
    loading,
    error,
    uploadingLogo,

    // Getters
    companyName,
    companyAddress,
    hasLogo,
    isConfigured,

    // Actions
    fetchSettings,
    updateSettings,
    uploadLogo,
    removeLogo,
    resetToDefaults,
    getLocalizedSetting,
    clearError,
    initialize
  }
})

