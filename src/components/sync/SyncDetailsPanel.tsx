import React from "react";

export default function SyncDetailsPanel({
  onClose,
  history,
}: {
  onClose: () => void;
  history?: Array<{ ts: string; status: string; message?: string }>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full rounded-t-lg bg-white p-4 sm:max-w-2xl sm:rounded-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Sync Details</h3>
          <button onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="max-h-64 space-y-2 overflow-auto">
          {(history || []).map((h, i) => (
            <div key={i} className="rounded border p-2">
              <div className="text-sm font-medium">
                {h.status} <span className="text-xs text-slate-500">{h.ts}</span>
              </div>
              {h.message && <div className="text-xs text-slate-600">{h.message}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
