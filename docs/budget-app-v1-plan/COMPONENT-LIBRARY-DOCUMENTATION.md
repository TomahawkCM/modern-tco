# Component Library Documentation with Accessibility Guidelines

**Budget App Design System** | **Version 1.0** | **WCAG 2.2 AA Compliant**

---

## 📚 Table of Contents

1. [Button Component](#button-component)
2. [Input Components](#input-components)
3. [Form Controls](#form-controls)
4. [Card & Layout Components](#card--layout-components)
5. [Interactive Components](#interactive-components)
6. [Accessibility Quick Reference](#accessibility-quick-reference)

---

## Button Component

### **Overview**

Primary interactive element for user actions. Supports multiple variants, sizes, and states.

### **Usage**

```tsx
import { Button } from '@/components/ui/button';

// Basic usage
<Button>Click Me</Button>

// With variants
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// Disabled state
<Button disabled>Disabled</Button>
```

### **Props API**

| Prop        | Type                                                                | Default     | Description                |
| ----------- | ------------------------------------------------------------------- | ----------- | -------------------------- |
| `variant`   | `'default' \| 'secondary' \| 'outline' \| 'ghost' \| 'destructive'` | `'default'` | Visual style variant       |
| `size`      | `'sm' \| 'default' \| 'lg'`                                         | `'default'` | Button size                |
| `disabled`  | `boolean`                                                           | `false`     | Disables interaction       |
| `asChild`   | `boolean`                                                           | `false`     | Renders as child component |
| `className` | `string`                                                            | -           | Additional CSS classes     |

### **Accessibility Requirements**

#### **✅ DO:**

- Use semantic `<button>` element
- Provide descriptive text or `aria-label`
- Ensure 48×48px minimum touch target
- Include visible focus indicator (3px ring)
- Support keyboard (Enter, Space)
- Use `aria-disabled` when disabled

#### **❌ DON'T:**

- Use `<div>` or `<span>` as buttons
- Use icon-only buttons without labels
- Create touch targets smaller than 48px
- Remove focus outlines
- Disable without explanation

### **Theme Mode Variants**

```tsx
// Light mode - Default styles
<Button>Light Button</Button>

// Dark mode - Automatically adapts
<Button className="dark:bg-primary dark:text-primary-foreground">
  Dark Button
</Button>

// High contrast - Enhanced borders
<Button className="high-contrast:border-2 high-contrast:border-foreground">
  High Contrast
</Button>
```

### **Common Patterns**

#### **Icon + Text Button**

```tsx
<Button>
  <PlusIcon className="mr-2 h-4 w-4" />
  Add Transaction
</Button>
```

#### **Loading State**

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

#### **Destructive Action with Confirmation**

```tsx
<Button
  variant="destructive"
  onClick={() => {
    if (confirm("Are you sure?")) {
      deleteItem();
    }
  }}
>
  Delete
</Button>
```

---

## Input Components

### **Text Input**

#### **Overview**

Single-line text entry field for user data.

#### **Usage**

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" required />
</div>;
```

#### **Props API**

| Prop               | Type                                                 | Default  | Description                |
| ------------------ | ---------------------------------------------------- | -------- | -------------------------- |
| `type`             | `'text' \| 'email' \| 'password' \| 'number' \| ...` | `'text'` | Input type                 |
| `placeholder`      | `string`                                             | -        | Placeholder text           |
| `disabled`         | `boolean`                                            | `false`  | Disables input             |
| `required`         | `boolean`                                            | `false`  | Marks as required          |
| `aria-invalid`     | `boolean`                                            | `false`  | Indicates validation error |
| `aria-describedby` | `string`                                             | -        | Links to error message     |

#### **Accessibility Requirements**

##### **✅ DO:**

- Always pair with `<Label>` using `htmlFor`
- Use appropriate `type` attribute
- Provide clear placeholder text
- Show visible error messages
- Use `aria-invalid="true"` for errors
- Link errors with `aria-describedby`
- Ensure 48×48px minimum height

##### **❌ DON'T:**

- Use placeholder as label replacement
- Remove focus indicators
- Hide error messages
- Use cryptic validation messages

#### **Error State Pattern**

```tsx
const [error, setError] = useState("");

<div className="space-y-2">
  <Label htmlFor="amount">Amount</Label>
  <Input
    id="amount"
    type="number"
    aria-invalid={!!error}
    aria-describedby={error ? "amount-error" : undefined}
    className={error ? "border-destructive" : ""}
  />
  {error && (
    <p id="amount-error" className="text-sm text-destructive">
      {error}
    </p>
  )}
</div>;
```

---

## Form Controls

### **Checkbox**

#### **Overview**

Binary choice control for selecting/deselecting options.

#### **Usage**

```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>;
```

#### **Accessibility Requirements**

##### **✅ DO:**

- Use with descriptive `<Label>`
- Ensure 48×48px touch target
- Support keyboard (Space to toggle)
- Show visible checked state
- Use in groups with `<fieldset>` and `<legend>`

##### **❌ DON'T:**

- Use without label
- Rely on color alone for state
- Create ambiguous labels

#### **Checkbox Group Pattern**

```tsx
<fieldset className="space-y-2">
  <legend className="text-base font-medium">Notification Preferences</legend>
  <div className="flex items-center space-x-2">
    <Checkbox id="email-notif" />
    <Label htmlFor="email-notif">Email notifications</Label>
  </div>
  <div className="flex items-center space-x-2">
    <Checkbox id="sms-notif" />
    <Label htmlFor="sms-notif">SMS notifications</Label>
  </div>
</fieldset>
```

---

### **Radio Group**

#### **Overview**

Mutually exclusive selection from multiple options.

#### **Usage**

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

<RadioGroup defaultValue="monthly">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="weekly" id="weekly" />
    <Label htmlFor="weekly">Weekly</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="monthly" id="monthly" />
    <Label htmlFor="monthly">Monthly</Label>
  </div>
</RadioGroup>;
```

#### **Accessibility Requirements**

##### **✅ DO:**

- Use `<RadioGroup>` wrapper
- Provide unique `id` for each item
- Use `<Label>` with `htmlFor`
- Support arrow key navigation
- Show visible selection state

##### **❌ DON'T:**

- Use checkboxes for mutually exclusive choices
- Forget to set `name` attribute
- Use fewer than 2 options

---

### **Switch**

#### **Overview**

Toggle control for on/off states (e.g., settings).

#### **Usage**

```tsx
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>;
```

#### **Accessibility Requirements**

##### **✅ DO:**

- Use for settings and preferences
- Provide clear on/off labels
- Ensure 48×48px touch target
- Support keyboard (Space to toggle)
- Use `aria-checked` attribute

##### **❌ DON'T:**

- Use for actions (use button instead)
- Hide the current state
- Use ambiguous labels

---

## Card & Layout Components

### **Card**

#### **Overview**

Container component for grouping related content.

#### **Usage**

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Budget Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your spending this month: $1,234</p>
  </CardContent>
</Card>;
```

#### **Props API**

| Prop        | Type        | Default | Description            |
| ----------- | ----------- | ------- | ---------------------- |
| `className` | `string`    | -       | Additional CSS classes |
| `children`  | `ReactNode` | -       | Card content           |

#### **Accessibility Requirements**

##### **✅ DO:**

- Use semantic HTML within cards
- Ensure proper heading hierarchy
- Provide sufficient padding (1.5rem)
- Use `tabIndex="0"` if interactive
- Maintain 4.5:1 contrast ratio

##### **❌ DON'T:**

- Nest headings incorrectly
- Create overly complex layouts
- Use insufficient spacing

#### **Interactive Card Pattern**

```tsx
<Card
  tabIndex={0}
  role="button"
  className="cursor-pointer transition-shadow hover:shadow-lg"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  }}
>
  <CardContent>Clickable Card</CardContent>
</Card>
```

---

## Interactive Components

### **Select**

#### **Overview**

Dropdown menu for selecting from a list of options.

#### **Usage**

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select defaultValue="usd">
  <SelectTrigger>
    <SelectValue placeholder="Select currency" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="usd">USD ($)</SelectItem>
    <SelectItem value="eur">EUR (€)</SelectItem>
    <SelectItem value="gbp">GBP (£)</SelectItem>
  </SelectContent>
</Select>;
```

#### **Accessibility Requirements**

##### **✅ DO:**

- Use semantic `<select>` or ARIA combobox
- Provide descriptive placeholder
- Support keyboard navigation (arrows, type-ahead)
- Show visible focus on trigger
- Announce selection to screen readers

##### **❌ DON'T:**

- Hide the selected value
- Use for navigation (use links)
- Forget to close on Escape key

---

### **Dialog (Modal)**

#### **Overview**

Overlay window for focused interactions.

#### **Usage**

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this transaction? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

#### **Accessibility Requirements**

##### **✅ DO:**

- Trap focus within dialog
- Close on Escape key
- Return focus to trigger on close
- Use `DialogTitle` (required for ARIA)
- Include `DialogDescription`
- Disable background scroll
- Use `role="dialog"` and `aria-modal="true"`

##### **❌ DON'T:**

- Auto-open dialogs unexpectedly
- Forget to provide close button
- Nest dialogs inside dialogs
- Use for non-critical content

---

## Accessibility Quick Reference

### **WCAG 2.2 AA Compliance Checklist**

#### **1. Color & Contrast**

- ✅ Text contrast ≥4.5:1 (normal text)
- ✅ Text contrast ≥3:1 (large text 24px+)
- ✅ UI component contrast ≥3:1
- ✅ Don't rely on color alone for information

#### **2. Touch Targets**

- ✅ Minimum 48×48px for all interactive elements
- ✅ Minimum 24px spacing between targets
- ✅ Touch target includes padding/margin

#### **3. Typography**

- ✅ Base font size: 18px (seniors-friendly)
- ✅ Line height: 1.5 (body text)
- ✅ Text resizable up to 200% without loss of function
- ✅ Proper heading hierarchy (h1 → h2 → h3)

#### **4. Keyboard Navigation**

- ✅ All functionality available via keyboard
- ✅ Visible focus indicators (3px ring)
- ✅ Logical tab order
- ✅ No keyboard traps

#### **5. Forms**

- ✅ All inputs have associated labels
- ✅ Required fields indicated
- ✅ Error messages descriptive and linked
- ✅ Help text provided when needed

#### **6. Motion & Animation**

- ✅ Reduced motion support (`prefers-reduced-motion`)
- ✅ Manual reduce motion toggle
- ✅ No auto-playing content
- ✅ Animations can be paused

#### **7. Screen Reader Support**

- ✅ Semantic HTML elements
- ✅ ARIA labels where needed
- ✅ Alt text for images
- ✅ Live regions for dynamic content

#### **8. High Contrast Mode**

- ✅ Text and borders visible
- ✅ Focus indicators enhanced
- ✅ Shadows removed
- ✅ Icons have sufficient contrast

---

### **Component Accessibility Matrix**

| Component | ARIA Role  | Keyboard             | Focus    | Touch Target | Screen Reader |
| --------- | ---------- | -------------------- | -------- | ------------ | ------------- |
| Button    | `button`   | Enter, Space         | ✅ Ring  | ✅ 54px      | ✅ Announces  |
| Input     | -          | Standard             | ✅ Ring  | ✅ 48px      | ✅ With Label |
| Checkbox  | `checkbox` | Space                | ✅ Ring  | ✅ 48px      | ✅ State      |
| Radio     | `radio`    | Arrows               | ✅ Ring  | ✅ 48px      | ✅ State      |
| Switch    | `switch`   | Space                | ✅ Ring  | ✅ 48px      | ✅ State      |
| Select    | `combobox` | Arrows               | ✅ Ring  | ✅ 48px      | ✅ Options    |
| Dialog    | `dialog`   | Esc, Tab             | ✅ Trap  | -            | ✅ Title      |
| Card      | -          | Tab (if interactive) | Optional | -            | ✅ Content    |

---

### **Common Accessibility Patterns**

#### **Skip Links**

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
>
  Skip to main content
</a>
```

#### **Loading States**

```tsx
<div role="status" aria-live="polite" aria-busy="true">
  <LoaderIcon className="animate-spin" />
  <span className="sr-only">Loading transactions...</span>
</div>
```

#### **Error Announcements**

```tsx
<div role="alert" aria-live="assertive">
  {error && <p className="text-destructive">{error}</p>}
</div>
```

#### **Visually Hidden Text**

```tsx
<span className="sr-only">Additional context for screen readers only</span>
```

---

### **Testing Tools**

#### **Automated Testing**

- **axe DevTools**: Browser extension for WCAG violations
- **Lighthouse**: Accessibility score in Chrome DevTools
- **WAVE**: Web accessibility evaluation tool

#### **Manual Testing**

- **Keyboard only**: Disconnect mouse, navigate with Tab/Arrows
- **Screen reader**: NVDA (Windows), VoiceOver (Mac)
- **Color contrast**: WebAIM Contrast Checker
- **Zoom**: Test at 200% browser zoom

#### **User Testing**

- **Real users with disabilities**: Best validation
- **Seniors (65+)**: Test font size and touch targets
- **Motor impairments**: Test keyboard and touch targets

---

### **Design Token Usage in Components**

#### **Spacing**

```tsx
// Use semantic spacing tokens
<Button className="px-button-padding-x py-button-padding-y">
<Card className="p-card">
<div className="space-y-section">
```

#### **Motion**

```tsx
// Use motion tokens
<Button className="transition-all duration-fast ease-default">
<Dialog className="transition-opacity duration-normal ease-emphasized">
```

#### **Shadows**

```tsx
// Use shadow tokens
<Card className="shadow-md hover:shadow-lg">
<Dialog className="shadow-2xl">
```

#### **Z-Index**

```tsx
// Use z-index tokens
<Dialog className="z-modal">
<Toast className="z-toast">
<Tooltip className="z-tooltip">
```

---

### **Component Do's and Don'ts Summary**

#### **Buttons**

- ✅ Use for actions
- ✅ Clear, action-oriented text
- ✅ 48px minimum touch target
- ❌ Don't use for navigation (use links)
- ❌ Don't use generic "Click here"

#### **Inputs**

- ✅ Always use with `<Label>`
- ✅ Provide helpful placeholders
- ✅ Show clear error messages
- ❌ Don't use placeholder as label
- ❌ Don't hide validation errors

#### **Forms**

- ✅ Group related fields with `<fieldset>`
- ✅ Mark required fields clearly
- ✅ Provide inline help text
- ❌ Don't ask for unnecessary info
- ❌ Don't hide error summaries

#### **Dialogs**

- ✅ Use for important decisions
- ✅ Trap focus inside modal
- ✅ Close on Escape key
- ❌ Don't auto-open unexpectedly
- ❌ Don't nest modals

#### **Cards**

- ✅ Use for grouping content
- ✅ Maintain proper heading hierarchy
- ✅ Use sufficient padding
- ❌ Don't create overly complex layouts
- ❌ Don't nest too deeply

---

### **Resources**

#### **Official Documentation**

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Radix UI Docs](https://www.radix-ui.com/docs/primitives)
- [shadcn/ui Docs](https://ui.shadcn.com/)

#### **Tools**

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

#### **Learning**

- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

---

## 📋 Usage Checklist

When using any component, ask:

- [ ] Is there a visible, descriptive label?
- [ ] Is the touch target at least 48×48px?
- [ ] Does it have a visible focus indicator?
- [ ] Can I use it with keyboard only?
- [ ] Does it work in all theme modes?
- [ ] Does it respect reduced motion?
- [ ] Will a screen reader understand it?
- [ ] Is the color contrast sufficient?

---

**Last Updated**: 2025-11-10
**Version**: 1.0
**Status**: ✅ Complete
