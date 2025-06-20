"use client"

import { useEffect, useState } from "react"
import { Clock, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"

interface CountdownTimerProps {
  expiresAt: Date
  onExpired: () => void
}

export function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number
    seconds: number
    total: number
  }>({ minutes: 0, seconds: 0, total: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = expiresAt.getTime()
      const difference = expiry - now

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({
          minutes,
          seconds,
          total: difference,
        })
      } else {
        setTimeLeft({ minutes: 0, seconds: 0, total: 0 })
        onExpired()
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, onExpired])

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (timeLeft.total <= 5 * 60 * 1000) {
      // Últimos 5 minutos
      return "border-red-800 bg-red-900/20"
    } else if (timeLeft.total <= 10 * 60 * 1000) {
      // Últimos 10 minutos
      return "border-yellow-800 bg-yellow-900/20"
    }
    return "border-green-800 bg-green-900/20"
  }

  const getTextColor = () => {
    if (timeLeft.total <= 5 * 60 * 1000) {
      return "text-red-300"
    } else if (timeLeft.total <= 10 * 60 * 1000) {
      return "text-yellow-300"
    }
    return "text-green-300"
  }

  const getIconColor = () => {
    if (timeLeft.total <= 5 * 60 * 1000) {
      return "text-red-400"
    } else if (timeLeft.total <= 10 * 60 * 1000) {
      return "text-yellow-400"
    }
    return "text-green-400"
  }

  if (timeLeft.total <= 0) {
    return null // El componente padre manejará el estado expirado
  }

  return (
    <Card className={`p-4 border ${getTimerColor()}`}>
      <div className="flex items-center gap-3">
        {timeLeft.total <= 5 * 60 * 1000 ? (
          <AlertTriangle className={`w-6 h-6 ${getIconColor()} animate-pulse`} />
        ) : (
          <Clock className={`w-6 h-6 ${getIconColor()}`} />
        )}
        <div className="flex-1">
          <p className="text-white font-semibold">⏳ Tiempo restante para retirar tu compra:</p>
          <p className={`text-2xl font-bold ${getTextColor()}`}>{formatTime(timeLeft.minutes, timeLeft.seconds)}</p>
        </div>
      </div>

      {timeLeft.total <= 10 * 60 * 1000 && (
        <div className="mt-3 text-sm">
          <p className={getTextColor()}>
            {timeLeft.total <= 5 * 60 * 1000 ? "⚠️ ¡Apurate! Quedan pocos minutos" : "💡 Dirigite al punto de retiro"}
          </p>
        </div>
      )}
    </Card>
  )
}
