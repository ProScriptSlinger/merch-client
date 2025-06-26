"use client"

import React from 'react'
import { QrCode, Package, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function MyInformationBanner() {
  const { user } = useAuth()
  const router = useRouter()

  const handleMyOrders = () => {
    router.push('/orders')
  }

  const handleMyQR = () => {
    router.push('/my-qr')
  }

  if (!user) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 border-blue-500 shadow-lg"
          >
            <QrCode className="w-6 h-6 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-black border-gray-800"
          sideOffset={8}
        >
          <div className="p-2">
            <div className="flex items-center gap-2 px-2 py-1">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-blue-600 text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-300 truncate">
                {user.email}
              </span>
            </div>
          </div>
          
          <DropdownMenuItem
            onClick={handleMyOrders}
            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-gray-800 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Mis Pedidos</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={handleMyQR}
            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-gray-800 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Mi QR</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 