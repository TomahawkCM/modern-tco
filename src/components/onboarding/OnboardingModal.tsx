import React, { useState } from "react";
import { seedDatabase } from "@/lib/seed-data";
import { importStarted, onboardingCompleted } from "@/lib/analytics/events";

export default function OnboardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSample = async () => {
    setLoading(true);
    try {
      importStarted("sample");
      await seedDatabase();
      onboardingCompleted();
      onClose();
    } catch (e) {
      console.error("seed error", e);
      // TODO: show user-friendly error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-2xl font-semibold">Welcome — Your money, your control</h2>
        <p className="mb-4 text-sm text-slate-600">
          We keep your data private by default. Let's set up a budget in 3 simple steps.
        </p>
        <div className="flex gap-3">
          <button className="btn-primary" onClick={handleSample} disabled={loading}>
            {loading ? "Importing…" : "Try with sample data"}
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              /* open import flow */ onClose();
            }}
          >
            Set up my accounts
          </button>
        </div>
        <button className="absolute right-3 top-3 text-slate-500" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
