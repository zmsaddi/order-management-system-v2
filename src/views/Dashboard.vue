<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <!-- Modern Navigation -->
    <nav class="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {{ $t('navigation.dashboard') }}
            </h1>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- Language Selector -->
            <div class="relative">
              <select 
                v-model="currentLanguage" 
                @change="changeLanguage"
                class="appearance-none bg-white/50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="nl">Nederlands</option>
              </select>
            </div>

            <!-- User Profile -->
            <div class="flex items-center space-x-3 bg-white/50 rounded-xl px-4 py-2 border border-gray-200/50">
              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span class="text-white text-sm font-semibold">{{ userInitials }}</span>
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-medium text-gray-900">{{ currentUser?.name }}</p>
                <p class="text-xs text-gray-500">{{ $t(`users.role_${currentUser?.role}`) }}</p>
              </div>
            </div>

            <!-- Logout Button -->
            <button
              @click="handleLogout"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-all duration-200"
              :title="$t('common.logout')"
            >
              <ArrowRightOnRectangleIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-10">
            <svg class="w-full h-full" viewBox="0 0 100 100" fill="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          
          <div class="relative">
            <h1 class="text-3xl font-bold mb-2">{{ $t('dashboard.welcome') }}, {{ currentUser?.name }}!</h1>
            <p class="text-blue-100 text-lg">{{ getWelcomeMessage() }}</p>
          </div>
          
          <!-- Floating Elements -->
          <div class="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div class="absolute bottom-4 right-8 w-12 h-12 bg-white/5 rounded-full animate-bounce"></div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          v-for="(stat, index) in quickStats" 
          :key="index"
          class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ stat.change }}</p>
            </div>
            <div :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center',
              stat.bgColor
            ]">
              <component :is="stat.icon" class="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Quick Actions Card -->
        <div class="lg:col-span-1">
          <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('dashboard.quick_actions') }}</h3>
            <div class="space-y-3">
              <button
                v-for="action in quickActions"
                :key="action.key"
                @click="action.handler"
                class="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
              >
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200',
                  action.bgColor
                ]">
                  <component :is="action.icon" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ action.title }}</p>
                  <p class="text-sm text-gray-500">{{ action.description }}</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="lg:col-span-2">
          <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ $t('dashboard.recent_orders') }}</h3>
              <button class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                {{ $t('common.view_all') }}
              </button>
            </div>
            
            <div class="space-y-3">
              <div 
                v-for="order in recentOrders" 
                :key="order.id"
                class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <span class="text-white text-sm font-semibold">#{{ order.number.slice(-3) }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ order.customer }}</p>
                    <p class="text-sm text-gray-500">{{ formatDate(order.date) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900">€{{ order.amount }}</p>
                  <span :class="[
                    'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                    getStatusColor(order.status)
                  ]">
                    {{ $t(`orders.status_${order.status}`) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Sales Chart -->
        <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('reports.monthly_trend') }}</h3>
          <div class="h-64 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <ChartBarIcon class="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>{{ $t('reports.no_data') }}</p>
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('reports.top_products') }}</h3>
          <div class="space-y-3">
            <div 
              v-for="(product, index) in topProducts" 
              :key="index"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <span class="text-white text-sm font-semibold">{{ index + 1 }}</span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ product.name }}</p>
                  <p class="text-sm text-gray-500">{{ product.sales }} {{ $t('common.sales') }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">€{{ product.revenue }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import {
  ArrowRightOnRectangleIcon,
  PlusIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  CurrencyEuroIcon
} from '@heroicons/vue/24/outline'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const currentLanguage = ref(locale.value)
const currentUser = computed(() => authStore.user)

// User initials
const userInitials = computed(() => {
  if (!currentUser.value?.name) return 'U'
  return currentUser.value.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Quick stats data
const quickStats = ref([
  {
    label: t('dashboard.total_orders'),
    value: '156',
    change: '+12% من الشهر الماضي',
    icon: ShoppingCartIcon,
    bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600'
  },
  {
    label: t('dashboard.total_revenue'),
    value: '€24,580',
    change: '+8% من الشهر الماضي',
    icon: CurrencyEuroIcon,
    bgColor: 'bg-gradient-to-r from-green-500 to-green-600'
  },
  {
    label: t('products.title'),
    value: '89',
    change: '+3 منتجات جديدة',
    icon: CubeIcon,
    bgColor: 'bg-gradient-to-r from-purple-500 to-purple-600'
  },
  {
    label: t('users.title'),
    value: '12',
    change: '+2 مستخدمين جدد',
    icon: UsersIcon,
    bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600'
  }
])

// Quick actions
const quickActions = ref([
  {
    key: 'new_order',
    title: t('orders.create_order'),
    description: 'إنشاء طلب جديد للعميل',
    icon: PlusIcon,
    bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
    handler: () => router.push('/orders/new')
  },
  {
    key: 'view_reports',
    title: t('dashboard.view_reports'),
    description: 'عرض التقارير والإحصائيات',
    icon: ChartBarIcon,
    bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
    handler: () => router.push('/reports')
  },
  {
    key: 'manage_products',
    title: t('dashboard.manage_products'),
    description: 'إدارة المنتجات والمخزون',
    icon: CubeIcon,
    bgColor: 'bg-gradient-to-r from-purple-500 to-purple-600',
    handler: () => router.push('/products')
  }
])

// Recent orders data
const recentOrders = ref([
  {
    id: '1',
    number: 'ORD-2025-001',
    customer: 'أحمد محمد',
    date: new Date(),
    amount: '1,250',
    status: 'pending'
  },
  {
    id: '2',
    number: 'ORD-2025-002',
    customer: 'فاطمة علي',
    date: new Date(Date.now() - 86400000),
    amount: '890',
    status: 'completed'
  },
  {
    id: '3',
    number: 'ORD-2025-003',
    customer: 'محمد حسن',
    date: new Date(Date.now() - 172800000),
    amount: '2,100',
    status: 'processing'
  }
])

// Top products data
const topProducts = ref([
  { name: 'لابتوب Dell XPS', sales: 45, revenue: '22,500' },
  { name: 'ماوس لاسلكي', sales: 89, revenue: '1,780' },
  { name: 'كيبورد ميكانيكي', sales: 67, revenue: '6,700' },
  { name: 'شاشة 24 بوصة', sales: 34, revenue: '10,200' }
])

// Methods
const changeLanguage = () => {
  locale.value = currentLanguage.value
  document.documentElement.lang = currentLanguage.value
  document.documentElement.dir = currentLanguage.value === 'ar' ? 'rtl' : 'ltr'
}

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}

const getWelcomeMessage = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'صباح الخير! نتمنى لك يوماً مثمراً'
  if (hour < 17) return 'مساء الخير! كيف يسير عملك اليوم؟'
  return 'مساء الخير! نتمنى أن تكون قد أنجزت الكثير اليوم'
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const getStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

// Lifecycle
onMounted(() => {
  // Set initial language direction
  document.documentElement.dir = currentLanguage.value === 'ar' ? 'rtl' : 'ltr'
})
</script>

<style scoped>
/* Custom animations and effects */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out;
}

/* Glass effect enhancements */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

.backdrop-blur-xl {
  backdrop-filter: blur(20px);
}

/* Hover effects */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

.hover\:scale-110:hover {
  transform: scale(1.1);
}

/* RTL Support */
[dir="rtl"] .space-x-3 > * + * {
  margin-left: 0;
  margin-right: 0.75rem;
}

[dir="rtl"] .space-x-4 > * + * {
  margin-left: 0;
  margin-right: 1rem;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>

