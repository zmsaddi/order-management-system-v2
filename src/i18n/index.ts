import { createI18n } from 'vue-i18n'

// Import language files
import en from './locales/en.json'
import ar from './locales/ar.json'
import fr from './locales/fr.json'
import nl from './locales/nl.json'

const messages = {
  en,
  ar,
  fr,
  nl
}

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en', // default locale
  fallbackLocale: 'en',
  messages,
  globalInjection: true,
  silentTranslationWarn: true,
  silentFallbackWarn: true
})

// Language configuration
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr', flag: '🇳🇱' }
]

// Helper functions
export const getLanguageByCode = (code: string) => {
  return languages.find(lang => lang.code === code) || languages[0]
}

export const isRTL = (locale: string) => {
  const language = getLanguageByCode(locale)
  return language.dir === 'rtl'
}

export const setDocumentDirection = (locale: string) => {
  const direction = isRTL(locale) ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('dir', direction)
  document.documentElement.setAttribute('lang', locale)
}

export const setDocumentTitle = (title: string, locale: string) => {
  const language = getLanguageByCode(locale)
  document.title = `${title} - Order Management System`
}

// Currency formatting by language
export const formatCurrencyByLanguage = (amount: number, currency: string, locale: string) => {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    ar: 'ar-SA',
    fr: 'fr-FR',
    nl: 'nl-NL'
  }
  
  const browserLocale = localeMap[locale] || 'en-US'
  
  return new Intl.NumberFormat(browserLocale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Date formatting by language
export const formatDateByLanguage = (date: Date | string, locale: string, options?: Intl.DateTimeFormatOptions) => {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    ar: 'ar-SA',
    fr: 'fr-FR',
    nl: 'nl-NL'
  }
  
  const browserLocale = localeMap[locale] || 'en-US'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
  
  return new Intl.DateTimeFormat(browserLocale, { ...defaultOptions, ...options }).format(dateObj)
}

// Number formatting by language
export const formatNumberByLanguage = (number: number, locale: string, options?: Intl.NumberFormatOptions) => {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    ar: 'ar-SA',
    fr: 'fr-FR',
    nl: 'nl-NL'
  }
  
  const browserLocale = localeMap[locale] || 'en-US'
  
  return new Intl.NumberFormat(browserLocale, options).format(number)
}

export default i18n

