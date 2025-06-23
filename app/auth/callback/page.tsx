"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth callback error:', error)
        router.push('/auth')
        return
      }

      if (data.session) {
        // Check if user profile exists, if not create one
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // User profile doesn't exist, create one
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: data.session.user.id,
              email: data.session.user.email!,
              full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name,
              role: 'staff',
            })

          if (createError) {
            console.error('Error creating user profile:', createError)
          }
        }

        router.push('/catalog')
      } else {
        router.push('/auth')
      }
    }

    handleAuthCallback()
  }, [router, isClient])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Procesando autenticación...</p>
      </div>
    </div>
  )
} 