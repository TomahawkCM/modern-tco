/**
 * Server-Side Modules Page - Static MDX Module Browser
 * Browse all TCO study modules with server-side rendering
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Search, Clock, Target, BookOpen, ChevronRight } from "lucide-react";

import { discoverModules, type ModuleMetadata } from "@/lib/content-discovery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModulesStaticTable } from "@/components/modules/ModulesStaticTable";
import type { ModuleListRow } from "@/components/modules/module-table-types";

export const metadata: Metadata = {
  title: "Study Modules - TCO Certification Prep",
  description:
    "Master all 5 TCO certification domains through interactive study modules, hands-on labs, and comprehensive assessments.",
  keywords:
    "TCO, Tanium Certified Operator, study modules, certification prep, interactive learning",
};

// Module card component
function ModuleCard({ module }: { module: ModuleMetadata }) {
  return (
    <Card className="h-full transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary">{module.domainSlug}</Badge>
          <Badge variant="outline">{module.difficulty}</Badge>
        </div>
        <CardTitle className="text-xl">{module.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {module.objectives.slice(0, 2).join(". ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{module.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{module.objectives.length} objectives</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{module.readingTime} min</span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1">
          {module.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {module.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{module.tags.length - 3}
            </Badge>
          )}
        </div>

        <Button asChild className="w-full">
          <Link href={`/modules/${module.slug}`}>
            Start Module
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// Modules content component
async function ModulesContent() {
  const { modules, errors, validModules } = await discoverModules();

  if (errors.length > 0) {
    console.error("Module discovery errors:", errors);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">Study Modules</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          Master Tanium Certified Operator certification through interactive study modules
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{validModules} modules available</span>
          {errors.length > 0 && (
            <span className="text-destructive">{errors.length} modules with errors</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input 
            placeholder="Search modules..." 
            className="pl-10" 
            aria-label="Search modules"
          />
        </div>

        <Select>
          <SelectTrigger 
            className="w-full sm:w-48"
            aria-label="Filter modules by domain"
          >
            <SelectValue placeholder="All Domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            <SelectItem value="asking-questions">Asking Questions</SelectItem>
            <SelectItem value="refining-questions-targeting">Refining Questions</SelectItem>
            <SelectItem value="taking-action-packages-actions">Taking Action</SelectItem>
            <SelectItem value="navigation-basic-modules">Navigation & Modules</SelectItem>
            <SelectItem value="reporting-data-export">Reporting & Export</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger 
            className="w-full sm:w-40"
            aria-label="Filter modules by difficulty level"
          >
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
            <SelectItem value="Expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Modules Table (Tanium-like list with filters) */}
      {modules.length > 0 ? (
        <>
          <Card className="mb-6 border-white/10">
            <CardHeader>
              <CardTitle>All Modules</CardTitle>
              <CardDescription>Sortable, filterable list of modules</CardDescription>
            </CardHeader>
            <CardContent>
              <ModulesStaticTable
                rows={modules.map((m): ModuleListRow => ({
                  id: m.id,
                  title: m.title,
                  domain: m.domainSlug,
                  difficulty: m.difficulty,
                  estimatedTimeMinutes: parseInt(String(m.estimatedTime).split(" ")[0]) || 0,
                  slug: m.slug,
                }))}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-medium">No modules found</h3>
          <p className="text-muted-foreground">
            {errors.length > 0
              ? "There are errors with the module files. Check the console for details."
              : "No study modules are available at this time."}
          </p>
        </div>
      )}

      {/* Error Summary */}
      {errors.length > 0 && process.env.NODE_ENV === "development" && (
        <Card className="mt-8 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Module Discovery Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="text-sm">
                  <strong>{error.module}:</strong> {error.validationError}
                  {error.suggestion && (
                    <div className="ml-4 text-muted-foreground">Suggestion: {error.suggestion}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Loading component
function ModulesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-10 w-64 animate-pulse rounded bg-muted" />
          <div className="h-6 w-96 animate-pulse rounded bg-muted" />
        </div>

        <div className="flex gap-4">
          <div className="h-10 flex-1 animate-pulse rounded bg-muted" />
          <div className="h-10 w-48 animate-pulse rounded bg-muted" />
          <div className="h-10 w-40 animate-pulse rounded bg-muted" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ServerModulesPage() {
  return (
    <Suspense fallback={<ModulesLoading />}>
      <ModulesContent />
    </Suspense>
  );
}
