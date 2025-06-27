"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { useAuth } from './auth-context'

type Product = Database['public']['Tables']['products']['Row'] & {
  variants: Database['public']['Tables']['product_variants']['Row'][]
  images: Database['public']['Tables']['product_images']['Row'][]
  category: Database['public']['Tables']['categories']['Row'] | null
}

type Order = Database['public']['Tables']['orders']['Row'] & {
  items: Database['public']['Tables']['order_items']['Row'][]
}

type Stand = Database['public']['Tables']['stands']['Row'] & {
  stock: Database['public']['Tables']['stand_stock']['Row'][]
}

interface AppContextType {
  products: Product[]
  orders: Order[]
  stands: Stand[]
  categories: Database['public']['Tables']['categories']['Row'][]
  loading: boolean
  refreshProducts: () => Promise<void>
  refreshOrders: () => Promise<void>
  refreshStands: () => Promise<void>
  refreshCategories: () => Promise<void>
  createOrder: (orderData: any) => Promise<{ data: any; error: any }>
  updateOrderStatus: (orderId: string, status: string) => Promise<{ error: any }>
  updateStock: (standId: string, variantId: string, quantity: number) => Promise<{ error: any }>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stands, setStands] = useState<Stand[]>([])
  const [categories, setCategories] = useState<Database['public']['Tables']['categories']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch initial data
  useEffect(() => {
    if (isClient && user) {
      fetchInitialData()
    }
  }, [user, isClient])


  useEffect(() => {
    console.log('user ------>', user);
    if (!user?.id) return;

    const channel = supabase
      .channel("orders_realtime_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders"
        },
        async (payload: any) => {
          if (!payload?.new?.id) {
            console.warn("Payload missing ID:", payload);
            return;
          }

          if(payload.new.user_id !== user.id) return;

          try {
            refreshOrders()
          } catch (error) {
            console.error("Error processing order update:", error);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to orders changes");
        }
        if (err) {
          console.error("Subscription error:", err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!isClient || !user) return

    const subscriptions: any[] = []

    // Products real-time subscription
    const productsSubscription = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          refreshProducts()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_variants',
        },
        () => {
          refreshProducts()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_images',
        },
        () => {
          refreshProducts()
        }
      )
      .subscribe()

    // Orders real-time subscription
    const ordersSubscription = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          refreshOrders()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
        },
        () => {
          refreshOrders()
        }
      )
      .subscribe()

    // Stands real-time subscription
    const standsSubscription = supabase
      .channel('stands_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stands',
        },
        () => {
          refreshStands()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stand_stock',
        },
        () => {
          refreshStands()
        }
      )
      .subscribe()

    subscriptions.push(productsSubscription, ordersSubscription, standsSubscription)

    return () => {
      subscriptions.forEach(sub => supabase.removeChannel(sub))
    }
  }, [user, isClient])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        refreshProducts(),
        refreshOrders(),
        refreshStands(),
        refreshCategories(),
      ])
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories!products_category_id_fkey(*),
          variants:product_variants!product_variants_product_id_fkey(*),
          images:product_images!product_images_product_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError

      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const refreshOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items!order_items_order_id_fkey(*)
        `)
        .order('created_at', { ascending: false })
        .eq('user_id', user?.id)

      if (ordersError) throw ordersError

      setOrders(ordersData || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const refreshStands = async () => {
    try {
      const { data: standsData, error: standsError } = await supabase
        .from('stands')
        .select(`
          *,
          stock:stand_stock!stand_stock_stand_id_fkey(*)
        `)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (standsError) throw standsError

      setStands(standsData || [])
    } catch (error) {
      console.error('Error fetching stands:', error)
    }
  }

  const refreshCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (categoriesError) throw categoriesError

      setCategories(categoriesData || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const createOrder = async (orderData: any) => {
    try {
      // Start a transaction by creating the order first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      // Get cart items from localStorage (client side only)
      let cartItems: any[] = []
      if (typeof window !== 'undefined') {
        try {
          cartItems = JSON.parse(localStorage.getItem('cart') || '[]')
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error)
          cartItems = []
        }
      }
      
      // Create order items
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: item.price,
      }))

      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          // If order items creation fails, we should delete the order
          await supabase.from('orders').delete().eq('id', order.id)
          throw itemsError
        }
      }

      return { data: order, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const updateStock = async (standId: string, variantId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('stand_stock')
        .upsert({
          stand_id: standId,
          product_variant_id: variantId,
          quantity,
        })

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    products,
    orders,
    stands,
    categories,
    loading,
    refreshProducts,
    refreshOrders,
    refreshStands,
    refreshCategories,
    createOrder,
    updateOrderStatus,
    updateStock,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
} 