import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types based on your schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'admin' | 'manager' | 'staff'
          qr_code: string | null
          balance: number
          total_purchases: number
          last_activity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'staff'
          qr_code?: string | null
          balance?: number
          total_purchases?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'staff'
          qr_code?: string | null
          balance?: number
          total_purchases?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category_id: string | null
          description: string | null
          low_stock_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id?: string | null
          description?: string | null
          low_stock_threshold?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string | null
          description?: string | null
          low_stock_threshold?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size: string
          quantity: number
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          quantity?: number
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          quantity?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          is_primary: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          image_url: string
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          image_url?: string
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      stands: {
        Row: {
          id: string
          name: string
          location: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          operating_hours: string | null
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stand_stock: {
        Row: {
          id: string
          stand_id: string
          product_variant_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stand_id: string
          product_variant_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stand_id?: string
          product_variant_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stand_stock_stand_id_fkey"
            columns: ["stand_id"]
            isOneToOne: false
            referencedRelation: "stands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stand_stock_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          customer_name: string
          customer_email: string
          qr_code: string | null
          status: 'pending' | 'delivered' | 'cancelled' | 'returned' | 'waiting_payment'
          payment_method: 'POS' | 'Efectivo' | 'QR_MercadoPago' | 'Transferencia' | null
          payment_validated: boolean
          total_amount: number
          sale_type: 'POS' | 'Online'
          stand_id: string | null
          delivery_qr_value: string | null
          delivered_by_stand_id: string | null
          delivery_timestamp: string | null
          return_requested: boolean
          return_reason: string | null
          return_timestamp: string | null
          refund_amount: number | null
          created_at: string
          updated_at: string
          transaction: [any]
        }
        Insert: {
          id?: string
          user_id?: string | null
          customer_name: string
          customer_email: string
          qr_code?: string | null
          status?: 'pending' | 'delivered' | 'cancelled' | 'returned'
          payment_method?: 'POS' | 'Efectivo' | 'QR_MercadoPago' | 'Transferencia' | null
          payment_validated?: boolean
          total_amount: number
          sale_type?: 'POS' | 'Online'
          stand_id?: string | null
          delivery_qr_value?: string | null
          delivered_by_stand_id?: string | null
          delivery_timestamp?: string | null
          return_requested?: boolean
          return_reason?: string | null
          return_timestamp?: string | null
          refund_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          customer_name?: string
          customer_email?: string
          qr_code?: string | null
          status?: 'pending' | 'delivered' | 'cancelled' | 'returned'
          payment_method?: 'POS' | 'Efectivo' | 'QR_MercadoPago' | 'Transferencia' | null
          payment_validated?: boolean
          total_amount?: number
          sale_type?: 'POS' | 'Online'
          stand_id?: string | null
          delivery_qr_value?: string | null
          delivered_by_stand_id?: string | null
          delivery_timestamp?: string | null
          return_requested?: boolean
          return_reason?: string | null
          return_timestamp?: string | null
          refund_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_stand_id_fkey"
            columns: ["stand_id"]
            isOneToOne: false
            referencedRelation: "stands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivered_by_stand_id_fkey"
            columns: ["delivered_by_stand_id"]
            isOneToOne: false
            referencedRelation: "stands"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_variant_id: string
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_variant_id: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_variant_id?: string
          quantity?: number
          unit_price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
    }
  }
} 