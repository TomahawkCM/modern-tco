#!/usr/bin/env tsx
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getValidDomains() {
  // Get all unique domains currently in database
  const { data, error } = await supabase
    .from("questions")
    .select("domain")
    .limit(1000);

  if (error) {
    console.error("Error:", error.message);
    return;
  }

  const uniqueDomains = [...new Set(data?.map((q: any) => q.domain))].sort();
  console.log("✅ Valid domains currently in database:");
  uniqueDomains.forEach(d => console.log(`   - ${d}`));
}

getValidDomains();
