# Onboarding Flow Component

**Interactive multi-step wizard for new user onboarding**

The OnboardingFlow component provides a comprehensive, user-friendly introduction to the Modern Tanium TCO Learning Management System. It guides new users through platform features, sets expectations, and encourages first steps.

---

## Features

- ✅ **6-Step Interactive Wizard**: Welcome, learning techniques, exam date, dashboard, first steps, completion
- ✅ **Progress Tracking**: Visual progress bar and step indicators
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Accessible**: WCAG 2.1 AA compliant using shadcn/ui components
- ✅ **Persistent State**: Remembers completion status via localStorage
- ✅ **Customizable**: Support for controlled/uncontrolled modes
- ✅ **Skip Option**: Users can skip and complete later
- ✅ **Exam Date Picker**: Integrated calendar for setting exam dates

---

## Installation

The component is already included in the project at:

```
src/components/onboarding/OnboardingFlow.tsx
src/components/onboarding/useOnboarding.tsx
```

**Dependencies** (already in package.json):
- `react` - Core React library
- `next/navigation` - Next.js routing
- `@/components/ui/*` - shadcn/ui components (Dialog, Button, Progress, Card, Calendar, Badge)
- `lucide-react` - Icons
- `date-fns` - Date utilities (for calendar)

---

## Usage

### Basic Usage (Auto-open for new users)

```tsx
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* OnboardingFlow automatically opens for new users */}
      <OnboardingFlow userName="John Doe" />
    </div>
  );
}
```

### Controlled Usage with Hook

```tsx
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/components/onboarding/useOnboarding";

export default function Dashboard() {
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();

  return (
    <div>
      <h1>Dashboard</h1>
      <OnboardingFlow
        open={!hasCompletedOnboarding}
        onComplete={completeOnboarding}
        userName="John Doe"
      />
    </div>
  );
}
```

### Manual Trigger (e.g., from Settings)

```tsx
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/components/onboarding/useOnboarding";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { resetOnboarding } = useOnboarding();

  return (
    <div>
      <h2>Help</h2>
      <Button onClick={resetOnboarding}>
        Restart Platform Tour
      </Button>
      <OnboardingFlow />
    </div>
  );
}
```

---

## Props

### OnboardingFlow

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `undefined` | Controls whether dialog is open. If undefined, component manages state automatically |
| `onComplete` | `() => void` | `undefined` | Callback fired when user completes onboarding |
| `userName` | `string` | `"there"` | User's name for personalization |

---

## Hook API

### useOnboarding()

Returns an object with:

```typescript
{
  hasCompletedOnboarding: boolean;  // Whether user has completed onboarding
  startOnboarding: () => void;      // Open onboarding flow
  completeOnboarding: () => void;   // Mark as completed
  resetOnboarding: () => void;      // Clear completion (for re-tutorial)
}
```

---

## Onboarding Steps

### Step 1: Welcome

- Welcomes user by name
- Shows key platform statistics (42% retention, 34% learning improvement, etc.)
- Sets expectations for research-backed approach

### Step 2: Learning Techniques

- Explains the 4 core techniques:
  1. **Spaced Repetition (2357 Method)** - 42% better retention
  2. **Active Recall** - 34% improvement
  3. **Gamification** - 48% more engagement
  4. **Analytics** - 45% study effectiveness
- Each technique has icon, description, and research backing

### Step 3: Exam Date

- Interactive calendar picker
- Allows user to set exam date for personalized scheduling
- Shows days until exam after selection
- Can be skipped if user doesn't know exam date yet

### Step 4: Dashboard Tour

- Introduces 4 main dashboard features:
  - Exam Readiness tracker
  - Today's Activities
  - Progress Analytics
  - Points & Achievements
- Explains what each section provides

### Step 5: First Steps

- Provides 3-step action plan:
  1. Start with Platform Foundation module
  2. Watch videos & complete quizzes
  3. Do daily reviews
- Emphasizes consistency over intensity

### Step 6: Completion

- Congratulatory message
- Summarizes key habits: Study Daily, Trust the System, Track Progress
- Explains how to replay onboarding from Settings
- Auto-closes and redirects to dashboard

---

## Customization

### Modify Steps

To add, remove, or modify steps, edit the `steps` array in `OnboardingFlow.tsx`:

```typescript
const steps = [
  {
    title: "Your Custom Step Title",
    content: <YourCustomStepComponent />,
  },
  // ... other steps
];
```

### Create Custom Step Component

```tsx
function YourCustomStepComponent() {
  return (
    <div className="space-y-6">
      <h3>Custom Content</h3>
      <p>Your custom step content goes here.</p>
    </div>
  );
}
```

### Styling

The component uses Tailwind CSS classes and shadcn/ui theming. To customize colors or spacing:

```tsx
// Example: Change progress bar color
<Progress value={progress} className="h-2 bg-purple-500" />

// Example: Change step card styling
<Card className="border-l-4 border-l-purple-500 bg-purple-500/5">
  {/* content */}
</Card>
```

---

## Integration with Authentication

### Automatic Onboarding for New Users

Integrate with your auth system to show onboarding automatically for new signups:

```tsx
// app/layout.tsx or dashboard/layout.tsx
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({ children }) {
  const { user } = useAuth();

  return (
    <>
      {children}
      {user && <OnboardingFlow userName={user.display_name} />}
    </>
  );
}
```

### Check Completion Status on Backend

Store completion status in database for enterprise deployments:

```sql
-- Add onboarding_completed column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN onboarding_completed_at TIMESTAMPTZ;

-- Mark as completed
UPDATE user_profiles
SET onboarding_completed_at = NOW()
WHERE user_id = 'user-uuid';
```

Then sync with localStorage:

```typescript
// Sync onboarding status with database
useEffect(() => {
  const syncOnboardingStatus = async () => {
    const localCompleted = localStorage.getItem("onboarding_completed");
    const dbCompleted = await fetchOnboardingStatus(user.id);

    if (dbCompleted && !localCompleted) {
      localStorage.setItem("onboarding_completed", "true");
    } else if (localCompleted && !dbCompleted) {
      await updateOnboardingStatus(user.id, true);
    }
  };

  syncOnboardingStatus();
}, [user.id]);
```

---

## Analytics Integration

Track onboarding completion and drop-off points with PostHog:

```tsx
import { analytics } from "@/lib/analytics";

// In OnboardingFlow.tsx
const handleNext = () => {
  analytics.capture("onboarding_step_completed", {
    step: currentStep,
    step_name: steps[currentStep].title,
  });

  if (currentStep < totalSteps - 1) {
    setCurrentStep((prev) => prev + 1);
  } else {
    handleComplete();
  }
};

const handleComplete = () => {
  analytics.capture("onboarding_completed", {
    exam_date_set: examDate !== undefined,
    time_spent: Date.now() - startTime,
  });

  // ... rest of completion logic
};

const handleSkip = () => {
  analytics.capture("onboarding_skipped", {
    step: currentStep,
    step_name: steps[currentStep].title,
  });

  // ... rest of skip logic
};
```

---

## Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { OnboardingFlow } from "./OnboardingFlow";

describe("OnboardingFlow", () => {
  it("renders welcome step", () => {
    render(<OnboardingFlow open={true} userName="Test User" />);
    expect(screen.getByText(/Welcome, Test User!/i)).toBeInTheDocument();
  });

  it("progresses through steps", () => {
    render(<OnboardingFlow open={true} />);

    // Click Next button 6 times to complete all steps
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByText(/Next|Complete/i));
    }

    expect(screen.getByText(/You're All Set!/i)).toBeInTheDocument();
  });

  it("allows skipping", () => {
    const onComplete = jest.fn();
    render(<OnboardingFlow open={true} onComplete={onComplete} />);

    fireEvent.click(screen.getByText(/Skip for now/i));

    expect(localStorage.getItem("onboarding_completed")).toBe("true");
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from "@playwright/test";

test("complete onboarding flow", async ({ page }) => {
  await page.goto("/dashboard");

  // Check if onboarding appears
  await expect(page.getByText("Welcome to Modern Tanium TCO!")).toBeVisible();

  // Click through all steps
  for (let i = 0; i < 6; i++) {
    await page.getByRole("button", { name: /Next|Complete/i }).click();
    await page.waitForTimeout(500); // Wait for step transition
  }

  // Verify completion
  await expect(page.getByText("You're All Set!")).toBeVisible();

  // Verify localStorage
  const onboardingCompleted = await page.evaluate(() =>
    localStorage.getItem("onboarding_completed")
  );
  expect(onboardingCompleted).toBe("true");
});
```

---

## Accessibility

The OnboardingFlow component follows WCAG 2.1 AA standards:

- ✅ **Keyboard Navigation**: All interactions accessible via keyboard (Tab, Enter, Escape)
- ✅ **Screen Reader Support**: Proper ARIA labels and semantic HTML
- ✅ **Focus Management**: Focus trapped within dialog during onboarding
- ✅ **Color Contrast**: All text meets 4.5:1 contrast ratio
- ✅ **Responsive**: Works on all screen sizes and orientations
- ✅ **Skip Option**: Users can skip without completing all steps

---

## Best Practices

### Do's

- ✅ Show onboarding automatically for new users
- ✅ Allow users to skip and complete later
- ✅ Keep steps concise (6 steps max)
- ✅ Use visuals and icons to reinforce concepts
- ✅ Provide option to replay onboarding from Settings
- ✅ Track analytics to identify drop-off points
- ✅ Test on multiple devices and screen sizes

### Don'ts

- ❌ Force users to complete onboarding before accessing platform
- ❌ Make steps too long or text-heavy
- ❌ Auto-advance steps without user interaction
- ❌ Show onboarding every time user logs in
- ❌ Hide skip button or make it hard to find
- ❌ Use technical jargon without explanation

---

## Troubleshooting

### Onboarding doesn't appear for new users

**Check:**
1. Is localStorage accessible? (some privacy modes block it)
2. Is the component rendered in the correct location? (should be in layout or dashboard)
3. Is `onboarding_completed` key present in localStorage? (clear it to test)

**Solution:**
```typescript
// Force onboarding to show (for testing)
localStorage.removeItem("onboarding_completed");
window.location.reload();
```

### Exam date not saving

**Check:**
1. Is calendar component receiving `onSelect` events?
2. Is `examDate` state being updated correctly?

**Solution:**
```typescript
// Debug exam date
console.log("Exam date:", examDate);
console.log("Saved exam date:", localStorage.getItem("user_exam_date"));
```

### Dialog not closing after completion

**Check:**
1. Is `onComplete` callback being fired?
2. Is there a conflicting `open` prop preventing closure?

**Solution:**
```typescript
// Ensure dialog closes
const handleComplete = () => {
  // ... existing logic

  setTimeout(() => {
    setOpen(false); // Force close
  }, 1500);
};
```

---

## Changelog

### Version 1.0 (January 2025)
- Initial release with 6-step onboarding flow
- Integrated calendar picker for exam date
- localStorage persistence for completion status
- useOnboarding hook for state management
- Full accessibility compliance (WCAG 2.1 AA)

---

## Support

For questions or issues:
- **Documentation**: See [USER_GUIDE.md](../../../docs/USER_GUIDE.md)
- **Issues**: Report bugs via GitHub Issues
- **Email**: support@your-domain.com

---

**Last Updated**: January 2025
**Component Version**: 1.0
**Maintained By**: Modern Tanium TCO Platform Team
