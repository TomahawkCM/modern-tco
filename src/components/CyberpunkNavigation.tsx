"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter, usePathname } from "next/navigation"
import { Search, User, Settings, Bell, Menu, X, Zap, Shield, Cpu, Activity } from "lucide-react"

export interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
}

export interface CyberpunkNavBarProps {
  className?: string
  navItems?: NavItem[]
  brandName?: string
  onTabChange?: (tabName: string) => void
}

// Circuit board pattern component
const CircuitPattern: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`absolute inset-0 opacity-20 pointer-events-none ${className}`}>
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

// Holographic text effect component
export const HolographicText: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-500 bg-clip-text text-transparent blur-sm">
        {children}
      </div>
      <div className="relative bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-500 bg-clip-text text-transparent">
        {children}
      </div>
    </div>
  )
}

// Interactive particle background component
export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    baseOpacity: number;
    id: number;
  }>>([])

  useEffect(() => {
    // Always render unless user explicitly disables via localStorage
    try {
      if (typeof window !== 'undefined') {
        const flag = localStorage.getItem('tco-particles')
        if (flag === '0' || flag === 'off' || flag === 'false') return
      }
    } catch {}

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      // Adaptive particle density for performance (smaller screens / high DPR → fewer particles)
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      const area = window.innerWidth * window.innerHeight
      const smallScreen = window.innerWidth < 768
      const baseDivisor = smallScreen ? 50000 : 25000
      const particleCount = Math.max(25, Math.floor(area / baseDivisor / dpr))
      particlesRef.current = []
      
      for (let i = 0; i < particleCount; i++) {
        // Restored visibility: 0.10 – 0.30 base opacity
        const baseOpacity = Math.random() * 0.15 + 0.08
        particlesRef.current.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: Math.random() * 2 + 1,
          opacity: baseOpacity,
          baseOpacity: baseOpacity,
          id: i
        })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const particles = particlesRef.current
      const mouse = mouseRef.current

      // Update particles
      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        const dx = mouse.x - particle.x
        const dy = mouse.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 100) {
          particle.opacity = Math.min(0.8, particle.baseOpacity + (100 - distance) / 100 * 0.5)
        } else {
          particle.opacity = particle.baseOpacity
        }
      })

      // Draw connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.12
            // Neutral white lines to avoid blue cast
            ctx.strokeStyle = `rgba(255,255,255, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }

        // Mouse connections
        const dx = mouse.x - particles[i].x
        const dy = mouse.y - particles[i].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 160) {
          // Interaction lines
          const opacity = (160 - distance) / 160 * 0.22
          ctx.strokeStyle = `rgba(255,255,255, ${opacity})`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
      }

      // Draw particles (boost size near cursor for feedback)
      particles.forEach(particle => {
        const mdx = mouse.x - particle.x
        const mdy = mouse.y - particle.y
        const md = Math.sqrt(mdx * mdx + mdy * mdy)
        const mouseRadius = 140
        const scale = md < mouseRadius ? 1 + ((mouseRadius - md) / mouseRadius) * 0.8 : 1
        const size = particle.size * scale

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
        // Star color: neutral white
        ctx.fillStyle = `rgba(255,255,255, ${particle.opacity})`
        ctx.fill()
        
        // Halo for depth
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255, ${Math.min(0.14, particle.opacity * 0.8)})`
        ctx.fill()
      })

      // Draw mouse glow (reduced intensity by ~80%)
      if (mouse.x !== 0 && mouse.y !== 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120)
        gradient.addColorStop(0, 'rgba(255,255,255, 0.036)')
        gradient.addColorStop(1, 'rgba(255,255,255, 0)')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    const start = () => {
      resizeCanvas()
      createParticles()
      animate()
    }

    // Defer heavy work until browser is idle to improve TTI
    const idle = (window as any).requestIdleCallback as undefined | ((cb: any) => void)
    if (idle) idle(() => start())
    else setTimeout(start, 150)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', () => {
      resizeCanvas()
      createParticles()
    })

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed inset-0" style={{ zIndex: 1, pointerEvents: 'none' }} />
  )
}

// Subtle nebula overlay (very low opacity, non-interactive)
export const NebulaOverlay: React.FC = () => {
  return (
    <div
      className="fixed inset-0"
      style={{
        zIndex: 0,
        pointerEvents: 'none',
        // Ultra-soft neutral nebula (barely visible)
        backgroundImage:
          'radial-gradient(600px 400px at 20% 15%, rgba(220,230,255,0.02), rgba(220,230,255,0) 60%), radial-gradient(700px 500px at 80% 85%, rgba(220,230,255,0.015), rgba(220,230,255,0) 55%)',
      }}
    />
  )
}

// Main cyberpunk navigation component
export const CyberpunkNavBar: React.FC<CyberpunkNavBarProps> = ({ 
  className,
  navItems = [
    { name: "Dashboard", href: "#", icon: <Cpu className="h-4 w-4" /> },
    { name: "Neural Net", href: "#", icon: <Zap className="h-4 w-4" /> },
    { name: "Security", href: "#", icon: <Shield className="h-4 w-4" /> },
    { name: "Analytics", href: "#", icon: <Activity className="h-4 w-4" /> },
  ],
  brandName = "ARCHON",
  onTabChange
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(navItems[0]?.name || "Dashboard")

  // Create route-to-tab mapping for detecting active tab from URL
  const routeToTabMapping: Record<string, string> = React.useMemo(() => {
    const mapping: Record<string, string> = {}
    navItems.forEach(item => {
      if (item.href && item.href !== "#") {
        mapping[item.href] = item.name
      }
    })
    return mapping
  }, [navItems])

  // Sync activeTab with current route
  useEffect(() => {
    const currentPath = pathname || "";
    // Normalize for basePath in production (e.g., '/tanium')
    const normalized = currentPath.startsWith("/tanium") ? currentPath.slice("/tanium".length) || "/" : currentPath;
    const currentTab = routeToTabMapping[currentPath] ?? routeToTabMapping[normalized];
    if (currentTab) {
      setActiveTab(currentTab)
      onTabChange?.(currentTab)
    }
  }, [pathname, routeToTabMapping, onTabChange])

  const handleTabChange = (tabName: string, href: string) => {
    setActiveTab(tabName)
    onTabChange?.(tabName)
    // Navigate to the actual route
    if (href && href !== "#") {
      router.push(href)
    }
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-1 left-0 right-0 z-50 mx-4 ${className}`}
    >
      <CircuitPattern />
      
      <div className="relative bg-black/20 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.1)]">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 rounded-2xl opacity-20 blur-sm animate-pulse"></div>
        
        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-sky-400 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-sky-400 rounded-lg blur animate-pulse opacity-50"></div>
              </div>
              <HolographicText className="text-xl font-bold hidden sm:block">
                {brandName}
              </HolographicText>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleTabChange(item.name, item.href)}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                    activeTab === item.name
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-cyan-100/80 hover:text-cyan-400 hover:bg-cyan-500/5'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                  
                  {activeTab === item.name && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-sky-400/20 to-cyan-500/20 rounded-lg"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <motion.button
                className="relative group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative w-10 h-10 bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-full flex items-center justify-center">
                  <Bell className="h-4 w-4 text-cyan-400" />
                </div>
              </motion.button>

              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden relative group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative w-10 h-10 bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-full flex items-center justify-center">
                  {isMenuOpen ? (
                    <X className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <Menu className="h-4 w-4 text-cyan-400" />
                  )}
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="lg:hidden mt-2 bg-black/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.1)]"
        >
          <div className="relative p-4">
            <CircuitPattern className="opacity-10" />
            <div className="relative space-y-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => {
                    handleTabChange(item.name, item.href)
                    setIsMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                    activeTab === item.name
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-cyan-100/80 hover:text-cyan-400 hover:bg-cyan-500/5'
                  }`}
                  whileHover={{ x: 5 }}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
