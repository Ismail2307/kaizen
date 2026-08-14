"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Coins, Star, Zap } from "lucide-react"

interface XpToastProps {
  amount: number
  source: string
  onComplete?: () => void
}

export function XpToast({ amount, source, onComplete }: XpToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 lg:left-auto lg:right-6 lg:translate-x-0"
        >
          <div className="flex items-center gap-3 rounded-xl border border-gold/30 bg-gradient-to-r from-gold/20 to-amber-500/10 backdrop-blur-xl px-5 py-3 shadow-lg shadow-gold/10">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Coins className="h-6 w-6 text-gold" />
            </motion.div>
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold text-gold"
              >
                +{amount} XP
              </motion.p>
              <p className="text-xs text-muted-foreground capitalize">{source}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
