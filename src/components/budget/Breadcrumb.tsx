'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname || '/budget-app');

  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-4 flex items-center text-sm ${className}`}
    >
      <ol className="flex items-center space-x-2">
        {/* Home crumb */}
        <li>
          <Link
            href="/budget-app"
            className="flex items-center text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-1"
            aria-label="Home"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {/* Path crumbs */}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li key={item.href} className="flex items-center">
              <ChevronRight
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              {isLast ? (
                <span
                  className="ml-2 font-medium text-foreground"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="ml-2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-1"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Auto-generate breadcrumbs from pathname
 * Examples:
 *   /budget-app/transactions → [{ label: "Transactions", href: "/budget-app/transactions" }]
 *   /budget-app/loans/123 → [{ label: "Loans", href: "/budget-app/loans" }, { label: "Details", href: "/budget-app/loans/123" }]
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);

  // Remove 'budget-app' prefix
  if (segments[0] === 'budget-app') {
    segments.shift();
  }

  // If on home page, return empty
  if (segments.length === 0) {
    return [];
  }

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '/budget-app';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Format label (capitalize, remove dashes/underscores)
    let label = segment
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // If it's a UUID or number (detail page), use generic "Details"
    if (/^[0-9a-f-]{36}$/.test(segment) || /^\d+$/.test(segment)) {
      label = 'Details';
    }

    // Special labels for known routes
    const labelMap: Record<string, string> = {
      ocr: 'OCR',
      'future': 'Future Plans',
      'retirement': 'Retirement Planning',
    };

    breadcrumbs.push({
      label: labelMap[segment] || label,
      href: currentPath,
    });
  });

  return breadcrumbs;
}

/**
 * Structured data for breadcrumbs (SEO)
 */
export function getBreadcrumbJsonLd(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${process.env.NEXT_PUBLIC_SITE_URL || ''}${item.href}`,
    })),
  };
}
