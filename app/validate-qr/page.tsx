"use client"

import { useState } from "react"
import { QrCode, CheckCircle, XCircle, Package, User, MapPin, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface OrderData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
    size: string
    quantity: number
    price: number
  }>
  total: number
  pickupLocation: string
  status: string
  createdAt: string
}

// Datos simulados del pedido
const mockOrderData: OrderData = {
  orderNumber: "EVT-2024-ABC123",
  customerName: "Juan Pérez",
  customerEmail: "juan@email.com",
  items: [
    { name: "Remera Básica", size: "M", quantity: 2, price: 8500 },
    { name: "Hoodie Premium", size: "L", quantity: 1, price: 15000 },
  ],
  total: 32000,
  pickupLocation: "Stand Principal",
  status: "ready",
  createdAt: "2024-12-15T14:30:00Z",
}

export default function ValidateQRPage() {
  const [qrCode, setQrCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "valid" | "invalid" | "delivered">(
    "idle",
  )
  const [staffMember, setStaffMember] = useState("María González")

  const handleQRScan = () => {
    if (!qrCode.trim()) return

    setIsScanning(true)
    setValidationStatus("validating")

    // Simular validación del QR
    setTimeout(() => {
      if (qrCode.includes("EVT-2024")) {
        setOrderData(mockOrderData)
        setValidationStatus("valid")
      } else {
        setValidationStatus("invalid")
      }
      setIsScanning(false)
    }, 2000)
  }

  const handleDelivery = () => {
    setValidationStatus("delivered")
    // Aquí se actualizaría la base de datos
  }

  const resetValidation = () => {
    setQrCode("")
    setOrderData(null)
    setValidationStatus("idle")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-900/50 text-green-300 border-green-800"
      case "paid":
        return "bg-blue-900/50 text-blue-300 border-blue-800"
      case "pending":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-800"
      default:
        return "bg-gray-900/50 text-gray-300 border-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready":
        return "Listo para retiro"
      case "paid":
        return "Pagado"
      case "pending":
        return "Pendiente"
      default:
        return "Desconocido"
    }
  }

  if (validationStatus === "delivered") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto border border-green-800">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">¡Entrega Completada!</h1>
            <p className="text-gray-400">Pedido {orderData?.orderNumber} entregado exitosamente</p>
          </div>

          <Card className="p-4 bg-black border-gray-900 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Cliente:</span>
                <span className="text-white">{orderData?.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="text-white">${orderData?.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Entregado por:</span>
                <span className="text-white">{staffMember}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hora:</span>
                <span className="text-white">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </Card>

          <Button onClick={resetValidation} className="w-full h-12 bg-white text-black hover:bg-gray-200">
            Escanear Siguiente QR
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black border-b border-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Validación de QR</h1>
            <p className="text-sm text-gray-400">Staff: {staffMember}</p>
          </div>
          <QrCode className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* QR Scanner Section */}
        <Card className="p-6 bg-black border-gray-900">
          <div className="space-y-4">
            <div className="text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-white">Escanear QR del Cliente</h2>
              <p className="text-sm text-gray-400">Ingresá o escaneá el código QR del pedido</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="qr-input" className="text-gray-300">
                Código QR
              </Label>
              <Input
                id="qr-input"
                type="text"
                placeholder="QR-EVT-2024-ABC123-..."
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                className="h-12 bg-black border-gray-900 text-white placeholder:text-gray-500"
                disabled={isScanning}
              />

              <Button
                onClick={handleQRScan}
                disabled={!qrCode.trim() || isScanning}
                className="w-full h-12 bg-white text-black hover:bg-gray-200"
              >
                {isScanning ? "Validando..." : "Validar QR"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Validation Status */}
        {validationStatus === "validating" && (
          <Card className="p-4 bg-black border-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-white">Validando código QR...</span>
            </div>
          </Card>
        )}

        {validationStatus === "invalid" && (
          <Card className="p-4 bg-red-900/20 border-red-800">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-400" />
              <div>
                <p className="font-semibold text-red-300">QR Inválido</p>
                <p className="text-sm text-red-400">El código no corresponde a ningún pedido válido</p>
              </div>
            </div>
          </Card>
        )}

        {/* Order Details */}
        {validationStatus === "valid" && orderData && (
          <div className="space-y-4">
            {/* Order Status */}
            <Card className="p-4 bg-black border-gray-900">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Estado del Pedido</h3>
                <Badge className={getStatusColor(orderData.status)}>{getStatusText(orderData.status)}</Badge>
              </div>

              {orderData.status !== "ready" && (
                <div className="flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <p className="text-sm text-yellow-300">Este pedido no está listo para retiro</p>
                </div>
              )}
            </Card>

            {/* Customer Info */}
            <Card className="p-4 bg-black border-gray-900">
              <h3 className="font-semibold text-white mb-3">Información del Cliente</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{orderData.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📧</span>
                  <span className="text-gray-300">{orderData.customerEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{orderData.pickupLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">
                    {new Date(orderData.createdAt).toLocaleDateString()} -{" "}
                    {new Date(orderData.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-4 bg-black border-gray-900">
              <h3 className="font-semibold text-white mb-3">Items del Pedido</h3>
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-sm text-gray-400">
                          Talle: {item.size} • Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-white">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}

                <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-xl text-white">${orderData.total.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {orderData.status === "ready" ? (
                <Button
                  onClick={handleDelivery}
                  className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirmar Entrega
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full h-14 text-lg font-semibold bg-gray-800 text-gray-400 cursor-not-allowed"
                >
                  No Disponible para Entrega
                </Button>
              )}

              <Button
                onClick={resetValidation}
                variant="outline"
                className="w-full h-12 border-gray-900 bg-black hover:bg-gray-900 text-white"
              >
                Cancelar / Nuevo Escaneo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
