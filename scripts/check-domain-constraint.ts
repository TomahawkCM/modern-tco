#!/usr/bin/env tsx
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkConstraint() {
  // Try to get constraint info by querying with invalid domain
  const { error } = await supabase
    .from("questions")
    .insert({
      question: "Test",
      options: [{ id: "a", text: "Test" }],
      correct_answer: 0,
      domain: "INVALID_TEST_DOMAIN",
      explanation: "Test",
    });

  if (error) {
    console.log("Error message:", error.message);
    console.log("\nValid domains are likely restricted. Common TCO domains:");
    console.log("- Asking Questions");
    console.log("- Refining & Targeting");
    console.log("- Taking Action");
    console.log("- Navigation & Modules");
    console.log("- Reporting & Export");
    console.log("- Fundamentals");
  }
}

checkConstraint();
