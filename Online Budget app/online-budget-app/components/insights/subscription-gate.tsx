"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SubscribeButton } from "@/components/subscribe-button";

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
            Subscribe to unlock AI-powered insights
          </p>
        </div>
        <SubscribeButton />
      </CardContent>
    </Card>
  );
}
