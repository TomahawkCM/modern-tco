/**
 * PWA Install Prompt Component
 * Phase 3 Task 3.2.3: Add install prompt
 *
 * Shows a friendly prompt to install the Budget App on mobile devices
 * - Appears after 3 visits
 * - Can be dismissed for 7 days
 * - Only shows if app is installable and not already installed
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallPrompt() {
  const t = useTranslations('pwaInstall');
  const { shouldShowPrompt, promptInstall, dismissPrompt } = usePWA();
  const [isVisible, setIsVisible] = useState(true);

  if (!shouldShowPrompt || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Teal accent border */}
        <div className="h-1 bg-teal-500" />
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-teal-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {t('title')}
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                {t('description')}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 px-3 py-1.5 bg-teal-500 text-white text-sm font-medium rounded-lg
                             hover:bg-teal-700 transition-colors
                             focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  {t('buttons.install')}
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900
                             rounded-lg hover:bg-gray-100 transition-colors
                             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  {t('buttons.notNow')}
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded
                         focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label={t('close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Features list */}
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-green-600">✓</span>
              <span>{t('features.offline')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-green-600">✓</span>
              <span>{t('features.fastSecure')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="text-green-600">✓</span>
              <span>{t('features.noAppStore')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

