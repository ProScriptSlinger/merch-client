"use client"

import { useState } from "react"
import Link from "next/link"
import { QrCode, Package, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DashboardStats {
  totalOrders: number
  pendingPickups: number
  completedToday: number
  revenue: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  items: number
  total: number
  status: string
  createdAt: string
}

const mockStats: DashboardStats = {
  totalOrders: 156,
  pendingPickups: 23,
  completedToday: 89,
  revenue: 2450000,
}

const mockRecentOrders: RecentOrder[] = [
  {
    id: "1",
    orderNumber: "EVT-2024-ABC123",
    customerName: "Juan Pérez",
    items: 3,
    total: 32000,
    status: "ready",
    createdAt: "2024-12-15T14:30:00Z",
  },
  {
    id: "2",
    orderNumber: "EVT-2024-DEF456",
    customerName: "María García",
    items: 2,
    total: 23500,
    status: "paid",
    createdAt: "2024-12-15T14:15:00Z",
  },
  {
    id: "3",
    orderNumber: "EVT-2024-GHI789",
    customerName: "Carlos López",
    items: 1,
    total: 8500,
    status: "completed",
    createdAt: "2024-12-15T13:45:00Z",
  },
]

export default function StaffDashboardPage() {
  const [staffMember] = useState("María González")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-900/50 text-green-300 border-green-800"
      case "paid":
        return "bg-blue-900/50 text-blue-300 border-blue-800"
      case "completed":
        return "bg-gray-900/50 text-gray-300 border-gray-800"
      case "pending":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-800"
      default:
        return "bg-gray-900/50 text-gray-300 border-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready":
        return "Listo"
      case "paid":
        return "Pagado"
      case "completed":
        return "Entregado"
      case "pending":
        return "Pendiente"
      default:
        return "Desconocido"
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black border-b border-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Panel de Staff</h1>
            <p className="text-sm text-gray-400">Bienvenido, {staffMember}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Stand Principal</p>
            <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          <Link href="/validate-qr">
            <Button className="w-full h-16 text-lg font-semibold bg-white text-black hover:bg-gray-200">
              <QrCode className="w-6 h-6 mr-3" />
              Escanear QR de Cliente
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-black border-gray-900">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{mockStats.totalOrders}</p>
                <p className="text-sm text-gray-400">Pedidos Total</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-black border-gray-900">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{mockStats.pendingPickups}</p>
                <p className="text-sm text-gray-400">Pendientes</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-black border-gray-900">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{mockStats.completedToday}</p>
                <p className="text-sm text-gray-400">Entregados Hoy</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-black border-gray-900">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">${(mockStats.revenue / 1000).toFixed(0)}K</p>
                <p className="text-sm text-gray-400">Ventas Hoy</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="p-4 bg-black border-gray-900">
          <h3 className="font-semibold text-white mb-4">Pedidos Recientes</h3>
          <div className="space-y-3">
            {mockRecentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-white">{order.orderNumber}</p>
                    <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                  </div>
                  <p className="text-sm text-gray-400">{order.customerName}</p>
                  <p className="text-xs text-gray-500">
                    {order.items} items • ${order.total.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  {order.status === "ready" && <AlertCircle className="w-4 h-4 text-green-400 ml-auto mt-1" />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-4 bg-black border-gray-900">
          <h3 className="font-semibold text-white mb-4">Estado del Stand</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tiempo promedio de entrega</span>
              <span className="text-white font-semibold">3.2 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Cola actual</span>
              <span className="text-white font-semibold">5 personas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Stock disponible</span>
              <span className="text-green-400 font-semibold">85%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
