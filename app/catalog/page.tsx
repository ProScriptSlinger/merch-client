"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  images: string[] // Cambiar de image a images array
  sizes: string[]
}

interface CartItem {
  productId: string
  name: string
  price: number
  size: string
  quantity: number
  images: string[] // Cambiar de image a images
}

const products: Product[] = [
  {
    id: "1",
    name: "Remera Básica",
    price: 8500,
    images: [
      "/placeholder.svg?height=300&width=300&text=Remera+Frente",
      "/placeholder.svg?height=300&width=300&text=Remera+Espalda",
      "/placeholder.svg?height=300&width=300&text=Remera+Detalle",
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "2",
    name: "Hoodie Premium",
    price: 15000,
    images: [
      "/placeholder.svg?height=300&width=300&text=Hoodie+Frente",
      "/placeholder.svg?height=300&width=300&text=Hoodie+Espalda",
      "/placeholder.svg?height=300&width=300&text=Hoodie+Capucha",
      "/placeholder.svg?height=300&width=300&text=Hoodie+Detalle",
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "3",
    name: "Gorra Snapback",
    price: 6500,
    images: [
      "/placeholder.svg?height=300&width=300&text=Gorra+Frente",
      "/placeholder.svg?height=300&width=300&text=Gorra+Perfil",
      "/placeholder.svg?height=300&width=300&text=Gorra+Espalda",
    ],
    sizes: ["Única"],
  },
  {
    id: "4",
    name: "Tote Bag",
    price: 4500,
    images: [
      "/placeholder.svg?height=300&width=300&text=Bolsa+Frente",
      "/placeholder.svg?height=300&width=300&text=Bolsa+Interior",
    ],
    sizes: ["Única"],
  },
]

export default function CatalogPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({})
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})

  const addToCart = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0]
    const quantity = quantities[product.id] || 1

    const existingItem = cart.find((item) => item.productId === product.id && item.size === size)

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id && item.size === size ? { ...item, quantity: item.quantity + quantity } : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          size,
          quantity,
          images: product.images, // Cambiar de image a images
        },
      ])
    }

    // Reset quantity after adding
    setQuantities({ ...quantities, [product.id]: 1 })
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setQuantities({ ...quantities, [productId]: newQuantity })
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-gray-900 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-900">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Catálogo</h1>
              <p className="text-sm text-gray-400">KHEA TRAPICHEO</p>
            </div>
          </div>
          <Link href="/cart">
            <Button
              variant="outline"
              size="sm"
              className="relative border-gray-900 bg-black hover:bg-gray-900 text-white"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-white text-black">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4 space-y-6">
        {products.map((product) => (
          <div key={product.id} className="bg-black rounded-2xl border border-gray-900 overflow-hidden">
            <div className="aspect-square relative bg-black">
              <Image
                src={product.images[currentImageIndex[product.id] || 0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />

              {/* Image Slider Dots */}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setCurrentImageIndex({
                          ...currentImageIndex,
                          [product.id]: index,
                        })
                      }
                      className={`w-2 h-2 rounded-full transition-all ${
                        (currentImageIndex[product.id] || 0) === index ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Swipe Area for Touch Navigation */}
              {product.images.length > 1 && (
                <div className="absolute inset-0 flex">
                  <button
                    className="flex-1 opacity-0"
                    onClick={() => {
                      const current = currentImageIndex[product.id] || 0
                      const newIndex = current > 0 ? current - 1 : product.images.length - 1
                      setCurrentImageIndex({ ...currentImageIndex, [product.id]: newIndex })
                    }}
                  />
                  <button
                    className="flex-1 opacity-0"
                    onClick={() => {
                      const current = currentImageIndex[product.id] || 0
                      const newIndex = current < product.images.length - 1 ? current + 1 : 0
                      setCurrentImageIndex({ ...currentImageIndex, [product.id]: newIndex })
                    }}
                  />
                </div>
              )}
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-white">{product.name}</h3>
                <p className="text-2xl font-bold text-white">${product.price.toLocaleString()}</p>
              </div>

              {/* Size Selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Talle</p>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSizes[product.id] === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: size })}
                      className={`min-w-[44px] ${
                        selectedSizes[product.id] === size
                          ? "bg-white text-black hover:bg-gray-200"
                          : "border-gray-900 bg-black hover:bg-gray-800 text-white"
                      }`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Cantidad</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) - 1)}
                    disabled={(quantities[product.id] || 1) <= 1}
                    className="border-gray-900 bg-black hover:bg-gray-800 text-white disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-semibold min-w-[2rem] text-center text-white">
                    {quantities[product.id] || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) + 1)}
                    className="border-gray-900 bg-black hover:bg-gray-800 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={() => addToCart(product)}
                className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-gray-200"
                size="lg"
              >
                Agregar al carrito
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-20">
          <Link href="/cart">
            <Button className="w-full h-14 text-lg font-semibold shadow-lg bg-white text-black hover:bg-gray-200">
              Ver carrito ({totalItems} {totalItems === 1 ? "producto" : "productos"})
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
