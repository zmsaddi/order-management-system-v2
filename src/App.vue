<template>
  <div id="app" :class="{ 'rtl': isRTL }" :dir="isRTL ? 'rtl' : 'ltr'">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useCompanyStore } from '@/stores/company'
import { isRTL } from '@/i18n'

const { locale } = useI18n()
const authStore = useAuthStore()
const companyStore = useCompanyStore()

// Computed
const isRTLDirection = computed(() => isRTL(locale.value))

// Watch for language changes to update document direction
watch(locale, (newLocale) => {
  document.documentElement.lang = newLocale
  document.documentElement.dir = isRTL(newLocale) ? 'rtl' : 'ltr'
}, { immediate: true })

// Initialize app
onMounted(async () => {
  // Initialize authentication
  await authStore.initialize()
  
  // Initialize company settings
  await companyStore.initialize()
  
  // Set initial language from company settings or browser
  if (companyStore.settings?.default_language) {
    locale.value = companyStore.settings.default_language
  } else {
    // Detect browser language
    const browserLang = navigator.language.split('-')[0]
    const supportedLangs = ['en', 'ar', 'fr', 'nl']
    locale.value = supportedLangs.includes(browserLang) ? browserLang : 'en'
  }
})
</script>

<style>
/* Global RTL styles */
.rtl {
  direction: rtl;
}

.rtl .text-left {
  text-align: right;
}

.rtl .text-right {
  text-align: left;
}

.rtl .ml-2 {
  margin-left: 0;
  margin-right: 0.5rem;
}

.rtl .mr-2 {
  margin-right: 0;
  margin-left: 0.5rem;
}

.rtl .pl-3 {
  padding-left: 0;
  padding-right: 0.75rem;
}

.rtl .pr-3 {
  padding-right: 0;
  padding-left: 0.75rem;
}

/* Form styles for RTL */
.rtl input[type="text"],
.rtl input[type="email"],
.rtl input[type="password"],
.rtl input[type="number"],
.rtl input[type="tel"],
.rtl input[type="url"],
.rtl input[type="date"],
.rtl textarea,
.rtl select {
  text-align: right;
}

/* Button styles for RTL */
.rtl .btn {
  flex-direction: row-reverse;
}

/* Navigation styles for RTL */
.rtl .nav-item {
  margin-left: 0;
  margin-right: 1rem;
}

/* Table styles for RTL */
.rtl table {
  direction: rtl;
}

.rtl th,
.rtl td {
  text-align: right;
}

/* Modal and dropdown styles for RTL */
.rtl .dropdown-menu {
  left: auto;
  right: 0;
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-break {
    page-break-before: always;
  }
  
  .print-avoid-break {
    page-break-inside: avoid;
  }
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .mobile-hidden {
    display: none;
  }
  
  .mobile-full-width {
    width: 100%;
  }
  
  .mobile-stack {
    flex-direction: column;
  }
}

/* Loading animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Fade transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

.rtl .slide-enter-from {
  transform: translateX(100%);
}

.rtl .slide-leave-to {
  transform: translateX(-100%);
}
</style>

