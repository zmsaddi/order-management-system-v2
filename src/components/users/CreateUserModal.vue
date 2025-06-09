<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">{{ $t('users.new_user') }}</h2>
          <button
            @click="$emit('close')"
            class="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Form -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              {{ $t('users.name') }} *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              :disabled="loading"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="$t('users.name_placeholder')"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              {{ $t('users.email') }} *
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              :disabled="loading"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="$t('users.email_placeholder')"
            />
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              {{ $t('users.role') }} *
            </label>
            <select
              v-model="form.role"
              required
              :disabled="loading"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{{ $t('users.select_role') }}</option>
              <option value="admin">{{ $t('users.role_admin') }}</option>
              <option value="sales_manager">{{ $t('users.role_sales_manager') }}</option>
              <option value="representative">{{ $t('users.role_representative') }}</option>
            </select>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              {{ $t('users.phone') }}
            </label>
            <input
              v-model="form.phone"
              type="tel"
              :disabled="loading"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="$t('users.phone_placeholder')"
            />
          </div>

          <!-- Address -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              {{ $t('users.address') }}
            </label>
            <textarea
              v-model="form.address"
              rows="3"
              :disabled="loading"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="$t('users.address_placeholder')"
            ></textarea>
          </div>

          <!-- Password Option -->
          <div>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="generatePassword"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm text-gray-600">{{ $t('users.generate_password') }}</span>
            </label>
          </div>

          <div v-if="!generatePassword">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              {{ $t('users.password') }} *
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="!generatePassword"
              :disabled="loading"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="$t('users.password_placeholder')"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div class="flex items-center space-x-2">
              <ExclamationTriangleIcon class="h-5 w-5" />
              <span class="text-sm">{{ error }}</span>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="generatedPassword" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <CheckCircleIcon class="h-5 w-5" />
                <span class="text-sm font-medium">{{ $t('users.user_created_success') }}</span>
              </div>
              <div class="bg-white border border-green-300 rounded p-3">
                <p class="text-sm font-medium text-gray-700 mb-1">{{ $t('users.generated_password') }}:</p>
                <div class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <code class="text-sm font-mono text-gray-800">{{ generatedPassword }}</code>
                  <button
                    type="button"
                    @click="copyPassword"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {{ $t('common.copy') }}
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-2">{{ $t('users.password_note') }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              :disabled="loading"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              <div class="flex items-center justify-center space-x-2">
                <ArrowPathIcon v-if="loading" class="animate-spin h-4 w-4" />
                <span>{{ loading ? $t('common.creating') : $t('common.create') }}</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { userService, type CreateUserData, type User } from '@/services/users'
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()

// Emits
const emit = defineEmits<{
  close: []
  created: [user: User]
}>()

// Form state
const form = ref<CreateUserData>({
  email: '',
  name: '',
  role: 'representative',
  phone: '',
  address: '',
  password: ''
})

const generatePassword = ref(true)
const loading = ref(false)
const error = ref<string | null>(null)
const generatedPassword = ref<string | null>(null)

// Computed
const isFormValid = computed(() => {
  return form.value.name.trim() && 
         form.value.email.trim() && 
         form.value.role &&
         (generatePassword.value || form.value.password)
})

// Methods
const handleSubmit = async () => {
  if (loading.value || !isFormValid.value) return

  error.value = null
  loading.value = true

  try {
    const userData: CreateUserData = {
      email: form.value.email.trim(),
      name: form.value.name.trim(),
      role: form.value.role,
      phone: form.value.phone?.trim() || undefined,
      address: form.value.address?.trim() || undefined
    }

    if (!generatePassword.value && form.value.password) {
      userData.password = form.value.password
    }

    const { data, error: createError, password } = await userService.createUser(userData)

    if (createError) {
      error.value = createError
    } else if (data) {
      if (password) {
        generatedPassword.value = password
      }
      
      // Reset form
      form.value = {
        email: '',
        name: '',
        role: 'representative',
        phone: '',
        address: '',
        password: ''
      }

      // Emit success after showing password
      setTimeout(() => {
        emit('created', data)
      }, 3000)
    }
  } catch (err) {
    console.error('Error creating user:', err)
    error.value = t('users.create_error')
  } finally {
    loading.value = false
  }
}

const copyPassword = async () => {
  if (generatedPassword.value) {
    try {
      await navigator.clipboard.writeText(generatedPassword.value)
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to copy password:', err)
    }
  }
}
</script>

