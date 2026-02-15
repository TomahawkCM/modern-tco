import React from 'react';

export default function SyncBanner({ status, lastSync, onRetry, onDetails }: { status: 'synced'|'syncing'|'warning'|'error'; lastSync?: string; onRetry?: ()=>void; onDetails?: ()=>void }){
  const color = status === 'synced' ? 'bg-green-500' : status === 'syncing' ? 'bg-blue-500' : status === 'warning' ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className={`fixed top-4 right-4 z-60 ${color} text-white px-3 py-2 rounded-full shadow-md flex items-center gap-3`} role="status" aria-live="polite">
      <span className="w-2 h-2 rounded-full inline-block" />
      <span className="text-sm">{status === 'synced' ? `Synced • last: ${lastSync ?? 'just now'}` : status === 'syncing' ? 'Syncing…' : status === 'warning' ? 'Sync delayed' : 'Sync failed'}</span>
      <div className="ml-2 flex gap-2">
        {status !== 'syncing' && <button onClick={onRetry} className="underline text-white text-sm">Retry</button>}
        <button onClick={onDetails} className="underline text-white text-sm">Details</button>
      </div>
    </div>
  );
}
