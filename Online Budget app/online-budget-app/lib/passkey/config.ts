/**
 * WebAuthn / Passkey configuration.
 *
 * RP = "Relying Party" — your app's identity for passkey registration.
 */

export const rpName = "Online Budget App";

export function getRpID(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return new URL(siteUrl).hostname;
  }
  return "localhost";
}

export function getOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
