"use client";

import type { TCODomain } from "@/types/exam";
import type { ModuleProgress as ModuleProgressType } from "@/types/module";
import { getDomainRouteSlug } from "@/utils/domainMapper";
import { motion } from "framer-motion";
import { Award, BookOpen, CheckCircle, Clock, Star, Target, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";

// Define Module interface locally to match the one used in ModuleContext
interface Module {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: number;
  objectives: Array<{ id: string; description: string }>;
  sections: Array<{ id: string; title: string }>;
}

interface ModuleProgressProps {
  module: Module;
  progress: ModuleProgressType;
  onStartModule?: () => void;
  onContinueModule?: () => void;
  className?: string;
}

const domainColors = {
  ASKING_QUESTIONS: {
    bg: "from-blue-500/20 to-blue-600/20",
    border: "border-primary/30",
    text: "text-primary",
    accent: "bg-primary",
    hover: "hover:from-blue-500/30 hover:to-blue-600/30",
  },
  REFINING_QUESTIONS: {
    bg: "from-green-500/20 to-green-600/20",
    border: "border-[#22c55e]/30",
    text: "text-[#22c55e]",
    accent: "bg-[#22c55e]",
    hover: "hover:from-green-500/30 hover:to-green-600/30",
  },
  TAKING_ACTION: {
    bg: "from-red-500/20 to-red-600/20",
    border: "border-red-500/30",
    text: "text-red-400",
    accent: "bg-red-500",
    hover: "hover:from-red-500/30 hover:to-red-600/30",
  },
  NAVIGATION_MODULES: {
    bg: "from-primary/20 to-cyan-600/20",
    border: "border-primary/30",
    text: "text-primary",
    accent: "bg-cyan-500",
    hover: "hover:from-primary/30 hover:to-cyan-600/30",
  },
  REPORTING_EXPORT: {
    bg: "from-yellow-500/20 to-yellow-600/20",
    border: "border-[#f97316]/30",
    text: "text-[#f97316]",
    accent: "bg-yellow-500",
    hover: "hover:from-yellow-500/30 hover:to-yellow-600/30",
  },
};

const difficultyConfig = {
  Beginner: { color: "text-[#22c55e]", bg: "bg-[#22c55e]/20", icon: Star },
  Intermediate: { color: "text-[#f97316]", bg: "bg-[#f97316]/20", icon: TrendingUp },
  Advanced: { color: "text-red-400", bg: "bg-red-500/20", icon: Award },
};

export default function ModuleProgress({
  module,
  progress,
  onStartModule,
  onContinueModule,
  className = "",
}: ModuleProgressProps) {
  const router = useRouter();
  const colors = (domainColors as any)[module.domain] || {
    bg: "from-gray-500/20 to-gray-600/20",
    border: "border-gray-500/30",
    text: "text-muted-foreground",
    accent: "bg-gray-500",
    hover: "hover:from-gray-500/30 hover:to-gray-600/30",
  };
  const difficultyInfo = difficultyConfig[module.difficulty] || {
    color: "text-muted-foreground",
    bg: "bg-gray-500/20",
    icon: Star,
  };
  const DifficultyIcon = difficultyInfo.icon;

  const completedObjectives = progress.sectionsCompleted.length;

  const totalObjectives = module.objectives.length;
  const objectiveProgress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

  const isCompleted = progress.completedAt !== undefined;
  const isInProgress = progress.lastAccessedAt && !progress.completedAt;
  const isNotStarted = !progress.lastAccessedAt;

  // Navigation handler to study content
  const handleNavigateToStudy = () => {
    const routeSlug = getDomainRouteSlug(module.domain as TCODomain);
    router.push(`/study/${routeSlug}`);
  };

  const getStatusInfo = () => {
    if (isCompleted) {
      return {
        status: "Completed",
        statusColor: "text-[#22c55e]",
        statusBg: "bg-[#22c55e]/20",
        icon: CheckCircle,
        action: "Review Module",
        actionHandler: handleNavigateToStudy,
      };
    } else if (isInProgress) {
      return {
        status: "In Progress",
        statusColor: colors.text,
        statusBg: `${colors.bg.replace("from-", "bg-").split(" ")[0]}/20`,
        icon: Clock,
        action: "Continue Module",
        actionHandler: handleNavigateToStudy,
      };
    } else {
      return {
        status: "Not Started",
        statusColor: "text-muted-foreground",
        statusBg: "bg-gray-500/20",
        icon: BookOpen,
        action: "Start Module",
        actionHandler: handleNavigateToStudy,
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-[#22c55e]";
    if (percentage >= 75) return colors.accent;
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border backdrop-blur-sm ${colors.border} bg-gradient-to-br ${colors.bg} ${className}`}
    >
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-12 w-12 rounded-lg ${colors.bg} ${colors.border} flex items-center justify-center border text-xl`}
            >
              📚
            </div>
            <div>
              <h3 className="mb-1 text-xl font-semibold text-foreground">{module.title}</h3>
              <div className="flex items-center gap-3 text-sm">
                <span
                  className={`rounded-full px-2 py-1 ${difficultyInfo.bg} ${difficultyInfo.color} flex items-center gap-1`}
                >
                  <DifficultyIcon className="h-3 w-3" />
                  {module.difficulty}
                </span>
                <span
                  className={`rounded-full px-2 py-1 ${statusInfo.statusBg} ${statusInfo.statusColor} flex items-center gap-1`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {statusInfo.status}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="mb-1 text-2xl font-bold text-foreground">
              {Math.round(objectiveProgress)}%
            </div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{module.description}</p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground">
              {completedObjectives} of {totalObjectives} objectives
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-card/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${objectiveProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${getProgressColor(objectiveProgress)} rounded-full`}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="mb-1 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Estimated</span>
          </div>
          <div className="text-lg font-semibold text-foreground">{module.estimatedTime}</div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#22c55e]" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Time Spent</span>
          </div>
          <div className="text-lg font-semibold text-foreground">
            {progress.totalTimeSpent ? formatTimeSpent(progress.totalTimeSpent) : "0m"}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="mb-1 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Objectives</span>
          </div>
          <div className="text-lg font-semibold text-foreground">
            {completedObjectives}/{totalObjectives}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="mb-1 flex items-center gap-2">
            <Users className="h-4 w-4 text-[#f97316]" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Domain</span>
          </div>
          <div className={`text-sm font-medium ${colors.text} truncate`}>
            {module.domain.replace(/_/g, " ")}
          </div>
        </div>
      </div>

      {/* Quick Objectives Preview */}
      {module.objectives.length > 0 && (
        <div className="px-6 pb-4">
          <h4 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Learning Objectives
          </h4>
          <div className="max-h-32 space-y-2 overflow-y-auto">
            {module.objectives.slice(0, 4).map((objective, index) => {
              // Show first N objectives as completed based on progress count
              const isCompleted = index < completedObjectives;
              return (
                <div key={objective.id} className="flex items-start gap-2">
                  <CheckCircle
                    className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                      isCompleted ? "text-[#22c55e]" : "text-gray-600"
                    }`}
                  />
                  <span className={`text-sm ${isCompleted ? "text-muted-foreground" : "text-muted-foreground"}`}>
                    {objective.description}
                  </span>
                </div>
              );
            })}
            {module.objectives.length > 4 && (
              <div className="ml-6 text-xs text-muted-foreground">
                +{module.objectives.length - 4} more objectives...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="p-6 pt-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={statusInfo.actionHandler}
          disabled={!statusInfo.actionHandler}
          className={`w-full rounded-lg bg-gradient-to-r px-4 py-3 font-medium text-foreground ${colors.bg} ${colors.border} border backdrop-blur-sm ${colors.hover} transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {statusInfo.action}
        </motion.button>
      </div>

      {/* Completion Badge */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute right-4 top-4"
        >
          <div className="rounded-full bg-[#22c55e] p-2 text-foreground shadow-lg">
            <Award className="h-5 w-5" />
          </div>
        </motion.div>
      )}

      {/* Prerequisites Warning */}
      {isNotStarted && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-[#f97316]/30 bg-[#f97316]/10 p-3">
          <div className="flex items-center gap-2 text-sm text-[#f97316]">
            <Star className="h-4 w-4" />
            <span>Ready to start this module</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
