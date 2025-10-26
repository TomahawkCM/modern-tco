# Code Style & Conventions - Modern TCO

## TypeScript Configuration

- **Target**: ES2018 with DOM and ES6 libraries
- **Module Resolution**: bundler (Next.js optimized)
- **Strict Mode**: Enabled for maximum type safety
- **Path Mapping**: Comprehensive alias system using `@/` prefix

## Path Aliases

```typescript
{
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/hooks/*": ["./src/hooks/*"],
  "@/types/*": ["./src/types/*"],
  "@/data/*": ["./src/data/*"],
  "@/services/*": ["./src/services/*"]
}
```

## File Organization

```text
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
│   ├── exam/        # Exam-specific components
│   └── ui/          # shadcn/ui base components
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── services/        # API and business logic
├── types/           # TypeScript type definitions
└── data/            # Static data and question banks
```

## Naming Conventions

- **Files**: kebab-case for files, PascalCase for React components
- **Components**: PascalCase (e.g., `ExamSession.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useDatabase.ts`)
- **Types**: PascalCase (e.g., `ExamSession`, `DatabaseTables`)
- **Constants**: UPPER_SNAKE_CASE
- **Variables**: camelCase

## Component Structure

```typescript
'use client' // For client components

import { dependencies } from 'external-packages'
import { localImports } from '@/local/modules'

interface ComponentProps {
  // TypeScript interface for props
}

export default function ComponentName({ props }: ComponentProps) {
  // Component logic
  return (
    // JSX with Tailwind classes
  )
}
```

## Context Pattern

```typescript
interface ContextState {
  // State interface
}

interface ContextActions {
  // Action interface
}

const Context = createContext<(ContextState & ContextActions) | undefined>(undefined);

export function ContextProvider({ children }: { children: React.ReactNode }) {
  // Provider implementation with useReducer
}

export function useContextHook() {
  // Custom hook with error handling
}
```

## Styling Conventions

- **Primary**: Tailwind CSS utility classes
- **Custom Colors**: Tanium brand colors (tanium-primary, tanium-accent, etc.)
- **Glass Effects**: Custom glassmorphic designs using backdrop blur
- **Responsive**: Mobile-first responsive design
- **Dark Mode**: CSS variables with `class` strategy

## Type Safety

- **Strict TypeScript**: All files must pass type checking
- **Supabase Types**: Generated types from database schema
- **Zod Validation**: Schema validation for forms and API data
- **No `any` Types**: Explicit typing required

## Error Handling

- **Try-Catch**: Wrap async operations
- **Error Boundaries**: React error boundaries for UI errors
- **Console Logging**: Structured logging for debugging
- **Fallback UI**: Graceful error states

## Performance Patterns

- **Code Splitting**: Dynamic imports for heavy components
- **Memoization**: React.memo and useMemo for expensive operations
- **Lazy Loading**: Next.js lazy loading for routes
- **Caching**: 5-minute cache for database operations

## Accessibility

- **WCAG 2.1 AA**: Compliance target
- **Semantic HTML**: Proper HTML structure
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: ARIA labels and descriptions
- **Color Contrast**: Sufficient contrast ratios
