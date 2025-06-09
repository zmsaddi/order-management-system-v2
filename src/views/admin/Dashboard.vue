<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ $t('navigation.admin_panel') }}
            </h1>
            <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {{ $t('users.role_admin') }}
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

    <!-- Quick Stats -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <UsersIcon class="h-6 w-6 text-blue-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('dashboard.total_users') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ totalUsers }}
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
                <ShoppingCartIcon class="h-6 w-6 text-green-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('dashboard.total_orders') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ totalOrders }}
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
                <CubeIcon class="h-6 w-6 text-purple-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('dashboard.total_products') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ totalProducts }}
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
                <CurrencyEuroIcon class="h-6 w-6 text-yellow-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('dashboard.monthly_revenue') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ formatCurrency(monthlyRevenue) }}
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
                  to="/admin/users"
                  class="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center">
                    <UsersIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <span class="text-sm font-medium text-gray-900">
                      {{ $t('navigation.users') }}
                    </span>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </router-link>

                <router-link
                  to="/admin/company"
                  class="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center">
                    <BuildingOfficeIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <span class="text-sm font-medium text-gray-900">
                      {{ $t('navigation.company') }}
                    </span>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </router-link>

                <router-link
                  to="/admin/reports"
                  class="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center">
                    <DocumentChartBarIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <span class="text-sm font-medium text-gray-900">
                      {{ $t('navigation.reports') }}
                    </span>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </router-link>

                <router-link
                  to="/admin/settings"
                  class="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center">
                    <CogIcon class="h-5 w-5 text-gray-400 mr-3" />
                    <span class="text-sm font-medium text-gray-900">
                      {{ $t('navigation.settings') }}
                    </span>
                  </div>
                  <ChevronRightIcon class="h-5 w-5 text-gray-400" />
                </router-link>
              </div>
            </div>
          </div>

          <!-- System Status -->
          <div class="mt-8 bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ $t('dashboard.system_status') }}
              </h3>
              <div class="mt-5 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">{{ $t('dashboard.database') }}</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ $t('dashboard.online') }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">{{ $t('dashboard.storage') }}</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ $t('dashboard.online') }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">{{ $t('dashboard.backup') }}</span>
                  <span class="text-sm text-gray-500">{{ lastBackupDate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ $t('dashboard.recent_activity') }}
                </h3>
                <router-link
                  to="/admin/activity"
                  class="text-sm text-primary-600 hover:text-primary-500"
                >
                  {{ $t('common.view_all') }}
                </router-link>
              </div>
              
              <div class="mt-6 flow-root">
                <ul class="-mb-8">
                  <li v-for="(activity, index) in recentActivities" :key="activity.id">
                    <div class="relative pb-8">
                      <span
                        v-if="index !== recentActivities.length - 1"
                        class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                      <div class="relative flex space-x-3">
                        <div>
                          <span
                            :class="[
                              'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                              getActivityColor(activity.type)
                            ]"
                          >
                            <component
                              :is="getActivityIcon(activity.type)"
                              class="h-4 w-4 text-white"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                        <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p class="text-sm text-gray-500">
                              {{ activity.description }}
                              <span class="font-medium text-gray-900">{{ activity.user_name }}</span>
                            </p>
                          </div>
                          <div class="text-right text-sm whitespace-nowrap text-gray-500">
                            {{ formatRelativeTime(activity.created_at) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <div v-if="recentActivities.length === 0" class="text-center py-6">
                <ClockIcon class="mx-auto h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('dashboard.no_activity') }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ $t('dashboard.no_activity_description') }}</p>
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
import { useProductsStore } from '@/stores/products'
import { formatCurrencyByLanguage } from '@/i18n'
import {
  UsersIcon,
  ShoppingCartIcon,
  CubeIcon,
  CurrencyEuroIcon,
  BuildingOfficeIcon,
  DocumentChartBarIcon,
  CogIcon,
  ChevronRightIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const productsStore = useProductsStore()

// State
const recentActivities = ref([])
const totalUsers = ref(0)
const lastBackupDate = ref('2 days ago')

// Computed
const user = computed(() => authStore.user)

const totalOrders = computed(() => ordersStore.orders.length)
const totalProducts = computed(() => productsStore.products.length)

const monthlyRevenue = computed(() => {
  const now = new Date()
  const thisMonth = ordersStore.orders.filter(order => {
    const orderDate = new Date(order.created_at)
    return orderDate.getMonth() === now.getMonth() && 
           orderDate.getFullYear() === now.getFullYear() &&
           order.status !== 'cancelled'
  })
  
  return thisMonth.reduce((sum, order) => sum + order.total, 0)
})

// Methods
const formatCurrency = (amount: number): string => {
  return formatCurrencyByLanguage(amount, 'EUR', locale.value)
}

const formatRelativeTime = (date: string): string => {
  const now = new Date()
  const activityDate = new Date(date)
  const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return t('dashboard.just_now')
  if (diffInMinutes < 60) return t('dashboard.minutes_ago', { count: diffInMinutes })
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return t('dashboard.hours_ago', { count: diffInHours })
  
  const diffInDays = Math.floor(diffInHours / 24)
  return t('dashboard.days_ago', { count: diffInDays })
}

const getActivityColor = (type: string): string => {
  const colors = {
    user_created: 'bg-green-500',
    user_updated: 'bg-blue-500',
    user_deleted: 'bg-red-500',
    order_created: 'bg-purple-500',
    order_updated: 'bg-yellow-500',
    product_created: 'bg-indigo-500',
    product_updated: 'bg-pink-500',
    login: 'bg-gray-500'
  }
  return colors[type] || 'bg-gray-500'
}

const getActivityIcon = (type: string) => {
  const icons = {
    user_created: PlusIcon,
    user_updated: PencilIcon,
    user_deleted: TrashIcon,
    order_created: PlusIcon,
    order_updated: PencilIcon,
    product_created: PlusIcon,
    product_updated: PencilIcon,
    login: UsersIcon
  }
  return icons[type] || ClockIcon
}

const fetchRecentActivities = async (): Promise<void> => {
  try {
    // This would fetch from activity_logs table
    recentActivities.value = [
      {
        id: 1,
        type: 'order_created',
        description: 'Created new order #1234 for',
        user_name: 'John Doe',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        type: 'user_created',
        description: 'Created new user account for',
        user_name: 'Jane Smith',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'product_updated',
        description: 'Updated product information by',
        user_name: 'Admin User',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ]
  } catch (error) {
    console.error('Error fetching recent activities:', error)
  }
}

const fetchUserCount = async (): Promise<void> => {
  try {
    // This would fetch from users table
    totalUsers.value = 15
  } catch (error) {
    console.error('Error fetching user count:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    ordersStore.initialize(),
    productsStore.initialize(),
    fetchRecentActivities(),
    fetchUserCount()
  ])
})
</script>

