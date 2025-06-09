<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">{{ $t('users.user_details') }}</h2>
          <button
            @click="$emit('close')"
            class="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
        <!-- User Profile -->
        <div class="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
          <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span class="text-white text-lg font-bold">
              {{ getUserInitials(user.name) }}
            </span>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-900">{{ user.name }}</h3>
            <p class="text-gray-600">{{ user.email }}</p>
            <div class="flex items-center space-x-4 mt-2">
              <span :class="[
                'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                getRoleColor(user.role)
              ]">
                {{ $t(`users.role_${user.role}`) }}
              </span>
              <span :class="[
                'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                getStatusColor(user.status)
              ]">
                {{ $t(`common.${user.status}`) }}
              </span>
            </div>
          </div>
        </div>

        <!-- User Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Basic Info -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900">{{ $t('users.basic_info') }}</h4>
            
            <div>
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.email') }}</label>
              <p class="text-gray-900">{{ user.email }}</p>
            </div>

            <div v-if="user.phone">
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.phone') }}</label>
              <p class="text-gray-900">{{ user.phone }}</p>
            </div>

            <div v-if="user.address">
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.address') }}</label>
              <p class="text-gray-900">{{ user.address }}</p>
            </div>
          </div>

          <!-- Account Info -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900">{{ $t('users.account_info') }}</h4>
            
            <div>
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.role') }}</label>
              <p class="text-gray-900">{{ $t(`users.role_${user.role}`) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.status') }}</label>
              <p class="text-gray-900">{{ $t(`common.${user.status}`) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.last_login') }}</label>
              <p class="text-gray-900">
                {{ user.last_login ? formatDate(user.last_login) : $t('users.never_logged_in') }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.member_since') }}</label>
              <p class="text-gray-900">{{ formatDate(user.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Security Info -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('users.security_info') }}</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.failed_attempts') }}</label>
              <p class="text-gray-900">{{ user.failed_login_attempts }}</p>
            </div>

            <div v-if="user.locked_until">
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.locked_until') }}</label>
              <p class="text-red-600">{{ formatDate(user.locked_until) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.last_updated') }}</label>
              <p class="text-gray-900">{{ formatDate(user.updated_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Detailed Auth Info (if available) -->
        <div v-if="detailedInfo" class="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('users.auth_details') }}</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.email_confirmed') }}</label>
              <p :class="detailedInfo.auth_confirmed ? 'text-green-600' : 'text-red-600'">
                {{ detailedInfo.auth_confirmed ? $t('common.yes') : $t('common.no') }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.account_banned') }}</label>
              <p :class="detailedInfo.auth_banned ? 'text-red-600' : 'text-green-600'">
                {{ detailedInfo.auth_banned ? $t('common.yes') : $t('common.no') }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-500">{{ $t('users.account_deleted') }}</label>
              <p :class="detailedInfo.auth_deleted ? 'text-red-600' : 'text-green-600'">
                {{ detailedInfo.auth_deleted ? $t('common.yes') : $t('common.no') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-4">
          <ArrowPathIcon class="w-6 h-6 animate-spin mx-auto text-blue-600" />
          <p class="text-sm text-gray-500 mt-2">{{ $t('common.loading') }}</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end">
          <button
            @click="$emit('close')"
            class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { userService, type User } from '@/services/users'
import {
  XMarkIcon,
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
}>()

// State
const loading = ref(false)
const detailedInfo = ref<any>(null)

// Methods
const loadDetailedInfo = async () => {
  loading.value = true
  try {
    const { data, error } = await userService.getUserDetailedInfo(props.user.email)
    if (!error && data) {
      detailedInfo.value = data
    }
  } catch (err) {
    console.error('Error loading detailed info:', err)
  } finally {
    loading.value = false
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

const getRoleColor = (role: string): string => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    sales_manager: 'bg-green-100 text-green-800',
    representative: 'bg-blue-100 text-blue-800'
  }
  return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getStatusColor = (status: string): string => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

// Lifecycle
onMounted(() => {
  loadDetailedInfo()
})
</script>

