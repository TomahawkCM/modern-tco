"use client"

import React from "react"

export interface CircuitPatternProps {
  className?: string
}

export const CircuitPattern: React.FC<CircuitPatternProps> = ({ className }) => {
  return (
    <div className={`absolute inset-0 opacity-20 ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M10 0v5h5v5h-5v5h5v5h-5M0 10h5v5h5v-5h5"
              stroke="url(#circuitGradient)"
              strokeWidth="0.5"
              fill="none"
            />
          </pattern>
          <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffff" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>
    </div>
  )
}

export default CircuitPattern