"use client"

import type React from "react"
import { useState } from "react"
import { Mail, ShoppingBag, MapPin, CreditCard, QrCode, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"

export default function WelcomePage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/catalog"
    }, 1500)
  }

  const handleGoogleLogin = () => {
    setIsLoading(true)
    // Simulate Google auth
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/catalog"
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="text-center p-6 border-b border-gray-900">
        <h1 className="text-2xl font-bold text-white mb-2">KHEA</h1>
        <p className="text-gray-400">TRAPICHEO - ESTADIO OBRAS</p>
      </div>

      {/* Welcome Content */}
      <div className="flex-1 p-6 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-white">¡Bienvenido!</h2>
            <p className="text-gray-400">Comprá merchandising oficial del evento de forma rápida y fácil</p>
          </div>

          {/* How it Works */}
          <Card className="p-4 bg-black border-gray-900">
            <h3 className="font-semibold text-white mb-4 text-center">¿Cómo funciona?</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Elegí tus productos favoritos</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Seleccioná dónde retirar</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    <DollarSign className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm text-gray-300">Pagá con tarjeta o efectivo</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  4
                </div>
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Retirá con tu QR</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 bg-green-900/20 border-green-800 text-center">
              <p className="text-sm font-medium text-green-300">Sin filas</p>
              <p className="text-xs text-green-400">Retiro rápido</p>
            </Card>
            <Card className="p-3 bg-blue-900/20 border-blue-800 text-center">
              <p className="text-sm font-medium text-blue-300">Pago seguro</p>
              <p className="text-xs text-blue-400">Mercado Pago</p>
            </Card>
          </div>

          {/* Login Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white text-center">Iniciá sesión para comenzar</h3>

            {/* Google Login */}
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-12 text-base font-semibold border-gray-900 bg-black hover:bg-gray-900 text-white"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? "Conectando..." : "Continuar con Google"}
            </Button>

            <div className="relative">
              <Separator className="bg-gray-800" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black px-4 text-sm text-gray-400">o</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-black border-gray-900 text-white placeholder:text-gray-500 focus:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 bg-black border-gray-900 text-white placeholder:text-gray-500 focus:border-gray-600"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-gray-200"
                disabled={isLoading}
              >
                <Mail className="w-4 h-4 mr-2" />
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>

            <p className="text-xs text-gray-500 text-center">Al continuar, aceptás nuestros términos y condiciones</p>
          </div>
        </div>
      </div>
    </div>
  )
}
