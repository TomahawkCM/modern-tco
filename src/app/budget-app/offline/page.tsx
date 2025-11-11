/**
 * Offline Fallback Page
 * Shown when user is offline and no cached version exists
 * Phase 3 Task 3.2.2: Service Worker offline support
 */

'use client';

import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Offline Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          {isOnline 
            ? "You're back online! Click refresh to reload the page."
            : "It looks like you've lost your internet connection. The page you're trying to reach isn't available offline yet."
          }
        </p>

        {/* Status Indicator */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium text-gray-700">
              {isOnline ? 'Connection restored' : 'No internet connection'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleRefresh}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white"
            size="lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            {isOnline ? 'Reload Page' : 'Try Again'}
          </Button>

          <Link href="/budget-app" className="block">
            <Button
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Offline Features
          </h3>
          <p className="text-xs text-gray-600">
            Once you visit a page while online, it will be available offline. 
            All your data is stored locally on your device.
          </p>
        </div>
      </div>
    </div>
  );
}
