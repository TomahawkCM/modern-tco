"use client";

import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";
import { Button } from "@/components/ui/button";

export interface PageHeaderAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline" | "ghost";
  icon?: ReactNode;
  ariaLabel?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: PageHeaderAction[];
  className?: string;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className = "",
  children,
}: PageHeaderProps) {
  return (
    <header className={`mb-section ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

      {/* Title & Actions Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Title & Description */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
          {description && (
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">{description}</p>
          )}
        </div>

        {/* Quick Actions */}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={action.onClick}
                className="min-h-touch"
                aria-label={action.ariaLabel || action.label}
              >
                {action.icon && (
                  <span className="mr-2" aria-hidden="true">
                    {action.icon}
                  </span>
                )}
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Optional children (tabs, filters, etc.) */}
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}

/**
 * Simplified header for pages that don't need actions
 */
export function SimplePageHeader({
  title,
  description,
  breadcrumbs,
}: Pick<PageHeaderProps, "title" | "description" | "breadcrumbs">) {
  return <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />;
}
