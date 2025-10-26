# shadcn/ui Patterns and Upgrades

This document captures the shadcn/ui setup, patterns implemented, file locations, and how to extend them consistently across the app.

## Overview

Implemented patterns mirror Tanium Console conventions:
- Global Command Palette for search/actions
- User Menu dropdown in the header
- Resizable split views (table + chart)
- Data table with filters/faceting and column manager

## What’s Implemented

- Command Palette
  - Files: `src/components/layout/app-header.tsx`
  - Shortcut: Ctrl/Cmd+K (Escape closes)
  - Library: `@/components/ui/command`

- User Menu Dropdown
  - Files: `src/components/layout/UserMenu.tsx`
  - Library: `@/components/ui/dropdown-menu`

- Resizable Panels
  - Files: `src/components/ui/resizable.tsx`
  - Library: `react-resizable-panels`
  - Usage example: Analytics → Domains tab

- Data Table (TanStack Table)
  - Files:
    - `src/components/data-table/DataTable.tsx` (base table)
    - `src/components/data-table/DomainStatsTable.tsx` (filters, facets, sticky header)
    - `src/components/data-table/columns.tsx` / `types.ts`
  - Features:
    - Text filter (domain)
    - Facet chips (domain)
    - Minimum score dropdown (0/60/70/80/90)
    - Column visibility manager
    - Sortable headers
    - Sticky header + scrollable body
    - Persisted state (filters, sorting, visibility, facets) via localStorage

## Where It’s Wired

- Analytics page (`src/app/analytics/page.tsx`)
  - Tabs → `domains` uses a resizable split between `DomainStatsTable` and `DomainRadarChart`.
  - Reuses ProgressContext domain stats.

## How To Extend to Other Views

1) Add a new table
- Create `YourXxxTable.tsx` in `src/components/data-table/`.
- Define `types.ts` (row type) and `columns.tsx` (ColumnDef array).
- Compose `DataTable` with your columns and data.

2) Add filters/facets + persistence
- Text filter: bind to `table.getColumn('yourCol').setFilterValue(e.target.value)`.
- Facets: maintain `selectedX: string[]`; set as the filter value for the target column and implement `filterFn` in that column similar to `domainColumns`.
- Numeric thresholds: use a dropdown + custom filter function or store `{ min: number }` for range semantics.
- Persist state using `usePersistentState(key, initial)` from `src/lib/usePersistentState.ts`.

3) Make headers sticky
- Wrap table in a container with `max-h-[Npx] overflow-auto` and apply sticky header styles as in `DomainStatsTable`.

4) Resizable layout
- Use `ResizablePanelGroup`, `ResizablePanel`, and `ResizableHandle` from `src/components/ui/resizable.tsx`.
- Keep sensible `defaultSize` and `minSize`.

5) Keyboard shortcuts
- For global palette, ensure the `useEffect` key handler is in a top-level header component.
- Avoid duplicate listeners when nesting layouts (one palette per top shell).

## Design Notes

- Theme: project currently forces dark cyberpunk theme in `globals.css`. If you want dynamic theming, re-enable `ThemeProvider` and relax global dark enforcement.
- Accessibility: Use shadcn primitives (`Dialog`, `AlertDialog`, `Tabs`, `Tooltip`) and keep aria-labels for icon-only buttons.

## Dependencies

- `@tanstack/react-table`
- `react-resizable-panels`

## Next Steps (Recommended)

- Extend the data-table pattern to Modules and Server views (filters: difficulty, status, estimated time).
- Add persisted table state (filters/columns/sort) via `localStorage`.
- Add `resizable` split to additional analytics/drilldown pages.
