<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo and Title -->
      <div class="text-center">
        <!-- Logo placeholder -->
        <div class="mx-auto h-16 w-16 bg-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-2xl">OMS</span>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ $t('auth.sign_in_title') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ $t('auth.sign_in_subtitle') }}
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Error Alert -->
        <div 
          v-if="error" 
          class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
          :class="{ 'animate-pulse': loading }"
        >
          <div class="flex items-center">
            <ExclamationTriangleIcon class="h-5 w-5 mr-2 flex-shrink-0" />
            <span class="block sm:inline">{{ error }}</span>
          </div>
          <button 
            @click="clearError"
            class="absolute top-0 bottom-0 right-0 px-4 py-3 hover:bg-red-100 rounded-r"
            :disabled="loading"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <!-- Success Alert -->
        <div 
          v-if="successMessage" 
          class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <div class="flex items-center">
            <CheckCircleIcon class="h-5 w-5 mr-2 flex-shrink-0" />
            <span class="block sm:inline">{{ successMessage }}</span>
          </div>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="form-label">
              {{ $t('auth.email') }}
            </label>
            <div class="mt-1 relative">
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                :disabled="loading"
                class="form-input"
                :class="{ 'border-red-300': emailError }"
                :placeholder="$t('auth.email_placeholder')"
              >
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <EnvelopeIcon class="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <p v-if="emailError" class="form-error">{{ emailError }}</p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="form-label">
              {{ $t('auth.password') }}
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                :disabled="loading"
                class="form-input pr-10"
                :class="{ 'border-red-300': passwordError }"
                :placeholder="$t('auth.password_placeholder')"
              >
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                :disabled="loading"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p v-if="passwordError" class="form-error">{{ passwordError }}</p>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                type="checkbox"
                :disabled="loading"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              >
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                {{ $t('auth.remember_me') }}
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="btn btn-primary w-full flex justify-center items-center"
              :class="{ 'opacity-50 cursor-not-allowed': loading || !isFormValid }"
            >
              <ArrowPathIcon 
                v-if="loading" 
                class="animate-spin -ml-1 mr-3 h-5 w-5" 
              />
              {{ loading ? $t('auth.signing_in') : $t('auth.sign_in') }}
            </button>
          </div>
        </form>

        <!-- Additional Info -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                {{ $t('auth.secure_login') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Browser Compatibility Notice -->
        <div v-if="showBrowserWarning" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div class="flex">
            <ExclamationTriangleIcon class="h-5 w-5 text-yellow-400" />
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                {{ $t('auth.browser_warning') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-sm text-gray-500">
      <p>{{ $t('auth.footer_text') }}</p>
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
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
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
const showBrowserWarning = ref(false)

// Form validation
const emailError = ref<string | null>(null)
const passwordError = ref<string | null>(null)

const isFormValid = computed(() => {
  return form.value.email.length > 0 && 
         form.value.password.length > 0 && 
         !emailError.value && 
         !passwordError.value
})

// Methods
const validateEmail = (): void => {
  const email = form.value.email.trim()
  if (!email) {
    emailError.value = t('auth.email_required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError.value = t('auth.email_invalid')
  } else {
    emailError.value = null
  }
}

const validatePassword = (): void => {
  const password = form.value.password
  if (!password) {
    passwordError.value = t('auth.password_required')
  } else if (password.length < 6) {
    passwordError.value = t('auth.password_min_length')
  } else {
    passwordError.value = null
  }
}

const togglePasswordVisibility = (): void => {
  showPassword.value = !showPassword.value
}

const clearError = (): void => {
  error.value = null
  authStore.clearError()
}

const handleLogoError = (event: Event): void => {
  const img = event.target as HTMLImageElement
  img.src = '/default-logo.png' // Fallback logo
}

const checkBrowserCompatibility = (): void => {
  // Check for modern browser features
  const hasLocalStorage = typeof Storage !== 'undefined'
  const hasSessionStorage = typeof sessionStorage !== 'undefined'
  const hasPromise = typeof Promise !== 'undefined'
  const hasFetch = typeof fetch !== 'undefined'
  
  if (!hasLocalStorage || !hasSessionStorage || !hasPromise || !hasFetch) {
    showBrowserWarning.value = true
  }
}

const handleSubmit = async (): Promise<void> => {
  // Prevent double submission
  if (loading.value || !isFormValid.value) return

  // Clear previous errors
  clearError()
  emailError.value = null
  passwordError.value = null
  
  // Validate form
  validateEmail()
  validatePassword()
  
  if (emailError.value || passwordError.value) {
    return
  }
  
  loading.value = true
  
  try {
    // Enhanced login with better error handling
    const result = await authStore.signIn({
      email: form.value.email.trim().toLowerCase(),
      password: form.value.password,
      rememberMe: form.value.rememberMe
    })
    
    if (result.success) {
      // Clear password for security
      form.value.password = ''
      
      // Show success message
      successMessage.value = t('auth.login_success')
      
      // Get redirect URL from query params or use default
      const redirectTo = (route.query.redirect as string) || authStore.getDefaultRoute()
      
      // Small delay to show success message
      setTimeout(async () => {
        await router.push(redirectTo)
      }, 1000)
    } else {
      // Handle login failure with specific error messages
      error.value = result.error || t('auth.login_failed')
      
      // Clear password on error for security
      form.value.password = ''
      
      // Focus email field for retry
      await nextTick()
      const emailInput = document.getElementById('email') as HTMLInputElement
      if (emailInput) {
        emailInput.focus()
        emailInput.select()
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
  // Check browser compatibility
  checkBrowserCompatibility()
  
  // Focus email field
  nextTick(() => {
    const emailInput = document.getElementById('email')
    if (emailInput) {
      emailInput.focus()
    }
  })
  
  // Add form validation listeners
  const emailInput = document.getElementById('email')
  const passwordInput = document.getElementById('password')
  
  if (emailInput) {
    emailInput.addEventListener('blur', validateEmail)
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('blur', validatePassword)
  }
})
</script>

<style scoped>
/* Additional styles for better cross-browser compatibility */
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Ensure consistent styling across browsers */
input[type="email"],
input[type="password"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* Loading animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>

