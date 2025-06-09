<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Login Card -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-center">
          <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white mb-2">{{ $t('auth.welcome_back') }}</h1>
          <p class="text-blue-100">{{ $t('auth.sign_in_subtitle') }}</p>
        </div>

        <!-- Form Container -->
        <div class="px-8 py-8">
          <!-- Alert Messages -->
          <div v-if="error" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <ExclamationTriangleIcon class="h-5 w-5" />
                <span class="text-sm font-medium">{{ error }}</span>
              </div>
              <button @click="clearError" class="text-red-400 hover:text-red-600">
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div class="flex items-center space-x-2">
              <CheckCircleIcon class="h-5 w-5" />
              <span class="text-sm font-medium">{{ successMessage }}</span>
            </div>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                {{ $t('auth.email') }}
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  required
                  :disabled="loading"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  :placeholder="$t('auth.email_placeholder')"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                {{ $t('auth.password') }}
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  :disabled="loading"
                  class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  :placeholder="$t('auth.password_placeholder')"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  :disabled="loading"
                >
                  <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                  <EyeSlashIcon v-else class="h-5 w-5" />
                </button>
              </div>
            </div>

            <!-- Remember Me -->
            <div class="flex items-center justify-between">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  id="remember-me"
                  v-model="form.rememberMe"
                  type="checkbox"
                  :disabled="loading"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm text-gray-600">{{ $t('auth.remember_me') }}</span>
              </label>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <div class="flex items-center justify-center space-x-2">
                <ArrowPathIcon v-if="loading" class="animate-spin h-5 w-5" />
                <span>{{ loading ? $t('auth.signing_in') : $t('auth.sign_in') }}</span>
              </div>
            </button>
          </form>

          <!-- Footer -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <!-- Language Selector -->
            <div class="text-center">
              <p class="text-sm text-gray-500 mb-3">{{ $t('auth.choose_language') }}</p>
              <div class="flex justify-center space-x-2">
                <button
                  v-for="lang in availableLanguages"
                  :key="lang.code"
                  @click="changeLanguage(lang.code)"
                  :class="[
                    'px-3 py-1 rounded-md text-xs font-medium transition-all duration-200',
                    currentLanguage === lang.code
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  {{ lang.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Info -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          {{ $t('auth.system_name') }} v2.0
        </p>
        <p class="text-xs text-gray-400 mt-1">
          {{ $t('auth.secure_login') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Form state
const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const isFormValid = computed(() => {
  return form.value.email.length > 0 && form.value.password.length > 0
})

// Language management
const currentLanguage = computed(() => locale.value)
const availableLanguages = [
  { code: 'ar', name: 'العربية' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'nl', name: 'Nederlands' }
]

// Methods
const togglePasswordVisibility = (): void => {
  showPassword.value = !showPassword.value
}

const clearError = (): void => {
  error.value = null
  authStore.clearError()
}

const changeLanguage = (langCode: string): void => {
  locale.value = langCode
  document.documentElement.lang = langCode
  document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr'
}

const handleSubmit = async (): Promise<void> => {
  if (loading.value || !isFormValid.value) return

  clearError()
  loading.value = true
  
  try {
    const result = await authStore.signIn({
      email: form.value.email.trim().toLowerCase(),
      password: form.value.password,
      rememberMe: form.value.rememberMe
    })
    
    if (result.success) {
      form.value.password = ''
      successMessage.value = t('auth.login_success')
      
      const redirectTo = (route.query.redirect as string) || authStore.getDefaultRoute()
      
      setTimeout(async () => {
        await router.push(redirectTo)
      }, 1000)
    } else {
      error.value = result.error || t('auth.login_failed')
      form.value.password = ''
      
      await nextTick()
      const emailInput = document.getElementById('email') as HTMLInputElement
      if (emailInput) {
        emailInput.focus()
      }
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = t('auth.unexpected_error')
    form.value.password = ''
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  const currentLang = locale.value
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr'
  
  nextTick(() => {
    const emailInput = document.getElementById('email')
    if (emailInput) {
      emailInput.focus()
    }
  })
})
</script>

<style scoped>
/* RTL Support */
[dir="rtl"] .space-x-2 > * + * {
  margin-left: 0;
  margin-right: 0.5rem;
}

/* Enhanced focus states */
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .rounded-2xl {
    border-radius: 1rem;
  }
}
</style>

