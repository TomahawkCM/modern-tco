import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { createClient } from "@/lib/supabase/server";
import { getRpID, getOrigin } from "@/lib/passkey/config";
import { logAuthEvent } from "@/server/audit-log";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const challenge = request.cookies.get("passkey_challenge")?.value;
  if (!challenge) {
    return NextResponse.json({ error: "Challenge expired" }, { status: 400 });
  }

  const body: RegistrationResponseJSON & { deviceName?: string } = await request.json();

  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedOrigin: getOrigin(),
      expectedRPID: getRpID(),
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    const { credential } = verification.registrationInfo;

    // Store the passkey in the database
    const { error: dbError } = await supabase.from("user_passkeys").insert({
      user_id: user.id,
      credential_id: credential.id,
      public_key: Buffer.from(credential.publicKey).toString("base64"),
      counter: credential.counter,
      transports: body.response.transports ?? [],
      device_name: body.deviceName || "Passkey",
    });

    if (dbError) {
      return NextResponse.json({ error: "Failed to save passkey" }, { status: 500 });
    }

    await logAuthEvent("passkey_registered", user.id, request);

    // Clear the challenge cookie
    const response = NextResponse.json({ verified: true });
    response.cookies.delete("passkey_challenge");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
