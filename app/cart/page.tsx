"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Plus, Minus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalAmount } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check for pending orders on component mount
  useEffect(() => {
    const checkPendingOrders = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const { data: pendingOrders, error } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .limit(1)

        if (error) {
          console.error('Error checking pending orders:', error)
        } else if (pendingOrders && pendingOrders.length > 0) {
          // Redirect to confirmation page for the pending order
          router.push(`/confirmation?orderId=${pendingOrders[0].id} `)
          return
        }
      } catch (error) {
        console.error('Error checking pending orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkPendingOrders()
  }, [user, router])

  const handleCheckout = () => {
    setIsCheckingOut(true)
    // Redirect to checkout page
    window.location.href = "/checkout"
  }

  // Show loading state while checking for pending orders
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-400">Verificando órdenes pendientes...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (items.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black">
          {/* Header */}
          <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-gray-900 z-10">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Link href="/catalog">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-900">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-white">Carrito</h1>
                  <p className="text-sm text-gray-400">KHEA TRAPICHEO</p>
                </div>
              </div>
            </div>
          </div>

          {/* Empty Cart */}
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-center space-y-4">
              <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto" />
              <h2 className="text-xl font-semibold text-white">Tu carrito está vacío</h2>
              <p className="text-gray-400">Agregá productos para comenzar</p>
              <Link href="/catalog">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Ver catálogo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-gray-900 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Link href="/catalog">
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-900">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Carrito</h1>
                <p className="text-sm text-gray-400">KHEA TRAPICHEO</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="p-4 space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="bg-black rounded-2xl border border-gray-900 p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 relative bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.images[0] || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="text-sm text-gray-400">Talle: {item.size}</p>
                    <p className="text-lg font-bold text-white">${item.price.toLocaleString()}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">Cantidad:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-8 h-8 p-0 border-gray-700 text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-white font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.availableQuantity}
                        className="w-8 h-8 p-0 border-gray-700 text-white disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.variantId)}
                      className="text-red-400 hover:text-red-300 ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Stock Warning */}
                  {item.quantity >= item.availableQuantity && (
                    <p className="text-xs text-yellow-400">
                      Stock limitado: {item.availableQuantity} disponibles
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Section */}
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-900 p-4">
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total ({totalItems} {totalItems === 1 ? 'producto' : 'productos'}):</span>
              <span className="text-xl font-bold text-white">${totalAmount.toLocaleString()}</span>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCheckingOut ? "Procesando..." : "Continuar al checkout"}
            </Button>
          </div>
        </div>

        {/* Bottom Spacer */}
        <div className="h-32"></div>
      </div>
    </ProtectedRoute>
  )
}
