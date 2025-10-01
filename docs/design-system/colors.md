## Color System Guidelines

The app now centralizes palette management through Tailwind CSS variables defined in `src/app/globals.css`. Use the semantic tokens below instead of hard-coded hex values or utility colors:

- `--background` / `bg-background` – page background and default surface
- `--surface` / `bg-surface` – elevated panels, cards, modals
- `--primary` / `bg-primary` – core cyan brand tone for call-to-action elements
- `--accent` / `bg-accent` – supporting purple highlight used sparingly for emphasis
- `--success`, `--warning`, `--destructive` – status messaging and feedback states
- `--muted` / `text-muted-foreground` – secondary text, supporting copy, quiet UI elements

### Usage principles

1. **Reach for tokens first.** Prefer Tailwind classes that map to tokens (`bg-surface`, `text-primary`, `border-border`) over raw `bg-white`/`text-gray-500` values.
2. **Stateful feedback.** Use `bg-success/20`, `text-warning`, etc. when conveying exam timers, alerts, or onboarding hints. Pair with matching `*-foreground` tokens for legible copy.
3. **Gradient accents.** For cyberpunk-style gradients, combine `from-primary` and `to-accent` (or `brand-accent`) so the palette stays in sync with the tokens.
4. **Overlays & glass.** When re-creating glassmorphism, layer `bg-surface/70` with `backdrop-blur` and optionally a `border-primary/30` outline instead of translucent whites.
5. **Avoid color drift.** If a design still needs a bespoke color, add a variable in `globals.css` and extend Tailwind rather than sprinkling ad-hoc hex codes.

See `tailwind.config.ts` for the full list of available semantic colors.
