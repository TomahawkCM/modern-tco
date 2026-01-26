/**
 * Onboarding Components
 * Enhanced "First 15 Minutes" flow for offline budget app
 * - WelcomeBanner: Non-blocking banner (recommended)
 * - OnboardingWizard: Full guided wizard (optional, triggered from banner)
 */

export { WelcomeBanner, resetWelcomeBanner, isWelcomeCompleted } from "./WelcomeBanner";
export { OnboardingWizard, restartOnboarding, isOnboardingCompleted } from "./OnboardingWizard";
export { WelcomeStep } from "./WelcomeStep";
export { VaultSetupStep } from "./VaultSetupStep";
export { AccessibilityStep } from "./AccessibilityStep";
export { ImportStep } from "./ImportStep";
export { CategoryMappingStep } from "./CategoryMappingStep";
export { FirstBudgetStep } from "./FirstBudgetStep";
export { BillRemindersStep } from "./BillRemindersStep";
export type { StepProps } from "./OnboardingWizard";
