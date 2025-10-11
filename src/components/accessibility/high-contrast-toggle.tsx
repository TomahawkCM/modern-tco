"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Contrast } from "lucide-react";

const STORAGE_KEY = "tco-high-contrast";

function applyHighContrast(on: boolean) {
  const html = document.documentElement;
  if (on) {
    html.setAttribute("data-high-contrast", "1");
  } else {
    html.removeAttribute("data-high-contrast");
  }
}

export function HighContrastToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      setEnabled(v === "1");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      applyHighContrast(enabled);
      localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch {}
  }, [enabled]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={enabled}
      aria-label={enabled ? "Disable high contrast" : "Enable high contrast"}
      className="text-foreground hover:bg-white/10"
      onClick={() => setEnabled((v) => !v)}
    >
      <Contrast className="h-5 w-5" />
    </Button>
  );
}

