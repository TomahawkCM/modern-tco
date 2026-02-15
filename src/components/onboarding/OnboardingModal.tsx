import React from 'react';

export default function OnboardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h2 className="text-2xl font-semibold mb-2">Welcome — Your money, your control</h2>
        <p className="text-sm text-slate-600 mb-4">We keep your data private by default. Let's set up a budget in 3 simple steps.</p>
        <div className="flex gap-3">
          <button className="btn-primary" onClick={() => { /* TODO: trigger sample data import */ onClose(); }}>
            Try with sample data
          </button>
          <button className="btn-secondary" onClick={() => { /* TODO: open import flow */ onClose(); }}>
            Set up my accounts
          </button>
        </div>
        <button className="absolute top-3 right-3 text-slate-500" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}
