"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
  productId: string
  variantId: string
  name: string
  price: number
  size: string
  quantity: number
  images: string[]
  availableQuantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalAmount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load cart from localStorage on mount (client side only)
  useEffect(() => {
    if (!isClient) return

    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [isClient])

  // Save cart to localStorage whenever it changes (client side only)
  useEffect(() => {
    if (!isClient) return

    localStorage.setItem('cart', JSON.stringify(items))
  }, [items, isClient])

  const addItem = (newItem: CartItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.variantId === newItem.variantId)
      
      if (existingItem) {
        return prevItems.map(item =>
          item.variantId === newItem.variantId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      } else {
        return [...prevItems, newItem]
      }
    })
  }

  const removeItem = (variantId: string) => {
    setItems(prevItems => prevItems.filter(item => item.variantId !== variantId))
  }

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId)
      return
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 