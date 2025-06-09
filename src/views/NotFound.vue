<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto h-24 w-24 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          {{ $t('errors.page_not_found') }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ $t('errors.page_not_found_description') }}
        </p>
      </div>
      
      <div class="mt-8 space-y-4">
        <button
          @click="goBack"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ $t('common.go_back') }}
        </button>
        
        <button
          @click="goHome"
          class="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ $t('common.go_home') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goBack = () => {
  router.back()
}

const goHome = () => {
  if (authStore.isAuthenticated) {
    const defaultRoute = authStore.getDefaultRoute()
    router.push(defaultRoute)
  } else {
    router.push('/login')
  }
}
</script>

