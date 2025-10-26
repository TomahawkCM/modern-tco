"use client"

import React from "react"

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-gray-900/90 via-black/95 to-gray-900/90" />
  )
}
