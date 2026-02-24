"use client";

import { Button } from "@/components/ui/button";

export function SubscribeButton() {
  async function handleSubscribe() {
    const response = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <Button onClick={handleSubscribe}>
      Subscribe — Start Free Trial
    </Button>
  );
}
