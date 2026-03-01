"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SubscribeButton } from "@/components/subscribe-button";
import { useTranslations } from "next-intl";

interface SubscriptionGateProps {
  isSubscriptionRequired: boolean;
  featureName: string;
  children: ReactNode;
}

export function SubscriptionGate({
  isSubscriptionRequired,
  featureName,
  children,
}: SubscriptionGateProps) {
  const t = useTranslations("insights.gate");

  if (!isSubscriptionRequired) {
    return <>{children}</>;
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <Lock className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="font-medium">{featureName}</p>
          <p className="text-sm text-muted-foreground">
            {t("subscribeToUnlock")}
          </p>
        </div>
        <SubscribeButton />
      </CardContent>
    </Card>
  );
}
