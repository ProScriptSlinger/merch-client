"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Clock, Users, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProtectedRoute from "@/components/protected-route"
import { useApp } from "@/contexts/app-context"
import { useCart } from "@/contexts/cart-context"
import type { Database } from "@/lib/supabase"

type Stand = Database['public']['Tables']['stands']['Row']

export default function PickupLocationPage() {
  const router = useRouter()
  const { stands, loading } = useApp()
  const { items } = useCart()
  const [selectedStand, setSelectedStand] = useState<string>("")

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/catalog')
    }
  }, [items, router])

  const getCapacityColor = (stockCount: number) => {
    if (stockCount > 50) {
      return "bg-green-900/50 text-green-300 border-green-800"
    } else if (stockCount > 20) {
      return "bg-yellow-900/50 text-yellow-300 border-yellow-800"
    } else {
      return "bg-red-900/50 text-red-300 border-red-800"
    }
  }

  const getCapacityText = (stockCount: number) => {
    if (stockCount > 50) {
      return "Stock alto"
    } else if (stockCount > 20) {
      return "Stock moderado"
    } else {
      return "Stock limitado"
    }
  }

  const getWaitTime = (stockCount: number) => {
    if (stockCount > 50) {
      return "2-5 min"
    } else if (stockCount > 20) {
      return "5-10 min"
    } else {
      return "10-15 min"
    }
  }

  const handleContinue = () => {
    if (selectedStand) {
      // Store selected stand in localStorage for checkout (client side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedStand', selectedStand)
      }
      router.push('/checkout')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Cargando puntos de retiro...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (items.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-white">Redirigiendo al catálogo...</p>
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
          <div className="flex items-center p-4">
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-lg font-semibold ml-4 text-white">Punto de retiro</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-xl font-bold text-white">¿Dónde querés retirar tu pedido?</h2>
            <p className="text-gray-400">Elegí la ubicación más conveniente para vos</p>
          </div>

          {/* Location Cards */}
          <div className="space-y-4">
            {stands.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No hay puntos de retiro disponibles</p>
              </div>
            ) : (
              stands.map((stand) => {
                const stockCount = stand.stock?.reduce((sum, stock) => sum + stock.quantity, 0) || 0
                
                return (
                  <Card
                    key={stand.id}
                    className={`p-4 cursor-pointer transition-all duration-200 bg-black border-gray-900 ${
                      selectedStand === stand.id
                        ? "ring-2 ring-white border-white bg-gray-900"
                        : "hover:border-gray-800"
                    }`}
                    onClick={() => setSelectedStand(stand.id)}
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-white">{stand.name}</h3>
                            {selectedStand === stand.id && <Check className="w-5 h-5 text-green-400" />}
                          </div>
                          <div className="flex items-center gap-1 text-gray-400 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{stand.location || 'Ubicación por confirmar'}</span>
                          </div>
                        </div>
                        <Badge className={getCapacityColor(stockCount)}>
                          {getCapacityText(stockCount)}
                        </Badge>
                      </div>

                      {/* Description */}
                      {stand.description && (
                        <p className="text-gray-400 text-sm">{stand.description}</p>
                      )}

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-white">{stand?.operating_hours || 'Horario por confirmar'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-white">Tiempo de espera</p>
                            <p className="text-gray-400">{getWaitTime(stockCount)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Stock Info */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs bg-black text-gray-300 border-gray-900">
                          Stock disponible: {stockCount} unidades
                        </Badge>
                        {stand.is_active && (
                          <Badge variant="secondary" className="text-xs bg-green-900/20 text-green-300 border-green-800">
                            Activo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>

          {/* Continue Button */}
          <div className="pt-4">
            <Button
              onClick={handleContinue}
              className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-gray-200"
              disabled={!selectedStand}
            >
              Continuar al checkout
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">💡 Podés cambiar el punto de retiro hasta confirmar tu compra</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
