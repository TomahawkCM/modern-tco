'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useState, useEffect, ReactNode } from 'react';
import { getLocalePreferences } from '@/lib/locale-storage';
import { DEFAULT_LOCALE, type SupportedLocale } from '@/i18n/config';
import enMessages from '@/i18n/messages/en.json';

export function ClientI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState(enMessages);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadMessages = async () => {
      const prefs = getLocalePreferences();
      const currentLocale = prefs.locale || DEFAULT_LOCALE;
      setLocale(currentLocale);

      if (currentLocale === 'en-US') {
        setMessages(enMessages);
      } else {
        try {
          // Dynamic import for messages
          // Note: Webpack/Next.js needs to know the path structure to bundle these
          const loadedMessages = (await import(`../../i18n/messages/${currentLocale}.json`)).default;
          setMessages(loadedMessages);
        } catch (error) {
          console.error(`Failed to load messages for ${currentLocale}`, error);
          setMessages(enMessages);
        }
      }
    };

    loadMessages();

    const handlePreferencesChanged = () => {
      loadMessages();
    };

    window.addEventListener('localePreferencesChanged', handlePreferencesChanged);
    return () => {
      window.removeEventListener('localePreferencesChanged', handlePreferencesChanged);
    };
  }, []);

  if (!mounted) {
    // Return children without provider or a loading state during SSR/hydration to avoid mismatch
    // But since we want SEO-friendly default English for initial render if possible, 
    // we can default to English. However, this is a client component inside a layout.
    return (
      <NextIntlClientProvider locale={DEFAULT_LOCALE} messages={enMessages} timeZone="UTC">
        {children}
      </NextIntlClientProvider>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}

