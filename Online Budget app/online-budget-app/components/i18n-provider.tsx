"use client";

import { NextIntlClientProvider } from "next-intl";
import { DEFAULT_LOCALE } from "@/i18n/config";
import type { ReactNode } from "react";

interface I18nProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: ReactNode;
}

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale || DEFAULT_LOCALE}
      messages={messages}
      timeZone="UTC"
      onError={(error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("i18n:", error.message);
        }
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
