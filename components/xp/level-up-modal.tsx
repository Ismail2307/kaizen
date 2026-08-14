"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Zap, Trophy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getLeague } from "@/lib/utils"

interface LevelUpModalProps {
  newLevel: number
  open: boolean
  onClose: () => void
}

export function LevelUpModal({ newLevel, open, onClose }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const league = getLeague(newLevel)

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowConfetti(true), 300)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-gold/30 bg-gradient-to-b from-card to-card/95">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold gold-gradient">
            Level Up!
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          {/* Animated level badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gold to-amber-500 shadow-lg shadow-gold/30">
              <Star className="h-10 w-10 text-white" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-kaizen-500 text-white font-bold text-lg shadow-lg"
            >
              {newLevel}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center space-y-2"
          >
            <p className="text-xl font-bold">
              You reached Level {newLevel}!
            </p>
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-4 w-4 text-gold" />
              <span className="text-sm text-muted-foreground">
                {league} League
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Keep pushing forward. Every step counts on your journey to mastery.
            </p>
          </motion.div>

          {/* Sparkle effects */}
          <AnimatePresence>
            {showConfetti && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: 0,
                      x: 0,
                      y: 0,
                      scale: 0,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: (Math.random() - 0.5) * 200,
                      y: (Math.random() - 0.5) * 200 - 50,
                      scale: [0, 1.5, 0],
                      rotate: Math.random() * 360,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                    className="absolute"
                  >
                    <Sparkles className="h-4 w-4 text-gold" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        <Button onClick={onClose} className="w-full gold-gradient text-black font-bold">
          <Zap className="mr-2 h-4 w-4" />
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  )
}
