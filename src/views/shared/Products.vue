<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ $t('products.title') }}
            </h1>
            <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ filteredProducts.length }} {{ $t('products.products') }}
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="showCreateModal = true"
              class="btn btn-primary"
            >
              <PlusIcon class="h-5 w-5 mr-2" />
              {{ $t('products.new_product') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="form-label">{{ $t('common.search') }}</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                class="form-input pl-10"
                :placeholder="$t('products.search_products')"
              >
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <!-- Category Filter -->
          <div>
            <label class="form-label">{{ $t('products.category') }}</label>
            <select
              v-model="selectedCategory"
              class="form-select"
            >
              <option :value="null">{{ $t('common.all') }}</option>
              <option
                v-for="category in activeCategories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Stock Filter -->
          <div>
            <label class="form-label">{{ $t('products.stock') }}</label>
            <select
              v-model="stockFilter"
              class="form-select"
            >
              <option value="all">{{ $t('common.all') }}</option>
              <option value="in_stock">{{ $t('products.in_stock') }}</option>
              <option value="low_stock">{{ $t('products.low_stock') }}</option>
              <option value="out_of_stock">{{ $t('products.out_of_stock') }}</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="form-label">{{ $t('common.status') }}</label>
            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input
                  v-model="showInactive"
                  type="checkbox"
                  class="form-checkbox"
                >
                <span class="ml-2 text-sm text-gray-700">
                  {{ $t('products.show_inactive') }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-gray-600">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
        <CubeIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('products.no_products') }}</h3>
        <p class="mt-1 text-sm text-gray-500">{{ $t('products.no_products_description') }}</p>
        <div class="mt-6">
          <button
            @click="showCreateModal = true"
            class="btn btn-primary"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            {{ $t('products.create_product') }}
          </button>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
          <!-- Product Image -->
          <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="h-48 w-full object-cover object-center"
              @error="handleImageError"
            >
            <div
              v-else
              class="h-48 w-full flex items-center justify-center bg-gray-100"
            >
              <CubeIcon class="h-12 w-12 text-gray-400" />
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-medium text-gray-900 truncate">
                  {{ product.name }}
                </h3>
                <p v-if="product.sku" class="text-sm text-gray-500">
                  {{ $t('products.sku') }}: {{ product.sku }}
                </p>
                <p v-if="product.description" class="mt-1 text-sm text-gray-600 line-clamp-2">
                  {{ product.description }}
                </p>
              </div>
              <div class="ml-2 flex-shrink-0">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    product.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ product.is_active ? $t('common.active') : $t('common.inactive') }}
                </span>
              </div>
            </div>

            <!-- Price and Stock -->
            <div class="mt-4 flex items-center justify-between">
              <div>
                <p class="text-lg font-semibold text-gray-900">
                  {{ formatCurrency(product.unit_price) }}
                </p>
                <p v-if="product.cost_price" class="text-sm text-gray-500">
                  {{ $t('products.cost') }}: {{ formatCurrency(product.cost_price) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">
                  {{ $t('products.stock') }}: {{ product.stock_quantity }}
                </p>
                <p
                  :class="[
                    'text-xs',
                    getStockStatus(product) === 'out_of_stock' ? 'text-red-600' :
                    getStockStatus(product) === 'low_stock' ? 'text-yellow-600' :
                    'text-green-600'
                  ]"
                >
                  {{ getStockStatusText(product) }}
                </p>
              </div>
            </div>

            <!-- Category -->
            <div v-if="product.category" class="mt-2">
              <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {{ product.category.name }}
              </span>
            </div>

            <!-- Actions -->
            <div class="mt-4 flex items-center justify-between">
              <div class="flex space-x-2">
                <button
                  @click="viewProduct(product)"
                  class="btn btn-sm btn-secondary"
                >
                  <EyeIcon class="h-4 w-4 mr-1" />
                  {{ $t('common.view') }}
                </button>
                <button
                  @click="editProduct(product)"
                  class="btn btn-sm btn-primary"
                >
                  <PencilIcon class="h-4 w-4 mr-1" />
                  {{ $t('common.edit') }}
                </button>
              </div>
              <div class="relative">
                <button
                  @click="toggleProductMenu(product.id)"
                  class="btn btn-sm btn-ghost"
                >
                  <EllipsisVerticalIcon class="h-4 w-4" />
                </button>
                <div
                  v-if="activeProductMenu === product.id"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
                >
                  <div class="py-1">
                    <button
                      @click="duplicateProduct(product)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <DocumentDuplicateIcon class="h-4 w-4 mr-2 inline" />
                      {{ $t('common.duplicate') }}
                    </button>
                    <button
                      @click="toggleProductStatus(product)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span v-if="product.is_active">
                        <EyeSlashIcon class="h-4 w-4 mr-2 inline" />
                        {{ $t('products.deactivate') }}
                      </span>
                      <span v-else>
                        <EyeIcon class="h-4 w-4 mr-2 inline" />
                        {{ $t('products.activate') }}
                      </span>
                    </button>
                    <hr class="my-1">
                    <button
                      @click="confirmDeleteProduct(product)"
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
        </div>
      </div>
    </div>

    <!-- Create/Edit Product Modal -->
    <ProductModal
      v-if="showCreateModal || showEditModal"
      :product="selectedProduct"
      :categories="activeCategories"
      @close="closeModals"
      @save="handleProductSave"
    />

    <!-- Product Details Modal -->
    <ProductDetailsModal
      v-if="showDetailsModal"
      :product="selectedProduct"
      @close="closeModals"
      @edit="editProduct"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteModal"
      :title="$t('products.confirm_delete')"
      :message="$t('products.delete_warning')"
      @confirm="handleDeleteProduct"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProductsStore } from '@/stores/products'
import { formatCurrencyByLanguage } from '@/i18n'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon
} from '@heroicons/vue/24/outline'

// Components (would be imported)
// import ProductModal from '@/components/products/ProductModal.vue'
// import ProductDetailsModal from '@/components/products/ProductDetailsModal.vue'
// import ConfirmModal from '@/components/common/ConfirmModal.vue'

const { t, locale } = useI18n()
const productsStore = useProductsStore()

// State
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const showDeleteModal = ref(false)
const selectedProduct = ref(null)
const activeProductMenu = ref(null)
const stockFilter = ref('all')

// Computed
const {
  filteredProducts,
  activeCategories,
  loading,
  error,
  searchQuery,
  selectedCategory,
  showInactive
} = productsStore

const computedFilteredProducts = computed(() => {
  let products = filteredProducts.value

  // Apply stock filter
  if (stockFilter.value !== 'all') {
    products = products.filter(product => {
      const status = getStockStatus(product)
      return status === stockFilter.value
    })
  }

  return products
})

// Methods
const formatCurrency = (amount: number): string => {
  return formatCurrencyByLanguage(amount, 'EUR', locale.value)
}

const getStockStatus = (product: any): string => {
  if (product.stock_quantity === 0) return 'out_of_stock'
  if (product.stock_quantity <= product.min_stock_level) return 'low_stock'
  return 'in_stock'
}

const getStockStatusText = (product: any): string => {
  const status = getStockStatus(product)
  switch (status) {
    case 'out_of_stock': return t('products.out_of_stock')
    case 'low_stock': return t('products.low_stock')
    default: return t('products.in_stock')
  }
}

const viewProduct = (product: any): void => {
  selectedProduct.value = product
  showDetailsModal.value = true
  activeProductMenu.value = null
}

const editProduct = (product: any): void => {
  selectedProduct.value = product
  showEditModal.value = true
  activeProductMenu.value = null
}

const duplicateProduct = async (product: any): Promise<void> => {
  const duplicateData = {
    ...product,
    name: `${product.name} (Copy)`,
    sku: product.sku ? `${product.sku}-COPY` : undefined
  }
  delete duplicateData.id
  delete duplicateData.created_at
  delete duplicateData.updated_at

  await productsStore.createProduct(duplicateData)
  activeProductMenu.value = null
}

const toggleProductStatus = async (product: any): Promise<void> => {
  await productsStore.updateProduct({
    id: product.id,
    is_active: !product.is_active
  })
  activeProductMenu.value = null
}

const confirmDeleteProduct = (product: any): void => {
  selectedProduct.value = product
  showDeleteModal.value = true
  activeProductMenu.value = null
}

const handleDeleteProduct = async (): Promise<void> => {
  if (selectedProduct.value) {
    await productsStore.deleteProduct(selectedProduct.value.id)
    showDeleteModal.value = false
    selectedProduct.value = null
  }
}

const toggleProductMenu = (productId: number): void => {
  activeProductMenu.value = activeProductMenu.value === productId ? null : productId
}

const closeModals = (): void => {
  showCreateModal.value = false
  showEditModal.value = false
  showDetailsModal.value = false
  selectedProduct.value = null
}

const handleProductSave = async (productData: any): Promise<void> => {
  if (selectedProduct.value) {
    await productsStore.updateProduct({ id: selectedProduct.value.id, ...productData })
  } else {
    await productsStore.createProduct(productData)
  }
  closeModals()
}

const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const handleClickOutside = (event: Event): void => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    activeProductMenu.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await productsStore.initialize()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-w-1 {
  position: relative;
  width: 100%;
}

.aspect-h-1 {
  padding-bottom: 100%;
}

.aspect-w-1 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>

