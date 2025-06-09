// Environment variables configuration
export const config = {
  // Supabase Configuration - Real Values
  supabaseUrl: 'https://hifordsrgtmuhlhwsfar.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZm9yZHNyZ3RtdWhsaHdzZmFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODE1MDgsImV4cCI6MjA2NTA1NzUwOH0.eGeNXKjiXjv_1MnM5R-0hs1FDKG54EoKASZLd9z4OhA',
  
  // Application Configuration
  appName: 'Order Management System',
  appVersion: '2.0.0',
  
  // Default Company Settings
  defaultCompany: {
    name: 'Your Company Name',
    nameAr: 'اسم شركتك',
    nameFr: 'Nom de votre entreprise',
    nameNl: 'Uw bedrijfsnaam',
    logo: '/logo.png',
    currency: 'EUR',
    currencySymbol: '€',
    language: 'en'
  },
  
  // Default Admin User
  defaultAdmin: {
    email: 'zmsaddi@gmail.com',
    password: 'Admin@spain2025',
    name: 'System Administrator',
    role: 'admin'
  },
  
  // Supported Languages
  supportedLanguages: [
    { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
    { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr' }
  ],
  
  // Supported Currencies
  supportedCurrencies: [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' }
  ],
  
  // User Roles
  userRoles: [
    { value: 'admin', label: 'Administrator' },
    { value: 'sales_manager', label: 'Sales Manager' },
    { value: 'representative', label: 'Sales Representative' }
  ],
  
  // Order Statuses
  orderStatuses: [
    { value: 'new', label: 'New', color: 'blue' },
    { value: 'processing', label: 'Processing', color: 'yellow' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ],
  
  // Pagination
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },
  
  // File Upload
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  
  // Security Settings
  security: {
    passwordMinLength: 8,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15 minutes
  },
  
  // API Settings
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  },
  
  // Date and Time Formats
  dateFormats: {
    short: 'DD/MM/YYYY',
    long: 'DD MMMM YYYY',
    withTime: 'DD/MM/YYYY HH:mm',
    time: 'HH:mm'
  },
  
  // Number Formats
  numberFormats: {
    decimal: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  }
}

// Helper function to get configuration value
export const getConfig = (key: string, defaultValue?: any) => {
  const keys = key.split('.')
  let value = config
  
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      return defaultValue
    }
  }
  
  return value
}

// Helper function to check if development mode
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development'
}

// Helper function to check if production mode
export const isProduction = () => {
  return import.meta.env.MODE === 'production'
}

