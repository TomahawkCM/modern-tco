"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Trophy, Zap, ChevronRight, Play } from "lucide-react";
import {
  archonTheme,
  getArchonOverlay,
  getHoverGradient,
  getDifficultyColor,
  getModuleTypeStyle,
} from "@/lib/archon-theme";

interface StudyCardProps {
  title?: string;
  description?: string;
  progress?: number;
  duration?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  points?: number;
  isLocked?: boolean;
  moduleType?: "theory" | "practical" | "assessment" | "lab";
  domain?: "asking" | "refining" | "action" | "navigation" | "reporting";
  className?: string;
  onClick?: () => void;
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      duration: number;
      delay: number;
    }>
  >([]);

  // Generate particles on mount using theme configuration
  useEffect(() => {
    const config = archonTheme.animations.particles;
    const newParticles = Array.from({ length: config.count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (config.sizeRange.max - config.sizeRange.min) + config.sizeRange.min,
      duration:
        Math.random() * (config.durationRange.max - config.durationRange.min) +
        config.durationRange.min,
      delay: Math.random() * config.delayRange.max,
    }));
    setParticles(newParticles);
  }, []);

  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      const rotateX = -(y / rect.height) * 8;
      const rotateY = (x / rect.width) * 8;

      setRotation({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const getModuleIcon = () => {
    switch (moduleType) {
      case "theory":
        return <BookOpen className="h-5 w-5" />;
      case "practical":
        return <Zap className="h-5 w-5" />;
      case "assessment":
        return <Trophy className="h-5 w-5" />;
      case "lab":
        return <Play className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative h-80 w-full max-w-sm cursor-pointer overflow-hidden rounded-2xl ${className}`}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Glass morphism background */}
      <div className="absolute inset-0 rounded-2xl border border-primary/20 bg-gradient-to-br from-gray-900/90 via-black/95 to-gray-900/90 backdrop-blur-xl" />

      {/* Authentic Archon gradient overlay */}
      <div className="absolute inset-0 opacity-60" style={getArchonOverlay()} />

      {/* Interactive glow effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
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
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px),
              linear-gradient(0deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg p-2 ${getModuleTypeStyle(moduleType)}`}>
              {getModuleIcon()}
            </div>
            <span
              className={`text-xs font-medium uppercase tracking-wider ${getDifficultyColor(difficulty)}`}
            >
              {difficulty}
            </span>
          </div>

          {isLocked && (
            <div className="rounded border border-red-500/30 bg-red-500/20 p-1">
              <div className="h-3 w-3 rounded-full bg-red-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-3 text-xl font-bold leading-tight text-cyan-100">{title}</h3>

        {/* Description */}
        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium text-primary">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-card">
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
              <Clock className="h-3 w-3" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              <span>{points} pts</span>
            </div>
          </div>

          <motion.button
            className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/20 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-cyan-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLocked}
          >
            {isLocked ? "Locked" : "Start"}
            {!isLocked && <ChevronRight className="h-3 w-3" />}
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
  );
};

export { CyberpunkStudyCard };
