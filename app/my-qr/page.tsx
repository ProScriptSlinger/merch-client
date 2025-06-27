"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, QrCode, Download, Share, Package } from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '@/components/protected-route'
import { QRCodeSVG } from 'qrcode.react'
import { useApp } from '@/contexts/app-context'

type Order = {
  id: string
  customer_name: string
  customer_email: string
  qr_code: string
  status: string
  payment_method: string
  total_amount: number
  created_at: string
  stand_id: string
}

export default function MyQRPage() {
  const { user } = useAuth()
  const { orders } = useApp()
  const [loading, setLoading] = useState(true)

  const downloadQRCode = (qrCode: string, orderId: string) => {
    // Create a canvas element to render the QR code
    const canvas = document.createElement('canvas')
    const svg = document.querySelector(`[data-qr="${qrCode}"]`) as SVGElement

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
              a.download = `qr-${orderId}.png`
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

  const shareQRCode = async (qrCode: string, orderId: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mi QR - Pedido ${orderId.slice(-8)}`,
          text: `Código QR para retirar mi pedido: ${qrCode}`,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(qrCode)
        alert('Código QR copiado al portapapeles')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Cargando códigos QR...</p>
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
            <Link href="/catalog">
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-lg font-semibold ml-4 text-white">Mis Códigos QR</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {orders.length === 0 ? (
            <Card className="p-6 text-center bg-black border-gray-900">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No tenés códigos QR</h3>
              <p className="text-gray-400 mb-4">Aún no has realizado ningún pedido con código QR.</p>
              <Link href="/catalog">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Ir al catálogo
                </Button>
              </Link>
            </Card>
          ) : (
            orders.filter((order) => order.status === "pending").map((order) => (
              <Card key={order.id} className="p-4 bg-black border-gray-900">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">
                      Pedido #{order.id.slice(-8)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="text-center mb-4">
                  <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-900 rounded-xl flex items-center justify-center p-2">
                    <QRCodeSVG
                      value={order.qr_code || ''}
                      size={192}
                      level="M"
                      className="qr-code-svg"
                      bgColor="#ffffff"
                      fgColor="#000000"
                      data-qr={order.qr_code || ''}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2 font-mono">
                    {order.qr_code || ''}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estado:</span>
                    <span className="text-white">{order.status === "pending" ? "Pendiente" : order.status === "waiting_payment" ? "Esperando pago" : order.status === "delivered" ? "Entregado" : order.status === "cancelled" ? "Cancelado"  : order.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white font-semibold">
                      ${order.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                    onClick={() => downloadQRCode(order.qr_code || '', order.id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                    onClick={() => shareQRCode(order.qr_code || '', order.id)}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
} 