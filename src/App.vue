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
  
  // Update body class for RTL styling
  if (isRTL(newLocale)) {
    document.body.classList.add('rtl')
    document.body.classList.remove('ltr')
  } else {
    document.body.classList.add('ltr')
    document.body.classList.remove('rtl')
  }
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
/* Enhanced RTL styles for better Arabic support */
.rtl {
  direction: rtl;
}

/* Text alignment fixes */
.rtl .text-left {
  text-align: right !important;
}

.rtl .text-right {
  text-align: left !important;
}

/* Margin fixes for RTL */
.rtl .ml-1 { margin-left: 0; margin-right: 0.25rem; }
.rtl .ml-2 { margin-left: 0; margin-right: 0.5rem; }
.rtl .ml-3 { margin-left: 0; margin-right: 0.75rem; }
.rtl .ml-4 { margin-left: 0; margin-right: 1rem; }
.rtl .ml-6 { margin-left: 0; margin-right: 1.5rem; }

.rtl .mr-1 { margin-right: 0; margin-left: 0.25rem; }
.rtl .mr-2 { margin-right: 0; margin-left: 0.5rem; }
.rtl .mr-3 { margin-right: 0; margin-left: 0.75rem; }
.rtl .mr-4 { margin-right: 0; margin-left: 1rem; }
.rtl .mr-6 { margin-right: 0; margin-left: 1.5rem; }

/* Padding fixes for RTL */
.rtl .pl-1 { padding-left: 0; padding-right: 0.25rem; }
.rtl .pl-2 { padding-left: 0; padding-right: 0.5rem; }
.rtl .pl-3 { padding-left: 0; padding-right: 0.75rem; }
.rtl .pl-4 { padding-left: 0; padding-right: 1rem; }
.rtl .pl-6 { padding-left: 0; padding-right: 1.5rem; }

.rtl .pr-1 { padding-right: 0; padding-left: 0.25rem; }
.rtl .pr-2 { padding-right: 0; padding-left: 0.5rem; }
.rtl .pr-3 { padding-right: 0; padding-left: 0.75rem; }
.rtl .pr-4 { padding-right: 0; padding-left: 1rem; }
.rtl .pr-6 { padding-right: 0; padding-left: 1.5rem; }

/* Border radius fixes for RTL */
.rtl .rounded-l { border-radius: 0 0.375rem 0.375rem 0; }
.rtl .rounded-r { border-radius: 0.375rem 0 0 0.375rem; }
.rtl .rounded-tl { border-top-left-radius: 0; border-top-right-radius: 0.375rem; }
.rtl .rounded-tr { border-top-right-radius: 0; border-top-left-radius: 0.375rem; }
.rtl .rounded-bl { border-bottom-left-radius: 0; border-bottom-right-radius: 0.375rem; }
.rtl .rounded-br { border-bottom-right-radius: 0; border-bottom-left-radius: 0.375rem; }

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

/* Flex direction fixes for RTL */
.rtl .flex-row {
  flex-direction: row-reverse;
}

.rtl .space-x-2 > * + * {
  margin-left: 0;
  margin-right: 0.5rem;
}

.rtl .space-x-4 > * + * {
  margin-left: 0;
  margin-right: 1rem;
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

.rtl th:first-child,
.rtl td:first-child {
  text-align: right;
}

.rtl th:last-child,
.rtl td:last-child {
  text-align: left;
}

/* Modal and dropdown styles for RTL */
.rtl .dropdown-menu {
  left: auto;
  right: 0;
}

.rtl .modal {
  direction: rtl;
}

/* Icon positioning for RTL */
.rtl .icon-left {
  order: 2;
  margin-left: 0.5rem;
  margin-right: 0;
}

.rtl .icon-right {
  order: -1;
  margin-right: 0.5rem;
  margin-left: 0;
}

/* Sidebar and layout fixes for RTL */
.rtl .sidebar {
  left: auto;
  right: 0;
}

.rtl .main-content {
  margin-left: 0;
  margin-right: 16rem; /* Adjust based on sidebar width */
}

/* Float fixes for RTL */
.rtl .float-left {
  float: right;
}

.rtl .float-right {
  float: left;
}

/* Transform fixes for RTL */
.rtl .transform {
  transform: scaleX(-1);
}

.rtl .transform-none {
  transform: none;
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

