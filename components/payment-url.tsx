"use client"

import { AlertTriangle, Clock, X , Banknote} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface PaymentUrlProps {
  paymentUrl: string
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function PaymentUrl({ paymentUrl, isOpen, onClose, onConfirm }: PaymentUrlProps) {
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
          {/* Title */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Complete el pago en la siguiente URL</h3>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Banknote className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <a href={paymentUrl} target="_blank" className="text-yellow-200 font-medium break-all">
                  {paymentUrl}
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* <Button
              onClick={onConfirm}
              className="w-full h-12 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
            >
              Ir a pagar
            </Button> */}
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full h-12 border-gray-900 bg-black hover:bg-gray-900 text-white"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
