"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CreditCard, Check, DollarSign, User, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CashPaymentWarning } from "@/components/cash-payment-warning"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useApp } from "@/contexts/app-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { generateQRCode } from '@/lib/utils'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, totalAmount, clearCart } = useCart()
  const { stands, createOrder } = useApp()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | null>("card")
  const [showCashWarning, setShowCashWarning] = useState(false)
  const [selectedStand, setSelectedStand] = useState<any>(null)
  const [customerId, setCustomerId] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")

  // Set default values from user profile
  useEffect(() => {
    if (user) {
      setCustomerEmail(user.email || "")
    }
  }, [user])

  // Set default stand if available
  useEffect(() => {
    if (stands.length > 0 && !selectedStand) {
      // Try to get selected stand from localStorage first (client side only)
      let savedStandId = null
      if (typeof window !== 'undefined') {
        savedStandId = localStorage.getItem('selectedStand')
      }
      
      if (savedStandId) {
        const savedStand = stands.find(stand => stand.id === savedStandId)
        if (savedStand) {
          setSelectedStand(savedStand)
          return
        }
      }
      // Fallback to first available stand
      setSelectedStand(stands[0])
    }
  }, [stands, selectedStand])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

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

  const handlePayment = async () => {
    if (!customerId || !customerEmail || !selectedStand || !paymentMethod) {
      toast.error('Por favor, completa toda la información para continuar')
      return
    }

    setIsProcessing(true)

    try {
      // Create order in database
      const orderData = {
        user_id: user?.id,
        customer_id: customerId,
        customer_email: customerEmail,
        qr_code: generateQRCode(),
        status: 'waiting_payment',
        payment_method: paymentMethod,
        payment_validated: paymentMethod === 'card', // Cash payments need validation at pickup
        total_amount: totalAmount,
        sale_type: 'Online',
        stand_id: selectedStand.id
      }

      const { data: order, error } = await createOrder(orderData);

      if(paymentMethod === "card") {
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: order.id,
            chargeAmount: totalAmount,
            userId: user?.id,
            payer: {
              email: customerEmail,
              name: customerId,
            },
          }),
        });
      }

      // Send email with QR code (non-blocking)
      try {
        await fetch("/api/mails", {
          method: "POST",
          body: JSON.stringify({
            email: customerEmail,
            type: "new_order",
            orderNumber: order.id,
            qrCode: order.qr_code,
            pickupLocation: selectedStand?.name,
            totalAmount: totalAmount,
            items: items.map(item => ({
              name: item.name,
              size: item.size,
              quantity: item.quantity,
              price: item.price * item.quantity
            })),
            firstName: customerId,
            orderUrl: `${process.env.NEXT_PUBLIC_WEB_URL}/confirmation?orderId=${order.id}`
          }),
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't block the order process if email fails
      }

      if (error) {
        console.error('Error creating order:', error)
        alert('Error al crear el pedido. Intenta nuevamente.')
        setIsProcessing(false)
        return
      }

      // Clear cart after successful order
      clearCart()

      // Redirect based on payment method
      if (paymentMethod === "cash") {
        router.push(`/confirmation?payment=cash&orderId=${order.id}`)
      } else {
        router.push(`/confirmation?orderId=${order.id}`)
      }

    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Error al procesar el pago. Intenta nuevamente.')
      setIsProcessing(false)
    }
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
        <div className="bg-black border-b border-gray-900">
          <div className="flex items-center p-4">
            <Link href="/cart">
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
              {items.map((item, index) => (
                <div key={item.variantId} className="flex justify-between items-start">
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
                <span className="text-white">${totalAmount.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {totalItems} {totalItems === 1 ? "producto" : "productos"} • Retiro en evento
              </p>
            </div>
          </Card>

          {/* Customer Information */}
          <Card className="p-4 space-y-4 bg-black border-gray-900">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white">Información de contacto</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Número de identificación nacional"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Pickup Location */}
          <Card className="p-4 space-y-3 bg-black border-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-400" />
                <h3 className="font-semibold text-white">Punto de retiro</h3>
              </div>
              <Link href="/pickup-location">
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                  Cambiar
                </Button>
              </Link>
            </div>
            
            {selectedStand ? (
              <div className="space-y-2">
                <p className="font-medium text-white">{selectedStand.name}</p>
                <p className="text-sm text-gray-400">
                  📍 {selectedStand.location || 'Ubicación por confirmar'}
                  <br />🕐 {selectedStand.operating_hours || 'Horario por confirmar'}
                  <br />
                  ⏱️ Tiempo de espera: 5-10 min
                  <br />📱 Presentá el QR que vas a recibir
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Seleccionando punto de retiro...</p>
            )}
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
            {/* <div
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
            </div> */}
          </Card>

          {/* Payment Button */}
          <div className="space-y-4">
            <Button
              onClick={handlePayment}
              disabled={isProcessing || !paymentMethod || !customerId || !customerEmail || !selectedStand}
              className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                "Procesando..."
              ) : paymentMethod === "card" ? (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pagar con tarjeta
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5 mr-2" />
                  Confirmar pedido
                </>
              )}
            </Button>
            
            {(!customerId || !customerEmail || !selectedStand) && (
              <p className="text-xs text-yellow-400 text-center">
                Completa toda la información para continuar
              </p>
            )}
          </div>
        </div>

        {/* Cash Payment Warning Modal */}
        {showCashWarning && (
          <CashPaymentWarning
            isOpen={showCashWarning}
            onConfirm={handleCashWarningConfirm}
            onClose={handleCashWarningClose}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
