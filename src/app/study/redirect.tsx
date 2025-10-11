"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudyRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect /study to /modules (unified study experience)
    router.replace("/modules");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-primary">Redirecting to unified study experience...</p>
      </div>
    </div>
  );
}