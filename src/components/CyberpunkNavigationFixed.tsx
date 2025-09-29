"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
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

// Main cyberpunk navigation component - FIXED version
export const CyberpunkNavBar: React.FC<CyberpunkNavBarProps> = ({
  className,
  navItems = [
    { name: "Dashboard", href: "/", icon: <Cpu className="h-4 w-4" /> },
    { name: "Study", href: "/study", icon: <Zap className="h-4 w-4" /> },
    { name: "Practice", href: "/practice", icon: <Shield className="h-4 w-4" /> },
    { name: "Analytics", href: "/analytics", icon: <Activity className="h-4 w-4" /> },
  ],
  brandName = "TANIUM TCO",
  onTabChange
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(navItems[0]?.name || "Dashboard")
  const [mounted, setMounted] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

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
    if (!mounted) return
    const currentPath = pathname || "/"
    const currentTab = routeToTabMapping[currentPath]
    if (currentTab) {
      setActiveTab(currentTab)
      onTabChange?.(currentTab)
    }
  }, [pathname, routeToTabMapping, onTabChange, mounted])

  const handleTabChange = (tabName: string, href: string) => {
    setActiveTab(tabName)
    onTabChange?.(tabName)
    if (href && href !== "#") {
      router.push(href)
    }
  }

  // Return simple nav during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-cyan-500/20 ${className}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-sky-400 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="text-xl font-bold text-cyan-400">
                {brandName}
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  className="px-4 py-2 rounded-lg text-cyan-100/80 hover:text-cyan-400 flex items-center space-x-2"
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-1 left-0 right-0 z-50 mx-4 ${className}`}
    >
      <div className="relative bg-black/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.1)]">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 rounded-2xl opacity-20 blur-sm"></div>

        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-sky-400/20 to-cyan-500/20 rounded-lg -z-10"
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
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="lg:hidden mt-2 bg-black/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.1)]"
          >
            <div className="relative p-4">
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
      </AnimatePresence>
    </motion.nav>
  )
}

// Export other components that were in the original file
export { AnimatedBackground, NebulaOverlay } from "./CyberpunkNavigation"
// CircuitPattern is not available - commented out for now
// export { CircuitPattern } from "./ui/cyberpunk/CircuitPattern"