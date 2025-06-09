<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">{{ $t('users.edit_user') }}</h2>
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
              <option value="admin">{{ $t('users.role_admin') }}</option>
              <option value="sales_manager">{{ $t('users.role_sales_manager') }}</option>
              <option value="representative">{{ $t('users.role_representative') }}</option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              {{ $t('users.status') }} *
            </label>
            <select
              v-model="form.status"
              required
              :disabled="loading"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">{{ $t('common.active') }}</option>
              <option value="inactive">{{ $t('common.inactive') }}</option>
              <option value="suspended">{{ $t('common.suspended') }}</option>
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

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div class="flex items-center space-x-2">
              <ExclamationTriangleIcon class="h-5 w-5" />
              <span class="text-sm">{{ error }}</span>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div class="flex items-center space-x-2">
              <CheckCircleIcon class="h-5 w-5" />
              <span class="text-sm">{{ $t('users.user_updated_success') }}</span>
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
              class="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              <div class="flex items-center justify-center space-x-2">
                <ArrowPathIcon v-if="loading" class="animate-spin h-4 w-4" />
                <span>{{ loading ? $t('common.updating') : $t('common.update') }}</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { userService, type UpdateUserData, type User } from '@/services/users'
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
  updated: [user: User]
}>()

// Form state
const form = ref<UpdateUserData>({
  name: '',
  role: 'representative',
  status: 'active',
  phone: '',
  address: ''
})

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

// Computed
const isFormValid = computed(() => {
  return form.value.name?.trim() && form.value.role && form.value.status
})

// Methods
const handleSubmit = async () => {
  if (loading.value || !isFormValid.value) return

  error.value = null
  success.value = false
  loading.value = true

  try {
    const updateData: UpdateUserData = {
      name: form.value.name?.trim(),
      role: form.value.role,
      status: form.value.status,
      phone: form.value.phone?.trim() || undefined,
      address: form.value.address?.trim() || undefined
    }

    const { data, error: updateError } = await userService.updateUser(props.user.id, updateData)

    if (updateError) {
      error.value = updateError
    } else if (data) {
      success.value = true
      
      // Emit success after showing message
      setTimeout(() => {
        emit('updated', data)
      }, 1500)
    }
  } catch (err) {
    console.error('Error updating user:', err)
    error.value = t('users.update_error')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Initialize form with user data
  form.value = {
    name: props.user.name,
    role: props.user.role,
    status: props.user.status,
    phone: props.user.phone || '',
    address: props.user.address || ''
  }
})
</script>

