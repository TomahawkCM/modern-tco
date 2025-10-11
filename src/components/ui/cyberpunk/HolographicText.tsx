"use client"

import React from "react"

export interface HolographicTextProps {
  children: React.ReactNode
  className?: string
}

export const HolographicText: React.FC<HolographicTextProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-sky-400 to-primary bg-clip-text text-transparent blur-sm">
        {children}
      </div>
      <div className="relative bg-gradient-to-r from-primary via-sky-400 to-primary bg-clip-text text-transparent">
        {children}
      </div>
    </div>
  )
}

export default HolographicText