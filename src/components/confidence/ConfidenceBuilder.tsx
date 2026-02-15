"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Star,
  Trophy,
  Target,
  CheckCircle,
  Lightbulb,
  Sparkles,
  Award,
  TrendingUp,
  Smile,
  MessageCircle,
  BookOpen,
  Users,
  Clock,
  ArrowRight,
  Zap,
  Shield,
  Compass,
} from "lucide-react";

// TypeScript interfaces for confidence building system
interface EncouragementMessage {
  id: string;
  message: string;
  icon: React.ComponentType<{ className?: string }>;
  type: "motivational" | "achievement" | "progress" | "tip" | "celebration";
  confidenceLevel: "building" | "growing" | "strong" | "expert";
  trigger: "login" | "struggle" | "progress" | "milestone" | "random";
}

interface ConfidenceBooster {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  benefit: string;
  category: "mindset" | "learning" | "progress" | "community";
}

interface BeginnerTip {
  id: string;
  title: string;
  content: string;
  icon: React.ComponentType<{ className?: string }>;
  isImportant: boolean;
  category: "study-strategy" | "exam-prep" | "confidence" | "time-management";
}

interface ConfidenceBuilderProps {
  currentConfidence: "building" | "growing" | "strong" | "expert";
  studyProgress: number;
  recentStruggle?: string;
  showEncouragement?: boolean;
  onBoostConfidence?: () => void;
}

export default function ConfidenceBuilder({
  currentConfidence,
  studyProgress,
  recentStruggle,
  showEncouragement = true,
  onBoostConfidence,
}: ConfidenceBuilderProps) {
  const [activeMessage, setActiveMessage] = useState<EncouragementMessage | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [dailyBooster, setDailyBooster] = useState<ConfidenceBooster | null>(null);
  const [encouragementHistory, setEncouragementHistory] = useState<string[]>([]);

  // Comprehensive encouragement messages database
  const encouragementMessages: EncouragementMessage[] = [
    {
      id: "welcome-building",
      message: "Every expert was once a beginner! You're taking the perfect first steps. 🌱",
      icon: Sparkles,
      type: "motivational",
      confidenceLevel: "building",
      trigger: "login",
    },
    {
      id: "progress-building",
      message: "Look at you go! Each concept you learn makes you stronger. Keep building! 💪",
      icon: TrendingUp,
      type: "progress",
      confidenceLevel: "building",
      trigger: "progress",
    },
    {
      id: "struggle-building",
      message:
        "It's okay to find this challenging - that means you're learning! Take it one step at a time. 🚀",
      icon: Heart,
      type: "motivational",
      confidenceLevel: "building",
      trigger: "struggle",
    },
    {
      id: "milestone-building",
      message:
        "Amazing! You just completed another milestone. Your confidence is growing with every step! ⭐",
      icon: Trophy,
      type: "celebration",
      confidenceLevel: "building",
      trigger: "milestone",
    },
    {
      id: "tip-building",
      message: "Pro tip: Focus on understanding concepts, not memorizing. You've got this! 💡",
      icon: Lightbulb,
      type: "tip",
      confidenceLevel: "building",
      trigger: "random",
    },
    {
      id: "welcome-growing",
      message:
        "Your confidence is growing! You're building real expertise in Tanium. Keep going! 🌟",
      icon: Star,
      type: "motivational",
      confidenceLevel: "growing",
      trigger: "login",
    },
    {
      id: "progress-growing",
      message:
        "Excellent progress! You're connecting the dots and it shows. Your journey is inspiring! 🎯",
      icon: Target,
      type: "progress",
      confidenceLevel: "growing",
      trigger: "progress",
    },
    {
      id: "achievement-growing",
      message: "Look at how far you've come! Your dedication is paying off in real knowledge. 🏆",
      icon: Award,
      type: "achievement",
      confidenceLevel: "growing",
      trigger: "milestone",
    },
    {
      id: "welcome-strong",
      message:
        "Strong confidence level detected! You're becoming a Tanium expert. Impressive work! 💪",
      icon: Shield,
      type: "motivational",
      confidenceLevel: "strong",
      trigger: "login",
    },
    {
      id: "expert-level",
      message: "Expert level achieved! You've mastered the fundamentals and are exam-ready! 🚀",
      icon: Compass,
      type: "celebration",
      confidenceLevel: "expert",
      trigger: "milestone",
    },
  ];

  // Confidence boosters for different scenarios
  const confidenceBoosters: ConfidenceBooster[] = [
    {
      id: "break-it-down",
      title: "Break It Down",
      description: "Complex topics become simple when you tackle them piece by piece",
      icon: Target,
      action: "Focus on one concept at a time",
      benefit: "Reduces overwhelm and builds steady progress",
      category: "learning",
    },
    {
      id: "practice-makes-progress",
      title: "Practice Makes Progress",
      description: "Every question you attempt makes you stronger, even the tough ones",
      icon: TrendingUp,
      action: "Try one practice question right now",
      benefit: "Builds familiarity and reduces exam anxiety",
      category: "learning",
    },
    {
      id: "growth-mindset",
      title: "Growth Mindset",
      description: "Your brain grows stronger with every challenge you face",
      icon: Lightbulb,
      action: "Embrace mistakes as learning opportunities",
      benefit: "Transforms setbacks into stepping stones",
      category: "mindset",
    },
    {
      id: "celebrate-small-wins",
      title: "Celebrate Small Wins",
      description: "Every completed module is a victory worth celebrating",
      icon: Trophy,
      action: "Acknowledge your progress today",
      benefit: "Builds positive momentum and motivation",
      category: "progress",
    },
    {
      id: "join-community",
      title: "You're Not Alone",
      description: "Thousands of beginners have successfully passed the TCO exam",
      icon: Users,
      action: "Connect with other learners",
      benefit: "Reduces isolation and provides support",
      category: "community",
    },
    {
      id: "time-management",
      title: "Smart Study Sessions",
      description: "Short, focused study sessions are more effective than marathon cramming",
      icon: Clock,
      action: "Study for 25 minutes, then take a 5-minute break",
      benefit: "Improves retention and prevents burnout",
      category: "learning",
    },
  ];

  // Beginner tips for confidence building
  const beginnerTips: BeginnerTip[] = [
    {
      id: "foundation-first",
      title: "Start with Foundation",
      content:
        "Complete Phase 0: Foundation before moving to advanced topics. This builds unshakeable confidence.",
      icon: BookOpen,
      isImportant: true,
      category: "study-strategy",
    },
    {
      id: "progress-over-perfection",
      title: "Progress Over Perfection",
      content:
        "It's better to understand 80% of all topics than 100% of just a few. Keep moving forward!",
      icon: ArrowRight,
      isImportant: false,
      category: "confidence",
    },
    {
      id: "exam-day-ready",
      title: "Exam Day Success",
      content:
        "Take practice exams when you feel 70% ready. This identifies gaps while building test confidence.",
      icon: CheckCircle,
      isImportant: true,
      category: "exam-prep",
    },
    {
      id: "consistent-study",
      title: "Consistency Wins",
      content: "Study 30 minutes daily rather than 3 hours once a week. Your brain loves routine!",
      icon: Zap,
      isImportant: false,
      category: "time-management",
    },
  ];

  // Select appropriate encouragement message based on context
  useEffect(() => {
    const getContextualMessage = (): EncouragementMessage | null => {
      let trigger: EncouragementMessage["trigger"] = "random";

      if (recentStruggle) {
        trigger = "struggle";
      } else if (studyProgress > 0 && studyProgress % 20 === 0) {
        trigger = "milestone";
      } else if (studyProgress > 0) {
        trigger = "progress";
      } else {
        trigger = "login";
      }

      const relevantMessages = encouragementMessages.filter(
        (msg) =>
          msg.confidenceLevel === currentConfidence &&
          (msg.trigger === trigger || msg.trigger === "random")
      );

      if (relevantMessages.length === 0) {
        // Fallback to any message for current confidence level
        const fallbackMessages = encouragementMessages.filter(
          (msg) => msg.confidenceLevel === currentConfidence
        );
        return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)] || null;
      }

      // Avoid repeating recent messages
      const freshMessages = relevantMessages.filter(
        (msg) => !encouragementHistory.includes(msg.id)
      );

      const selectedMessages = freshMessages.length > 0 ? freshMessages : relevantMessages;
      return selectedMessages[Math.floor(Math.random() * selectedMessages.length)];
    };

    if (showEncouragement) {
      const message = getContextualMessage();
      if (message) {
        setActiveMessage(message);
        setEncouragementHistory((prev) => [...prev.slice(-4), message.id]);
      }
    }
  }, [currentConfidence, studyProgress, recentStruggle, showEncouragement, encouragementHistory]);

  // Select daily confidence booster
  useEffect(() => {
    const today = new Date().toDateString();
    const savedBooster = localStorage.getItem(`daily-booster-${today}`);

    if (savedBooster) {
      const booster = confidenceBoosters.find((b) => b.id === savedBooster);
      setDailyBooster(booster ?? null);
    } else {
      const randomBooster =
        confidenceBoosters[Math.floor(Math.random() * confidenceBoosters.length)];
      setDailyBooster(randomBooster);
      localStorage.setItem(`daily-booster-${today}`, randomBooster.id);
    }
  }, []);

  const handleBoostConfidence = () => {
    setShowTip(true);
    onBoostConfidence?.();
  };

  const getConfidenceColor = (level: string): string => {
    switch (level) {
      case "building":
        return "from-blue-500 to-primary";
      case "growing":
        return "from-green-500 to-emerald-500";
      case "strong":
        return "from-primary to-sky-500";
      case "expert":
        return "from-yellow-500 to-orange-500";
      default:
        return "from-gray-500 to-slate-500";
    }
  };

  const getConfidenceMessage = (level: string): string => {
    switch (level) {
      case "building":
        return "Building Foundation";
      case "growing":
        return "Growing Knowledge";
      case "strong":
        return "Strong Understanding";
      case "expert":
        return "Expert Level";
      default:
        return "Getting Started";
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Encouragement Display */}
      <AnimatePresence mode="wait">
        {activeMessage && showEncouragement && (
          <motion.div
            key={activeMessage.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`relative rounded-2xl bg-gradient-to-r p-6 ${getConfidenceColor(currentConfidence)} shadow-lg`}
          >
            <div className="flex items-start space-x-4">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
                className="flex-shrink-0 rounded-xl bg-white/20 p-3 backdrop-blur-sm"
              >
                <activeMessage.icon className="h-8 w-8 text-foreground" />
              </motion.div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-foreground/90 backdrop-blur-sm">
                    {getConfidenceMessage(currentConfidence)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveMessage(null)}
                    className="rounded-full p-1 text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground"
                  >
                    ✕
                  </motion.button>
                </div>

                <p className="text-lg font-medium leading-relaxed text-foreground">
                  {activeMessage.message}
                </p>

                {activeMessage.type !== "tip" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBoostConfidence}
                    className="mt-3 inline-flex items-center space-x-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-white/30"
                  >
                    <Smile className="h-4 w-4" />
                    <span>Get More Tips</span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Animated background elements */}
            <div className="absolute right-0 top-0 -mr-2 -mt-2 h-16 w-16 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-2 -ml-2 h-12 w-12 rounded-full bg-white/10 blur-lg"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Confidence Booster */}
      {dailyBooster && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-cyan-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 rounded-lg bg-cyan-50 p-3">
              <dailyBooster.icon className="h-6 w-6 text-cyan-600" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700">
                  Today's Boost
                </span>
                <span className="text-xs capitalize text-muted-foreground">
                  {dailyBooster.category.replace("-", " ")}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">{dailyBooster.title}</h3>

              <p className="text-gray-600">{dailyBooster.description}</p>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">Action: {dailyBooster.action}</p>
                <p className="text-sm text-gray-600">Benefit: {dailyBooster.benefit}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Beginner Tips Modal */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowTip(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Lightbulb className="h-8 w-8 text-[#22c55e]" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900">Quick Confidence Tip</h3>

                {beginnerTips.slice(0, 1).map((tip) => (
                  <div key={tip.id} className="space-y-3">
                    <div className="flex items-center justify-center space-x-2">
                      <tip.icon className="h-5 w-5 text-cyan-600" />
                      <span className="font-semibold text-gray-900">{tip.title}</span>
                      {tip.isImportant && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                          Important
                        </span>
                      )}
                    </div>

                    <p className="leading-relaxed text-gray-600">{tip.content}</p>
                  </div>
                ))}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTip(false)}
                  className="w-full rounded-lg bg-gradient-to-r from-primary to-sky-500 px-6 py-3 font-semibold text-foreground transition-colors hover:from-cyan-600 hover:to-sky-600"
                >
                  Got It! 💪
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Confidence Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowTip(true)}
          className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 text-left transition-colors hover:from-blue-100 hover:to-cyan-100"
        >
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Quick Tips</h4>
              <p className="text-sm text-gray-600">Get instant study advice</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBoostConfidence}
          className="rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-4 text-left transition-colors hover:from-green-100 hover:to-emerald-100"
        >
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 text-[#22c55e]" />
            <div>
              <h4 className="font-semibold text-gray-900">Confidence Boost</h4>
              <p className="text-sm text-gray-600">Feel motivated & ready</p>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
