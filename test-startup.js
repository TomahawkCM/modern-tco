// Minimal startup test to isolate the issue
console.log("Testing environment variables...");

// Test env loading
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("SUPABASE_URL present:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE_KEY present:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Test if we can require next
try {
  console.log("Testing Next.js import...");
  const next = require("next");
  console.log("✅ Next.js import successful");
} catch (error) {
  console.error("❌ Next.js import failed:", error.message);
}

// Test if we can require react
try {
  console.log("Testing React import...");
  const react = require("react");
  console.log("✅ React import successful");
} catch (error) {
  console.error("❌ React import failed:", error.message);
}

console.log("Startup test completed");
