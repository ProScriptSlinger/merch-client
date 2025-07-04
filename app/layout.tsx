import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { AppProvider } from "@/contexts/app-context"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "sonner"
import { MyInformationBanner } from "@/components/my-information-banner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Merch Store - Evento 2025",
  description: "Tienda de merchandising para eventos",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>
            <CartProvider>
              {children}
              <MyInformationBanner />
              <Toaster />
            </CartProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
