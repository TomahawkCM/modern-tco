/**
 * Shared Email Layout Component
 *
 * Provides consistent styling and structure for all email templates
 * Uses @react-email/components for email-safe rendering
 */

import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  /** Preview text shown in email clients */
  preview: string;
  /** Main content */
  children: React.ReactNode;
  /** Footer text (optional) */
  footerText?: string;
  /** Unsubscribe URL */
  unsubscribeUrl: string;
  /** App base URL for assets */
  baseUrl: string;
}

export function EmailLayout({
  preview,
  children,
  footerText = "You received this email because you enabled notifications in Budget App.",
  unsubscribeUrl,
  baseUrl,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/icons/icon-96x96.png`}
              width="48"
              height="48"
              alt="Budget App"
              style={logo}
            />
            <Text style={headerTitle}>Budget App</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerTextStyle}>{footerText}</Text>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              Unsubscribe from these emails
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Shared styles
const main: React.CSSProperties = {
  backgroundColor: "#0f172a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const header: React.CSSProperties = {
  padding: "24px",
  textAlign: "center" as const,
  borderBottom: "1px solid #1e293b",
};

const logo: React.CSSProperties = {
  margin: "0 auto 12px",
};

const headerTitle: React.CSSProperties = {
  color: "#2dd4bf",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0",
};

const content: React.CSSProperties = {
  padding: "32px 24px",
};

const footer: React.CSSProperties = {
  padding: "24px",
  borderTop: "1px solid #1e293b",
  textAlign: "center" as const,
};

const footerTextStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 12px",
};

const unsubscribeLink: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  textDecoration: "underline",
};

// Export commonly used styles for templates
export const emailStyles = {
  heading: {
    color: "#f8fafc",
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "32px",
    margin: "0 0 16px",
  } as React.CSSProperties,

  subheading: {
    color: "#e2e8f0",
    fontSize: "18px",
    fontWeight: "500",
    lineHeight: "28px",
    margin: "0 0 12px",
  } as React.CSSProperties,

  paragraph: {
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: "24px",
    margin: "0 0 16px",
  } as React.CSSProperties,

  amount: {
    color: "#2dd4bf",
    fontSize: "32px",
    fontWeight: "700",
    lineHeight: "40px",
    margin: "0",
  } as React.CSSProperties,

  amountLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 4px",
  } as React.CSSProperties,

  card: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    padding: "24px",
    margin: "24px 0",
  } as React.CSSProperties,

  button: {
    backgroundColor: "#2dd4bf",
    borderRadius: "8px",
    color: "#0f172a",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "600",
    lineHeight: "1",
    padding: "12px 24px",
    textDecoration: "none",
    textAlign: "center" as const,
  } as React.CSSProperties,

  secondaryButton: {
    backgroundColor: "transparent",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#e2e8f0",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "1",
    padding: "12px 24px",
    textDecoration: "none",
    textAlign: "center" as const,
  } as React.CSSProperties,

  warning: {
    color: "#fbbf24",
  } as React.CSSProperties,

  danger: {
    color: "#f87171",
  } as React.CSSProperties,

  success: {
    color: "#4ade80",
  } as React.CSSProperties,

  muted: {
    color: "#64748b",
    fontSize: "12px",
  } as React.CSSProperties,

  divider: {
    borderTop: "1px solid #334155",
    margin: "24px 0",
  } as React.CSSProperties,

  progressBar: {
    backgroundColor: "#334155",
    borderRadius: "4px",
    height: "8px",
    overflow: "hidden",
  } as React.CSSProperties,

  progressFill: (percent: number, color: string = "#2dd4bf"): React.CSSProperties => ({
    backgroundColor: color,
    borderRadius: "4px",
    height: "8px",
    width: `${Math.min(100, percent)}%`,
  }),
};
