import { NextResponse } from "next/server";

type Plan = "free" | "pro" | "team";

function originFrom(req: Request): string {
  try {
    const u = new URL(req.url);
    return `${u.protocol}//${u.host}`;
  } catch (error) {
    return "";
  }
}

export async function POST(req: Request) {
  let selected: Plan = "pro";
  try {
    const payload = (await req.json()) as unknown;
    if (payload && typeof payload === "object" && "plan" in payload) {
      const desiredPlan = (payload as { plan?: Plan }).plan;
      if (desiredPlan) {
        selected = desiredPlan;
      }
    }
  } catch (error) {
    // ignore malformed JSON payloads and use default
  }

  const origin = originFrom(req);

  const secret = process.env.STRIPE_SECRET_KEY ?? "";
  const priceMap: Record<Plan, string | undefined> = {
    free: process.env.STRIPE_PRICE_FREE,
    pro: process.env.STRIPE_PRICE_PRO,
    team: process.env.STRIPE_PRICE_TEAM,
  };

  // Fallback: mock redirect when not configured
  if (!secret || !priceMap[selected]) {
    const url = `${origin}/pricing?mock=1&plan=${encodeURIComponent(selected)}`;
    return NextResponse.json({ url, mode: "mock" });
  }

  // Stripe package is not bundled in this project by default.
  // When ready to enable real checkout, install `stripe` and replace the mock below.
  const url = `${origin}/pricing?mock=1&plan=${encodeURIComponent(selected)}`;
  return NextResponse.json({ url, mode: "mock" });
}
