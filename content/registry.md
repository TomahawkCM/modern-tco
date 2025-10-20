# MDX Component Registry Audit

## Purpose
Catalog registered MDX components available for the Codex rewrite to ensure safe reuse and consistent learner experience.

## Registered Components (excerpt)
- **Callout** – Variants: `note`, `definition`, `info`, `try`, `warning`, `tip`, `caution`, `lab`, `summary`, `next`.
- **InfoBox** – Use for emphasis, tips, and TCO exam notes.
- **MicroQuizMDX** – Inline single-question assessments; requires `id`, `question`, `answers`, and `correct` index.
- **PracticeButton** – Launches guided practice or external tool.
- **QueryPlayground** – Interactive query builder; maintain existing prop contract (`instruction`, `expectedQuery`, etc.).
- **Steps**, **Tabs**, **Accordion** – Present sequential or grouped content.
- **ModuleTransition** – Provide navigation to next module.

## Usage Guidelines
- Prefer existing components before introducing new ones.
- Do not rename or remove components; extend via props when necessary.
- Wrap interactive components in `<ClientOnly>` when they depend on browser APIs.
- Document non-obvious props in `content/examples.mdx` with canonical snippets.

## Proposal for Optional Additions
- Evaluate lightweight `GlossaryTerm` component for inline definitions (pending approval).
- Consider reusable `ActiveRecall` block that renders question lists; ensure SSR friendly.

## Change Control
- Any new component requires TypeScript typings, story/demo, and accessibility review.
- Update this registry document alongside component changes.
