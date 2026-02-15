import React from 'react';

export default function SyncDetailsPanel({ onClose, history }: { onClose: ()=>void; history?: Array<{ts:string, status:string, message?:string}> }){
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-lg sm:rounded-lg w-full sm:max-w-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Sync Details</h3>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="space-y-2 max-h-64 overflow-auto">
          {(history || []).map((h, i) => (
            <div key={i} className="p-2 border rounded">
              <div className="text-sm font-medium">{h.status} <span className="text-xs text-slate-500">{h.ts}</span></div>
              {h.message && <div className="text-xs text-slate-600">{h.message}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
