<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ $t('orders.title') }}
            </h1>
            <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ filteredOrders.length }} {{ $t('orders.orders') }}
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="showCreateModal = true"
              class="btn btn-primary"
            >
              <PlusIcon class="h-5 w-5 mr-2" />
              {{ $t('orders.new_order') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ShoppingCartIcon class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('dashboard.total_orders') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ orderStats.total }}
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
                <CurrencyEuroIcon class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('dashboard.total_revenue') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ formatCurrency(orderStats.totalRevenue) }}
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
                <ClockIcon class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('dashboard.pending_orders') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ orderStats.pending }}
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
                <CheckCircleIcon class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ $t('dashboard.completed_orders') }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ orderStats.completed }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Search -->
          <div>
            <label class="form-label">{{ $t('common.search') }}</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                class="form-input pl-10"
                :placeholder="$t('orders.search_orders')"
              >
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="form-label">{{ $t('orders.order_status') }}</label>
            <select
              v-model="selectedStatus"
              class="form-select"
            >
              <option :value="null">{{ $t('common.all') }}</option>
              <option value="new">{{ $t('orders.status_new') }}</option>
              <option value="processing">{{ $t('orders.status_processing') }}</option>
              <option value="completed">{{ $t('orders.status_completed') }}</option>
              <option value="delivered">{{ $t('orders.status_delivered') }}</option>
              <option value="cancelled">{{ $t('orders.status_cancelled') }}</option>
            </select>
          </div>

          <!-- Representative Filter -->
          <div v-if="canViewAllOrders">
            <label class="form-label">{{ $t('orders.sales_representative') }}</label>
            <select
              v-model="selectedRep"
              class="form-select"
            >
              <option :value="null">{{ $t('common.all') }}</option>
              <option
                v-for="rep in salesReps"
                :key="rep.id"
                :value="rep.id"
              >
                {{ rep.name }}
              </option>
            </select>
          </div>

          <!-- Date Range -->
          <div>
            <label class="form-label">{{ $t('reports.from_date') }}</label>
            <input
              v-model="dateRange.start"
              type="date"
              class="form-input"
            >
          </div>

          <div>
            <label class="form-label">{{ $t('reports.to_date') }}</label>
            <input
              v-model="dateRange.end"
              type="date"
              class="form-input"
            >
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            @click="clearFilters"
            class="btn btn-secondary mr-3"
          >
            {{ $t('common.clear') }}
          </button>
          <button
            @click="exportOrders"
            class="btn btn-outline"
          >
            <DocumentArrowDownIcon class="h-5 w-5 mr-2" />
            {{ $t('common.export') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-600">{{ $t('common.loading') }}</p>
        </div>

        <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
          <ShoppingCartIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('orders.no_orders') }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ $t('orders.no_orders_description') }}</p>
          <div class="mt-6">
            <button
              @click="showCreateModal = true"
              class="btn btn-primary"
            >
              <PlusIcon class="h-5 w-5 mr-2" />
              {{ $t('orders.create_order') }}
            </button>
          </div>
        </div>

        <ul v-else class="divide-y divide-gray-200">
          <li
            v-for="order in filteredOrders"
            :key="order.id"
            class="hover:bg-gray-50"
          >
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">
                        #{{ order.id }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="flex items-center">
                      <p class="text-sm font-medium text-gray-900">
                        {{ order.customer_name }}
                      </p>
                      <span
                        :class="[
                          'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(order.status)
                        ]"
                      >
                        {{ getStatusText(order.status) }}
                      </span>
                    </div>
                    <div class="mt-1 flex items-center text-sm text-gray-500">
                      <p>{{ formatDate(order.created_at) }}</p>
                      <span class="mx-2">•</span>
                      <p>{{ formatCurrency(order.total) }}</p>
                      <span v-if="order.sales_rep" class="mx-2">•</span>
                      <p v-if="order.sales_rep">{{ order.sales_rep.name }}</p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="viewOrder(order)"
                    class="btn btn-sm btn-secondary"
                  >
                    <EyeIcon class="h-4 w-4 mr-1" />
                    {{ $t('common.view') }}
                  </button>
                  <button
                    @click="editOrder(order)"
                    class="btn btn-sm btn-primary"
                  >
                    <PencilIcon class="h-4 w-4 mr-1" />
                    {{ $t('common.edit') }}
                  </button>
                  <div class="relative">
                    <button
                      @click="toggleOrderMenu(order.id)"
                      class="btn btn-sm btn-ghost"
                    >
                      <EllipsisVerticalIcon class="h-4 w-4" />
                    </button>
                    <div
                      v-if="activeOrderMenu === order.id"
                      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
                    >
                      <div class="py-1">
                        <button
                          @click="printInvoice(order)"
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <PrinterIcon class="h-4 w-4 mr-2 inline" />
                          {{ $t('orders.print_invoice') }}
                        </button>
                        <button
                          @click="duplicateOrder(order)"
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <DocumentDuplicateIcon class="h-4 w-4 mr-2 inline" />
                          {{ $t('orders.duplicate_order') }}
                        </button>
                        <hr class="my-1">
                        <button
                          @click="confirmDeleteOrder(order)"
                          class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          <TrashIcon class="h-4 w-4 mr-2 inline" />
                          {{ $t('common.delete') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Order Items Preview -->
              <div v-if="order.order_products && order.order_products.length > 0" class="mt-3">
                <div class="flex items-center text-xs text-gray-500">
                  <span>{{ order.order_products.length }} {{ $t('orders.items') }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ order.order_products.slice(0, 3).map(item => item.name).join(', ') }}</span>
                  <span v-if="order.order_products.length > 3">...</span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Create/Edit Order Modal -->
    <OrderModal
      v-if="showCreateModal || showEditModal"
      :order="selectedOrder"
      @close="closeModals"
      @save="handleOrderSave"
    />

    <!-- Order Details Modal -->
    <OrderDetailsModal
      v-if="showDetailsModal"
      :order="selectedOrder"
      @close="closeModals"
      @edit="editOrder"
      @print="printInvoice"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteModal"
      :title="$t('orders.confirm_delete')"
      :message="$t('orders.delete_warning')"
      @confirm="handleDeleteOrder"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { formatCurrencyByLanguage, formatDateByLanguage } from '@/i18n'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  CurrencyEuroIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  EllipsisVerticalIcon
} from '@heroicons/vue/24/outline'

// Components (would be imported)
// import OrderModal from '@/components/orders/OrderModal.vue'
// import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue'
// import ConfirmModal from '@/components/common/ConfirmModal.vue'

const { t, locale } = useI18n()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()

// State
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const showDeleteModal = ref(false)
const selectedOrder = ref(null)
const activeOrderMenu = ref(null)
const salesReps = ref([]) // Would be fetched from users store

// Computed
const {
  filteredOrders,
  orderStats,
  loading,
  error,
  searchQuery,
  selectedStatus,
  selectedRep,
  dateRange
} = ordersStore

const canViewAllOrders = computed(() => {
  return authStore.isAdmin || authStore.isSalesManager
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

const viewOrder = (order: any): void => {
  selectedOrder.value = order
  showDetailsModal.value = true
  activeOrderMenu.value = null
}

const editOrder = (order: any): void => {
  selectedOrder.value = order
  showEditModal.value = true
  activeOrderMenu.value = null
}

const duplicateOrder = async (order: any): Promise<void> => {
  await ordersStore.duplicateOrder(order.id)
  activeOrderMenu.value = null
}

const confirmDeleteOrder = (order: any): void => {
  selectedOrder.value = order
  showDeleteModal.value = true
  activeOrderMenu.value = null
}

const handleDeleteOrder = async (): Promise<void> => {
  if (selectedOrder.value) {
    await ordersStore.deleteOrder(selectedOrder.value.id)
    showDeleteModal.value = false
    selectedOrder.value = null
  }
}

const printInvoice = (order: any): void => {
  // Would implement invoice printing
  console.log('Print invoice for order:', order.id)
  activeOrderMenu.value = null
}

const exportOrders = (): void => {
  // Would implement orders export
  console.log('Export orders')
}

const toggleOrderMenu = (orderId: number): void => {
  activeOrderMenu.value = activeOrderMenu.value === orderId ? null : orderId
}

const closeModals = (): void => {
  showCreateModal.value = false
  showEditModal.value = false
  showDetailsModal.value = false
  selectedOrder.value = null
}

const handleOrderSave = async (orderData: any): Promise<void> => {
  if (selectedOrder.value) {
    await ordersStore.updateOrder({ id: selectedOrder.value.id, ...orderData })
  } else {
    await ordersStore.createOrder(orderData)
  }
  closeModals()
}

const clearFilters = (): void => {
  ordersStore.clearFilters()
}

const handleClickOutside = (event: Event): void => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    activeOrderMenu.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await ordersStore.initialize()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

