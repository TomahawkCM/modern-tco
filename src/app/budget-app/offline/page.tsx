/**
 * Offline Fallback Page
 * Shown when user is offline and no cached version exists
 * Phase 3 Task 3.2.2: Service Worker offline support
 */

"use client";

import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        {/* Offline Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <WifiOff className="h-12 w-12 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold text-gray-900">You're Offline</h1>

        {/* Description */}
        <p className="mb-6 text-gray-600">
          {isOnline
            ? "You're back online! Click refresh to reload the page."
            : "It looks like you've lost your internet connection. The page you're trying to reach isn't available offline yet."}
        </p>

        {/* Status Indicator */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
            <span className="text-sm font-medium text-gray-700">
              {isOnline ? "Connection restored" : "No internet connection"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleRefresh}
            className="w-full bg-teal-500 text-white hover:bg-teal-600"
            size="lg"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            {isOnline ? "Reload Page" : "Try Again"}
          </Button>

          <Link href="/budget-app" className="block">
            <Button variant="outline" className="w-full" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Info */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Offline Features</h3>
          <p className="text-xs text-gray-600">
            Once you visit a page while online, it will be available offline. All your data is
            stored locally on your device.
          </p>
        </div>
      </div>
    </div>
  );
}
