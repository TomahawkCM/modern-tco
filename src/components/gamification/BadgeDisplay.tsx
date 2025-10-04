"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import {
  Trophy,
  Star,
  Crown,
  Flame,
  Brain,
  Target,
  Zap,
  Compass,
  BookOpen,
  GraduationCap,
  Clock,
  Building2,
  MessageSquareQuote,
  FileBarChart,
  TrendingUp,
  Footprints,
  Calendar,
  Sunrise,
  Moon,
  CheckCircle2,
  Lock,
} from "lucide-react";
import type { Badge as BadgeType, BadgeTier, BadgeCategory } from "@/lib/achievements";

interface BadgeDisplayProps {
  badge: BadgeType;
  earned?: boolean;
  earnedAt?: Date;
  progress?: number; // 0-100 for badges in progress
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const iconMap: Record<string, typeof Trophy> = {
  TrophyIcon: Trophy,
  StarIcon: Star,
  CrownIcon: Crown,
  FlameIcon: Flame,
  BrainIcon: Brain,
  TargetIcon: Target,
  ZapIcon: Zap,
  CompassIcon: Compass,
  BookOpenIcon: BookOpen,
  GraduationCapIcon: GraduationCap,
  ClockIcon: Clock,
  Building2Icon: Building2,
  MessageSquareQuoteIcon: MessageSquareQuote,
  FileBarChartIcon: FileBarChart,
  TrendingUpIcon: TrendingUp,
  FootprintsIcon: Footprints,
  CalendarIcon: Calendar,
  SunriseIcon: Sunrise,
  MoonIcon: Moon,
};

const tierBorderColors: Record<BadgeTier, string> = {
  bronze: "border-amber-600",
  silver: "border-gray-400",
  gold: "border-yellow-500",
  platinum: "border-purple-500",
};

const tierGradients: Record<BadgeTier, string> = {
  bronze: "from-amber-600/20 to-amber-900/20",
  silver: "from-gray-400/20 to-gray-600/20",
  gold: "from-yellow-500/20 to-yellow-700/20",
  platinum: "from-purple-500/20 to-purple-700/20",
};

export default function BadgeDisplay({
  badge,
  earned = false,
  earnedAt,
  progress = 0,
  showProgress = false,
  size = "md",
  onClick,
}: BadgeDisplayProps) {
  const Icon = iconMap[badge.icon] || Trophy;

  const sizeClasses = {
    sm: {
      container: "p-3",
      icon: "h-8 w-8",
      title: "text-xs",
      description: "text-xs",
      points: "text-xs",
    },
    md: {
      container: "p-4",
      icon: "h-12 w-12",
      title: "text-sm",
      description: "text-xs",
      points: "text-sm",
    },
    lg: {
      container: "p-6",
      icon: "h-16 w-16",
      title: "text-base",
      description: "text-sm",
      points: "text-base",
    },
  };

  const classes = sizeClasses[size];

  return (
    <Card
      className={`
        relative overflow-hidden transition-all
        ${classes.container}
        ${earned ? tierBorderColors[badge.tier] : "border-gray-700"}
        ${earned ? "border-2" : "border"}
        ${!earned ? "opacity-60 grayscale" : ""}
        ${onClick ? "cursor-pointer hover:scale-105" : ""}
        ${earned ? `bg-gradient-to-br ${tierGradients[badge.tier]}` : "bg-muted/30"}
      `}
      onClick={onClick}
    >
      {/* Earned Indicator */}
      {earned && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </div>
      )}

      {/* Locked Indicator */}
      {!earned && (
        <div className="absolute top-2 right-2">
          <Lock className="h-4 w-4 text-gray-500" />
        </div>
      )}

      {/* Badge Icon */}
      <div className="flex flex-col items-center gap-3">
        <div
          className={`
          rounded-full p-4
          ${earned ? tierGradients[badge.tier] : "bg-gray-800/50"}
          border-2
          ${earned ? tierBorderColors[badge.tier] : "border-gray-600"}
        `}
        >
          <Icon className={`${classes.icon} ${earned ? badge.color : "text-gray-500"}`} />
        </div>

        {/* Badge Details */}
        <div className="text-center space-y-1">
          <h3 className={`font-bold ${classes.title}`}>{badge.name}</h3>
          <p className={`${classes.description} text-muted-foreground`}>
            {badge.description}
          </p>

          {/* Criteria */}
          <div className="flex items-center justify-center gap-1 pt-1">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {badge.criteria.description}
            </span>
          </div>

          {/* Points */}
          <div className="flex items-center justify-center gap-1 pt-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className={`${classes.points} font-bold text-yellow-500`}>
              {badge.points} points
            </span>
          </div>
        </div>

        {/* Progress Bar (if in progress) */}
        {showProgress && !earned && progress > 0 && (
          <div className="w-full space-y-1 pt-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {/* Earned Date */}
        {earned && earnedAt && (
          <div className="text-xs text-muted-foreground pt-1">
            Earned {new Date(earnedAt).toLocaleDateString()}
          </div>
        )}

        {/* Tier Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge
            variant="outline"
            className={`text-xs ${earned ? tierBorderColors[badge.tier] : "border-gray-600"}`}
          >
            {badge.tier.toUpperCase()}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
