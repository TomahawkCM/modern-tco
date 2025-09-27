"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Type } from "lucide-react";

const STORAGE_KEY = "tco-large-text";

function applyLargeText(enabled: boolean) {
  const html = document.documentElement;
  if (enabled) {
    html.style.fontSize = "18px"; // ~112.5% assuming 16px base
    html.setAttribute("data-large-text", "1");
  } else {
    html.style.fontSize = "";
    html.removeAttribute("data-large-text");
  }
}

export function LargeTextToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      const on = v === "1";
      setEnabled(on);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      applyLargeText(enabled);
      localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch {}
  }, [enabled]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={enabled}
      aria-label={enabled ? "Disable large text" : "Enable large text"}
      className="text-white hover:bg-white/10"
      onClick={() => setEnabled((v) => !v)}
    >
      <Type className="h-5 w-5" />
    </Button>
  );
}

