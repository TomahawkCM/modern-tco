import { AuthGuard } from "@/components/auth/AuthGuard";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata = {
  title: "Create Account",
};

export default function SignUpPage() {
  return (
    <AuthGuard requireAuth={false}>
      <main className="container mx-auto max-w-xl px-4 py-10">
        <SignUpForm />
      </main>
    </AuthGuard>
  );
}

