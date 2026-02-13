# Accessibility Checklist Reference (WCAG 2.1 AA)

## Perceivable

### 1.1 Text Alternatives
- [ ] All `<img>` tags have `alt` attribute
- [ ] Decorative images use `alt=""` or `role="presentation"`
- [ ] Complex images (charts, diagrams) have extended description
- [ ] Icon buttons have `aria-label` or visible text

### 1.2 Time-Based Media
- [ ] Video content has captions (if applicable)
- [ ] Audio content has text transcript (if applicable)

### 1.3 Adaptable
- [ ] Content uses semantic HTML (headings, lists, tables, landmarks)
- [ ] Heading hierarchy is logical (h1 → h2 → h3, no skips)
- [ ] Form inputs have associated labels
- [ ] Tables use `<th>` with `scope` attribute
- [ ] Content order is meaningful when CSS is disabled
- [ ] Input purpose is identified (`autocomplete` attributes)

### 1.4 Distinguishable
- [ ] Text color contrast ≥ 4.5:1 (normal text)
- [ ] Text color contrast ≥ 3:1 (large text ≥ 18px bold or ≥ 24px)
- [ ] Non-text contrast ≥ 3:1 (UI components, focus indicators)
- [ ] Text resizable to 200% without loss of content
- [ ] No images of text (use actual text)
- [ ] Content reflows at 320px width (no horizontal scroll)
- [ ] Text spacing adjustable (line-height, letter-spacing)
- [ ] Hover/focus content dismissible and persistent

## Operable

### 2.1 Keyboard Accessible
- [ ] All functionality available via keyboard
- [ ] No keyboard traps (Tab moves forward through all elements)
- [ ] Custom keyboard shortcuts (if any) can be disabled
- [ ] Focus order follows logical reading order

### 2.2 Enough Time
- [ ] Timed content has controls to extend/disable timer
- [ ] Auto-moving content can be paused/stopped
- [ ] Session timeouts: at least 20 hours or user warned

### 2.3 Seizures and Physical Reactions
- [ ] No content flashes more than 3 times per second
- [ ] Animation can be disabled (respect `prefers-reduced-motion`)

### 2.4 Navigable
- [ ] Skip navigation link on every page
- [ ] Page titles are descriptive and unique
- [ ] Focus order is logical and intuitive
- [ ] Link text is descriptive (not "click here")
- [ ] Multiple ways to navigate (nav, search, sitemap)
- [ ] Headings and labels are descriptive
- [ ] Focus indicator visible on every interactive element

### 2.5 Input Modalities
- [ ] Touch target minimum 44×44px
- [ ] Multipoint gestures have single-pointer alternative
- [ ] Drag operations have non-drag alternative
- [ ] Motion-activated features have UI control alternative

## Understandable

### 3.1 Readable
- [ ] Language of page set (`<html lang="en">`)
- [ ] Language changes marked with `lang` attribute

### 3.2 Predictable
- [ ] Focus changes don't trigger unexpected actions
- [ ] Input changes don't trigger unexpected actions
- [ ] Navigation is consistent across pages
- [ ] Components with same function look the same

### 3.3 Input Assistance
- [ ] Errors identified and described in text
- [ ] Form labels and instructions provided
- [ ] Error suggestions offered when possible
- [ ] Important submissions are reversible, confirmed, or reviewed

## Robust

### 4.1 Compatible
- [ ] HTML validates (no duplicate IDs, proper nesting)
- [ ] ARIA attributes used correctly
- [ ] Status messages use `aria-live` regions
- [ ] Custom components follow ARIA authoring practices

---

## Testing Tools

| Tool | Type | Usage |
|------|------|-------|
| axe-core | Automated | `npx @axe-core/cli <url>` |
| Lighthouse | Automated | Chrome DevTools → Lighthouse tab |
| WAVE | Browser extension | wave.webaim.org |
| VoiceOver | Screen reader | macOS built-in (Cmd+F5) |
| NVDA | Screen reader | Windows free download |
| TalkBack | Screen reader | Android built-in |
| Contrast Checker | Color tool | webaim.org/resources/contrastchecker |

## ARIA Patterns for Financial UI

### Budget Progress Bar
```html
<div role="progressbar"
     aria-valuenow="75"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Budget used: 75% of $1,000">
```

### Transaction Amount
```html
<span aria-label="Negative forty-five dollars and ninety-nine cents">
  -$45.99
</span>
```

### Sortable Table Header
```html
<th scope="col" aria-sort="ascending">
  <button>Date <span aria-hidden="true">▲</span></button>
</th>
```

### Expandable Category Row
```html
<tr>
  <td>
    <button aria-expanded="false" aria-controls="food-details">
      Food & Dining
    </button>
  </td>
</tr>
<tr id="food-details" hidden>
  <!-- subcategory details -->
</tr>
```

## Screen Reader Testing Script

1. Navigate to budget dashboard with Tab key only
2. Verify all widgets are announced with purpose
3. Open transaction list — verify each row reads amount, description, date
4. Add new transaction — verify form labels read correctly
5. Trigger an error — verify error message is announced
6. Open budget chart — verify data summary is readable
7. Navigate with VoiceOver rotor — verify headings and landmarks
