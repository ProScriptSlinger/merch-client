"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Minus, ShoppingCart, ArrowLeft, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"
import { useCart } from "@/contexts/cart-context"
import type { Database } from "@/lib/supabase"

type Product = Database['public']['Tables']['products']['Row'] & {
  variants: Database['public']['Tables']['product_variants']['Row'][]
  images: Database['public']['Tables']['product_images']['Row'][]
  category: Database['public']['Tables']['categories']['Row'] | null
}

export default function CatalogPage() {
  const { user, signOut } = useAuth()
  const { products, loading } = useApp()
  const { addItem, totalItems } = useCart()
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({})
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})

  const handleAddToCart = (product: Product) => {
    const selectedVariantId = selectedVariants[product.id]
    if (!selectedVariantId) return

    const variant = product.variants.find(v => v.id === selectedVariantId)
    if (!variant || variant.quantity <= 0) return

    const quantity = quantities[product.id] || 1
    const primaryImage = product.images.find(img => img.is_primary)?.image_url || product.images[0]?.image_url || "/placeholder.svg"

    addItem({
      productId: product.id,
      variantId: selectedVariantId,
      name: product.name,
      price: variant.price,
      size: variant.size,
      quantity,
      images: [primaryImage],
      availableQuantity: variant.quantity,
    })

    // Reset quantity after adding
    setQuantities({ ...quantities, [product.id]: 1 })
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setQuantities({ ...quantities, [productId]: newQuantity })
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Cargando productos...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-sm  z-10">
          <div className="flex items-center justify-between p-4 border-b border-gray-900">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-900">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <img src={"/icon.png"} width={120}/>
                <p className="text-sm text-gray-400">KHEA TRAPICHEO</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white hover:bg-gray-900"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <h1 className="text-xl font-bold text-white pl-8 pt-4">Catálogo</h1>
        </div>

        {/* Products Grid */}
        <div className="p-4 space-y-6 pb-[80px]">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No hay productos disponibles</p>
            </div>
          ) : (
            products.map((product) => {
              const availableVariants = product.variants.filter(v => v.quantity > 0)
              const primaryImage = product.images.find(img => img.is_primary)?.image_url || product.images[0]?.image_url || "/placeholder.svg"
              
              return (
                <div key={product.id} className="bg-black rounded-2xl border border-gray-900 overflow-hidden">
                  <div className="aspect-square relative bg-black">
                    <Image
                      src={primaryImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />

                    {/* Stock Badge */}
                    {availableVariants.length === 0 && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-red-600 text-white">Sin stock</Badge>
                      </div>
                    )}

                    {/* Category Badge */}
                    {product.category && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                          {product.category.name}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-gray-400 mt-1">{product.description}</p>
                      )}
                    </div>

                    {/* Size Selection */}
                    {availableVariants.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {availableVariants.map((variant) => (
                            <button
                              key={variant.id}
                              onClick={() => setSelectedVariants({ ...selectedVariants, [product.id]: variant.id })}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                selectedVariants[product.id] === variant.id
                                  ? "bg-white text-black"
                                  : "bg-white/40 text-black hover:bg-white/60"
                              }`}
                            >
                              {variant.size} - ${variant.price.toLocaleString()}
                            </button>
                          ))}
                        </div>

                        {/* Quantity Selector */}
                        {selectedVariants[product.id] && (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">Cantidad:</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) - 1)}
                                className="w-8 h-8 p-0 border-gray-700 text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-white font-medium w-8 text-center">
                                {quantities[product.id] || 1}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) + 1)}
                                className="w-8 h-8 p-0 border-gray-700 text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Add to Cart Button */}
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={!selectedVariants[product.id]}
                          className="w-full bg-white hover:bg-white/80 text-black"
                        >
                          Agregar al carrito
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

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
    </ProtectedRoute>
  )
}
