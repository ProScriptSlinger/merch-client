"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CartItem {
  productId: string
  name: string
  price: number
  size: string
  quantity: number
  images: string[] // Cambiar de image a images
}

// Simulated cart data - in a real app this would come from state management
const mockCartItems: CartItem[] = [
  {
    productId: "1",
    name: "Remera Básica",
    price: 8500,
    size: "M",
    quantity: 2,
    images: ["/placeholder.svg?height=80&width=80&text=Remera"], // Array con una imagen
  },
  {
    productId: "2",
    name: "Hoodie Premium",
    price: 15000,
    size: "L",
    quantity: 1,
    images: ["/placeholder.svg?height=80&width=80&text=Hoodie"], // Array con una imagen
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems)

  const removeItem = (productId: string, size: string) => {
    setCartItems(cartItems.filter((item) => !(item.productId === productId && item.size === size)))
  }

  const updateQuantity = (productId: string, size: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId, size)
      return
    }

    setCartItems(
      cartItems.map((item) =>
        item.productId === productId && item.size === size ? { ...item, quantity: newQuantity } : item,
      ),
    )
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex items-center p-4 border-b border-gray-900">
          <Link href="/catalog">
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">Tu carrito está vacío</p>
            <Link href="/catalog">
              <Button className="bg-white text-black hover:bg-gray-200">Explorar productos</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-900">
        <Link href="/catalog">
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Seguir comprando
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-white">Carrito ({totalItems})</h1>
        <div className="w-20"></div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 p-4 space-y-4">
        {cartItems.map((item, index) => (
          <div
            key={`${item.productId}-${item.size}`}
            className="flex gap-4 p-4 bg-black rounded-xl border border-gray-900"
          >
            <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-black">
              <Image src={item.images[0] || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            </div>

            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-gray-400">Talle: {item.size}</p>
                <p className="font-semibold text-white">${item.price.toLocaleString()}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                    className="border-gray-900 bg-black hover:bg-gray-800 text-white"
                  >
                    -
                  </Button>
                  <span className="font-semibold min-w-[2rem] text-center text-white">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                    className="border-gray-900 bg-black hover:bg-gray-800 text-white"
                  >
                    +
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.productId, item.size)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-gray-900 p-4 space-y-4 bg-black">
        <div className="space-y-2">
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-white">Total</span>
            <span className="font-bold text-white">${subtotal.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-400">Retiro en el evento • Sin costo de envío</p>
        </div>

        <Link href="/pickup-location">
          <Button className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-gray-200">
            Continuar compra
          </Button>
        </Link>
      </div>
    </div>
  )
}
