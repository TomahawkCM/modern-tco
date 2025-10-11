"use client"

import React from "react"
import { motion } from "framer-motion"
import { CircuitPattern } from "./CircuitPattern"

export interface CyberpunkCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  circuit?: boolean
}

export const CyberpunkCard: React.FC<CyberpunkCardProps> = ({ 
  children, 
  className = "",
  hover = true,
  glow = true,
  circuit = true
}) => {
  const baseClasses = "relative bg-black/20 backdrop-blur-xl border border-primary/20 rounded-xl"
  const glowClasses = glow ? "shadow-[0_0_50px_rgba(34,211,238,0.1)]" : ""
  const hoverClasses = hover ? "transition-all duration-200 ease-out hover:shadow-[0_0_80px_rgba(34,211,238,0.15)] hover:scale-[1.03] hover:-translate-y-0.5" : ""
  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_80px_rgba(34,211,238,0.15)]"

  return (
    <motion.div
      className={`${baseClasses} ${glowClasses} ${hoverClasses} ${focusClasses} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      tabIndex={0}
    >
      {/* Circuit Pattern Background */}
      {circuit && <CircuitPattern className="opacity-10" />}
      
      {/* Animated Border Glow */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-sky-400 to-primary rounded-xl opacity-20 blur-sm animate-pulse"></div>
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  )
}

export default CyberpunkCard