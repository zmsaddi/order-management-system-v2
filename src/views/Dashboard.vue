<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading Screen -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-gray-600">{{ $t('common.loading') }}</p>
      </div>
    </div>

    <!-- Role-based Dashboard -->
    <div v-else>
      <!-- Admin Dashboard -->
      <AdminDashboard v-if="isAdmin" />
      
      <!-- Sales Manager Dashboard -->
      <SalesManagerDashboard v-else-if="isSalesManager" />
      
      <!-- Representative Dashboard -->
      <RepresentativeDashboard v-else-if="isRepresentative" />
      
      <!-- Unauthorized -->
      <div v-else class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('errors.unauthorized') }}</h1>
          <p class="mt-2 text-gray-600">{{ $t('errors.contact_admin') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import AdminDashboard from '@/views/admin/Dashboard.vue'
import SalesManagerDashboard from '@/views/sales-manager/Dashboard.vue'
import RepresentativeDashboard from '@/views/representative/Dashboard.vue'

const { t } = useI18n()
const authStore = useAuthStore()

// State
const loading = ref(true)

// Computed
const isAdmin = computed(() => authStore.isAdmin)
const isSalesManager = computed(() => authStore.isSalesManager)
const isRepresentative = computed(() => authStore.isRepresentative)

// Lifecycle
onMounted(async () => {
  try {
    await authStore.initialize()
  } catch (error) {
    console.error('Error initializing dashboard:', error)
  } finally {
    loading.value = false
  }
})
</script>

