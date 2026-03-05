import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitAuth, createRateLimitResponse } from "@/lib/rate-limit";
import { createLinkToken, isPlaidConfigured } from "@/integrations/plaid";
import { getUserSettings } from "@/server/settings";
import { CountryCode } from "plaid";
import { getValidLocale, type SupportedLocale } from "@/i18n/config";

// Map locale region to Plaid CountryCode (Plaid supports: US, GB, ES, NL, FR, IE, CA, DE, IT, PL, DK, NO, SE, EE, LT, LV, PT, BE)
const REGION_TO_PLAID_COUNTRY: Record<string, CountryCode> = {
  US: CountryCode.Us,
  GB: CountryCode.Gb,
  ES: CountryCode.Es,
  NL: CountryCode.Nl,
  FR: CountryCode.Fr,
  IE: CountryCode.Ie,
  CA: CountryCode.Ca,
  DE: CountryCode.De,
  IT: CountryCode.It,
  PL: CountryCode.Pl,
  DK: CountryCode.Dk,
  NO: CountryCode.No,
  SE: CountryCode.Se,
  EE: CountryCode.Ee,
  LT: CountryCode.Lt,
  LV: CountryCode.Lv,
  PT: CountryCode.Pt,
  BE: CountryCode.Be,
};

function getPlaidCountryCode(locale: string): CountryCode {
  const region = locale.split("-")[1]?.toUpperCase() ?? "";
  return REGION_TO_PLAID_COUNTRY[region] ?? CountryCode.Us;
}

export async function POST(request: NextRequest) {
  const rl = await rateLimitAuth(request);
  if (!rl.success) return createRateLimitResponse(rl);

  if (!isPlaidConfigured()) {
    return NextResponse.json({ error: "Bank sync is not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getUserSettings(supabase, user.id);
    const locale = getValidLocale(settings.locale) as SupportedLocale;
    const language = settings.language || locale.split("-")[0] || "en";
    const countryCode = getPlaidCountryCode(locale);

    const linkToken = await createLinkToken(user.id, {
      countryCodes: [countryCode],
      language,
    });
    return NextResponse.json({ link_token: linkToken });
  } catch (err) {
    console.error("[plaid/link-token]", err);
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 });
  }
}
