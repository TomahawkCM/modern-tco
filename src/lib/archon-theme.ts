/**
 * Authentic Archon Cyberpunk Theme Configuration
 * Based on specifications from SESSION_CONTINUITY_TODO.md
 */

export const archonTheme = {
  // Authentic Archon Gradients
  gradients: {
    // Main overlay gradient system
    authentic: {
      background: `
        radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
        linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)
      `
    },
    // Interactive hover gradients
    hover: {
      background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 255, 255, 0.2) 0%, rgba(34, 211, 238, 0.1) 40%, transparent 70%)`
    },
    // Border gradients
    border: {
      active: 'linear-gradient(135deg, rgba(0, 255, 255, 0.5), rgba(34, 211, 238, 0.5))',
      inactive: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(34, 211, 238, 0.2))'
    },
    // Progress gradients
    progress: 'linear-gradient(90deg, #00ffff, #22d3ee)',
    // Glow effects
    glow: {
      primary: '0 0 40px rgba(0, 255, 255, 0.3), 0 0 80px rgba(34, 211, 238, 0.2)',
      hover: '0 0 60px rgba(0, 255, 255, 0.4), 0 0 100px rgba(34, 211, 238, 0.3)'
    }
  },

  // Color Palette
  colors: {
    // Primary colors
    cyan: {
      400: '#22d3ee', // rgb(34, 211, 238)
      500: '#06b6d4',
      primary: 'rgba(0, 255, 255, 1)'
    },
    cyan_alt: {
      400: '#22d3ee',
      500: '#06b6d4', // rgb(6, 182, 212)
      primary: 'rgba(34, 211, 238, 1)'
    },
    pink: {
      400: '#f472b6',
      500: '#ec4899'
    },
    // Text colors
    text: {
      primary: '#ffffff',
      secondary: '#e2e8f0',
      muted: '#94a3b8',
      cyan: '#22d3ee',
      cyan_alt: '#22d3ee'
    }
  },

  // Glassmorphism Effects
  glassmorphism: {
    background: 'bg-gradient-to-br from-gray-900/90 via-black/95 to-gray-900/90 backdrop-blur-xl',
    border: 'border border-primary/20',
    card: 'bg-black/60 backdrop-blur-xl border border-primary/20'
  },

  // Animation Configurations
  animations: {
    // Particle system
    particles: {
      count: 15,
      sizeRange: { min: 1, max: 4 },
      durationRange: { min: 4, max: 12 },
      delayRange: { min: 0, max: 3 }
    },
    // Hover effects
    hover: {
      scale: 1.02,
      duration: 0.3,
      stiffness: 300,
      damping: 20
    },
    // Entry animations
    entry: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  },

  // Circuit Pattern
  circuitPattern: {
    strokeWidth: 0.5,
    opacity: 0.1,
    size: '20px 20px',
    gradient: 'linear-gradient(135deg, rgba(0, 255, 255, 0.3) 0%, rgba(34, 211, 238, 0.3) 100%)'
  },

  // Difficulty Level Colors
  difficulty: {
    'Beginner': 'text-primary',
    'Intermediate': 'text-primary', 
    'Advanced': 'text-pink-400',
    'Expert': 'text-red-400'
  },

  // Module Type Icons & Colors
  moduleTypes: {
    'theory': { 
      color: 'text-primary',
      background: 'bg-primary/20 border-primary/30'
    },
    'practical': { 
      color: 'text-primary',
      background: 'bg-primary/20 border-primary/30'
    },
    'assessment': { 
      color: 'text-pink-400',
      background: 'bg-pink-500/20 border-pink-500/30'
    },
    'lab': { 
      color: 'text-primary',
      background: 'bg-primary/20 border-primary/30'
    }
  }
};

// Utility functions for applying theme
export const getArchonOverlay = () => ({
  background: archonTheme.gradients.authentic.background
});

export const getHoverGradient = (mouseX?: number, mouseY?: number) => {
  if (mouseX !== undefined && mouseY !== undefined) {
    return `radial-gradient(circle at ${mouseX}px ${mouseY}px, rgba(0, 255, 255, 0.2) 0%, rgba(34, 211, 238, 0.1) 40%, transparent 70%)`;
  }
  // Default hover gradient when no mouse position is provided
  return `linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)`;
};

export const getDifficultyColor = (difficulty: string) => 
  archonTheme.difficulty[difficulty as keyof typeof archonTheme.difficulty] || 'text-primary';

export const getModuleTypeStyle = (type: string) => {
  const moduleType = archonTheme.moduleTypes[type as keyof typeof archonTheme.moduleTypes] || archonTheme.moduleTypes.theory;
  return moduleType.background;
};
