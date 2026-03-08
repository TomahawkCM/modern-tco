"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfile } from "@/contexts/ProfileContext";
import { Check, ChevronRight, User, Globe, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface StepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip?: () => void;
}

export function restartOnboarding(): void {
  localStorage.removeItem("budget_app_onboarding_completed");
}

export function isOnboardingCompleted(): boolean {
  return (
    typeof window !== "undefined" &&
    localStorage.getItem("budget_app_onboarding_completed") === "true"
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const t = useTranslations("onboardingPage");
  const { currentProfile, updateProfile } = useProfile();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD"); // Default, should load from settings
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (currentProfile?.name) {
      setName(currentProfile.name);
    }
  }, [currentProfile]);

  const totalSteps = 4;

  const handleNext = async () => {
    if (step === 2 && name) {
      setLoading(true);
      try {
        if (currentProfile) {
          await updateProfile(currentProfile.id, { name });
        }
      } catch (error) {
        console.error("Failed to update profile name:", error);
      } finally {
        setLoading(false);
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem("budget_app_onboarding_completed", "true");
    router.push("/budget-app");
  };

  if (!isClient) return null;

  const steps = [
    {
      id: 1,
      title: t("steps.welcome.title"),
      description: t("steps.welcome.description"),
      icon: Sparkles,
      content: (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-teal-500/10 p-4">
              <Sparkles className="h-12 w-12 text-teal-500" />
            </div>
          </div>
          <p className="text-muted-foreground">{t("steps.welcome.content")}</p>
        </div>
      ),
    },
    {
      id: 2,
      title: t("steps.profile.title"),
      description: t("steps.profile.description"),
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("steps.profile.nameLabel")}</Label>
            <Input
              id="name"
              placeholder={t("steps.profile.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <p className="text-sm text-muted-foreground">{t("steps.profile.privacyNote")}</p>
        </div>
      ),
    },
    {
      id: 3,
      title: t("steps.currency.title"),
      description: t("steps.currency.description"),
      icon: Globe,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {["USD", "EUR", "GBP", "CAD", "AUD", "JPY"].map((curr) => (
              <Button
                key={curr}
                variant={currency === curr ? "default" : "outline"}
                className={currency === curr ? "bg-teal-600 text-white hover:bg-teal-700" : ""}
                onClick={() => setCurrency(curr)}
              >
                {curr}
              </Button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">{t("steps.currency.note")}</p>
        </div>
      ),
    },
    {
      id: 4,
      title: t("steps.complete.title"),
      description: t("steps.complete.description"),
      icon: Check,
      content: (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-500/10 p-4">
              <Check className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <p className="text-muted-foreground">{t("steps.complete.content")}</p>
        </div>
      ),
    },
  ];

  const currentStepData = steps[step - 1];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-lg border-t-4 border-t-teal-500 shadow-xl">
        <CardHeader>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex space-x-1">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    s.id <= step ? "bg-teal-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {t("stepCounter", { current: step, total: totalSteps })}
            </span>
          </div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <currentStepData.icon className="h-6 w-6 text-teal-600" />
            {currentStepData.title}
          </CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>

        <CardContent className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            {t("back")}
          </Button>
          <Button
            onClick={handleNext}
            className="min-w-[100px] bg-teal-600 text-white hover:bg-teal-700"
            disabled={loading || (step === 2 && !name)}
          >
            {loading ? t("saving") : step === totalSteps ? t("getStarted") : t("next")}
            {step !== totalSteps && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
