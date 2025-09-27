"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";

type Plan = "free" | "pro" | "team";

async function startCheckout(plan: Plan) {
  try {
    analytics.capture("checkout_start", { plan });
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) throw new Error("Checkout failed");
    const data = (await res.json()) as { url?: string; mode?: string };
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    throw new Error("No redirect URL returned");
  } catch (e) {
    alert("Unable to start checkout right now. Please try again later.");
  }
}

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);

  const onSelect = async (plan: Plan) => {
    setLoadingPlan(plan);
    try { await startCheckout(plan); } finally { setLoadingPlan(null); }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="text-center">
        <h1 className="mb-3 text-4xl font-bold text-white">Choose Your Plan</h1>
        <p className="text-gray-300">Upgrade to unlock full practice, analytics, and advanced modules.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Free</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-200">
            <div className="text-3xl font-bold text-white">$0</div>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Core study modules</li>
              <li>Basic practice (limited)</li>
              <li>Local notes</li>
            </ul>
            <Button disabled className="w-full" variant="outline">
              Current Plan
            </Button>
          </CardContent>
        </Card>

        <Card className="glass border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white">Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-200">
            <div className="text-3xl font-bold text-white">$9<span className="text-base font-medium">/mo</span></div>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Unlimited practice + explanations</li>
              <li>Exam simulator</li>
              <li>Progress analytics</li>
              <li>Cloud sync for notes</li>
            </ul>
            <Button
              className="w-full bg-tanium-accent hover:bg-blue-600"
              onClick={() => onSelect("pro")}
              disabled={loadingPlan === "pro"}
            >
              {loadingPlan === "pro" ? "Starting checkout…" : "Get Pro"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass border-cyan-400/30">
          <CardHeader>
            <CardTitle className="text-white">Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-200">
            <div className="text-3xl font-bold text-white">$29<span className="text-base font-medium">/mo</span></div>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>All Pro features</li>
              <li>Team seats (basic)</li>
              <li>Usage analytics</li>
            </ul>
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={() => onSelect("team")}
              disabled={loadingPlan === "team"}
            >
              {loadingPlan === "team" ? "Starting checkout…" : "Get Team"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-gray-400">
        No card? In dev mode, checkout falls back to a mock redirect.
      </div>
    </div>
  );
}
