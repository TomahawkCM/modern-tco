---
name: mobile-first-ux
description: Use when building or modifying any UI component. Enforces mobile-first responsive patterns, touch-friendly targets, and PWA best practices.
---

# Mobile-First UX

## Overview

Every UI component in the budget app must be designed mobile-first. This skill enforces touch-friendly targets, responsive breakpoints, safe area handling, and PWA-specific patterns. The budget app is a PWA used primarily on mobile — desktop is an enhanced experience, not the primary target.

## When to Use

- Building any new UI component or page
- Modifying existing layouts or navigation
- Adding touch interactions (swipe, tap, long-press)
- Implementing PWA install prompts or offline UI
- Reviewing component responsiveness

## Core Principles

- **Mobile-first breakpoints** — Write base styles for mobile, add `md:` and `lg:` for larger screens
- **Touch targets ≥ 44×44px** — All interactive elements must meet WCAG 2.5.5
- **Bottom navigation** — Primary nav accessible by thumb on mobile
- **Safe areas** — Account for notch, home indicator, keyboard
- **Progressive enhancement** — Mobile gets core UX, tablet/desktop get additional features

## Workflow

### Step 1: Define Responsive Breakpoints

Use Tailwind's default breakpoints aligned to device categories:

```
Mobile:  < 640px   (default, no prefix)
Tablet:  ≥ 640px   (sm:)
Desktop: ≥ 1024px  (lg:)
Wide:    ≥ 1280px  (xl:)
```

Always write mobile styles first, then layer on breakpoint modifiers:

```tsx
// CORRECT - mobile first
<div className="flex flex-col gap-2 sm:flex-row sm:gap-4 lg:gap-6">

// WRONG - desktop first
<div className="flex flex-row gap-6 max-sm:flex-col max-sm:gap-2">
```

### Step 2: Enforce Touch Targets

All interactive elements must have minimum 44×44px touch area:

```tsx
// Button with proper touch target
<button className="min-h-[44px] min-w-[44px] px-4 py-3">

// Icon button with touch padding
<button className="p-3" aria-label="Delete transaction">
  <TrashIcon className="h-5 w-5" />
</button>

// List item as clickable row
<button className="w-full py-3 px-4 text-left">
```

### Step 3: Bottom Navigation Pattern

Primary navigation on mobile uses bottom tab bar:

```tsx
<nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-surface-primary pb-safe sm:hidden">
  <div className="flex justify-around">
    <NavTab icon={HomeIcon} label="Home" href="/budget-app" />
    <NavTab icon={ListIcon} label="Transactions" href="/budget-app/transactions" />
    <NavTab icon={PlusCircleIcon} label="Add" href="/budget-app/add" primary />
    <NavTab icon={PieChartIcon} label="Reports" href="/budget-app/reports" />
    <NavTab icon={SettingsIcon} label="Settings" href="/budget-app/settings" />
  </div>
</nav>
```

### Step 4: Safe Area Handling

Add safe area insets for notched devices:

```css
/* In globals.css */
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pt-safe { padding-top: env(safe-area-inset-top); }
.px-safe {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

```tsx
// Page layout with safe areas
<main className="min-h-screen pt-safe pb-20 sm:pb-0 sm:pt-16">
  {/* pb-20 = space for bottom nav on mobile */}
  {/* sm:pb-0 sm:pt-16 = space for top nav on desktop */}
</main>
```

### Step 5: Responsive Component Patterns

**Cards** — Stack on mobile, grid on desktop:
```tsx
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

**Tables** — Card view on mobile, table on desktop:
```tsx
<div className="hidden sm:block">
  <Table>{/* full table */}</Table>
</div>
<div className="sm:hidden space-y-2">
  {items.map(item => <MobileCard key={item.id} {...item} />)}
</div>
```

**Modals** — Full screen on mobile, centered on desktop:
```tsx
<Dialog>
  <DialogContent className="h-full w-full sm:h-auto sm:max-w-lg sm:rounded-lg">
```

### Step 6: PWA Install Prompt

Show install prompt at appropriate moments:

```tsx
// Hook for install prompt
function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return { canInstall: !!deferredPrompt, install: () => deferredPrompt?.prompt() };
}
```

### Step 7: Gesture Patterns

Common touch gestures for budget app:

```
Swipe right → Approve/confirm transaction
Swipe left  → Categorize/edit transaction
Pull down   → Refresh data
Long press   → Multi-select mode
Pinch        → Zoom chart (if applicable)
```

## Key Files

| File | Role |
|------|------|
| `src/app/layout.tsx` | Root layout with viewport meta |
| `src/app/globals.css` | Safe area CSS, base responsive styles |
| `tailwind.config.ts` | Breakpoint configuration |
| `src/components/budget/` | All budget components (must be mobile-first) |
| `public/manifest.json` | PWA manifest |
| `next.config.js` | PWA service worker config |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Designing desktop-first, then shrinking | Always start with mobile layout, enhance upward |
| Touch targets < 44px | Add `min-h-[44px] min-w-[44px]` or sufficient padding |
| Ignoring safe areas on notched phones | Add `pb-safe`, `pt-safe` utility classes |
| Hiding features on mobile instead of adapting | Restructure layout, don't remove functionality |
| Fixed position elements covering bottom nav | Account for bottom nav height (80px) |
| Hover-only interactions | Always provide tap alternative; `hover:` is enhancement only |

## Validation Checklist

- [ ] Base styles work at 320px width (smallest mobile)
- [ ] All interactive elements ≥ 44×44px touch area
- [ ] Bottom navigation visible and functional on mobile
- [ ] Safe areas handled (notch, home indicator)
- [ ] No horizontal scroll at any breakpoint
- [ ] Content readable without zooming (≥16px body text)
- [ ] Forms use appropriate input types (`inputmode="decimal"` for amounts)
- [ ] Tested in Chrome DevTools mobile emulator
- [ ] PWA install prompt works on supported browsers

## Related Skills

- `design-tokens` — spacing/color system used in responsive designs
- `swipe-review` — specific swipe gesture patterns for transactions
- `dashboard-builder` — responsive widget grid layout
- `accessibility-audit` — touch target sizes, keyboard navigation
