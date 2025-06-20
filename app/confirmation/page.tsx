"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Check, Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CountdownTimer } from "@/components/countdown-timer"
import { ExpiredOrderModal } from "@/components/expired-order-modal"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const paymentMethod = searchParams?.get("payment")
  const isCashPayment = paymentMethod === "cash"

  const [orderNumber] = useState("EVT-2024-" + Math.random().toString(36).substr(2, 6).toUpperCase())
  const [qrGenerated, setQrGenerated] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  // Para efectivo, crear fecha de expiración (30 minutos desde ahora)
  const [expirationDate] = useState(() => {
    if (isCashPayment) {
      const expiry = new Date()
      expiry.setMinutes(expiry.getMinutes() + 30)
      return expiry
    }
    return null
  })

  useEffect(() => {
    // Simulate QR generation
    const timer = setTimeout(() => {
      setQrGenerated(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleOrderExpired = () => {
    setIsExpired(true)
  }

  const handleRetryPurchase = () => {
    // Redirigir al checkout manteniendo el carrito
    window.location.href = "/checkout"
  }

  const handleGoToCatalog = () => {
    window.location.href = "/catalog"
  }

  const shareOrder = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi pedido - KHEA TRAPICHEO",
          text: `Pedido ${orderNumber} confirmado. ¡Listo para retirar!`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="p-4 max-w-md mx-auto pt-8">
        {/* Success Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto border border-green-800">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">¡Listo!</h1>
            <p className="text-gray-400">{isCashPayment ? "Tu reserva fue confirmada" : "Tu compra fue confirmada"}</p>
          </div>
        </div>

        {/* Countdown Timer for Cash Payments */}
        {isCashPayment && expirationDate && !isExpired && (
          <div className="mb-6">
            <CountdownTimer expiresAt={expirationDate} onExpired={handleOrderExpired} />
          </div>
        )}

        {/* QR Code Section */}
        <Card className="p-6 text-center space-y-4 mb-6 bg-black border-gray-900">
          <h2 className="text-lg font-semibold text-white">
            {isCashPayment ? "QR para retiro y pago" : "QR para retiro"}
          </h2>

          <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-900 rounded-xl flex items-center justify-center">
            {qrGenerated ? (
              <div className="w-40 h-40 bg-black rounded-lg flex items-center justify-center">
                <div className="w-36 h-36 bg-white rounded grid grid-cols-8 gap-px p-2">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={`w-full h-full ${Math.random() > 0.5 ? "bg-black" : "bg-white"}`} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-500">Generando QR...</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-white">
              {isCashPayment
                ? "Mostrá este QR en el stand para pagar y retirar"
                : "Mostrá este QR en el stand para retirar tu compra"}
            </p>
            <p className="text-sm text-gray-400">Pedido #{orderNumber}</p>
          </div>
        </Card>

        {/* Order Details */}
        <Card className="p-4 space-y-3 mb-6 bg-black border-gray-900">
          <h3 className="font-semibold text-white">Detalles del pedido</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">2x Remera Básica (M)</span>
              <span className="text-white">$17.000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">1x Hoodie Premium (L)</span>
              <span className="text-white">$15.000</span>
            </div>
            <div className="pt-2 border-t border-gray-900 flex justify-between font-semibold">
              <span className="text-white">Total</span>
              <span className="text-white">$32.000</span>
            </div>
            {isCashPayment && (
              <div className="pt-2 border-t border-gray-900">
                <p className="text-yellow-400 text-xs">💰 Pago en efectivo al retirar</p>
              </div>
            )}
          </div>
        </Card>

        {/* Pickup Instructions */}
        <Card className="p-4 space-y-2 mb-6 bg-black border-gray-900">
          <h3 className="font-semibold text-white">Instrucciones de retiro</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <p>
              <strong className="text-white">📍 Ubicación:</strong> Stand Principal
            </p>
            <p className="text-xs text-gray-500 ml-4">Sector A - Entrada principal</p>
            <p>
              <strong className="text-white">🕐 Horario:</strong> 10:00 - 22:00
            </p>
            <p>
              <strong className="text-white">⏱️ Tiempo estimado:</strong> 5-10 min de espera
            </p>
            <p>
              <strong className="text-white">📱 Importante:</strong> Tené este QR listo en tu celular
            </p>
            {isCashPayment && (
              <p>
                <strong className="text-white">💰 Efectivo:</strong> Llevá el monto exacto ($32.000)
              </p>
            )}
          </div>
          <div className="pt-2 border-t border-gray-900">
            <p className="text-xs text-gray-500">¿Necesitás cambiar el punto de retiro? Contactanos en el evento.</p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={shareOrder}
            variant="outline"
            className="w-full h-12 border-gray-900 bg-black hover:bg-gray-900 text-white"
          >
            <Share className="w-4 h-4 mr-2" />
            Compartir pedido
          </Button>

          <Button
            onClick={() => window.print()}
            variant="outline"
            className="w-full h-12 border-gray-900 bg-black hover:bg-gray-900 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Guardar QR
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <p className="text-sm text-gray-500">
            ¿Problemas con tu pedido?
            <br />
            Contactanos en el stand o por WhatsApp
          </p>
        </div>
      </div>

      {/* Expired Order Modal */}
      <ExpiredOrderModal
        isOpen={isExpired}
        orderNumber={orderNumber}
        onRetryPurchase={handleRetryPurchase}
        onGoToCatalog={handleGoToCatalog}
      />
    </div>
  )
}
