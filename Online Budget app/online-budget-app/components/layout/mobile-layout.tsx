"use client";

import { useState } from "react";
import { MobileHeader } from "./mobile-header";
import { MobileSheet } from "./mobile-sheet";

export function MobileLayout() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <MobileHeader onMenuClick={() => setSheetOpen(true)} />
      <MobileSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
