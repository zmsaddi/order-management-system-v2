import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useI18n } from 'vue-i18n'
import { calculateOrderTotals, type OrderCalculation } from '@/utils/calculations'
import type { Product } from './products'

export interface OrderItem {
  id?: number
  order_id?: number
  product_id?: number
  name: string
  description?: string
  notes?: string
  quantity: number
  unit_price: number
  subtotal: number
  is_custom: boolean
  product?: Product
}

export interface Order {
  id: number
  customer_name: string
  customer_phone?: string
  customer_address?: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes?: string
  status: 'new' | 'processing' | 'completed' | 'delivered' | 'cancelled'
  sales_rep_id: string
  created_at: string
  updated_at: string
  order_products: OrderItem[]
  sales_rep?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateOrderData {
  customer_name: string
  customer_phone?: string
  customer_address?: string
  tax_rate: number
  notes?: string
  status: Order['status']
  order_items: Omit<OrderItem, 'id' | 'order_id' | 'subtotal'>[]
}

export interface UpdateOrderData extends Partial<CreateOrderData> {
  id: number
}

export const useOrdersStore = defineStore('orders', () => {
  const { t } = useI18n()
  
  // State
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedStatus = ref<Order['status'] | null>(null)
  const selectedRep = ref<string | null>(null)
  const dateRange = ref<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  })

  // Getters
  const filteredOrders = computed(() => {
    let filtered = orders.value

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(query) ||
        order.customer_phone?.toLowerCase().includes(query) ||
        order.id.toString().includes(query) ||
        order.notes?.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (selectedStatus.value) {
      filtered = filtered.filter(order => order.status === selectedStatus.value)
    }

    // Filter by sales rep
    if (selectedRep.value) {
      filtered = filtered.filter(order => order.sales_rep_id === selectedRep.value)
    }

    // Filter by date range
    if (dateRange.value.start) {
      filtered = filtered.filter(order => 
        new Date(order.created_at) >= new Date(dateRange.value.start!)
      )
    }
    if (dateRange.value.end) {
      filtered = filtered.filter(order => 
        new Date(order.created_at) <= new Date(dateRange.value.end!)
      )
    }

    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  })

  const ordersByStatus = computed(() => {
    const statusGroups: Record<Order['status'], Order[]> = {
      new: [],
      processing: [],
      completed: [],
      delivered: [],
      cancelled: []
    }

    orders.value.forEach(order => {
      statusGroups[order.status].push(order)
    })

    return statusGroups
  })

  const orderStats = computed(() => {
    const total = orders.value.length
    const thisMonth = orders.value.filter(order => {
      const orderDate = new Date(order.created_at)
      const now = new Date()
      return orderDate.getMonth() === now.getMonth() && 
             orderDate.getFullYear() === now.getFullYear()
    })

    const totalRevenue = orders.value
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0)

    const thisMonthRevenue = thisMonth
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0)

    return {
      total,
      thisMonth: thisMonth.length,
      totalRevenue,
      thisMonthRevenue,
      pending: ordersByStatus.value.new.length + ordersByStatus.value.processing.length,
      completed: ordersByStatus.value.completed.length + ordersByStatus.value.delivered.length
    }
  })

  // Actions
  const fetchOrders = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_products(*),
          sales_rep:users(id, name, email)
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      orders.value = data || []
    } catch (err) {
      console.error('Error fetching orders:', err)
      error.value = t('orders.fetch_error')
    } finally {
      loading.value = false
    }
  }

  const fetchOrderById = async (orderId: number): Promise<Order | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_products(*),
          sales_rep:users(id, name, email)
        `)
        .eq('id', orderId)
        .single()

      if (fetchError) throw fetchError

      return data
    } catch (err) {
      console.error('Error fetching order:', err)
      return null
    }
  }

  const createOrder = async (orderData: CreateOrderData): Promise<Order | null> => {
    loading.value = true
    error.value = null

    try {
      // Calculate totals
      const calculation = calculateOrderTotals(orderData.order_items, orderData.tax_rate)
      
      // Create order
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          customer_address: orderData.customer_address,
          subtotal: calculation.subtotal,
          tax_rate: orderData.tax_rate,
          tax_amount: calculation.taxAmount,
          total: calculation.total,
          notes: orderData.notes,
          status: orderData.status
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = orderData.order_items.map(item => ({
        order_id: orderResult.id,
        product_id: item.product_id,
        name: item.name,
        description: item.description,
        notes: item.notes,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
        is_custom: item.is_custom
      }))

      const { data: itemsResult, error: itemsError } = await supabase
        .from('order_products')
        .insert(orderItems)
        .select()

      if (itemsError) throw itemsError

      // Fetch complete order with relations
      const completeOrder = await fetchOrderById(orderResult.id)
      if (completeOrder) {
        orders.value.unshift(completeOrder)
        return completeOrder
      }

      return null
    } catch (err) {
      console.error('Error creating order:', err)
      error.value = t('orders.create_error')
      return null
    } finally {
      loading.value = false
    }
  }

  const updateOrder = async (orderData: UpdateOrderData): Promise<Order | null> => {
    loading.value = true
    error.value = null

    try {
      const { id, order_items, ...updateData } = orderData
      
      // Calculate totals if items are provided
      let calculation: OrderCalculation | undefined
      if (order_items) {
        calculation = calculateOrderTotals(order_items, updateData.tax_rate || 0)
      }

      // Update order
      const orderUpdateData = {
        ...updateData,
        ...(calculation && {
          subtotal: calculation.subtotal,
          tax_amount: calculation.taxAmount,
          total: calculation.total
        })
      }

      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .update(orderUpdateData)
        .eq('id', id)
        .select()
        .single()

      if (orderError) throw orderError

      // Update order items if provided
      if (order_items) {
        // Delete existing items
        await supabase
          .from('order_products')
          .delete()
          .eq('order_id', id)

        // Insert new items
        const orderItems = order_items.map(item => ({
          order_id: id,
          product_id: item.product_id,
          name: item.name,
          description: item.description,
          notes: item.notes,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.quantity * item.unit_price,
          is_custom: item.is_custom
        }))

        await supabase
          .from('order_products')
          .insert(orderItems)
      }

      // Fetch complete updated order
      const completeOrder = await fetchOrderById(id)
      if (completeOrder) {
        const index = orders.value.findIndex(o => o.id === id)
        if (index !== -1) {
          orders.value[index] = completeOrder
        }
        return completeOrder
      }

      return null
    } catch (err) {
      console.error('Error updating order:', err)
      error.value = t('orders.update_error')
      return null
    } finally {
      loading.value = false
    }
  }

  const updateOrderStatus = async (orderId: number, status: Order['status']): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (updateError) throw updateError

      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        order.status = status
      }

      return true
    } catch (err) {
      console.error('Error updating order status:', err)
      return false
    }
  }

  const deleteOrder = async (orderId: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (deleteError) throw deleteError

      orders.value = orders.value.filter(o => o.id !== orderId)
      return true
    } catch (err) {
      console.error('Error deleting order:', err)
      error.value = t('orders.delete_error')
      return false
    } finally {
      loading.value = false
    }
  }

  const duplicateOrder = async (orderId: number): Promise<Order | null> => {
    const originalOrder = orders.value.find(o => o.id === orderId)
    if (!originalOrder) return null

    const duplicateData: CreateOrderData = {
      customer_name: `${originalOrder.customer_name} (Copy)`,
      customer_phone: originalOrder.customer_phone,
      customer_address: originalOrder.customer_address,
      tax_rate: originalOrder.tax_rate,
      notes: originalOrder.notes,
      status: 'new',
      order_items: originalOrder.order_products.map(item => ({
        product_id: item.product_id,
        name: item.name,
        description: item.description,
        notes: item.notes,
        quantity: item.quantity,
        unit_price: item.unit_price,
        is_custom: item.is_custom
      }))
    }

    return await createOrder(duplicateData)
  }

  const getOrderById = (id: number): Order | undefined => {
    return orders.value.find(order => order.id === id)
  }

  const getOrdersByCustomer = (customerName: string): Order[] => {
    return orders.value.filter(order => 
      order.customer_name.toLowerCase().includes(customerName.toLowerCase())
    )
  }

  const getOrdersByRep = (repId: string): Order[] => {
    return orders.value.filter(order => order.sales_rep_id === repId)
  }

  const clearError = (): void => {
    error.value = null
  }

  const setSearchQuery = (query: string): void => {
    searchQuery.value = query
  }

  const setSelectedStatus = (status: Order['status'] | null): void => {
    selectedStatus.value = status
  }

  const setSelectedRep = (repId: string | null): void => {
    selectedRep.value = repId
  }

  const setDateRange = (start: string | null, end: string | null): void => {
    dateRange.value = { start, end }
  }

  const clearFilters = (): void => {
    searchQuery.value = ''
    selectedStatus.value = null
    selectedRep.value = null
    dateRange.value = { start: null, end: null }
  }

  // Initialize
  const initialize = async (): Promise<void> => {
    await fetchOrders()
  }

  return {
    // State
    orders,
    loading,
    error,
    searchQuery,
    selectedStatus,
    selectedRep,
    dateRange,

    // Getters
    filteredOrders,
    ordersByStatus,
    orderStats,

    // Actions
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    duplicateOrder,
    getOrderById,
    getOrdersByCustomer,
    getOrdersByRep,
    clearError,
    setSearchQuery,
    setSelectedStatus,
    setSelectedRep,
    setDateRange,
    clearFilters,
    initialize
  }
})

