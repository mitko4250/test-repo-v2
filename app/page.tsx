'use client'

import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"

export default function Page() {
  const handleClick = () => {
    const duration = 2 * 1000
    const animationEnd = Date.now() + duration

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2,
        },
      })

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2,
        },
      })
    }, 250)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6">
      <div className="w-full max-w-md text-center space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          🎉 Celebrate!
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Click the button below to launch confetti.
        </p>
        <Button
          size="lg"
          className="w-full sm:w-auto px-8 py-6 text-base sm:text-lg active:scale-95 transition-transform"
          onClick={handleClick}
        >
          Throw Confetti 🎊
        </Button>
      </div>
    </main>
  )
}
