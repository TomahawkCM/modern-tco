"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { BookOpen, Clock, Trophy, Zap, ChevronRight, Play } from "lucide-react"
import { archonTheme, getArchonOverlay, getHoverGradient, getDifficultyColor, getModuleTypeStyle } from "@/lib/archon-theme"

interface StudyCardProps {
  title?: string
  description?: string
  progress?: number
  duration?: string
  difficulty?: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  points?: number
  isLocked?: boolean
  moduleType?: "theory" | "practical" | "assessment" | "lab"
  domain?: "asking" | "refining" | "action" | "navigation" | "reporting"
  className?: string
  onClick?: () => void
}

const CyberpunkStudyCard = ({
  title = "Advanced Threat Detection",
  description = "Master the art of identifying and neutralizing sophisticated cyber threats using AI-powered detection systems and behavioral analysis techniques.",
  progress = 65,
  duration = "45 min",
  difficulty = "Advanced",
  points = 250,
  isLocked = false,
  moduleType = "theory",
  domain: _domain = "asking",
  className = "",
  onClick,
}: StudyCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    duration: number
    delay: number
  }>>([])

  // Generate particles on mount using theme configuration
  useEffect(() => {
    const config = archonTheme.animations.particles
    const newParticles = Array.from({ length: config.count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (config.sizeRange.max - config.sizeRange.min) + config.sizeRange.min,
      duration: Math.random() * (config.durationRange.max - config.durationRange.min) + config.durationRange.min,
      delay: Math.random() * config.delayRange.max
    }))
    setParticles(newParticles)
  }, [])

  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })

      const rotateX = -(y / rect.height) * 8
      const rotateY = (x / rect.width) * 8

      setRotation({ x: rotateX, y: rotateY })
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotation({ x: 0, y: 0 })
  }

  const getModuleIcon = () => {
    switch (moduleType) {
      case "theory": return <BookOpen className="w-5 h-5" />
      case "practical": return <Zap className="w-5 h-5" />
      case "assessment": return <Trophy className="w-5 h-5" />
      case "lab": return <Play className="w-5 h-5" />
      default: return <BookOpen className="w-5 h-5" />
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative w-full max-w-sm h-80 rounded-2xl overflow-hidden cursor-pointer ${className}`}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
        scale: isHovered ? 1.02 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-black/95 to-gray-900/90 backdrop-blur-xl border border-primary/20 rounded-2xl" />
      
      {/* Authentic Archon gradient overlay */}
      <div 
        className="absolute inset-0 opacity-60"
        style={getArchonOverlay()}
      />

      {/* Interactive glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: isHovered ? getHoverGradient(mousePosition.x, mousePosition.y) : "",
          opacity: isHovered ? 1 : 0,
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-cyan-400/30"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px),
              linear-gradient(0deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${getModuleTypeStyle(moduleType)}`}>
              {getModuleIcon()}
            </div>
            <span className={`text-xs font-medium uppercase tracking-wider ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          </div>
          
          {isLocked && (
            <div className="p-1 rounded bg-red-500/20 border border-red-500/30">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-cyan-100 mb-3 leading-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">
          {description}
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs text-primary font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-card rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-sky-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>{points} pts</span>
            </div>
          </div>

          <motion.button
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/20 border border-primary/30 text-primary text-xs font-medium hover:bg-cyan-500/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLocked}
          >
            {isLocked ? "Locked" : "Start"}
            {!isLocked && <ChevronRight className="w-3 h-3" />}
          </motion.button>
        </div>
      </div>

      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-transparent"
        style={{
          background: isHovered 
            ? "linear-gradient(135deg, rgba(0, 255, 255, 0.5), rgba(34, 211, 238, 0.5)) border-box"
            : "linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(34, 211, 238, 0.2)) border-box",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "subtract",
        }}
        animate={{
          opacity: isHovered ? 1 : 0.6,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow: isHovered 
            ? "0 0 40px rgba(0, 255, 255, 0.3), 0 0 80px rgba(34, 211, 238, 0.2)"
            : "0 0 20px rgba(0, 255, 255, 0.1)",
        }}
        animate={{
          opacity: isHovered ? 1 : 0.7,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export { CyberpunkStudyCard }
