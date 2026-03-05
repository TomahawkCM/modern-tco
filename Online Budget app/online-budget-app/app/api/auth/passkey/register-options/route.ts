import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { createClient } from "@/lib/supabase/server";
import { rpName, getRpID } from "@/lib/passkey/config";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch existing passkeys to exclude from registration
  const { data: existingPasskeys } = await supabase
    .from("user_passkeys")
    .select("credential_id, transports")
    .eq("user_id", user.id);

  const options = await generateRegistrationOptions({
    rpName,
    rpID: getRpID(),
    userName: user.email ?? user.id,
    excludeCredentials: (existingPasskeys ?? []).map((p) => ({
      id: p.credential_id,
      transports: p.transports as AuthenticatorTransport[],
    })),
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
    attestationType: "none",
  });

  // Store challenge in a cookie for verification (short-lived)
  const response = NextResponse.json(options);
  response.cookies.set("passkey_challenge", options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 300, // 5 minutes
    path: "/",
  });

  return response;
}
