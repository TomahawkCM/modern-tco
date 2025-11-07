"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Search, User, Settings, Bell, Menu, X, Zap, Shield, Cpu, Activity, Brain, Sparkles, Wallet } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import AIAssistant to avoid SSR issues
const AIAssistant = dynamic(() => import("@/components/ai/AIAssistant"), {
  ssr: false,
})

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
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-sky-400 to-primary bg-clip-text text-transparent blur-sm">
        {children}
      </div>
      <div className="relative bg-gradient-to-r from-primary via-sky-400 to-primary bg-clip-text text-transparent">
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
    { name: "Budget", href: "/budget-app", icon: <Wallet className="h-4 w-4" /> },
  ],
  brandName = "TANIUM TCO",
  onTabChange
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(navItems[0]?.name ?? "Dashboard")
  const [mounted, setMounted] = useState(false)
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)

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
    const currentPath = pathname ?? "/"
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
      void router.push(href)
    }
  }

  // Global keyboard shortcut: Cmd+Shift+K to open AI Assistant
  useEffect(() => {
    if (!mounted) return

    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdShiftK = (e.key === 'k' || e.key === 'K') && e.shiftKey && (e.metaKey || e.ctrlKey)

      if (isCmdShiftK) {
        e.preventDefault()
        setAiAssistantOpen(true)
      }

      if (e.key === 'Escape') {
        setAiAssistantOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mounted])

  // Return simple nav during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/[0.02] backdrop-blur-xl backdrop-saturate-150 border-b border-white/10 shadow-lg shadow-black/5 ${className}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/tco-logo.png"
                alt="TCO Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                priority
              />
              <div className="text-xl font-bold text-primary">
                {brandName}
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  className="px-4 py-2 rounded-lg text-cyan-100/80 hover:text-primary flex items-center space-x-2"
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
      <div className="relative bg-white/[0.02] backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-2xl shadow-lg shadow-black/5">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-sky-400 to-primary rounded-2xl opacity-5 blur-sm"></div>

        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <motion.div
              className="flex items-center space-x-2 sm:space-x-3 min-w-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative flex-shrink-0">
                <Image
                  src="/tco-logo.png"
                  alt="TCO Logo"
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full blur animate-pulse opacity-10"></div>
              </div>
              <HolographicText className="text-base sm:text-lg lg:text-xl font-bold whitespace-nowrap hidden xs:block">
                <span className="hidden lg:inline">{brandName}</span>
                <span className="lg:hidden">TCO</span>
              </HolographicText>
            </motion.div>

            {/* Desktop Navigation - Simplified to just search bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div
                className="relative w-full cursor-pointer"
                onClick={() => void router.push("/search")}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search modules, questions..."
                  className="w-full pl-10 pr-4 py-2 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-lg text-sm text-cyan-100 placeholder-cyan-400/40 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 transition-all cursor-pointer"
                  readOnly
                  onClick={() => void router.push("/search")}
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              {/* Search icon for mobile */}
              <motion.button
                className="md:hidden relative group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => void router.push("/search")}
                aria-label="Search modules and questions"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-sky-400 rounded-full blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative w-9 h-9 bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center">
                  <Search className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
              </motion.button>

              {/* Notifications */}
              <motion.button
                className="relative group hidden sm:flex"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => void router.push("/notifications")}
                aria-label="Notifications (3 unread)"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-sky-400 rounded-full blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative w-9 h-9 bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center">
                  <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-foreground flex items-center justify-center font-bold" aria-hidden="true">3</span>
                </div>
              </motion.button>

              {/* AI Assistant */}
              <motion.button
                className="relative group hidden sm:flex"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setAiAssistantOpen(true)}
                aria-label="Open AI Study Assistant (Cmd+Shift+K)"
                title="AI Study Assistant (Cmd+Shift+K)"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative w-9 h-9 bg-white/[0.05] backdrop-blur-xl border border-amber-400/20 rounded-full flex items-center justify-center">
                  <Brain className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  <Sparkles className="absolute -right-0.5 -top-0.5 h-3 w-3 text-amber-400" aria-hidden="true" />
                </div>
              </motion.button>

              {/* Profile */}
              <motion.button
                className="relative group hidden sm:flex"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => void router.push("/profile")}
                aria-label="User profile settings"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-sky-400 rounded-full blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative w-9 h-9 bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Removed (navigation now in sidebar) */}

      {/* AI Study Assistant Modal */}
      {mounted && (
        <AIAssistant
          isOpen={aiAssistantOpen}
          onClose={() => setAiAssistantOpen(false)}
        />
      )}
    </motion.nav>
  )
}

// Export other components that were in the original file
export { AnimatedBackground, NebulaOverlay } from "./CyberpunkNavigation"
// CircuitPattern is not available - commented out for now
// export { CircuitPattern } from "./ui/cyberpunk/CircuitPattern"