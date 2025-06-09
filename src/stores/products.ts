import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useI18n } from 'vue-i18n'

export interface Product {
  id: number
  name: string
  description?: string
  sku?: string
  category_id?: number
  unit_price: number
  cost_price?: number
  stock_quantity: number
  min_stock_level: number
  unit_of_measure: string
  is_active: boolean
  image_url?: string
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
  category?: ProductCategory
}

export interface ProductCategory {
  id: number
  name: string
  description?: string
  parent_id?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateProductData {
  name: string
  description?: string
  sku?: string
  category_id?: number
  unit_price: number
  cost_price?: number
  stock_quantity: number
  min_stock_level: number
  unit_of_measure: string
  is_active: boolean
  image_url?: string
  notes?: string
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: number
}

export const useProductsStore = defineStore('products', () => {
  const { t } = useI18n()
  
  // State
  const products = ref<Product[]>([])
  const categories = ref<ProductCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCategory = ref<number | null>(null)
  const showInactive = ref(false)

  // Getters
  const filteredProducts = computed(() => {
    let filtered = products.value

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (selectedCategory.value) {
      filtered = filtered.filter(product => product.category_id === selectedCategory.value)
    }

    // Filter by active status
    if (!showInactive.value) {
      filtered = filtered.filter(product => product.is_active)
    }

    return filtered
  })

  const activeProducts = computed(() => 
    products.value.filter(product => product.is_active)
  )

  const lowStockProducts = computed(() =>
    products.value.filter(product => 
      product.is_active && product.stock_quantity <= product.min_stock_level
    )
  )

  const outOfStockProducts = computed(() =>
    products.value.filter(product => 
      product.is_active && product.stock_quantity === 0
    )
  )

  const activeCategories = computed(() =>
    categories.value.filter(category => category.is_active)
  )

  // Actions
  const fetchProducts = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(*)
        `)
        .order('name')

      if (fetchError) throw fetchError

      products.value = data || []
    } catch (err) {
      console.error('Error fetching products:', err)
      error.value = t('products.fetch_error')
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async (): Promise<void> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('product_categories')
        .select('*')
        .order('name')

      if (fetchError) throw fetchError

      categories.value = data || []
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const createProduct = async (productData: CreateProductData): Promise<Product | null> => {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await supabase
        .from('products')
        .insert([productData])
        .select(`
          *,
          category:product_categories(*)
        `)
        .single()

      if (createError) throw createError

      if (data) {
        products.value.push(data)
        return data
      }

      return null
    } catch (err) {
      console.error('Error creating product:', err)
      error.value = t('products.create_error')
      return null
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (productData: UpdateProductData): Promise<Product | null> => {
    loading.value = true
    error.value = null

    try {
      const { id, ...updateData } = productData
      
      const { data, error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          category:product_categories(*)
        `)
        .single()

      if (updateError) throw updateError

      if (data) {
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) {
          products.value[index] = data
        }
        return data
      }

      return null
    } catch (err) {
      console.error('Error updating product:', err)
      error.value = t('products.update_error')
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (productId: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (deleteError) throw deleteError

      products.value = products.value.filter(p => p.id !== productId)
      return true
    } catch (err) {
      console.error('Error deleting product:', err)
      error.value = t('products.delete_error')
      return false
    } finally {
      loading.value = false
    }
  }

  const getProductById = (id: number): Product | undefined => {
    return products.value.find(product => product.id === id)
  }

  const getProductsBySku = (sku: string): Product[] => {
    return products.value.filter(product => 
      product.sku?.toLowerCase().includes(sku.toLowerCase())
    )
  }

  const updateStock = async (productId: number, newQuantity: number): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('id', productId)

      if (updateError) throw updateError

      const product = products.value.find(p => p.id === productId)
      if (product) {
        product.stock_quantity = newQuantity
      }

      return true
    } catch (err) {
      console.error('Error updating stock:', err)
      return false
    }
  }

  const createCategory = async (categoryData: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ProductCategory | null> => {
    try {
      const { data, error: createError } = await supabase
        .from('product_categories')
        .insert([categoryData])
        .select()
        .single()

      if (createError) throw createError

      if (data) {
        categories.value.push(data)
        return data
      }

      return null
    } catch (err) {
      console.error('Error creating category:', err)
      return null
    }
  }

  const updateCategory = async (categoryId: number, categoryData: Partial<ProductCategory>): Promise<ProductCategory | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('product_categories')
        .update(categoryData)
        .eq('id', categoryId)
        .select()
        .single()

      if (updateError) throw updateError

      if (data) {
        const index = categories.value.findIndex(c => c.id === categoryId)
        if (index !== -1) {
          categories.value[index] = data
        }
        return data
      }

      return null
    } catch (err) {
      console.error('Error updating category:', err)
      return null
    }
  }

  const deleteCategory = async (categoryId: number): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', categoryId)

      if (deleteError) throw deleteError

      categories.value = categories.value.filter(c => c.id !== categoryId)
      return true
    } catch (err) {
      console.error('Error deleting category:', err)
      return false
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  const setSearchQuery = (query: string): void => {
    searchQuery.value = query
  }

  const setSelectedCategory = (categoryId: number | null): void => {
    selectedCategory.value = categoryId
  }

  const toggleShowInactive = (): void => {
    showInactive.value = !showInactive.value
  }

  // Initialize
  const initialize = async (): Promise<void> => {
    await Promise.all([
      fetchProducts(),
      fetchCategories()
    ])
  }

  return {
    // State
    products,
    categories,
    loading,
    error,
    searchQuery,
    selectedCategory,
    showInactive,

    // Getters
    filteredProducts,
    activeProducts,
    lowStockProducts,
    outOfStockProducts,
    activeCategories,

    // Actions
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsBySku,
    updateStock,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
    setSearchQuery,
    setSelectedCategory,
    toggleShowInactive,
    initialize
  }
})

