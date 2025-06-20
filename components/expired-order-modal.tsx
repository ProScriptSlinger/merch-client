"use client"

import { XCircle, RefreshCw, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ExpiredOrderModalProps {
  isOpen: boolean
  orderNumber: string
  onRetryPurchase: () => void
  onGoToCatalog: () => void
}

export function ExpiredOrderModal({ isOpen, orderNumber, onRetryPurchase, onGoToCatalog }: ExpiredOrderModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black border-red-800">
        <div className="p-6 space-y-6 text-center">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-900/50 rounded-full flex items-center justify-center border border-red-800">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">❌ Pedido Expirado</h2>
            <p className="text-gray-400">Pedido #{orderNumber}</p>
          </div>

          {/* Explanation */}
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-200">
              El tiempo para retirar tu compra en efectivo ha expirado y el pedido fue{" "}
              <span className="font-bold">cancelado automáticamente</span>.
            </p>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Los pedidos en efectivo deben retirarse dentro de 30 minutos</p>
            <p>• Esto ayuda a mantener el stock disponible para otros usuarios</p>
            <p>• Podés realizar una nueva compra cuando quieras</p>
          </div>

          {/* Call to Action */}
          <div className="space-y-3">
            <p className="text-white font-medium">¿Todavía querés tu pedido?</p>
            <p className="text-gray-400 text-sm">Podés realizar la compra otra vez ahora.</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onRetryPurchase}
              className="w-full h-12 bg-white text-black hover:bg-gray-200 font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />🔁 Realizar compra nuevamente
            </Button>

            <Button
              onClick={onGoToCatalog}
              variant="outline"
              className="w-full h-12 border-gray-900 bg-black hover:bg-gray-900 text-white"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Ver catálogo
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
