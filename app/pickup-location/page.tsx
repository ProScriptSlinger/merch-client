"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Clock, Users, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PickupLocation {
  id: string
  name: string
  address: string
  description: string
  hours: string
  waitTime: string
  capacity: "low" | "medium" | "high"
  features: string[]
}

const pickupLocations: PickupLocation[] = [
  {
    id: "main-stand",
    name: "Stand Principal",
    address: "Sector A - Entrada principal",
    description: "Ubicación principal con mayor stock disponible",
    hours: "10:00 - 22:00",
    waitTime: "5-10 min",
    capacity: "high",
    features: ["Stock completo", "Atención rápida", "Fácil acceso"],
  },
  {
    id: "food-court",
    name: "Patio de Comidas",
    address: "Sector B - Junto al food court",
    description: "Punto de retiro cerca del área gastronómica",
    hours: "11:00 - 21:00",
    waitTime: "2-5 min",
    capacity: "low",
    features: ["Sin filas", "Cerca de restaurantes", "Ambiente relajado"],
  },
  {
    id: "main-stage",
    name: "Escenario Principal",
    address: "Sector C - Lateral del escenario",
    description: "Ideal si vas a ver los shows principales",
    hours: "12:00 - 20:00",
    waitTime: "3-8 min",
    capacity: "medium",
    features: ["Cerca del escenario", "Horario extendido", "Stock limitado"],
  },
  {
    id: "vip-area",
    name: "Área VIP",
    address: "Sector D - Zona exclusiva",
    description: "Retiro express para experiencia premium",
    hours: "14:00 - 19:00",
    waitTime: "1-2 min",
    capacity: "low",
    features: ["Atención premium", "Sin esperas", "Acceso VIP requerido"],
  },
]

export default function PickupLocationPage() {
  const [selectedLocation, setSelectedLocation] = useState<string>("")

  const getCapacityColor = (capacity: string) => {
    switch (capacity) {
      case "low":
        return "bg-green-900/50 text-green-300 border-green-800"
      case "medium":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-800"
      case "high":
        return "bg-red-900/50 text-red-300 border-red-800"
      default:
        return "bg-gray-900/50 text-gray-300 border-gray-800"
    }
  }

  const getCapacityText = (capacity: string) => {
    switch (capacity) {
      case "low":
        return "Poca espera"
      case "medium":
        return "Espera moderada"
      case "high":
        return "Mayor espera"
      default:
        return "Sin info"
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-gray-900 z-10">
        <div className="flex items-center p-4">
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-lg font-semibold ml-4 text-white">Punto de retiro</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-bold text-white">¿Dónde querés retirar tu pedido?</h2>
          <p className="text-gray-400">Elegí la ubicación más conveniente para vos</p>
        </div>

        {/* Location Cards */}
        <div className="space-y-4">
          {pickupLocations.map((location) => (
            <Card
              key={location.id}
              className={`p-4 cursor-pointer transition-all duration-200 bg-black border-gray-900 ${
                selectedLocation === location.id
                  ? "ring-2 ring-white border-white bg-gray-900"
                  : "hover:border-gray-800"
              }`}
              onClick={() => setSelectedLocation(location.id)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-white">{location.name}</h3>
                      {selectedLocation === location.id && <Check className="w-5 h-5 text-green-400" />}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{location.address}</span>
                    </div>
                  </div>
                  <Badge className={getCapacityColor(location.capacity)}>{getCapacityText(location.capacity)}</Badge>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm">{location.description}</p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-white">Horario</p>
                      <p className="text-gray-400">{location.hours}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-white">Tiempo de espera</p>
                      <p className="text-gray-400">{location.waitTime}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {location.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-black text-gray-300 border-gray-900">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <Link href={selectedLocation ? "/checkout" : "#"}>
            <Button
              className="w-full h-14 text-lg font-semibold bg-white text-black hover:bg-gray-200"
              disabled={!selectedLocation}
            >
              Continuar al checkout
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">💡 Podés cambiar el punto de retiro hasta confirmar tu compra</p>
        </div>
      </div>
    </div>
  )
}
