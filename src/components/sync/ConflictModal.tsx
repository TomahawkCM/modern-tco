import React from "react";

export default function ConflictModal({
  conflict,
  onClose,
  onResolveLocal,
  onResolveRemote,
  onMerge,
}: {
  conflict: any;
  onClose: () => void;
  onResolveLocal: () => void;
  onResolveRemote: () => void;
  onMerge: (merged: any) => void;
}) {
  if (!conflict) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-lg bg-white p-4 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold">Conflicting Changes</h3>
        <p className="mb-3 text-sm text-slate-600">
          This item was edited on two devices while offline. Choose which version to keep or merge
          fields.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded border p-2">
            <div className="text-xs text-slate-500">Local</div>
            <pre className="text-sm">{JSON.stringify(conflict.local, null, 2)}</pre>
          </div>
          <div className="rounded border p-2">
            <div className="text-xs text-slate-500">Merged Preview</div>
            <pre className="text-sm">{JSON.stringify(conflict.merged || {}, null, 2)}</pre>
          </div>
          <div className="rounded border p-2">
            <div className="text-xs text-slate-500">Remote</div>
            <pre className="text-sm">{JSON.stringify(conflict.remote, null, 2)}</pre>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onResolveLocal}>
            Keep Local
          </button>
          <button className="btn-secondary" onClick={onResolveRemote}>
            Keep Remote
          </button>
          <button className="btn-primary" onClick={() => onMerge(conflict.merged)}>
            Merge
          </button>
        </div>
      </div>
    </div>
  );
}
