'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  Info,
  Check,
  X,
  BookOpen,
  Zap,
  GraduationCap,
  HelpCircle,
  Shield
} from 'lucide-react';
import { getArchonOverlay, getHoverGradient } from '@/lib/archon-theme';

// TypeScript interfaces
interface BeginnerModeToggleProps {
  defaultEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showTooltip?: boolean;
}

interface BeginnerModeFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
}

export default function BeginnerModeToggle({
  defaultEnabled = true,
  onToggle,
  position = 'top-right',
  showTooltip = true
}: BeginnerModeToggleProps) {
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);
  const [showFeatures, setShowFeatures] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Beginner mode features
  const beginnerFeatures: BeginnerModeFeature[] = [
    {
      id: 'navigation-helper',
      title: 'Navigation Helper',
      description: 'Floating help button with guided tour',
      icon: HelpCircle,
      enabled: isEnabled
    },
    {
      id: 'simplified-content',
      title: 'Simplified Content',
      description: 'Foundation-first learning approach',
      icon: BookOpen,
      enabled: isEnabled
    },
    {
      id: 'progress-tracking',
      title: 'Enhanced Progress Tracking',
      description: 'Visual milestones and achievements',
      icon: GraduationCap,
      enabled: isEnabled
    },
    {
      id: 'confidence-builder',
      title: 'Confidence Building',
      description: 'Encouraging messages and tips',
      icon: Sparkles,
      enabled: isEnabled
    },
    {
      id: 'guided-learning',
      title: 'Guided Learning Path',
      description: 'Step-by-step progression',
      icon: Zap,
      enabled: isEnabled
    }
  ];

  // Load saved preference
  useEffect(() => {
    const savedMode = localStorage.getItem('beginnerMode');
    const firstVisit = !localStorage.getItem('hasVisited');
    
    if (savedMode !== null) {
      const enabled = savedMode === 'true';
      setIsEnabled(enabled);
      onToggle?.(enabled);
    } else if (firstVisit) {
      // First time visitor - enable beginner mode by default
      setIsEnabled(true);
      setIsFirstVisit(true);
      localStorage.setItem('beginnerMode', 'true');
      localStorage.setItem('hasVisited', 'true');
      onToggle?.(true);
      
      // Show features tooltip for first-time users
      setTimeout(() => setShowFeatures(true), 1000);
    }
  }, []);

  // Handle toggle
  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('beginnerMode', String(newState));
    onToggle?.(newState);
    
    // Show features briefly when toggling on
    if (newState && !showFeatures) {
      setShowFeatures(true);
      setTimeout(() => setShowFeatures(false), 3000);
    }
  };

  // Get position classes
  const getPositionClasses = (): string => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed ${getPositionClasses()} z-30`}
      >
        <div className="relative">
          {/* Main Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            onMouseEnter={() => showTooltip && setShowFeatures(true)}
            onMouseLeave={() => showTooltip && setShowFeatures(false)}
            className={`relative flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg transition-all backdrop-blur-sm ${
              isEnabled 
                ? 'border border-cyan-400/30 text-white shadow-cyan-400/20'
                : 'bg-white/10 border border-gray-300/30 text-gray-200 hover:bg-white/20'
            }`}
            style={isEnabled ? {
              background: getArchonOverlay().background,
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.2), 0 0 40px rgba(147, 51, 234, 0.1)'
            } : undefined}
          >
            <Sparkles className={`w-5 h-5 ${isEnabled ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-semibold">
              Beginner Mode
            </span>
            <div className={`relative w-12 h-6 rounded-full transition-colors ${
              isEnabled ? 'bg-white/30' : 'bg-gray-200'
            }`}>
              <motion.div
                className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md ${
                  isEnabled ? 'bg-white' : 'bg-gray-400'
                }`}
                animate={{ left: isEnabled ? '1.5rem' : '0.125rem' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            </div>
          </motion.button>

          {/* Status Indicator */}
          {isEnabled && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" />
          )}
        </div>

        {/* Features Tooltip */}
        <AnimatePresence>
          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 right-0 w-80 bg-black/80 backdrop-blur-md rounded-xl shadow-2xl border border-cyan-400/30 overflow-hidden"
              style={{
                background: getArchonOverlay().background,
                boxShadow: '0 0 30px rgba(0, 255, 255, 0.2), 0 0 60px rgba(147, 51, 234, 0.1)'
              }}
            >
              {/* Header */}
              <div className={`p-4 ${
                isEnabled 
                  ? 'text-white border-b border-cyan-400/30'
                  : 'bg-black/40 text-gray-300 border-b border-gray-600/30'
              }`}
              style={isEnabled ? {
                background: getArchonOverlay().background
              } : undefined}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <h3 className="font-semibold">
                      {isEnabled ? 'Beginner Mode Active' : 'Beginner Mode Disabled'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowFeatures(false)}
                    className={`p-1 rounded-full transition-colors ${
                      isEnabled 
                        ? 'hover:bg-cyan-400/20 text-cyan-200 hover:text-cyan-100'
                        : 'hover:bg-gray-600/30 text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className={`text-sm mt-1 ${
                  isEnabled ? 'text-white/90' : 'text-gray-600'
                }`}>
                  {isEnabled 
                    ? 'Enhanced guidance and support enabled'
                    : 'Advanced mode for experienced users'}
                </p>
              </div>

              {/* Features List */}
              <div className="p-4 space-y-3">
                {beginnerFeatures.map((feature) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-colors border ${
                      feature.enabled 
                        ? 'border-cyan-400/30'
                        : 'border-gray-500/30'
                    }`}
                    style={feature.enabled ? {
                      background: getArchonOverlay().background,
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)'
                    } : {
                      background: 'rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div className={`flex-shrink-0 p-2 rounded-lg ${
                      feature.enabled 
                        ? 'bg-cyan-400/20 text-cyan-300'
                        : 'bg-gray-600/30 text-gray-400'
                    }`}>
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-semibold ${
                          feature.enabled ? 'text-white' : 'text-gray-400'
                        }`}>
                          {feature.title}
                        </h4>
                        {feature.enabled && (
                          <Check className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${
                        feature.enabled ? 'text-cyan-100' : 'text-gray-500'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer Message */}
              <div className="p-4 border-t border-cyan-400/30"
                   style={{
                     background: 'rgba(0, 0, 0, 0.3)',
                     backdropFilter: 'blur(8px)',
                     WebkitBackdropFilter: 'blur(8px)'
                   }}>
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-cyan-100">
                    {isEnabled 
                      ? 'Perfect for beginners! Switch off when you feel confident.'
                      : 'Enable anytime to get extra guidance and support.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* First Visit Welcome */}
      <AnimatePresence>
        {isFirstVisit && isEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsFirstVisit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/80 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center space-y-6 border border-cyan-400/30"
              style={{
                background: getArchonOverlay().background,
                boxShadow: '0 0 40px rgba(0, 255, 255, 0.2), 0 0 80px rgba(147, 51, 234, 0.1)'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center border border-cyan-400/30"
                style={{
                  background: getArchonOverlay().background,
                  boxShadow: '0 0 30px rgba(0, 255, 255, 0.3), 0 0 60px rgba(147, 51, 234, 0.2)'
                }}
              >
                <Sparkles className="w-10 h-10 text-cyan-100 animate-pulse" />
              </motion.div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  Beginner Mode Activated! 🎉
                </h2>
                <p className="text-cyan-100">
                  We've enabled special features to help you learn Tanium with confidence. 
                  You can toggle this mode on/off anytime using the button in the corner.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {beginnerFeatures.slice(0, 4).map((feature) => (
                  <div key={feature.id} className="p-3 rounded-lg border border-cyan-400/30"
                       style={{
                         background: 'rgba(0, 255, 255, 0.1)',
                         backdropFilter: 'blur(8px)',
                         WebkitBackdropFilter: 'blur(8px)'
                       }}>
                    <feature.icon className="w-6 h-6 text-cyan-300 mx-auto mb-1" />
                    <p className="text-xs font-medium text-white">{feature.title}</p>
                  </div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFirstVisit(false)}
                className="w-full px-6 py-3 text-white font-semibold rounded-lg transition-colors border border-cyan-400/30"
                style={{
                  background: getHoverGradient(),
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), 0 0 40px rgba(147, 51, 234, 0.2)'
                }}
              >
                Start My Journey! 🚀
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}