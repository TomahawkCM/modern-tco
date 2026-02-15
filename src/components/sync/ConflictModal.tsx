import React from 'react';

export default function ConflictModal({ conflict, onClose, onResolveLocal, onResolveRemote, onMerge }: { conflict: any; onClose: ()=>void; onResolveLocal: ()=>void; onResolveRemote: ()=>void; onMerge: (merged:any)=>void }){
  if(!conflict) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-4">
        <h3 className="text-lg font-semibold mb-2">Conflicting Changes</h3>
        <p className="text-sm text-slate-600 mb-3">This item was edited on two devices while offline. Choose which version to keep or merge fields.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-2 border rounded">
            <div className="text-xs text-slate-500">Local</div>
            <pre className="text-sm">{JSON.stringify(conflict.local, null, 2)}</pre>
          </div>
          <div className="p-2 border rounded">
            <div className="text-xs text-slate-500">Merged Preview</div>
            <pre className="text-sm">{JSON.stringify(conflict.merged || {}, null, 2)}</pre>
          </div>
          <div className="p-2 border rounded">
            <div className="text-xs text-slate-500">Remote</div>
            <pre className="text-sm">{JSON.stringify(conflict.remote, null, 2)}</pre>
          </div>
        </div>
        <div className="mt-3 flex gap-2 justify-end">
          <button className="btn-secondary" onClick={onResolveLocal}>Keep Local</button>
          <button className="btn-secondary" onClick={onResolveRemote}>Keep Remote</button>
          <button className="btn-primary" onClick={() => onMerge(conflict.merged)}>Merge</button>
        </div>
      </div>
    </div>
  );
}
