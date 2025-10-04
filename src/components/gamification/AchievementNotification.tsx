"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, X, TrendingUp } from "lucide-react";
import type { Achievement } from "@/lib/gamification";
import { cn } from "@/lib/utils";

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

/**
 * Achievement Notification Component
 *
 * Toast-style notification that appears when an achievement is unlocked
 */
export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-500 bg-gradient-to-r from-gray-500/20 to-gray-600/20";
      case "uncommon":
        return "border-green-500 bg-gradient-to-r from-green-500/20 to-green-600/20";
      case "rare":
        return "border-blue-500 bg-gradient-to-r from-blue-500/20 to-blue-600/20";
      case "epic":
        return "border-purple-500 bg-gradient-to-r from-purple-500/20 to-purple-600/20";
      case "legendary":
        return "border-yellow-500 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 shadow-[0_0_20px_rgba(234,179,8,0.3)]";
      default:
        return "border-gray-500 bg-gradient-to-r from-gray-500/20 to-gray-600/20";
    }
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 transition-all duration-300",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <Card
        className={cn(
          "border-2 p-4 shadow-xl backdrop-blur-sm",
          getRarityColor(achievement.rarity)
        )}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Trophy className="h-6 w-6 text-yellow-500 animate-bounce" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-white">Achievement Unlocked!</h4>
              <Badge variant="outline" className="text-xs">
                {achievement.rarity}
              </Badge>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{achievement.icon}</span>
              <span className="font-semibold text-gray-200">{achievement.name}</span>
            </div>

            <p className="text-sm text-gray-400 mb-2">
              {achievement.description}
            </p>

            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              +{achievement.points} points
            </Badge>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </Card>
    </div>
  );
}

/**
 * Achievement Notification Manager
 *
 * Manages a queue of achievement notifications
 */
export function AchievementNotificationManager() {
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [current, setCurrent] = useState<Achievement | null>(null);

  // Listen for new achievements
  useEffect(() => {
    const handleAchievementUnlocked = (e: CustomEvent<Achievement>) => {
      setQueue(prev => [...prev, e.detail]);
    };

    window.addEventListener(
      "achievement-unlocked" as any,
      handleAchievementUnlocked as EventListener
    );

    return () => {
      window.removeEventListener(
        "achievement-unlocked" as any,
        handleAchievementUnlocked as EventListener
      );
    };
  }, []);

  // Show next achievement from queue
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(prev => prev.slice(1));
    }
  }, [current, queue]);

  const handleClose = () => {
    setCurrent(null);
  };

  if (!current) return null;

  return <AchievementNotification achievement={current} onClose={handleClose} />;
}

/**
 * Helper function to dispatch achievement unlock event
 */
export function notifyAchievementUnlocked(achievement: Achievement) {
  const event = new CustomEvent("achievement-unlocked", { detail: achievement });
  window.dispatchEvent(event);
}

export default AchievementNotificationManager;
