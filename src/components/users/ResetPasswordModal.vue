<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">{{ $t('users.reset_password') }}</h2>
          <button
            @click="$emit('close')"
            class="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="mb-6">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white text-sm font-semibold">
                {{ getUserInitials(user.name) }}
              </span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ user.name }}</h3>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
            </div>
          </div>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <ExclamationTriangleIcon class="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 class="text-sm font-medium text-yellow-800">{{ $t('users.password_reset_warning') }}</h4>
                <p class="text-sm text-yellow-700 mt-1">{{ $t('users.password_reset_description') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Password Options -->
        <div class="space-y-4 mb-6">
          <div>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="generatePassword"
                type="radio"
                :value="true"
                name="passwordOption"
                class="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
              />
              <div>
                <span class="text-sm font-medium text-gray-900">{{ $t('users.generate_new_password') }}</span>
                <p class="text-xs text-gray-500">{{ $t('users.generate_password_description') }}</p>
              </div>
            </label>
          </div>

          <div>
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                v-model="generatePassword"
                type="radio"
                :value="false"
                name="passwordOption"
                class="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
              />
              <div>
                <span class="text-sm font-medium text-gray-900">{{ $t('users.set_custom_password') }}</span>
                <p class="text-xs text-gray-500">{{ $t('users.custom_password_description') }}</p>
              </div>
            </label>
          </div>

          <!-- Custom Password Input -->
          <div v-if="!generatePassword" class="ml-7">
            <input
              v-model="customPassword"
              type="password"
              :disabled="loading"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              :placeholder="$t('users.enter_new_password')"
            />
            <p class="text-xs text-gray-500 mt-1">{{ $t('users.password_requirements') }}</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div class="flex items-center space-x-2">
            <ExclamationTriangleIcon class="h-5 w-5" />
            <span class="text-sm">{{ error }}</span>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="newPassword" class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <CheckCircleIcon class="h-5 w-5" />
              <span class="text-sm font-medium">{{ $t('users.password_reset_success') }}</span>
            </div>
            <div class="bg-white border border-green-300 rounded p-3">
              <p class="text-sm font-medium text-gray-700 mb-2">{{ $t('users.new_password') }}:</p>
              <div class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <code class="text-sm font-mono text-gray-800">{{ newPassword }}</code>
                <button
                  type="button"
                  @click="copyPassword"
                  class="text-green-600 hover:text-green-800 text-sm"
                >
                  {{ $t('common.copy') }}
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-2">{{ $t('users.share_password_note') }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            :disabled="loading"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="handleReset"
            :disabled="loading || (!generatePassword && !customPassword)"
            class="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            <div class="flex items-center justify-center space-x-2">
              <ArrowPathIcon v-if="loading" class="animate-spin h-4 w-4" />
              <span>{{ loading ? $t('users.resetting') : $t('users.reset_password') }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { userService, type User } from '@/services/users'
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()

// Props
const props = defineProps<{
  user: User
}>()

// Emits
const emit = defineEmits<{
  close: []
  reset: []
}>()

// State
const generatePassword = ref(true)
const customPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const newPassword = ref<string | null>(null)

// Methods
const handleReset = async () => {
  if (loading.value) return

  error.value = null
  newPassword.value = null
  loading.value = true

  try {
    const passwordToUse = generatePassword.value ? undefined : customPassword.value

    const { password, error: resetError } = await userService.resetUserPassword(
      props.user.email,
      passwordToUse
    )

    if (resetError) {
      error.value = resetError
    } else if (password) {
      newPassword.value = password
      
      // Auto close after showing password
      setTimeout(() => {
        emit('reset')
      }, 5000)
    }
  } catch (err) {
    console.error('Error resetting password:', err)
    error.value = t('users.password_reset_error')
  } finally {
    loading.value = false
  }
}

const copyPassword = async () => {
  if (newPassword.value) {
    try {
      await navigator.clipboard.writeText(newPassword.value)
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to copy password:', err)
    }
  }
}

const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

