/**
 * PWA Hook - Service Worker Registration and Install Prompt
 * Phase 3 Tasks 3.2.2 and 3.2.3
 */

'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Client-side only: Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration);
            
            // Check for updates every hour
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      });
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      console.log('[PWA] App is running in standalone mode');
    }

    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] Install prompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Track that user saw the prompt after 3 visits
      const visits = parseInt(localStorage.getItem('budget-app-visits') || '0');
      localStorage.setItem('budget-app-visits', (visits + 1).toString());
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.setItem('budget-app-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No install prompt available');
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] User response:', outcome);

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      } else {
        console.log('[PWA] User dismissed the install prompt');
        // Don't show again for this session
        setIsInstallable(false);
        return false;
      }
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
      return false;
    }
  };

  const dismissPrompt = () => {
    setIsInstallable(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('budget-app-install-dismissed', Date.now().toString());
    }
  };

  // Show prompt after 3 visits and not dismissed recently (7 days)
  const shouldShowPrompt = () => {
    // Client-side only
    if (typeof window === 'undefined') return false;
    if (isInstalled || !isInstallable) return false;

    const visits = parseInt(localStorage.getItem('budget-app-visits') || '0');
    const dismissedAt = localStorage.getItem('budget-app-install-dismissed');

    if (visits < 3) return false;

    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return false;
    }

    return true;
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    dismissPrompt,
    shouldShowPrompt: shouldShowPrompt(),
  };
}

