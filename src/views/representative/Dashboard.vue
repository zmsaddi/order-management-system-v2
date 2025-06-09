<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Representative Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ $t('dashboard.my_dashboard') }}
            </h1>
            <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {{ $t('users.role_representative') }}
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">
              {{ $t('common.welcome') }}, {{ user?.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Personal Stats -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ShoppingCartIcon class="h-6 w-6 text-blue-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('dashboard.my_orders') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ personalStats.totalOrders }}
                  </dd>
                  <dd class="text-sm text-green-600">
                    +{{ personalStats.ordersThisMonth }} {{ $t('dashboard.this_month') }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CurrencyEuroIcon class="h-6 w-6 text-green-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('dashboard.my_sales') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ formatCurrency(personalStats.totalSales) }}
                  </dd>
                  <dd class="text-sm text-green-600">
                    {{ formatCurrency(personalStats.salesThisMonth) }} {{ $t('dashboard.this_month') }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <UsersIcon class="h-6 w-6 text-purple-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('dashboard.my_customers') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ personalStats.totalCustomers }}
                  </dd>
                  <dd class="text-sm text-blue-600">
                    +{{ personalStats.newCustomers }} {{ $t('dashboard.new_this_month') }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ChartBarIcon class="h-6 w-6 text-yellow-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('dashboard.target_progress') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ personalStats.targetProgress }}%
                  </dd>
                  <dd class="text-sm text-gray-500">
                    {{ formatCurrency(personalStats.monthlyTarget) }} {{ $t('dashboard.target') }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Quick Actions -->
        <div class="lg:col-span-1">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ $t('dashboard.quick_actions') }}
              </h3>
              <div class="mt-5 space-y-3">
                <router-link
                  to="/representative/orders/new"
                  class="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon class="h-5 w-5 mr-2" />
                  {{ $t('orders.new_order') }}
                </router-link>

                <router-link
                  to="/representative/orders"
                  class="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center">
                    <ShoppingCartIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <span class="text-sm font-medium text-gray-900">
                      {{ $t('navigation.my_orders') }}
                    </span>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </router-link>

                <router-link
                  to="/representative/customers"
                  class="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center">
                    <UsersIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <span class="text-sm font-medium text-gray-900">
                      {{ $t('navigation.my_customers') }}
                    </span>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </router-link>

                <router-link
                  to="/representative/products"
                  class="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center">
                    <CubeIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <span class="text-sm font-medium text-gray-900">
                      {{ $t('navigation.products') }}
                    </span>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </router-link>
              </div>
            </div>
          </div>

          <!-- Target Progress -->
          <div class="mt-8 bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ $t('dashboard.monthly_target') }}
              </h3>
              <div class="mt-5">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">{{ $t('dashboard.progress') }}</span>
                  <span class="font-medium text-gray-900">
                    {{ personalStats.targetProgress }}%
                  </span>
                </div>
                <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${Math.min(personalStats.targetProgress, 100)}%` }"
                  ></div>
                </div>
                <div class="mt-3 flex items-center justify-between text-sm">
                  <span class="text-gray-500">
                    {{ formatCurrency(personalStats.salesThisMonth) }} / {{ formatCurrency(personalStats.monthlyTarget) }}
                  </span>
                  <span
                    :class="[
                      'font-medium',
                      personalStats.targetProgress >= 100 ? 'text-green-600' : 
                      personalStats.targetProgress >= 75 ? 'text-yellow-600' : 'text-red-600'
                    ]"
                  >
                    {{ formatCurrency(personalStats.monthlyTarget - personalStats.salesThisMonth) }} {{ $t('dashboard.remaining') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders and Performance -->
        <div class="lg:col-span-2">
          <!-- Recent Orders -->
          <div class="bg-white shadow rounded-lg mb-8">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ $t('dashboard.recent_orders') }}
                </h3>
                <router-link
                  to="/representative/orders"
                  class="text-sm text-primary-600 hover:text-primary-500"
                >
                  {{ $t('common.view_all') }}
                </router-link>
              </div>
              
              <div class="mt-6">
                <div class="flow-root">
                  <ul class="-my-5 divide-y divide-gray-200">
                    <li
                      v-for="order in myRecentOrders"
                      :key="order.id"
                      class="py-4"
                    >
                      <div class="flex items-center space-x-4">
                        <div class="flex-shrink-0">
                          <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span class="text-xs font-medium text-gray-700">
                              #{{ order.id }}
                            </span>
                          </div>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900 truncate">
                            {{ order.customer_name }}
                          </p>
                          <p class="text-sm text-gray-500">
                            {{ formatDate(order.created_at) }}
                          </p>
                        </div>
                        <div class="flex items-center space-x-2">
                          <span
                            :class="[
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              getStatusColor(order.status)
                            ]"
                          >
                            {{ getStatusText(order.status) }}
                          </span>
                          <span class="text-sm font-medium text-gray-900">
                            {{ formatCurrency(order.total) }}
                          </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div v-if="myRecentOrders.length === 0" class="text-center py-6">
                  <ShoppingCartIcon class="mx-auto h-12 w-12 text-gray-400" />
                  <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('dashboard.no_orders') }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ $t('dashboard.create_first_order') }}</p>
                  <div class="mt-6">
                    <router-link
                      to="/representative/orders/new"
                      class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <PlusIcon class="h-4 w-4 mr-2" />
                      {{ $t('orders.create_order') }}
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Chart -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ $t('dashboard.my_performance') }}
              </h3>
              <div class="mt-6 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <!-- Chart would go here -->
                <div class="text-center">
                  <ChartBarIcon class="mx-auto h-12 w-12 text-gray-400" />
                  <p class="mt-2 text-sm text-gray-500">{{ $t('dashboard.chart_placeholder') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import { formatCurrencyByLanguage, formatDateByLanguage } from '@/i18n'
import {
  ShoppingCartIcon,
  CurrencyEuroIcon,
  UsersIcon,
  ChartBarIcon,
  CubeIcon,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()

// State
const personalStats = ref({
  totalOrders: 28,
  ordersThisMonth: 8,
  totalSales: 75000,
  salesThisMonth: 18500,
  totalCustomers: 15,
  newCustomers: 3,
  targetProgress: 62,
  monthlyTarget: 30000
})

// Computed
const user = computed(() => authStore.user)

const myRecentOrders = computed(() => {
  // Filter orders for current user only
  return ordersStore.orders
    .filter(order => order.sales_rep_id === user.value?.id)
    .slice(0, 5)
})

// Methods
const formatCurrency = (amount: number): string => {
  return formatCurrencyByLanguage(amount, 'EUR', locale.value)
}

const formatDate = (date: string): string => {
  return formatDateByLanguage(new Date(date), locale.value)
}

const getStatusColor = (status: string): string => {
  const colors = {
    new: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    delivered: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string): string => {
  return t(`orders.status_${status}`)
}

// Lifecycle
onMounted(async () => {
  await ordersStore.initialize()
})
</script>

