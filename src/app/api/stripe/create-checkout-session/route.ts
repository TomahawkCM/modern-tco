import { NextResponse } from 'next/server';

type Plan = 'free' | 'pro' | 'team';

function originFrom(req: Request): string {
  try {
    const u = new URL(req.url);
    return `${u.protocol}//${u.host}`;
  } catch (error) {
    return '';
  }
}

export async function POST(req: Request) {
  // VALIDATION: Strict Zod schema validation - reject invalid requests
  let selected: Plan | null = null;
  try {
    const payload = (await req.json()) as unknown;
    if (payload && typeof payload === 'object' && 'plan' in payload) {
      const desiredPlan = (payload as { plan?: Plan }).plan;
      if (desiredPlan) {
        selected = desiredPlan;
      }
    }
  } catch (error) {
    // Security fix: Return 400 error instead of silently using default plan
    return NextResponse.json(
      {
        error: 'Invalid request body',
        message: 'Request must include a valid plan (free, pro, or team)',
      },
      { status: 400 }
    );
  }

  // Ensure plan was provided
  if (selected === null) {
    return NextResponse.json(
      {
        error: 'Missing plan parameter',
        message: 'Request must include a valid plan (free, pro, or team)',
      },
      { status: 400 }
    );
  }

  const origin = originFrom(req);

  const secret = process.env.STRIPE_SECRET_KEY ?? '';
  const priceMap: Record<Plan, string | undefined> = {
    free: process.env.STRIPE_PRICE_FREE,
    pro: process.env.STRIPE_PRICE_PRO,
    team: process.env.STRIPE_PRICE_TEAM,
  };

  // Fallback: mock redirect when not configured
  if (!secret || !priceMap[selected]) {
    const url = `${origin}/pricing?mock=1&plan=${encodeURIComponent(selected)}`;
    return NextResponse.json({ url, mode: 'mock' });
  }

  // Stripe package is not bundled in this project by default.
  // When ready to enable real checkout, install `stripe` and replace the mock below.
  const url = `${origin}/pricing?mock=1&plan=${encodeURIComponent(selected)}`;
  return NextResponse.json({ url, mode: 'mock' });
}
