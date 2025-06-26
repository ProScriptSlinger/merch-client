"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '@/components/protected-route'

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

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
      } else {
        setOrders(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Package className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'delivered':
        return 'Entregado'
      case 'cancelled':
        return 'Cancelado'
      case 'waiting_payment':
        return 'Esperando Pago'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Cargando pedidos...</p>
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
            <h1 className="text-lg font-semibold ml-4 text-white">Mis Pedidos</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {orders.length === 0 ? (
            <Card className="p-6 text-center bg-black border-gray-900">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No tenés pedidos</h3>
              <p className="text-gray-400 mb-4">Aún no has realizado ningún pedido.</p>
              <Link href="/catalog">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Ir al catálogo
                </Button>
              </Link>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="p-4 bg-black border-gray-900">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="text-white font-medium">
                      Pedido #{order.id.slice(-8)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estado:</span>
                    <span className="text-white">{getStatusText(order.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white font-semibold">
                      ${order.total_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Método de pago:</span>
                    <span className="text-white">{order.payment_method}</span>
                  </div>
                  {order.qr_code && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Código QR:</span>
                      <span className="text-white font-mono text-sm">{order.qr_code}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800">
                  <Link href={`/confirmation?orderId=${order.id}`}>
                    <Button variant="outline" size="sm" className="w-full border-gray-700 text-white hover:bg-gray-800">
                      Ver detalles
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
} 