"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, BookOpen, Clock, CheckCircle, Target, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLearningProgress } from "./LearningProgressProvider";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export function LearningNavigation() {
  const pathname = usePathname() || "";
  const { currentDomain, currentModule, domains, getProgress } = useLearningProgress();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Study", href: "/study" }];

    if (segments.includes("learning")) {
      breadcrumbs.push({ label: "Learning Modules", href: "/learning" });
    }

    if (currentDomain) {
      const domain = domains.find((d) => d.id === currentDomain);
      if (domain) {
        breadcrumbs.push({
          label: domain.title,
          href: `/learning/${domain.id}`,
          current: !currentModule,
        });
      }
    }

    if (currentModule && currentDomain) {
      const domain = domains.find((d) => d.id === currentDomain);
      const module = domain?.modules.find((m) => m.id === currentModule);
      if (module) {
        breadcrumbs.push({
          label: module.title,
          current: true,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const progress = getProgress();

  return (
    <div className="sticky top-0 z-40 border-b border-primary/30 bg-black/40 backdrop-blur-sm">
      <div className="px-6 py-4">
        {/* Back Navigation */}
        <div className="mb-4 flex items-center gap-4">
          <Link
            href="/study"
            className="inline-flex items-center gap-2 text-primary transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Study Dashboard</span>
          </Link>
        </div>

        {/* Breadcrumbs */}
        <nav className="mb-4 flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              {item.href && !item.current ? (
                <Link
                  href={item.href}
                  className="text-primary transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    item.current ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Current Module Info */}
        {currentDomain && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Domain Progress */}
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/20 p-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    {domains.find((d) => d.id === currentDomain)?.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {progress.completedModules} of {progress.totalModules} modules completed
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <div className="h-2 w-32 rounded-full bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress.percentage)}%
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-[#22c55e]">
                <CheckCircle className="h-4 w-4" />
                <span>{progress.completedModules} Complete</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Target className="h-4 w-4" />
                <span>{progress.totalModules - progress.completedModules} Remaining</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <Clock className="h-4 w-4" />
                <span>{progress.estimatedTime}min left</span>
              </div>
            </div>
          </div>
        )}

        {/* Module Navigation - shown when in a specific module */}
        {currentModule && currentDomain && (
          <div className="mt-4 border-t border-gray-700 pt-4">
            <ModuleNavigation />
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleNavigation() {
  const { currentDomain, currentModule, domains, navigateToPreviousModule, navigateToNextModule } =
    useLearningProgress();

  if (!currentDomain || !currentModule) return null;

  const domain = domains.find((d) => d.id === currentDomain);
  if (!domain) return null;

  const currentModuleIndex = domain.modules.findIndex((m) => m.id === currentModule);
  const previousModule = currentModuleIndex > 0 ? domain.modules[currentModuleIndex - 1] : null;
  const nextModule =
    currentModuleIndex < domain.modules.length - 1 ? domain.modules[currentModuleIndex + 1] : null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        {previousModule && (
          <button
            onClick={() => navigateToPreviousModule()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <div className="text-left">
              <div className="text-xs text-muted-foreground">Previous</div>
              <div>{previousModule.title}</div>
            </div>
          </button>
        )}
      </div>

      <div className="flex-1 text-center">
        <div className="text-xs text-muted-foreground">
          Module {currentModuleIndex + 1} of {domain.modules.length}
        </div>
        <div className="text-sm font-medium text-foreground">
          {domain.modules[currentModuleIndex]?.title}
        </div>
      </div>

      <div className="flex-1 text-right">
        {nextModule && (
          <button
            onClick={() => navigateToNextModule()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Next</div>
              <div>{nextModule.title}</div>
            </div>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
