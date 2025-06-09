<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -inset-10 opacity-50">
        <div class="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div class="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div class="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
    </div>

    <!-- Login Container -->
    <div class="relative w-full max-w-md">
      <!-- Glass Card -->
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-8">
        <!-- Logo and Header -->
        <div class="text-center space-y-4">
          <div class="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">{{ $t('auth.welcome_back') }}</h1>
            <p class="text-white/70">{{ $t('auth.sign_in_subtitle') }}</p>
          </div>
        </div>

        <!-- Alert Messages -->
        <Transition name="slide-down" appear>
          <div v-if="error" class="bg-red-500/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-xl backdrop-blur-sm">
            <div class="flex items-center space-x-3">
              <ExclamationTriangleIcon class="h-5 w-5 flex-shrink-0" />
              <span class="text-sm">{{ error }}</span>
              <button @click="clearError" class="ml-auto hover:bg-red-500/20 rounded-lg p-1 transition-colors">
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </Transition>

        <Transition name="slide-down" appear>
          <div v-if="successMessage" class="bg-green-500/20 border border-green-500/30 text-green-100 px-4 py-3 rounded-xl backdrop-blur-sm">
            <div class="flex items-center space-x-3">
              <CheckCircleIcon class="h-5 w-5 flex-shrink-0" />
              <span class="text-sm">{{ successMessage }}</span>
            </div>
          </div>
        </Transition>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email Field -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-white/90">
              {{ $t('auth.email') }}
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon class="h-5 w-5 text-white/50 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                :disabled="loading"
                @blur="validateEmail"
                class="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                :placeholder="$t('auth.email_placeholder')"
              />
            </div>
            <Transition name="fade">
              <p v-if="emailError" class="text-red-300 text-xs mt-1 flex items-center space-x-1">
                <ExclamationTriangleIcon class="h-3 w-3" />
                <span>{{ emailError }}</span>
              </p>
            </Transition>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-white/90">
              {{ $t('auth.password') }}
            </label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon class="h-5 w-5 text-white/50 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                :disabled="loading"
                @blur="validatePassword"
                class="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                :placeholder="$t('auth.password_placeholder')"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-white/10 rounded-r-xl transition-colors"
                :disabled="loading"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                <EyeSlashIcon v-else class="h-5 w-5 text-white/50 hover:text-white transition-colors" />
              </button>
            </div>
            <Transition name="fade">
              <p v-if="passwordError" class="text-red-300 text-xs mt-1 flex items-center space-x-1">
                <ExclamationTriangleIcon class="h-3 w-3" />
                <span>{{ passwordError }}</span>
              </p>
            </Transition>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center justify-between">
            <label class="flex items-center space-x-3 cursor-pointer group">
              <div class="relative">
                <input
                  id="remember-me"
                  v-model="form.rememberMe"
                  type="checkbox"
                  :disabled="loading"
                  class="sr-only"
                />
                <div class="w-5 h-5 bg-white/10 border border-white/20 rounded-md group-hover:bg-white/20 transition-colors flex items-center justify-center">
                  <CheckIcon v-if="form.rememberMe" class="h-3 w-3 text-purple-400" />
                </div>
              </div>
              <span class="text-sm text-white/70 group-hover:text-white transition-colors">
                {{ $t('auth.remember_me') }}
              </span>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <div class="flex items-center justify-center space-x-2">
              <ArrowPathIcon v-if="loading" class="animate-spin h-5 w-5" />
              <span>{{ loading ? $t('auth.signing_in') : $t('auth.sign_in') }}</span>
            </div>
            
            <!-- Button Shine Effect -->
            <div class="absolute inset-0 -top-1 -left-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        </form>

        <!-- Footer -->
        <div class="text-center space-y-4">
          <div class="flex items-center space-x-4">
            <div class="flex-1 h-px bg-white/20"></div>
            <span class="text-white/50 text-sm">{{ $t('auth.secure_login') }}</span>
            <div class="flex-1 h-px bg-white/20"></div>
          </div>
          
          <!-- Language Selector -->
          <div class="flex justify-center space-x-2">
            <button
              v-for="lang in availableLanguages"
              :key="lang.code"
              @click="changeLanguage(lang.code)"
              :class="[
                'px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                currentLanguage === lang.code
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-400/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/10'
              ]"
            >
              {{ lang.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Floating Elements -->
      <div class="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-60 animate-bounce"></div>
      <div class="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-60 animate-pulse"></div>
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
  CheckCircleIcon,
  CheckIcon
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

// Form validation
const emailError = ref<string | null>(null)
const passwordError = ref<string | null>(null)

const isFormValid = computed(() => {
  return form.value.email.length > 0 && 
         form.value.password.length > 0 && 
         !emailError.value && 
         !passwordError.value
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

const changeLanguage = (langCode: string): void => {
  locale.value = langCode
  document.documentElement.lang = langCode
  document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr'
}

const handleSubmit = async (): Promise<void> => {
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
      }, 1500)
    } else {
      // Handle login failure
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
  // Set initial language direction
  const currentLang = locale.value
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr'
  
  // Focus email field
  nextTick(() => {
    const emailInput = document.getElementById('email')
    if (emailInput) {
      emailInput.focus()
    }
  })
})
</script>

<style scoped>
/* Custom animations */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Glass effect enhancements */
.backdrop-blur-xl {
  backdrop-filter: blur(20px);
}

/* Custom scrollbar for better aesthetics */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* RTL Support */
[dir="rtl"] .space-x-2 > * + * {
  margin-left: 0;
  margin-right: 0.5rem;
}

[dir="rtl"] .space-x-3 > * + * {
  margin-left: 0;
  margin-right: 0.75rem;
}

[dir="rtl"] .space-x-4 > * + * {
  margin-left: 0;
  margin-right: 1rem;
}

/* Enhanced focus states */
input:focus {
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.3);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .backdrop-blur-xl {
    backdrop-filter: blur(10px);
  }
  
  .rounded-3xl {
    border-radius: 1.5rem;
  }
}
</style>

