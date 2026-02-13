# Mobile Design Patterns Reference

## Touch Target Sizes

| Element | Minimum Size | Recommended | Standard |
|---------|-------------|-------------|----------|
| Button | 44×44px | 48×48px | WCAG 2.5.5 |
| Icon button | 44×44px (with padding) | 48×48px | Material Design |
| List item | 44px height | 56-72px height | iOS HIG |
| Tab bar item | 44×49px | 48×49px | iOS HIG |
| Text link (inline) | 44px tap area | — | Use padding |

## Responsive Breakpoints

| Breakpoint | Tailwind | Target Devices |
|-----------|----------|----------------|
| < 640px | (default) | Phones (portrait) |
| ≥ 640px | `sm:` | Phones (landscape), small tablets |
| ≥ 768px | `md:` | Tablets (portrait) |
| ≥ 1024px | `lg:` | Tablets (landscape), laptops |
| ≥ 1280px | `xl:` | Desktops |
| ≥ 1536px | `2xl:` | Large desktops |

## Bottom Navigation Spec

```
┌────────────────────────────────────────┐
│                                        │ ← Content area
│                                        │
│                                        │
├────────────────────────────────────────┤ ← Border top
│  🏠     📋     ➕     📊     ⚙️    │ ← 56px height
│  Home   Trans   Add   Report  Settings │ ← 12px label
├────────────────────────────────────────┤
│         Safe area inset bottom         │ ← env(safe-area-inset-bottom)
└────────────────────────────────────────┘
```

- Fixed to bottom
- 5 items maximum
- Primary action (Add) centered and visually distinct
- Hidden on desktop (`sm:hidden`), replaced with sidebar

## Gesture Patterns

| Gesture | Action | Implementation |
|---------|--------|----------------|
| Swipe right | Approve/confirm | `onTouchStart` + `onTouchEnd` delta |
| Swipe left | Edit/categorize | Same touch tracking |
| Pull down | Refresh | `overscroll-behavior: contain` + custom handler |
| Long press | Multi-select | `onTouchStart` with 500ms timer |
| Pinch | Zoom chart | Use chart library's built-in zoom |

## Safe Area Insets

```css
/* Apply to root layout */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Or use Tailwind utilities */
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pt-safe { padding-top: env(safe-area-inset-top); }
```

## Responsive Patterns

### Card Grid
- Mobile: 1 column, full width
- Tablet: 2 columns
- Desktop: 3-4 columns

### Table → Cards
- Mobile: Card view with stacked fields
- Desktop: Traditional table view

### Modal → Full Screen
- Mobile: Full screen with back button
- Desktop: Centered overlay with close button

### Sidebar → Bottom Sheet
- Mobile: Bottom sheet (slide up from bottom)
- Desktop: Side panel

### Horizontal Scroll
- Mobile: Horizontal scroll with snap points
- Desktop: Grid or wrap

## Input Patterns (Mobile)

| Field Type | `inputMode` | Keyboard |
|-----------|------------|----------|
| Currency amount | `decimal` | Number pad with decimal |
| Date | — | Use date picker component |
| Search | `search` | Search keyboard |
| Email | `email` | Email keyboard |
| Phone | `tel` | Phone pad |
| URL | `url` | URL keyboard |

```tsx
// Currency input on mobile
<input inputMode="decimal" pattern="[0-9]*\.?[0-9]*" />

// Prevent zoom on iOS (font-size must be ≥ 16px)
<input className="text-base" /> // 16px = no zoom
```

## Performance Considerations

- Images: Use WebP, serve responsive sizes
- Animations: Use `transform` and `opacity` only (GPU-accelerated)
- Scroll: Use `will-change: transform` sparingly for smooth scroll
- Touch: Use `touch-action: manipulation` to eliminate 300ms click delay
