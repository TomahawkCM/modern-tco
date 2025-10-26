"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const { signIn, signUp, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (isSignUp) {
      const { error } = await signUp(email, password, { firstName, lastName });
      if (error) {
        setAuthError(error.message);
      } else {
        router.push("/modules"); // Redirect to modules page after successful signup
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setAuthError(error.message);
      } else {
        router.push("/modules"); // Redirect to modules page after successful login
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 p-4">
      <motion.div initial="hidden" animate="visible" variants={cardVariants}>
        <Card className="w-full max-w-md bg-white/10 p-6 shadow-xl backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isSignUp
                ? "Join the Tanium TCO study community."
                : "Sign in to continue your learning journey."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <Input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-white/20 text-foreground placeholder-blue-200 focus:border-blue-500"
                  />
                  <Input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-white/20 text-foreground placeholder-blue-200 focus:border-blue-500"
                  />
                </>
              )}
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/20 text-foreground placeholder-blue-200 focus:border-blue-500"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/20 text-foreground placeholder-blue-200 focus:border-blue-500"
              />
              {authError && <p className="text-center text-red-400">{authError}</p>}
              <Button
                type="submit"
                className="w-full bg-blue-600 text-foreground hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-primary hover:text-blue-100"
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
