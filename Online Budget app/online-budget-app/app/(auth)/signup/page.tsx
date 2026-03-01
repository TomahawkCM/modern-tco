import Link from "next/link";
import { signUp } from "../actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Sign up to start managing your budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
              />
            </div>
            <Button formAction={signUp}>Sign Up</Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button variant="link" className="h-auto p-0" asChild>
                <Link href="/login">Log in</Link>
              </Button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
