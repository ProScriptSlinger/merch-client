"use client"

import { AlertTriangle, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CashPaymentWarningProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function CashPaymentWarning({ isOpen, onClose, onConfirm }: CashPaymentWarningProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black border-yellow-800 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-6 space-y-4">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-yellow-900/50 rounded-full flex items-center justify-center border border-yellow-800">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">⚠️ Atención: Pago en Efectivo</h3>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-yellow-200 font-medium">
                  Al pagar en efectivo, deberás retirar tu compra dentro de los{" "}
                  <span className="font-bold">30 minutos</span> desde ahora.
                </p>
                <p className="text-yellow-300 text-sm">
                  De lo contrario, la orden será cancelada automáticamente y deberás realizar una nueva compra.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 text-sm text-gray-400">
            <p>• El temporizador comenzará al confirmar tu pedido</p>
            <p>• Podrás ver el tiempo restante en todo momento</p>
            <p>• Llevá efectivo exacto para agilizar el proceso</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={onConfirm}
              className="w-full h-12 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
            >
              Entiendo, continuar con efectivo
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full h-12 border-gray-900 bg-black hover:bg-gray-900 text-white"
            >
              Cancelar y elegir otro método
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
