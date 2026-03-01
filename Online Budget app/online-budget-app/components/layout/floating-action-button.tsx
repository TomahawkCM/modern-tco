"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export function FloatingActionButton() {
  const t = useTranslations("common");
  const router = useRouter();

  return (
    <Button
      size="icon"
      className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg md:hidden"
      onClick={() => router.push("/transactions?action=add")}
      aria-label={t("addTransaction")}
    >
      <PlusIcon className="h-6 w-6" />
    </Button>
  );
}
