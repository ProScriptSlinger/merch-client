"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CreditCard, Check, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CashPaymentWarning } from "@/components/cash-payment-warning"

interface CartItem {
  name: string
  price: number
  size: string
  quantity: number
}

const mockCartItems: CartItem[] = [
  { name: "Remera Básica", price: 8500, size: "M", quantity: 2 },
  { name: "Hoodie Premium", price: 15000, size: "L", quantity: 1 },
]

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | null>(null)
  const [showCashWarning, setShowCashWarning] = useState(false)

  const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = mockCartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handlePaymentMethodSelect = (method: "card" | "cash") => {
    if (method === "cash") {
      setShowCashWarning(true)
    } else {
      setPaymentMethod(method)
    }
  }

  const handleCashWarningConfirm = () => {
    setPaymentMethod("cash")
    setShowCashWarning(false)
  }

  const handleCashWarningClose = () => {
    setShowCashWarning(false)
    setPaymentMethod(null)
  }

  const handlePayment = () => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      if (paymentMethod === "cash") {
        // Para efectivo, redirigir a confirmación con timer
        window.location.href = "/confirmation?payment=cash"
      } else {
        // Para tarjeta, confirmación normal
        window.location.href = "/confirmation"
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black border-b border-gray-900">
        <div className="flex items-center p-4">
          <Link href="/pickup-location">
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-lg font-semibold ml-4 text-white">Checkout</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Order Summary */}
        <Card className="p-4 space-y-4 bg-black border-gray-900">
          <h2 className="font-semibold text-lg text-white">Resumen del pedido</h2>

          <div className="space-y-3">
            {mockCartItems.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-sm text-gray-400">
                    Talle {item.size} • Cantidad: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-white">${(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-900 pt-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-white">Total</span>
              <span className="text-white">${subtotal.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {totalItems} {totalItems === 1 ? "producto" : "productos"} • Retiro en evento
            </p>
          </div>
        </Card>

        {/* Payment Method Selection */}
        <Card className="p-4 space-y-4 bg-black border-gray-900">
          <h3 className="font-semibold text-white">Método de pago</h3>

          {/* Card Payment */}
          <div
            onClick={() => handlePaymentMethodSelect("card")}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              paymentMethod === "card" ? "border-blue-600 bg-blue-900/20" : "border-gray-800 hover:border-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Tarjeta de Crédito/Débito</p>
                <p className="text-sm text-gray-400">Mercado Pago • Visa, Mastercard</p>
              </div>
              {paymentMethod === "card" && (
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          {/* Cash Payment */}
          <div
            onClick={() => handlePaymentMethodSelect("cash")}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              paymentMethod === "cash" ? "border-green-600 bg-green-900/20" : "border-gray-800 hover:border-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Efectivo en el Evento</p>
                <p className="text-sm text-gray-400">Pagá al retirar en el stand</p>
                <p className="text-xs text-yellow-400 mt-1">⚠️ Retiro obligatorio en 30 min</p>
              </div>
              {paymentMethod === "cash" && (
                <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* User Info */}
        <Card className="p-4 space-y-2 bg-black border-gray-900">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            <span className="font-medium text-white">Cuenta creada</span>
          </div>
          <p className="text-sm text-gray-400 ml-6">usuario@email.com</p>
        </Card>

        {/* Pickup Info */}
        <Card className="p-4 space-y-3 bg-black border-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Punto de retiro seleccionado</h3>
            <Link href="/pickup-location">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                Cambiar
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-white">Stand Principal</p>
            <p className="text-sm text-gray-400">
              📍 Sector A - Entrada principal
              <br />🕐 10:00 - 22:00
              <br />
              ⏱️ Tiempo de espera: 5-10 min
              <br />📱 Presentá el QR que vas a recibir
            </p>
          </div>
        </Card>

        {/* Payment Button */}
        <div className="space-y-4">
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !paymentMethod}
            className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-gray-200"
          >
            {paymentMethod === "card" ? (
              <CreditCard className="w-5 h-5 mr-2" />
            ) : (
              <DollarSign className="w-5 h-5 mr-2" />
            )}
            {isProcessing
              ? "Procesando..."
              : paymentMethod === "cash"
                ? `Reservar $${subtotal.toLocaleString()}`
                : `Pagar $${subtotal.toLocaleString()}`}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            {paymentMethod === "cash"
              ? "Pagá al retirar tu pedido en el stand seleccionado"
              : "Pago seguro procesado por Mercado Pago"}
          </p>
        </div>
      </div>

      {/* Cash Payment Warning Modal */}
      <CashPaymentWarning
        isOpen={showCashWarning}
        onClose={handleCashWarningClose}
        onConfirm={handleCashWarningConfirm}
      />
    </div>
  )
}
