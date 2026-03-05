import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRpID, getOrigin } from "@/lib/passkey/config";
import { logAuthEvent } from "@/server/audit-log";
import type { Tables } from "@/supabase/database.types";

export async function POST(request: NextRequest) {
  const challenge = request.cookies.get("passkey_challenge")?.value;
  if (!challenge) {
    return NextResponse.json({ error: "Challenge expired" }, { status: 400 });
  }

  const body: AuthenticationResponseJSON = await request.json();
  const admin = createAdminClient();

  // Look up the passkey by credential ID
  const { data: passkey } = (await admin
    .from("user_passkeys")
    .select("*")
    .eq("credential_id", body.id)
    .single()) as { data: Tables<"user_passkeys"> | null };

  if (!passkey) {
    await logAuthEvent("login_failure", null, request, {
      provider: "passkey",
      error: "Passkey not found",
    });
    return NextResponse.json({ error: "Passkey not found" }, { status: 400 });
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedOrigin: getOrigin(),
      expectedRPID: getRpID(),
      credential: {
        id: passkey.credential_id,
        publicKey: Buffer.from(passkey.public_key, "base64"),
        counter: passkey.counter,
        transports: passkey.transports as AuthenticatorTransport[],
      },
    });

    if (!verification.verified) {
      await logAuthEvent("login_failure", passkey.user_id, request, {
        provider: "passkey",
        error: "Verification failed",
      });
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    // Update the counter to prevent replay attacks
    await admin
      .from("user_passkeys")
      .update({ counter: verification.authenticationInfo.newCounter })
      .eq("credential_id", passkey.credential_id);

    // Generate a magic link to create a Supabase session for this user
    const { data: userData } = await admin.auth.admin.getUserById(passkey.user_id);
    if (!userData?.user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user.email,
    });

    if (linkError || !linkData) {
      return NextResponse.json({ error: "Session creation failed" }, { status: 500 });
    }

    await logAuthEvent("login_success", passkey.user_id, request, {
      provider: "passkey",
    });

    // Return the hashed token so the client can exchange it for a session
    const response = NextResponse.json({
      verified: true,
      token_hash: linkData.properties.hashed_token,
      email: userData.user.email,
    });
    response.cookies.delete("passkey_challenge");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    await logAuthEvent("login_failure", passkey.user_id, request, {
      provider: "passkey",
      error: message,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
