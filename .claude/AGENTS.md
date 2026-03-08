# Agent System

> See also: [CLAUDE.md](./CLAUDE.md) | [TOOLS.md](./TOOLS.md) | [WORKFLOWS.md](./WORKFLOWS.md)

## Auto-Spawn Patterns

| Task Type | Primary Agent(s) |
|-----------|------------------|
| UI work | Task tool with react/typescript context |
| shadcn/ui | shadcn MCP tools (registry, variants, theming) |
| Database | Supabase specialist, RLS policies |
| Testing | Playwright for E2E, Vitest for unit |
| Debugging | Task tool with debug context |
| Library docs | context7 (resolve-library-id + get-library-docs) |
| Browser automation | Playwright MCP or agent-browser CLI |
| Budget App | Bank import parsing, financial data management |

## shadcn Project Context

| Setting | Value |
|---------|-------|
| Style | `new-york` |
| RSC | `true` |
| TypeScript | `true` |
| Base Color | `neutral` |
| CSS Variables | enabled |
| Components Path | `src/components/ui/` |
| Globals CSS | `src/app/globals.css` |
| Registry | `@shadcn` |

## Component Workflow

1. Search shadcn registry → `search_items_in_registries`
2. View examples → `get_item_examples_from_registries`
3. Install → `npx shadcn@latest add [component]`
4. Customize with CVA variants
5. Add accessibility (ARIA, keyboard nav)
6. Test visually → `playwright.browser_snapshot`

## Budget App Import Pipeline

1. File Upload (CSV/OFX/PDF/QIF/MT940/CAMT.053)
2. Format Detection → identify file type
3. Bank Detection → signature patterns + AI fallback
4. Parsing → bank-specific logic
5. Duplicate Detection → FITID/fuzzy/AI matching
6. Validation → anomaly + business rules
7. Enrichment → merchant normalization, categories
8. Preview → user review
9. Import → bulk add to IndexedDB

## i18n / Locale Work

- **Translating locales**: Use `/budget:translate-locales` skill
- **Adding new keys**: Add to `src/i18n/messages/en.json` under the appropriate namespace, then sync to other locales
- **Key hooks**: `useDefaultCurrency()`, `useLocale()`, `useTranslations()`, `formatCurrency()`
- **Utilities**: `src/i18n/utils/formatCurrency.ts`, `src/hooks/useDefaultCurrency.ts`, `src/lib/locale-storage.ts`

## Key Budget App Files

| Category | Files |
|----------|-------|
| **Parsers** | `csv-parser.ts`, `ofx-parser.ts`, `pdf-bank-parser.ts`, `bank-configs.ts`, `qif-parser.ts`, `mt940-parser.ts`, `camt053-parser.ts` |
| **AI** | `smart-bank-detection.ts`, `smart-column-mapper.ts`, `smart-duplicate-detection.ts` |
| **Database** | `budget-db.ts`, `subscription-detector.ts` |
| **Components** | `AIColumnMapperModal.tsx`, `ErrorRecoveryModal.tsx`, `ValidationWarningsModal.tsx` |
