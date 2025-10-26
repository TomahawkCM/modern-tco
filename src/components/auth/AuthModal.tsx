import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);

  const handleSuccess = () => {
    onClose();
  };

  const switchToLogin = () => setMode("login");
  const switchToSignUp = () => setMode("signup");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>{mode === "login" ? "Sign In" : "Create Account"}</DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Sign in to access your TCO exam progress"
              : "Create an account to track your TCO certification journey"}
          </DialogDescription>
        </DialogHeader>

        {mode === "login" ? (
          <LoginForm onSuccess={handleSuccess} onSwitchToSignUp={switchToSignUp} />
        ) : (
          <SignUpForm onSuccess={handleSuccess} onSwitchToLogin={switchToLogin} />
        )}
      </DialogContent>
    </Dialog>
  );
}
