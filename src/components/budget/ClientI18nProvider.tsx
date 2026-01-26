"use client";

import { DEFAULT_LOCALE } from "@/i18n/config";
import enMessages from "@/i18n/messages/en.json";
import { getLocalePreferences } from "@/lib/locale-storage";
import { NextIntlClientProvider } from "next-intl";
import { useCallback, useEffect, useState, type ReactNode } from "react";

// Track target locale to know when messages are ready
interface LocaleState {
  locale: string;
  messages: typeof enMessages;
  isReady: boolean;
}

/**
 * Minimal loading skeleton shown while locale messages are loading.
 * This prevents widgets from rendering and calling useTranslations()
 * before the correct locale messages are available.
 */
function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

export function ClientI18nProvider({ children }: { children: ReactNode }) {
  // Start with isReady: true to prevent hydration mismatch
  // Server and client both render children immediately with default locale
  // useEffect will then load the correct locale messages client-side
  const [state, setState] = useState<LocaleState>({
    locale: DEFAULT_LOCALE,
    messages: enMessages,
    isReady: true,
  });

  const loadMessages = useCallback(async () => {
    const prefs = getLocalePreferences();
    const targetLocale = prefs.locale || DEFAULT_LOCALE;

    // Check if we already have the right locale loaded
    if (state.locale === targetLocale) {
      return;
    }

    // Only show loading skeleton for non-initial locale switches
    // This prevents hydration mismatch while still showing feedback during locale changes
    if (state.locale !== DEFAULT_LOCALE) {
      setState(prev => ({ ...prev, isReady: false }));
    }

    // For all English locales, use the en.json messages (they share the same keys)
    // This covers en-US, en-CA, en-GB, en-AU, etc.
    if (targetLocale.startsWith("en-")) {
      setState({
        locale: targetLocale,
        messages: enMessages,
        isReady: true,
      });
    } else {
      try {
        // Dynamic import for messages
        const loadedMessages = (await import(`../../i18n/messages/${targetLocale}.json`))
          .default;

        // Verify the messages have the expected structure (basic check)
        if (loadedMessages && typeof loadedMessages === 'object') {
          setState({
            locale: targetLocale,
            messages: loadedMessages,
            isReady: true,
          });
        } else {
          throw new Error('Invalid messages format');
        }
      } catch (error) {
        console.error(`Failed to load messages for ${targetLocale}, falling back to en`, error);
        // Fall back to default locale
        setState({
          locale: DEFAULT_LOCALE,
          messages: enMessages,
          isReady: true,
        });
      }
    }
  }, [state.isReady, state.locale]);

  useEffect(() => {
    loadMessages();

    const handlePreferencesChanged = () => {
      loadMessages();
    };

    window.addEventListener("localePreferencesChanged", handlePreferencesChanged);
    return () => {
      window.removeEventListener("localePreferencesChanged", handlePreferencesChanged);
    };
  }, [loadMessages]);

  // CRITICAL: Do NOT render children until messages are fully loaded
  // This prevents the race condition where widgets call useTranslations()
  // and detect browser locale before matching messages are available
  if (!state.isReady) {
    return <LoadingSkeleton />;
  }

  return (
    <NextIntlClientProvider
      locale={state.locale}
      messages={state.messages}
      timeZone="UTC"
      onError={(error) => {
        // Log missing messages as warnings in development only
        if (process.env.NODE_ENV === 'development') {
          console.warn('i18n:', error.message);
        }
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
