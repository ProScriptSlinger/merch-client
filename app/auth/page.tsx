"use client"

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
              showLinks={false}
              view="sign_in"
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Contraseña',
                    button_label: 'Iniciar sesión',
                    loading_button_label: 'Iniciando sesión...',
                    social_provider_text: 'Continuar con {{provider}}',
                    link_text: '¿Ya tenés cuenta? Iniciá sesión',
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Contraseña',
                    button_label: 'Crear cuenta',
                    loading_button_label: 'Creando cuenta...',
                    social_provider_text: 'Continuar con {{provider}}',
                    link_text: '¿No tenés cuenta? Creá una',
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