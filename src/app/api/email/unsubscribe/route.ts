/**
 * Email Unsubscribe API Route
 *
 * GET/POST /api/email/unsubscribe
 * Handles one-click unsubscribe (RFC 8058) and manual unsubscribe requests
 */

import { type NextRequest, NextResponse } from "next/server";
import type { EmailType, UnsubscribeResponse } from "@/types/email";

// In a production app, this would interact with a database
// For now, we'll use localStorage on the client side to manage preferences
// This endpoint validates the token and returns the appropriate response

/**
 * Handle GET request - Show unsubscribe confirmation page
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type") as EmailType | null;

  if (!token) {
    return new NextResponse(getUnsubscribePage("error", "Invalid unsubscribe link"), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  // In production, validate the token against the database
  // For now, we'll accept any non-empty token
  const typeLabel = type ? getTypeLabel(type) : "all email notifications";

  return new NextResponse(getUnsubscribePage("confirm", typeLabel), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

/**
 * Handle POST request - Process unsubscribe (RFC 8058 one-click)
 */
export async function POST(request: NextRequest): Promise<NextResponse<UnsubscribeResponse>> {
  try {
    // Check for RFC 8058 List-Unsubscribe-Post header
    const listUnsubscribe = request.headers.get("List-Unsubscribe");

    // Parse token from URL or body
    let token: string | null = null;
    let type: EmailType | null = null;

    const contentType = request.headers.get("content-type");

    if (contentType?.includes("application/x-www-form-urlencoded")) {
      // RFC 8058 one-click unsubscribe
      const formData = await request.formData();
      const listUnsubscribeValue = formData.get("List-Unsubscribe");

      if (listUnsubscribeValue === "One-Click") {
        // Extract token from URL
        const { searchParams } = new URL(request.url);
        token = searchParams.get("token");
        type = searchParams.get("type") as EmailType | null;
      }
    } else if (contentType?.includes("application/json")) {
      // Manual unsubscribe from app
      const body = await request.json();
      token = body.token;
      type = body.type;
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid unsubscribe request",
        },
        { status: 400 }
      );
    }

    // In production, update the database to mark the user as unsubscribed
    // For now, we'll return success and let the client handle the preference update

    const typeLabel = type ? getTypeLabel(type) : "all email notifications";

    return NextResponse.json({
      success: true,
      message: `Successfully unsubscribed from ${typeLabel}`,
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process unsubscribe request",
      },
      { status: 500 }
    );
  }
}

function getTypeLabel(type: EmailType): string {
  switch (type) {
    case "bill_reminder":
      return "bill reminders";
    case "budget_alert":
      return "budget alerts";
    case "goal_milestone":
      return "goal milestone notifications";
    case "test":
      return "test notifications";
    default:
      return "email notifications";
  }
}

function getUnsubscribePage(status: "confirm" | "success" | "error", message: string): string {
  const title =
    status === "confirm" ? "Confirm Unsubscribe" : status === "success" ? "Unsubscribed" : "Error";

  const icon = status === "success" ? "✅" : status === "error" ? "❌" : "📧";

  const content =
    status === "confirm"
      ? `<p>You are about to unsubscribe from <strong>${message}</strong>.</p>
         <p>Click the button below to confirm.</p>
         <form method="POST">
           <input type="hidden" name="List-Unsubscribe" value="One-Click" />
           <button type="submit" class="btn">Unsubscribe</button>
         </form>
         <p class="note">You can re-enable notifications anytime in the Budget App settings.</p>`
      : status === "success"
        ? `<p>You have been unsubscribed from <strong>${message}</strong>.</p>
         <p>You can re-enable notifications anytime in the Budget App settings.</p>
         <a href="/budget-app/settings" class="btn-secondary">Go to Settings</a>`
        : `<p>${message}</p>
         <a href="/budget-app/settings" class="btn-secondary">Go to Settings</a>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Budget App</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: #1e293b;
      border-radius: 16px;
      padding: 48px;
      max-width: 480px;
      text-align: center;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 24px;
    }
    h1 {
      color: #f8fafc;
      font-size: 24px;
      margin-bottom: 16px;
    }
    p {
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    strong {
      color: #e2e8f0;
    }
    .btn {
      display: inline-block;
      background: #2dd4bf;
      color: #0f172a;
      font-weight: 600;
      padding: 12px 32px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 8px;
      text-decoration: none;
    }
    .btn:hover {
      background: #5eead4;
    }
    .btn-secondary {
      display: inline-block;
      background: transparent;
      color: #e2e8f0;
      font-weight: 500;
      padding: 12px 32px;
      border: 1px solid #334155;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 8px;
      text-decoration: none;
    }
    .btn-secondary:hover {
      border-color: #475569;
    }
    .note {
      font-size: 14px;
      color: #64748b;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    ${content}
  </div>
</body>
</html>
`;
}
