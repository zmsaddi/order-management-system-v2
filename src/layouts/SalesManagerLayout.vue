<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <img
                v-if="companyLogo"
                :src="companyLogo"
                :alt="companyName"
                class="h-8 w-auto"
              >
              <span v-else class="text-xl font-bold text-gray-900">
                {{ companyName }}
              </span>
            </div>

            <!-- Navigation Links -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/sales-manager/dashboard"
                class="nav-link"
                active-class="nav-link-active"
              >
                {{ $t('navigation.dashboard') }}
              </router-link>
              <router-link
                to="/sales-manager/team"
                class="nav-link"
                active-class="nav-link-active"
              >
                {{ $t('navigation.team_management') }}
              </router-link>
              <router-link
                to="/sales-manager/orders"
                class="nav-link"
                active-class="nav-link-active"
              >
                {{ $t('navigation.orders') }}
              </router-link>
              <router-link
                to="/sales-manager/products"
                class="nav-link"
                active-class="nav-link-active"
              >
                {{ $t('navigation.products') }}
              </router-link>
              <router-link
                to="/sales-manager/reports"
                class="nav-link"
                active-class="nav-link-active"
              >
                {{ $t('navigation.reports') }}
              </router-link>
            </div>
          </div>

          <!-- Right side -->
          <div class="flex items-center space-x-4">
            <!-- Language Selector -->
            <LanguageSelector />

            <!-- User Menu -->
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCompanyStore } from '@/stores/company'
// import LanguageSelector from '@/components/common/LanguageSelector.vue'
// import UserMenu from '@/components/common/UserMenu.vue'

const companyStore = useCompanyStore()

// Computed
const companyName = computed(() => companyStore.companyName)
const companyLogo = computed(() => companyStore.settings?.logo_url)
</script>

<style scoped>
.nav-link {
  @apply border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200;
}

.nav-link-active {
  @apply border-primary-500 text-gray-900;
}
</style>

