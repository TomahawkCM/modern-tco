import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { getRpID } from "@/lib/passkey/config";

export async function GET() {
  const options = await generateAuthenticationOptions({
    rpID: getRpID(),
    userVerification: "preferred",
    // Empty allowCredentials = discoverable credential (passkey) flow
  });

  const response = NextResponse.json(options);
  response.cookies.set("passkey_challenge", options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 300,
    path: "/",
  });

  return response;
}
