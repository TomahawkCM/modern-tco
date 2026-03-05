import Link from "next/link";
import { resendVerificationEmail } from "../actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailIcon } from "lucide-react";

interface Props {
  searchParams: Promise<{
    email?: string;
    error?: string;
    message?: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  const email = params.email ?? "";
  const error = params.error;
  const message = params.message;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MailIcon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            {email
              ? `We sent a verification link to ${email}`
              : "We sent a verification link to your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Click the link in the email to verify your account. Check your spam folder if you
            don&apos;t see it.
          </p>

          {email && (
            <form className="flex justify-center">
              <input type="hidden" name="email" value={email} />
              <Button formAction={resendVerificationEmail} variant="outline" size="sm">
                Resend verification email
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/login">Back to login</Link>
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
