"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { SUPPORTED_LOCALES, LOCALE_METADATA, type SupportedLocale } from "@/i18n/config";
import {
  getLocalePreferences,
  setLocalePreferences,
  type LocalePreferences,
} from "@/lib/locale-storage";
import { Globe, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSelectorProps {
  variant?: "minimal" | "full";
  className?: string;
}

export function LanguageSelector({ variant = "minimal", className = "" }: LanguageSelectorProps) {
  const tAria = useTranslations("aria");
  const [preferences, setPreferences] = useState<LocalePreferences | null>(null);

  useEffect(() => {
    // Initial load
    setPreferences(getLocalePreferences());

    // Listen for preference changes from other components
    const handlePreferencesChanged = (event: CustomEvent) => {
      setPreferences(event.detail);
    };

    window.addEventListener("localePreferencesChanged", handlePreferencesChanged as EventListener);
    return () => {
      window.removeEventListener(
        "localePreferencesChanged",
        handlePreferencesChanged as EventListener
      );
    };
  }, []);

  if (!preferences) return null;

  const currentLocale = preferences.locale;
  const currentMetadata = LOCALE_METADATA[currentLocale];

  const handleLocaleChange = (locale: SupportedLocale) => {
    setLocalePreferences({ locale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
            variant === "full"
              ? "border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
              : "p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          } ${className}`}
          aria-label={tAria("selectLanguage")}
        >
          <Globe className="h-4 w-4" />
          {variant === "full" && (
            <>
              <span>{currentMetadata?.label || "Language"}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[300px] overflow-y-auto border-white/10 bg-slate-900 text-slate-200"
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`cursor-pointer focus:bg-white/10 focus:text-white ${
              currentLocale === locale ? "bg-teal-500/20 text-teal-400" : ""
            }`}
          >
            <span className="flex-1">{LOCALE_METADATA[locale].label}</span>
            {currentLocale === locale && (
              <span className="ms-2 h-1.5 w-1.5 rounded-full bg-teal-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
