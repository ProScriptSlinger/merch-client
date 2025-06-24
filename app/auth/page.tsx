"use client"

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { ShoppingBag, MapPin, CreditCard, DollarSign, QrCode } from 'lucide-react'

export default function AuthPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/catalog')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="text-center p-6 border-b border-gray-900">
        <h1 className="text-2xl font-bold text-white mb-2">KHEA</h1>
        <p className="text-gray-400">TRAPICHEO - ESTADIO OBRAS</p>
      </div>

      {/* Auth Content */}
      <div className="flex-1 p-6 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-white">¡Bienvenido!</h2>
            <p className="text-gray-400">Comprá merchandising oficial del evento de forma rápida y fácil</p>
          </div>

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

          {/* Supabase Auth UI */}
          <div className="bg-black border border-gray-900 rounded-lg p-6">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#3b82f6',
                      brandAccent: '#1d4ed8',
                      brandButtonText: '#ffffff',
                      defaultButtonBackground: '#1f2937',
                      defaultButtonBackgroundHover: '#374151',
                      defaultButtonBorder: '#374151',
                      defaultButtonText: '#ffffff',
                      dividerBackground: '#374151',
                      inputBackground: '#111827',
                      inputBorder: '#374151',
                      inputBorderHover: '#4b5563',
                      inputBorderFocus: '#3b82f6',
                      inputText: '#ffffff',
                      inputLabelText: '#d1d5db',
                      inputPlaceholder: '#6b7280',
                      messageText: '#d1d5db',
                      messageTextDanger: '#ef4444',
                      anchorTextColor: '#3b82f6',
                      anchorTextHoverColor: '#60a5fa',
                    },
                    space: {
                      inputPadding: '12px',
                      buttonPadding: '12px',
                    },
                    fontSizes: {
                      baseBodySize: '14px',
                      baseInputSize: '14px',
                      baseLabelSize: '14px',
                      baseButtonSize: '14px',
                    },
                    fonts: {
                      bodyFontFamily: 'Inter, system-ui, sans-serif',
                      buttonFontFamily: 'Inter, system-ui, sans-serif',
                      inputFontFamily: 'Inter, system-ui, sans-serif',
                      labelFontFamily: 'Inter, system-ui, sans-serif',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '8px',
                      buttonBorderRadius: '8px',
                      inputBorderRadius: '8px',
                    },
                  },
                },
                className: {
                  anchor: 'text-blue-400 hover:text-blue-300',
                  button: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors',
                  container: 'space-y-4',
                  divider: 'bg-gray-700',
                  input: 'bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
                  label: 'text-gray-300 font-medium',
                  loader: 'text-blue-400',
                  message: 'text-red-400 text-sm',
                },
              }}
              providers={['google']}
              redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
              showLinks={true}
              view="sign_in"
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Contraseña',
                    button_label: 'Iniciar sesión',
                    loading_button_label: 'Iniciando sesión...',
                    social_provider_text: 'Continuar con {{provider}}',
                    link_text: '¿No tenés cuenta? Creá una',
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Contraseña',
                    button_label: 'Crear cuenta',
                    loading_button_label: 'Creando cuenta...',
                    social_provider_text: 'Continuar con {{provider}}',
                    link_text: '¿Ya tenés cuenta? Iniciá sesión',
                  },
                  forgotten_password: {
                    email_label: 'Email',
                    button_label: 'Enviar instrucciones',
                    loading_button_label: 'Enviando...',
                    link_text: '¿Olvidaste tu contraseña?',
                  },
                },
              }}
            />
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center">
            Al continuar, aceptás nuestros términos y condiciones
          </p>
        </div>
      </div>
    </div>
  )
} 