/**
 * Domain-Module Cross-Links Component
 * Reusable components for linking between domains and modules
 */

import Link from "next/link";
import { ChevronRight, BookOpen, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getModulesForDomain,
  getDomainForModule,
  getDomainDisplayName,
  getDomainRouteSlug,
} from "@/lib/domain-module-mapper";
import type { ModuleMetadata } from "@/lib/content-discovery";

interface ModuleLinkCardProps {
  module: ModuleMetadata;
  showDomain?: boolean;
}

export function ModuleLinkCard({ module, showDomain = false }: ModuleLinkCardProps) {
  return (
    <Card className="h-full transition-shadow hover:shadow-lg">
      <CardHeader>
        {showDomain && (
          <Badge variant="secondary" className="mb-2 w-fit">
            {getDomainDisplayName(module.domainSlug)}
          </Badge>
        )}
        <CardTitle className="text-lg">{module.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {module.objectives.slice(0, 2).join(". ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{module.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{module.objectives.length} objectives</span>
          </div>
        </div>

        <Button asChild size="sm" className="w-full">
          <Link href={`/modules/${module.slug}`}>
            Start Module
            <ChevronRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface DomainModulesListProps {
  domainSlug: string;
  modules: ModuleMetadata[];
  title?: string;
  showAll?: boolean;
  maxModules?: number;
}

export function DomainModulesList({
  domainSlug,
  modules,
  title,
  showAll = false,
  maxModules = 3,
}: DomainModulesListProps) {
  const domainModules = modules.filter((module) => module.domainSlug === domainSlug);
  const displayModules = showAll ? domainModules : domainModules.slice(0, maxModules);
  const hasMore = domainModules.length > maxModules && !showAll;

  if (domainModules.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          {hasMore && (
            <Link
              href={`/modules/server?domain=${domainSlug}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              View all {domainModules.length} modules
              <ChevronRight className="ml-1 inline h-3 w-3" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayModules.map((module) => (
          <ModuleLinkCard key={module.id} module={module} />
        ))}
      </div>

      {hasMore && (
        <div className="pt-4 text-center">
          <Button variant="outline" asChild>
            <Link href={`/modules/server?domain=${domainSlug}`}>
              View all {domainModules.length} modules
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

interface ModuleDomainBreadcrumbProps {
  moduleSlug: string;
  showModulesLink?: boolean;
}

export function ModuleDomainBreadcrumb({
  moduleSlug,
  showModulesLink = true,
}: ModuleDomainBreadcrumbProps) {
  const domainSlug = getDomainForModule(moduleSlug);

  if (!domainSlug) {
    return null;
  }

  const domainName = getDomainDisplayName(domainSlug);
  const domainRoute = getDomainRouteSlug(domainSlug);

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link href="/study" className="transition-colors hover:text-primary">
        Study
      </Link>
      <ChevronRight className="h-3 w-3" />

      <Link href={`/study/${domainRoute}`} className="transition-colors hover:text-primary">
        {domainName}
      </Link>
      <ChevronRight className="h-3 w-3" />

      {showModulesLink && (
        <>
          <Link href="/modules/server" className="transition-colors hover:text-primary">
            Modules
          </Link>
          <ChevronRight className="h-3 w-3" />
        </>
      )}

      <span className="text-foreground">Current Module</span>
    </nav>
  );
}

interface DomainLinkButtonProps {
  domainSlug: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function DomainLinkButton({
  domainSlug,
  variant = "outline",
  size = "default",
  className,
}: DomainLinkButtonProps) {
  const domainName = getDomainDisplayName(domainSlug);
  const domainRoute = getDomainRouteSlug(domainSlug);

  return (
    <Button variant={variant} size={size} asChild className={className}>
      <Link href={`/study/${domainRoute}`}>
        Study {domainName}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}
