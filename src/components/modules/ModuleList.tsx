"use client";

import { useModules } from "@/contexts/ModuleContext";
import { TCODomain } from "@/types/exam";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, BookOpen, CheckCircle2, Filter, Grid, List, Play, Search } from "lucide-react";
import { useMemo, useState } from "react";
import ModuleProgress from "./ModuleProgress";
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

type ViewMode = "grid" | "list";
type FilterType = "all" | "not_started" | "in_progress" | "completed";
type SortType = "order" | "title" | "difficulty" | "domain" | "progress";

interface ModuleListProps {
  onModuleSelect?: (module: Module) => void;
  className?: string;
}

const domainLabels: Record<TCODomain, string> = {
  [TCODomain.ASKING_QUESTIONS]: "Asking Questions",
  [TCODomain.REFINING_QUESTIONS]: "Refining Questions",
  [TCODomain.REFINING_TARGETING]: "Refining Questions", // Alias uses same label
  [TCODomain.TAKING_ACTION]: "Taking Action",
  [TCODomain.NAVIGATION_MODULES]: "Navigation and Basic Module Functions",
  [TCODomain.REPORTING_EXPORT]: "Report Generation and Data Export",
  // Additional domain labels
  [TCODomain.SECURITY]: "Security",
  [TCODomain.FUNDAMENTALS]: "Fundamentals",
  [TCODomain.TROUBLESHOOTING]: "Troubleshooting",
};

const domainColors: Record<TCODomain, string> = {
  [TCODomain.ASKING_QUESTIONS]: "text-primary",
  [TCODomain.REFINING_QUESTIONS]: "text-[#22c55e]",
  [TCODomain.REFINING_TARGETING]: "text-[#22c55e]", // Alias uses same color
  [TCODomain.TAKING_ACTION]: "text-red-400",
  [TCODomain.NAVIGATION_MODULES]: "text-primary",
  [TCODomain.REPORTING_EXPORT]: "text-[#f97316]",
  // Additional domain colors
  [TCODomain.SECURITY]: "text-orange-400",
  [TCODomain.FUNDAMENTALS]: "text-sky-400",
  [TCODomain.TROUBLESHOOTING]: "text-pink-400",
};

function ModuleList({ onModuleSelect, className = "" }: ModuleListProps) {
  const {
    modules,
    moduleProgress,
    startModule,
    setCurrentModule,
    getOverallProgress,
    getCompletedModules,
    getInProgressModules,
    getNotStartedModules,
  } = useModules();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<TCODomain | "all">("all");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("order");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const overallStats = getOverallProgress();

  // Filter and sort modules
  const filteredAndSortedModules = useMemo(() => {
    const filtered = modules.filter((module) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          module.title.toLowerCase().includes(searchLower) ||
          module.description.toLowerCase().includes(searchLower) ||
          module.objectives.some((obj) => obj.description.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      // Domain filter
      if (selectedDomain !== "all" && module.domain !== selectedDomain) {
        return false;
      }

      // Status filter
      const progress = moduleProgress[module.id];
      if (selectedFilter !== "all") {
        const isCompleted = progress?.completedAt !== undefined;
        const isInProgress = progress?.startedAt && !progress.completedAt;
        const isNotStarted = !progress?.startedAt;

        switch (selectedFilter) {
          case "completed":
            if (!isCompleted) return false;
            break;
          case "in_progress":
            if (!isInProgress) return false;
            break;
          case "not_started":
            if (!isNotStarted) return false;
            break;
        }
      }

      return true;
    });

    // Sort modules
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "difficulty":
          const difficultyOrder = { Beginner: 0, Intermediate: 1, Advanced: 2 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case "domain":
          return a.domain.localeCompare(b.domain);
        case "progress":
          const aProgress = moduleProgress[a.id];
          const bProgress = moduleProgress[b.id];
          const aComplete = aProgress?.completedAt ? 100 : aProgress?.overallProgress || 0;
          const bComplete = bProgress?.completedAt ? 100 : bProgress?.overallProgress || 0;
          return bComplete - aComplete;
        case "order":
        default:
          // Use the order from the modules array (already in correct TCO order)
          return modules.indexOf(a) - modules.indexOf(b);
      }
    });

    return filtered;
  }, [modules, moduleProgress, searchTerm, selectedDomain, selectedFilter, sortBy]);

  const handleModuleClick = (module: Module) => {
    setCurrentModule(module);
    if (onModuleSelect) {
      onModuleSelect(module);
    }
  };

  const handleStartModule = (moduleId: string) => {
    startModule(moduleId);
    const selectedModule = modules.find((m) => m.id === moduleId);
    if (selectedModule) {
      handleModuleClick(selectedModule);
    }
  };

  const handleContinueModule = (moduleId: string) => {
    const selectedModule = modules.find((m) => m.id === moduleId);
    if (selectedModule) {
      handleModuleClick(selectedModule);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/30 bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-4"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold text-foreground">{overallStats.totalModules}</div>
              <div className="text-sm text-muted-foreground">Total Modules</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-[#22c55e]/30 bg-gradient-to-r from-green-500/20 to-green-600/20 p-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-[#22c55e]" />
            <div>
              <div className="text-2xl font-bold text-foreground">{overallStats.completedModules}</div>
              <div className="text-sm text-green-200">Completed</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[#f97316]/30 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 p-4"
        >
          <div className="flex items-center gap-3">
            <Play className="h-8 w-8 text-[#f97316]" />
            <div>
              <div className="text-2xl font-bold text-foreground">{overallStats.inProgressModules}</div>
              <div className="text-sm text-[#f97316]">In Progress</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/20 to-cyan-600/20 p-4"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold text-foreground">
                {Math.round(overallStats.averageCompletion)}%
              </div>
              <div className="text-sm text-cyan-200">Overall Progress</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <input
              type="text"
              placeholder="Search modules, objectives, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-10 pr-4 text-foreground placeholder-gray-400 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value as TCODomain | "all")}
            aria-label="Filter modules by domain"
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Domains</option>
            {Object.entries(domainLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as FilterType)}
            aria-label="Filter modules by status"
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            aria-label="Sort modules by"
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="order">TCO Order</option>
            <option value="title">Title</option>
            <option value="difficulty">Difficulty</option>
            <option value="domain">Domain</option>
            <option value="progress">Progress</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-1">
          <button
            onClick={() => setViewMode("grid")}
            title="Switch to grid view"
            aria-label="Switch to grid view"
            className={`rounded-md p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            title="Switch to list view"
            aria-label="Switch to list view"
            className={`rounded-md p-2 transition-colors ${
              viewMode === "list"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedModules.length} of {modules.length} modules
        </div>
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedDomain("all");
              setSelectedFilter("all");
              setSortBy("order");
            }}
            className="text-sm text-primary transition-colors hover:text-primary"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Module Grid/List */}
      <AnimatePresence mode="popLayout">
        {filteredAndSortedModules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center"
          >
            <Filter className="mx-auto mb-4 h-12 w-12 text-gray-600" />
            <h3 className="mb-2 text-lg font-medium text-muted-foreground">No modules found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className={`grid gap-6 ${
              viewMode === "grid" ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            }`}
          >
            {filteredAndSortedModules.map((module, index) => {
              const progress = moduleProgress[module.id] || {
                moduleId: module.id,
                completed: false,
                completedObjectives: [],
                currentSectionIndex: 0,
                timeSpent: 0,
              };

              return (
                <motion.div
                  key={module.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={viewMode === "list" ? "max-w-none" : ""}
                >
                  <ModuleProgress
                    module={module}
                    progress={progress}
                    onStartModule={() => handleStartModule(module.id)}
                    onContinueModule={() => handleContinueModule(module.id)}
                    className={`h-full cursor-pointer transition-transform duration-200 hover:scale-105`}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export both default and named export for compatibility
export default ModuleList;
export { ModuleList };
