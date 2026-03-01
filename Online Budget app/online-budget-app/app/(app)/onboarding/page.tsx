import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch categories for the "Create First Budget" step
  const { data: categories } = await supabase.from("categories").select("id, key").order("key");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <OnboardingWizard categories={categories ?? []} />
    </div>
  );
}
