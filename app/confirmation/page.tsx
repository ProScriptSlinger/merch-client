"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Check, Download, Share, ArrowLeft, Clock, Banknote, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CountdownTimer } from "@/components/countdown-timer"
import { ExpiredOrderModal } from "@/components/expired-order-modal"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"
import { QRCodeSVG } from "qrcode.react"
import { PaymentUrl } from "@/components/payment-url"

type Order = Database['public']['Tables']['orders']['Row'] & {
  items: Database['public']['Tables']['order_items']['Row'][]
  stand: Database['public']['Tables']['stands']['Row'] | null
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { updateOrderStatus } = useApp()

  const orderId = searchParams?.get("orderId")
  const paymentMethod = searchParams?.get("payment")
  const isCashPayment = paymentMethod === "cash"

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExpired, setIsExpired] = useState(false)
  const [showPaymentUrl, setShowPaymentUrl] = useState(false)



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
    if (!orderId) {
      router.push('/catalog')
      return
    }
    fetchOrder();
    const channel = supabase
      .channel("order_realtime_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        async (payload: any) => {
          console.log(
            "Change detected for order:",
            orderId,
            "Payload:",
            payload
          );
          try {
            if (payload.new?.id == orderId || payload.old?.id == orderId) {
              console.log("Our order changed:", payload);
              await fetchOrder();
            }
          } catch (error) {
            console.error("Error fetching updated profile:", error);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to changes for order ${orderId}`);
        }
        if (err) {
          console.error("Subscription error:", err);
        }
      });
      
      
      return () => {
        supabase.removeChannel(channel);
        console.log(`Unsubscribed from changes for order ${orderId}`);
      };
  }, [orderId, router])

  useEffect(() => {
    if (order?.transaction[0]?.payment_url) {
      setShowPaymentUrl(true)
    }
  }, [order])

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          stand:stands!orders_stand_id_fkey(*),
          transaction:transactions!transactions_order_id_fkey(*)
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
        router.push('/catalog')
        return
      }

      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
      router.push('/catalog')
    } finally {
      setLoading(false)
    }
  }

  const handleOrderExpired = async () => {
    setIsExpired(true)

    // Update order status to cancelled
    if (orderId) {
      await updateOrderStatus(orderId, 'cancelled')
    }
  }

  const handleRetryPurchase = () => {
    router.push('/catalog')
  }

  const handleGoToCatalog = () => {
    router.push('/catalog')
  }

  const shareOrder = async () => {
    if (navigator.share && order) {
      try {
        await navigator.share({
          title: "Mi pedido - KHEA TRAPICHEO",
          text: `Pedido ${order.qr_code} confirmado. ¡Listo para retirar!`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    }
  }

  const downloadQRCode = () => {
    if (order?.qr_code) {
      // Create a canvas element to render the QR code
      const canvas = document.createElement('canvas')
      const svg = document.querySelector('.qr-code-svg') as SVGElement

      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg)
        const img = new Image()

        img.onload = () => {
          canvas.width = 256
          canvas.height = 256
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, 256, 256)
            ctx.drawImage(img, 0, 0, 256, 256)

            // Download the canvas as PNG
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `qr-${order.qr_code}.png`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }
            })
          }
        }

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
      }
    }
  }

  const handlePaymentUrlClose = () => {
    setShowPaymentUrl(false)
  }

  const handlePaymentUrlConfirm = () => {
    setShowPaymentUrl(false)
  }

  console.log('loading ----->', loading)

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Cargando pedido...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-white">Pedido no encontrado</p>
            <Button onClick={() => router.push('/catalog')} className="mt-4">
              Volver al catálogo
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <div className="p-4 max-w-md mx-auto pt-8">
          {/* Success Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto border border-green-800">
              {
                order.status === 'pending' ? (
                  <Clock className="w-8 h-8 text-yellow-400" />
                ) : order.status === 'waiting_payment' ? (
                  <Banknote className="w-8 h-8 text-yellow-400" />
                ) : (
                  <Check className="w-8 h-8 text-green-400" />
                )
              }
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

            <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-900 rounded-xl flex items-center justify-center p-2">
              {order.qr_code ? (
                <QRCodeSVG
                  value={order.qr_code}
                  size={192}
                  level="M"
                  className="qr-code-svg"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
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
              <p className="text-sm text-gray-400">Pedido #{order.qr_code}</p>
            </div>
          </Card>

          {/* Order Details */}
          <Card className="p-4 space-y-3 mb-6 bg-black border-gray-900">
            <h3 className="font-semibold text-white">Detalles del pedido</h3>
            <div className="space-y-2 text-sm">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-400">
                    {item.quantity}x Producto #{item.product_variant_id}
                  </span>
                  <span className="text-white">${(item.unit_price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-900 flex justify-between font-semibold">
                <span className="text-white">Total</span>
                <span className="text-white">${order.total_amount.toLocaleString()}</span>
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
                <strong className="text-white">📍 Ubicación:</strong> {order.stand?.name || 'Stand por confirmar'}
              </p>
              <p className="text-xs text-gray-500 ml-4">{order.stand?.location || 'Ubicación por confirmar'}</p>
              <p>
                <strong className="text-white">🕐 Horario:</strong> {order.stand?.operating_hours || 'Horario por confirmar'}
              </p>
              <p>
                <strong className="text-white">⏱️ Tiempo estimado:</strong> 5-10 min de espera
              </p>
              <p>
                <strong className="text-white">📱 Importante:</strong> Tené este QR listo en tu celular
              </p>
              {isCashPayment && (
                <p>
                  <strong className="text-white">💰 Efectivo:</strong> Llevá el monto exacto (${order.total_amount.toLocaleString()})
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
              onClick={downloadQRCode}
              variant="outline"
              className="w-full h-12 border-gray-900 bg-black hover:bg-gray-900 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Guardar QR
            </Button>

            {
              order.status === 'waiting_payment' && (
                <Button
                  onClick={() => setShowPaymentUrl(true)}
                  variant="outline"
                  className="w-full h-12 border-gray-900 bg-black hover:bg-gray-900 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Pagar con tarjeta
                </Button>
              )
            }

            <Button
              onClick={handleGoToCatalog}
              variant="outline"
              className="w-full h-12 border-gray-900 bg-black hover:bg-gray-900 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Seguir comprando
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
        {isExpired && (
          <ExpiredOrderModal
            isOpen={isExpired}
            orderNumber={order.qr_code || ''}
            onRetryPurchase={handleRetryPurchase}
            onGoToCatalog={handleGoToCatalog}
          />
        )}
        <PaymentUrl
          paymentUrl={order.transaction[0]?.payment_url || ''}
          isOpen={showPaymentUrl}
          onClose={handlePaymentUrlClose}
          onConfirm={handlePaymentUrlConfirm}
        />
      </div>
    </ProtectedRoute>
  )
}
